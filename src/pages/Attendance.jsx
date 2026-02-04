import React, { useState, useEffect, useRef } from 'react';
import {
  UserCheck, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Calendar, Save, Trash2, ChevronDown, ChevronUp, AlertCircle, Users,
  Search, X, Building2, MapPin
} from 'lucide-react';
import Swal from 'sweetalert2'; // Import SweetAlert2
import FlashMessage from '../components/FlashMessage';
import attendanceService from '../services/attendanceService.js';
import churchService from '../services/churchService.js'; 
import { useAuth } from '../context/AuthContext';

const AttendanceTracker = () => {
  const { user } = useAuth();

  const [currentView, setCurrentView] = useState('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [attendanceData, setAttendanceData] = useState({}); 
  const [mainFlash, setMainFlash] = useState({ message: '', type: '' });
  const [isFetchingData, setIsFetchingData] = useState(false); 

  const [selectedChurch, setSelectedChurch] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const resultsRef = useRef(null);

  // Define Permissions
  const userStatus = user?.status?.toLowerCase() || '';
  const canSearch = ['manager', 'grouppastor', 'groupadmin'].includes(userStatus);


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


  useEffect(() => {
    const fetchMonthlyAttendance = async () => {
      if (!selectedChurch?._id) return;

      setIsFetchingData(true);
      
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1; 

      try {
        const response = await attendanceService.getAttendance({
          params: {
            churchId: selectedChurch._id,
            year,
            month
          }
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
        console.error("Failed to fetch attendance:", error);
      } finally {
        setIsFetchingData(false);
      }
    };

    fetchMonthlyAttendance();
  }, [selectedChurch, currentDate]); 


  const highlightText = (text) => {
    if (!searchTerm) return text;
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === searchTerm.toLowerCase()
        ? <span key={i} style={{ backgroundColor: '#fef08a', fontWeight: 'bold' }}>{part}</span>
        : part
    );
  };

  const getInitials = (item) => {
    if (!item?.name) return 'C';
    const words = item.name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return item.name.substring(0, 2).toUpperCase();
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return {
      daysInMonth: new Date(year, month + 1, 0).getDate(),
      startingDayOfWeek: new Date(year, month, 1).getDay()
    };
  };

  const formatDateKey = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowResults(value.trim() !== '');
    if (!value.trim()) setSearchResults([]);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm && canSearch) {
        setIsLoading(true);
        try {
          const response = await churchService.getChurches({ search: searchTerm });
          let data = [];
          if (Array.isArray(response)) data = response;
          else if (response.churches) data = response.churches;
          else if (response.data) data = response.data;
          setSearchResults(data);
        } catch (error) {
          console.error("Search failed", error);
          setSearchResults([]);
        } finally {
          setIsLoading(false);
        }
      }
    }, 0);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, canSearch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (resultsRef.current && !resultsRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectChurch = (church) => {
    setSelectedChurch(church);
    setSearchTerm('');
    setShowResults(false);
    setAttendanceData({}); 
  };

  const handleRemoveChurch = () => {
    setSelectedChurch(null);
    setAttendanceData({});
  };


  const handleDateClick = (day) => {
    if (!selectedChurch) {
        setMainFlash({ message: 'Please select a church first.', type: 'danger' });
        window.scrollTo(0,0);
        return;
    }
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateKey = formatDateKey(clickedDate);

    setSelectedDate({ date: clickedDate, key: dateKey });
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
    window.scrollTo(0,0);
  };

  // Delete function
  const handleDeleteData = () => {
    const record = attendanceData[selectedDate.key];
    
    if (!record || !record._id) return;

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

          // Success Alert
          await Swal.fire({
            title: "Deleted!",
            text: "Attendance record has been removed.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false
          });

          // Update State
          setAttendanceData(prev => {
            const newData = { ...prev };
            delete newData[selectedDate.key];
            return newData;
          });

          // Switch View
          setCurrentView('calendar');
          window.scrollTo(0,0);

        } catch (error) {
          console.error("Delete error:", error);
          Swal.fire(
            "Error",
            error.response?.data?.message || "Failed to delete attendance.",
            "error"
          );
        }
      }
    });
  };

  const changeMonth = (delta) => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
  const changeYear = (delta) => setCurrentDate(new Date(currentDate.getFullYear() + delta, currentDate.getMonth(), 1));
  const goToToday = () => setCurrentDate(new Date());

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const isToday = (day) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();
  };


  // Show Form Page
  if (currentView === 'form' && selectedDate) {
    const existingData = attendanceData[selectedDate.key];

    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={handleBackToCalendar}
            className="flex items-center text-gray-600 hover:text-indigo-600 mb-6 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Calendar
          </button>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-indigo-600 p-8 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold flex items-center gap-2">
                    {selectedDate.date.toLocaleDateString('en-US', { weekday: 'long' })}
                  </h2>
                  <div className="flex flex-col mt-1">
                    <span className="text-indigo-100 text-lg">
                      {selectedDate.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="text-indigo-200 text-sm font-medium flex items-center gap-1 mt-1">
                      <Building2 className="w-4 h-4" />
                      {selectedChurch ? selectedChurch.name : 'Unknown Church'}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            <AttendanceForm
              initialData={existingData}
              selectedDate={selectedDate.date}
              churchId={selectedChurch?._id}
              onSave={handleSaveData}
              onDelete={handleDeleteData}
            />
          </div>
        </div>
      </div>
    );
  }

  // Show calendar
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8">
      
      {/* Flash message */}
      <div className="max-w-5xl mx-auto mb-4">
        <FlashMessage 
            message={mainFlash.message} 
            type={mainFlash.type} 
            onClose={() => setMainFlash({ message: '', type: '' })} 
        />
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <UserCheck className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Attendance Tracker
            </h1>
          </div>
          <p className="text-gray-600">
            {selectedChurch ? `Viewing: ${selectedChurch.name}` : 'Select a church to view attendance'}
          </p>
        </div>

        {/* Search bar */}
        {canSearch && (
          <div className="max-w-lg mx-auto mb-8 relative z-20">
            <div ref={resultsRef} style={{ position: 'relative' }}>
                <div style={{ position: 'relative' }}>
                    <Search
                        style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#6c757d',
                            width: '20px',
                            height: '20px'
                        }}
                    />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onFocus={() => { if (searchTerm) setShowResults(true); }}
                        placeholder="Search for a church..."
                        className="form-control form-control-lg"
                        style={{ 
                            paddingLeft: '45px', 
                            width: '100%', 
                            display: 'block',
                            padding: '0.75rem 1rem 0.75rem 2.8rem',
                            fontSize: '1.1rem',
                            lineHeight: '1.5',
                            color: '#495057',
                            backgroundColor: '#fff',
                            backgroundClip: 'padding-box',
                            border: '1px solid #ced4da',
                            borderRadius: '0.5rem',
                            transition: 'border-color .15s ease-in-out,box-shadow .15s ease-in-out',
                            outline: 'none',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                        }}
                        autoComplete="off"
                    />
                </div>

                {/* Dropdown */}
                {showResults && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            backgroundColor: 'white',
                            border: '1px solid #dee2e6',
                            borderRadius: '8px',
                            marginTop: '0.5rem',
                            maxHeight: '300px',
                            overflowY: 'auto',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            zIndex: 1000
                        }}
                    >
                        {searchResults.length === 0 ? (
                            <div style={{ padding: '1rem', textAlign: 'center', color: '#6c757d' }}>
                                {isLoading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" style={{ display: 'inline-block', width: '1rem', height: '1rem', verticalAlign: 'text-bottom', border: '.25em solid currentColor', borderRightColor: 'transparent', borderRadius: '50%', animation: 'spinner-border .75s linear infinite' }}></span>
                                        Searching...
                                    </>
                                ) : 'No church found.'}
                            </div>
                        ) : (
                            searchResults.map(church => (
                                <div
                                    key={church._id}
                                    onClick={() => handleSelectChurch(church)}
                                    style={{
                                        padding: '0.75rem 1rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        borderBottom: '1px solid #f1f3f5',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                >
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        fontSize: '0.875rem'
                                    }}>
                                        {getInitials(church)}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600', color: '#212529' }}>
                                            {highlightText(church.name)}
                                        </div>
                                        <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                                            {church.location}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* SELECTED CHURCH CARD */}
            {selectedChurch && (
                <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '2px solid #0dcaf0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    position: 'relative',
                    animation: 'fadeIn 0.3s ease-in-out'
                }}>
                    <button
                        type="button"
                        onClick={handleRemoveChurch}
                        style={{
                            position: 'absolute',
                            top: '0.5rem',
                            right: '0.5rem',
                            background: '#dc3545',
                            border: 'none',
                            borderRadius: '50%',
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'white',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#bb2d3b'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
                        title="Deselect Church"
                    >
                        <X style={{ width: '16px', height: '16px' }} />
                    </button>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        flexShrink: 0
                    }}>
                        {getInitials(selectedChurch)}
                    </div>
                    <div>
                        <div style={{ fontWeight: 'bold', color: '#212529', fontSize: '1.1rem' }}>
                            {selectedChurch.name}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#6c757d', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={14} />
                            {selectedChurch.location || 'Location not available'}
                        </div>
                    </div>
                </div>
            )}
          </div>
        )}

        {/* Calendar Grid */}
        <div className={`bg-white rounded-3xl shadow-xl overflow-hidden transition-all duration-300 ${!selectedChurch ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
          {/* Calendar Header with Loading Indicator */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white relative">
            
            {/* Loading Overlay */}
            {isFetchingData && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-[1px] z-10">
                    <div className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-md flex items-center gap-2">
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <span className="text-sm font-medium">Loading Data...</span>
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
                const record = attendanceData[dateKey];
                
                // Visual Logic: Any record = Green
                const hasData = !!record;

                return (
                  <button
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={`aspect-square rounded-xl font-medium transition-all hover:scale-105 relative border-2 
                      ${isToday(day) ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' :
                        hasData ? 'bg-green-50 text-green-700 border-green-200' :
                            'bg-white text-gray-700 border-transparent hover:border-indigo-100 hover:bg-gray-50'
                      }`}
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



// Form Accordion
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

  const [openSection, setOpenSection] = useState(() => {
    if (initialData?.reason) return 'reason';
    return 'attendance';
  });

  const hasAttendanceData = Object.values(stats).some(val => val !== '' && val !== null && val !== undefined);
  const hasReasonData = reason.trim().length > 0;

  const isReasonDisabled = hasAttendanceData;
  const isAttendanceDisabled = hasReasonData;

  const handleStatChange = (e) => {
    const { name, value } = e.target;
    setStats(prev => ({ ...prev, [name]: value === '' ? '' : value }));
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      
      if (!churchId) {
          setFlash({ message: 'No church selected. Cannot save data.', type: 'danger' });
          return;
      }
      if (!hasReasonData && !hasAttendanceData) {
        setFlash({ message: 'Please enter attendance numbers OR provide a reason for no service.', type: 'danger' });
        return;
      }

      const processedStats = {};
      if (hasAttendanceData) {
        Object.keys(stats).forEach(key => {
          const val = stats[key];
          processedStats[key] = val === '' ? null : parseFloat(val);
        });
      }

      const basePayload = {
        reason: hasReasonData ? reason : null, 
        ...(hasAttendanceData ? processedStats : {}) 
      };

      if (initialData && initialData._id) {
        await attendanceService.update(initialData._id, basePayload);
        onSave({ ...initialData, ...basePayload }); 
      } else {
        const createPayload = {
            ...basePayload,
            churchId: churchId,
            date: selectedDate
        };
        await attendanceService.save(createPayload);
        onSave(createPayload);
      }

    } catch (error) {
      // console.error(error);
      setFlash({ 
        message: error.response?.data?.message || 'Error saving attendance. Please try again.', 
        type: 'danger' 
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4">
      <FlashMessage message={flash.message} type={flash.type} onClose={() => setFlash({ message: '', type: '' })} />
      
      {/* NO SERVICE SECTION */}
      <div className={`border rounded-2xl overflow-hidden transition-all ${isReasonDisabled ? 'border-gray-100 opacity-60' : 'border-indigo-100 shadow-sm'}`}>
        <button type="button" onClick={() => !isReasonDisabled && setOpenSection(openSection === 'reason' ? null : 'reason')} disabled={isReasonDisabled} className={`w-full flex items-center justify-between p-4 text-left transition-colors ${openSection === 'reason' ? 'bg-red-50' : 'bg-white hover:bg-gray-50'}`}>
          <div className="flex items-center gap-3"><AlertCircle className={`w-5 h-5 ${hasReasonData ? 'text-red-500' : 'text-gray-400'}`} /><span className="font-bold text-gray-700">NO Service?</span></div>
          {openSection === 'reason' ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
        </button>
        {openSection === 'reason' && (
          <div className="p-4 bg-white border-t border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
            <textarea rows="3" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none resize-none" placeholder="Write your reason here..." value={reason} onChange={(e) => setReason(e.target.value)} disabled={isReasonDisabled} />
          </div>
        )}
      </div>

      {/* ATTENDANCE SECTION */}
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
                  {key.includes('offering') ? (
                    <div className="relative rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><span className="text-gray-500 sm:text-sm">₵</span></div>
                        <input type="number" name={key} value={stats[key]} onChange={handleStatChange} autoComplete='off' min={'0'} step="0.1" className="w-full rounded-md border border-gray-300 py-2 pl-7 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="0.00" />
                    </div>
                  ) : (
                    <input type="number" name={key} value={stats[key]} onChange={handleStatChange} autoComplete='off' min={'0'} className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 flex gap-3">
        {initialData && (
          <button
            type="button"
            onClick={onDelete}
            className="p-4 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors flex items-center justify-center gap-2 font-semibold"
            title="Delete Entry"
          >
            <Trash2 className="w-5 h-5" />
            <span>Delete</span>
          </button>
        )}
        
        <button
          type="submit"
          disabled={!hasReasonData && !hasAttendanceData}
          className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          {isEditMode ? 'Update Attendance' : 'Save Attendance'}
        </button>
      </div>
    </form>
  );
};

export default AttendanceTracker;