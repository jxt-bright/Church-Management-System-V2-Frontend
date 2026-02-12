import React, { useState, useEffect, useRef } from 'react';
import {
  UserCheck, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Calendar, Save, Trash2, ChevronDown, ChevronUp, AlertCircle, Users,
  Search, X, Building2, CheckCircle2
} from 'lucide-react';
import Swal from 'sweetalert2';
import FlashMessage from '../components/FlashMessage';
import attendanceService from '../services/attendanceService.js';
import churchService from '../services/churchService.js';
import { useAuth } from '../context/AuthContext';
import '../assets/styles/Attendance.css';
import '../assets/styles/SendMessage.css'; 

/* =========================
   SearchSelect Component 
========================= */
function SearchSelect({ options, value, onChange, placeholder, disabled, icon: Icon, label, isLoading }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`search-select-wrapper ${disabled ? 'disabled' : ''}`} ref={wrapperRef}>
      <div
        className={`search-select-trigger ${isOpen ? 'open' : ''} ${value ? 'has-value' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="trigger-content">
          {Icon && <Icon size={16} strokeWidth={1.5} />}
          <span className={value ? 'selected-text' : 'placeholder-text'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <div className="trigger-icons">
          {value && !disabled && (
            <button
              type="button"
              className="clear-btn"
              onClick={(e) => { e.stopPropagation(); handleSelect(null); }}
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown size={16} className={`chevron ${isOpen ? 'rotated' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="search-select-dropdown">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${label.toLowerCase()}...`}
              className="search-input-field"
              autoFocus
            />
          </div>
          <div className="options-list">
            {isLoading ? (
              <div className="no-results">Loading...</div>
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map(option => (
                <div
                  key={option.value}
                  className={`option-item ${option.value === value ? 'selected' : ''}`}
                  onClick={() => handleSelect(option.value)}
                >
                  {option.label}
                  {option.value === value && <CheckCircle2 size={16} />}
                </div>
              ))
            ) : (
              <div className="no-results">No results found for "{searchTerm}"</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================
   Main Component
========================= */
const AttendanceTracker = () => {
  const { user } = useAuth();

  const [currentView, setCurrentView] = useState('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [attendanceData, setAttendanceData] = useState({});
  const [mainFlash, setMainFlash] = useState({ message: '', type: '' });
  const [isFetchingData, setIsFetchingData] = useState(false);

  // Search State
  const [selectedChurch, setSelectedChurch] = useState(null);
  const [churches, setChurches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const userStatus = user?.status?.toLowerCase() || '';
  const canSearch = ['manager', 'grouppastor', 'groupadmin'].includes(userStatus);

  // Auto-select church for local pastors/admins
  useEffect(() => {
    if (user && !canSearch) {
      if (user.churchId) {
        setSelectedChurch({
          _id: user.churchId,
          name: user.churchName || 'My Church',
          location: user.churchLocation || ''
        });
      }
    }
  }, [user, canSearch]);

  // Fetch Attendance for the selected church
  useEffect(() => {
    const fetchMonthlyAttendance = async () => {
      if (!selectedChurch?._id) return;
      setIsFetchingData(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      try {
        const response = await attendanceService.getAttendance({
          params: { churchId: selectedChurch._id, year, month }
        });
        const records = Array.isArray(response) ? response : (response.data || []);
        const formattedData = {};
        records.forEach(record => {
          const recDate = new Date(record.date);
          const dateKey = `${recDate.getFullYear()}-${String(recDate.getMonth() + 1).padStart(2, '0')}-${String(recDate.getDate()).padStart(2, '0')}`;
          formattedData[dateKey] = record;
        });
        setAttendanceData(formattedData);
      } catch (error) {
        console.error("Attendance fetch error:", error);
      } finally {
        setIsFetchingData(false);
      }
    };
    fetchMonthlyAttendance();
  }, [selectedChurch, currentDate]);

  // Initial Fetch of Churches for SearchSelect
  useEffect(() => {
    const loadChurches = async () => {
      if (canSearch) {
        setIsLoading(true);
        try {
          const response = await churchService.getChurches();
          const data = Array.isArray(response) ? response : (response.churches || response.data || []);
          setChurches(data);
        } catch (error) {
          setChurches([]);
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadChurches();
  }, [canSearch]);

  const churchOptions = churches.map(c => ({
    value: c._id,
    label: c.name || c.churchname
  }));

  const handleSelectChurch = (churchId) => {
    if (!churchId) {
      setSelectedChurch(null);
      setAttendanceData({});
      return;
    }
    const church = churches.find(c => c._id === churchId);
    setSelectedChurch(church);
    setAttendanceData({});
  };

  const formatDateKey = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const handleDateClick = (day) => {
    if (!selectedChurch) {
      setMainFlash({ message: 'Please select a church first.', type: 'danger' });
      window.scrollTo(0, 0);
      return;
    }
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate({ date: clickedDate, key: formatDateKey(clickedDate) });
    setCurrentView('form');
    setMainFlash({ message: '', type: '' });
  };

  const handleBackToCalendar = () => {
    setCurrentView('calendar');
    setSelectedDate(null);
  };

  const handleSaveData = (data) => {
    setAttendanceData(prev => ({ ...prev, [selectedDate.key]: data }));
    setMainFlash({ message: 'Attendance saved successfully!', type: 'success' });
    setCurrentView('calendar');
    window.scrollTo(0, 0);
  };

  const handleDeleteData = () => {
    const record = attendanceData[selectedDate.key];
    if (!record?._id) return;

    Swal.fire({
      title: "Delete Attendance?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await attendanceService.delete(record._id);
          await Swal.fire({ title: "Deleted!", icon: "success", timer: 1500, showConfirmButton: false });
          setAttendanceData(prev => {
            const newData = { ...prev };
            delete newData[selectedDate.key];
            return newData;
          });
          setCurrentView('calendar');
          window.scrollTo(0, 0);
        } catch (error) {
          Swal.fire("Error", error.response?.data?.message || "Failed to delete.", "error");
        }
      }
    });
  };

  const changeMonth = (delta) => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
  const changeYear = (delta) => setCurrentDate(new Date(currentDate.getFullYear() + delta, currentDate.getMonth(), 1));
  const goToToday = () => setCurrentDate(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return {
      daysInMonth: new Date(year, month + 1, 0).getDate(),
      startingDayOfWeek: new Date(year, month, 1).getDay()
    };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const isToday = (day) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  if (currentView === 'form' && selectedDate) {
    const existingData = attendanceData[selectedDate.key];
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <button onClick={handleBackToCalendar} className="flex items-center text-gray-600 hover:text-indigo-600 mb-6 transition-colors">
            <ChevronLeft className="w-5 h-5 mr-1" /> Back to Calendar
          </button>
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-indigo-600 p-8 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold flex items-center gap-2">{selectedDate.date.toLocaleDateString('en-US', { weekday: 'long' })}</h2>
                  <div className="flex flex-col mt-1">
                    <span className="text-indigo-100 text-lg">{selectedDate.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    <span className="text-indigo-200 text-sm font-medium flex items-center gap-1 mt-1">
                      <Building2 className="w-4 h-4" /> {selectedChurch?.name || 'Unknown Church'}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm"><Calendar className="w-8 h-8 text-white" /></div>
              </div>
            </div>
            <AttendanceForm initialData={existingData} selectedDate={selectedDate.date} churchId={selectedChurch?._id} onSave={handleSaveData} onDelete={handleDeleteData} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto mb-4">
        <FlashMessage message={mainFlash.message} type={mainFlash.type} onClose={() => setMainFlash({ message: '', type: '' })} />
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <UserCheck className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Attendance Tracker</h1>
          </div>
          <p className="text-gray-600">{selectedChurch ? `Viewing: ${selectedChurch.name}` : 'Select a church to view attendance'}</p>
        </div>

        {canSearch && (
          <div className="max-w-lg mx-auto mb-8">
            <SearchSelect
              options={churchOptions}
              value={selectedChurch?._id || null}
              onChange={handleSelectChurch}
              placeholder="Search and select a church..."
              icon={Building2}
              label="Church"
              isLoading={isLoading}
            />
          </div>
        )}

        <div className={`bg-white rounded-3xl shadow-xl overflow-hidden transition-all duration-300 ${!selectedChurch ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white relative">
            {isFetchingData && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-[1px] z-10">
                <div className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-md flex items-center gap-2">
                  <span className="custom-spinner"></span><span className="text-sm font-medium">Loading Data...</span>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-1">
                <button onClick={() => changeYear(-1)} className="p-2 hover:bg-white/20 rounded-xl transition-colors"><ChevronsLeft className="w-5 h-5" /></button>
                <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white/20 rounded-xl transition-colors"><ChevronLeft className="w-6 h-6" /></button>
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold">{monthNames[currentDate.getMonth()]}</h2>
                <p className="text-indigo-100 font-medium">{currentDate.getFullYear()}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white/20 rounded-xl transition-colors"><ChevronRight className="w-6 h-6" /></button>
                <button onClick={() => changeYear(1)} className="p-2 hover:bg-white/20 rounded-xl transition-colors"><ChevronsRight className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="flex justify-center">
              <button onClick={goToToday} className="px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold backdrop-blur-sm transition-all shadow-sm">Today</button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="text-center text-sm font-semibold text-gray-500">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {[...Array(startingDayOfWeek)].map((_, i) => <div key={`empty-${i}`} />)}
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1;
                const dateKey = formatDateKey(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
                const hasData = !!attendanceData[dateKey];
                return (
                  <button
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={`aspect-square rounded-xl font-medium transition-all hover:scale-105 relative border-2 
                      ${isToday(day) ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' :
                        hasData ? 'bg-green-50 text-green-700 border-green-200' :
                          'bg-white text-gray-700 border-transparent hover:border-indigo-100 hover:bg-gray-50'}`}
                  >
                    {day}
                    {hasData && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AttendanceForm = ({ initialData, selectedDate, churchId, onSave, onDelete }) => {
  const [flash, setFlash] = useState({ message: '', type: '' });
  const [reason, setReason] = useState(initialData?.reason || '');
  const [stats, setStats] = useState({
    adultmale: initialData?.adultmale ?? '',
    adultfemale: initialData?.adultfemale ?? '',
    youthmale: initialData?.youthmale ?? '',
    youthfemale: initialData?.youthfemale ?? '',
    childrenmale: initialData?.childrenmale ?? '',
    childrenfemale: initialData?.childrenfemale ?? '',
    newcomersmales: initialData?.newcomersmales ?? '',
    newcomersfemales: initialData?.newcomersfemales ?? '',
    firstoffering: initialData?.firstoffering ?? '',
    secondoffering: initialData?.secondoffering ?? ''
  });

  const isEditMode = !!initialData;
  const [openSection, setOpenSection] = useState(initialData?.reason ? 'reason' : 'attendance');

  const hasAttendanceData = Object.values(stats).some(val => val !== '' && val !== null);
  const hasReasonData = reason.trim().length > 0;
  const isReasonDisabled = hasAttendanceData;
  const isAttendanceDisabled = hasReasonData;

  const handleStatChange = (e) => {
    const { name, value } = e.target;
    setStats(prev => ({ ...prev, [name]: value === '' ? '' : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!churchId) return setFlash({ message: 'No church selected.', type: 'danger' });
    if (!hasReasonData && !hasAttendanceData) return setFlash({ message: 'Provide attendance or a reason.', type: 'danger' });

    try {
      const processedStats = {};
      if (hasAttendanceData) {
        Object.keys(stats).forEach(key => processedStats[key] = stats[key] === '' ? null : parseFloat(stats[key]));
      }
      const basePayload = { reason: hasReasonData ? reason : null, ...(hasAttendanceData ? processedStats : {}) };

      if (initialData?._id) {
        await attendanceService.update(initialData._id, basePayload);
        onSave({ ...initialData, ...basePayload });
      } else {
        const createPayload = { ...basePayload, churchId, date: selectedDate };
        await attendanceService.save(createPayload);
        onSave(createPayload);
      }
    } catch (error) {
      setFlash({ message: error.response?.data?.message || 'Error saving.', type: 'danger' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4">
      <FlashMessage message={flash.message} type={flash.type} onClose={() => setFlash({ message: '', type: '' })} />

      <div className={`border rounded-2xl overflow-hidden transition-all ${isReasonDisabled ? 'border-gray-100 opacity-60' : 'border-indigo-100 shadow-sm'}`}>
        <button type="button" onClick={() => !isReasonDisabled && setOpenSection(openSection === 'reason' ? null : 'reason')} disabled={isReasonDisabled} className={`w-full flex items-center justify-between p-4 text-left transition-colors ${openSection === 'reason' ? 'bg-red-50' : 'bg-white hover:bg-gray-50'}`}>
          <div className="flex items-center gap-3"><AlertCircle className={`w-5 h-5 ${hasReasonData ? 'text-red-500' : 'text-gray-400'}`} /><span className="font-bold text-gray-700">NO Service?</span></div>
          {openSection === 'reason' ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
        </button>
        {openSection === 'reason' && (
          <div className="p-4 bg-white border-t border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
            <textarea rows="3" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none resize-none" placeholder="Reason..." value={reason} onChange={(e) => setReason(e.target.value)} disabled={isReasonDisabled} />
          </div>
        )}
      </div>

      <div className={`border rounded-2xl overflow-hidden transition-all ${isAttendanceDisabled ? 'border-gray-100 opacity-60' : 'border-indigo-100 shadow-sm'}`}>
        <button type="button" onClick={() => !isAttendanceDisabled && setOpenSection(openSection === 'attendance' ? null : 'attendance')} disabled={isAttendanceDisabled} className={`w-full flex items-center justify-between p-4 text-left transition-colors ${openSection === 'attendance' ? 'bg-indigo-50' : 'bg-white hover:bg-gray-50'}`}>
          <div className="flex items-center gap-3"><Users className={`w-5 h-5 ${hasAttendanceData ? 'text-indigo-500' : 'text-gray-400'}`} /><span className="font-bold text-gray-700">Enter Attendance</span></div>
          {openSection === 'attendance' ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
        </button>
        {openSection === 'attendance' && (
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(stats).map(key => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()}</label>
                  <div className="relative rounded-md shadow-sm">
                    {key.includes('offering') && <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><span className="text-gray-500 sm:text-sm">₵</span></div>}
                    <input
                      type="number" name={key} value={stats[key]} onChange={handleStatChange} min="0" step={key.includes('offering') ? "0.1" : "1"}
                      className={`w-full rounded-md border border-gray-300 py-2 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${key.includes('offering') ? 'pl-7' : 'pl-3'}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 flex gap-3">
        {initialData && (
          <button type="button" onClick={onDelete} className="p-4 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors flex items-center justify-center gap-2 font-semibold"><Trash2 className="w-5 h-5" /><span>Delete</span></button>
        )}
        <button type="submit" disabled={!hasReasonData && !hasAttendanceData} className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
          <Save className="w-5 h-5" />{isEditMode ? 'Save Changes' : 'Save Attendance'}
        </button>
      </div>
    </form>
  );
};

export default AttendanceTracker;