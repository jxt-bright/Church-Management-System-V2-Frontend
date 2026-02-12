import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, ClipboardList, Baby, 
  UserCircle, CheckCircle2, Search, X, MapPin, ChevronDown, Building2 
} from 'lucide-react';
import churchService from '../services/churchService.js';
import specialServiece from '../services/specialService.js';
import { useAuth } from '../context/AuthContext';
import FlashMessage from '../components/FlashMessage';
import '../assets/styles/SendMessage.css'; // Importing shared search styles

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
const SpecialServiceForm = () => {
  const { user } = useAuth();

  // Search and Selection State
  const [selectedChurch, setSelectedChurch] = useState(null);
  const [churches, setChurches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form and UI State
  const [formData, setFormData] = useState({
    category: '',
    date: '',
    adults: '',
    youths: '',
    children: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flash, setFlash] = useState({ message: '', type: '' });

  // Permissions
  const userStatus = user?.status?.toLowerCase() || '';
  const canSearch = ['manager', 'grouppastor', 'groupadmin'].includes(userStatus);

  // Background Logic for local pastors
  useEffect(() => {
    if (user && !canSearch && user.churchId) {
      setSelectedChurch({
        _id: user.churchId,
        name: user.churchName,
        location: user.churchLocation
      });
    }
  }, [user, canSearch]);

  // Initial Fetch of Churches for SearchSelect
  useEffect(() => {
    const fetchChurches = async () => {
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
    fetchChurches();
  }, [canSearch]);

  const churchOptions = churches.map(c => ({
    value: c._id,
    label: c.name || c.churchname
  }));

  const handleSelectChurch = (churchId) => {
    if (!churchId) {
      setSelectedChurch(null);
      return;
    }
    const church = churches.find(c => c._id === churchId);
    setSelectedChurch(church);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedChurch?._id) {
      setFlash({ message: "Error: Please select a church first.", type: 'danger' });
      return;
    }
    
    setIsSubmitting(true);

    const payload = { 
      ...formData, 
      churchId: selectedChurch._id,
      adults: parseInt(formData.adults) || 0,
      youths: parseInt(formData.youths) || 0,
      children: parseInt(formData.children) || 0
    };

    try {
      const res = await specialServiece.save(payload);
      setFlash({ message: res.message || 'Attendance recorded successfully!', type: 'success' });
      
      setFormData({ 
        category: '', 
        date: '', 
        adults: '', 
        youths: '', 
        children: '' 
      });
      
      if (canSearch) {
        setSelectedChurch(null);
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
      setFlash({ 
        message: error.response?.data?.message || "Failed to save record.", 
        type: 'danger' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      
      <FlashMessage
        message={flash.message}
        type={flash.type}
        onClose={() => setFlash({ message: '', type: '' })}
      />

      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mt-4">
        <div className="bg-indigo-600 p-8 text-center text-white">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-3">
            <ClipboardList size={24} />
          </div>
          <h1 className="text-2xl font-bold">Special Service</h1>
          <p className="opacity-80 text-sm">Enter detailed attendance records</p>
        </div>

        <div className="p-6 md:p-10 space-y-6">
          
          {canSearch && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Building2 size={16} className="text-indigo-500" />
                Select Church
              </label>

              <SearchSelect 
                options={churchOptions}
                value={selectedChurch?._id || null}
                onChange={handleSelectChurch}
                placeholder="Search and select church..."
                icon={Building2}
                label="Church"
                isLoading={isLoading}
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className={`space-y-6 ${canSearch ? 'pt-4 border-t border-slate-100' : ''}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Category</label>
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50"
                >
                  <option value="">Select Category</option>
                  <option value="Home Caring Fellowship">Home Caring Fellowship</option>
                  <option value="GCK">GCK</option>
                  <option value="Seminar">Seminar</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Date</label>
                <input
                  type="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="text-center space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-400 flex items-center justify-center gap-1"><UserCircle size={12}/> Adults</label>
                <input type="number" name="adults" required value={formData.adults} onChange={handleChange} placeholder="0" min={'0'} className="w-full p-3 text-center text-lg font-bold rounded-xl border border-slate-200 bg-white" />
              </div>
              <div className="text-center space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-400 flex items-center justify-center gap-1"><Users size={12}/> Youths</label>
                <input type="number" name="youths" required value={formData.youths} onChange={handleChange} placeholder="0" min={'0'} className="w-full p-3 text-center text-lg font-bold rounded-xl border border-slate-200 bg-white" />
              </div>
              <div className="text-center space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-400 flex items-center justify-center gap-1"><Baby size={12}/> Children</label>
                <input type="number" name="children" required value={formData.children} onChange={handleChange} placeholder="0" min={'0'} className="w-full p-3 text-center text-lg font-bold rounded-xl border border-slate-200 bg-white" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                   <div className="spinner-border spinner-border-sm" role="status"></div>
                  Saving...
                </span>
              ) : 'Save Special Service'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SpecialServiceForm;