import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, ClipboardList, Baby, 
  UserCircle, CheckCircle, Search, X, MapPin 
} from 'lucide-react';
import churchService from '../services/churchService.js';
import specialServiece from '../services/specialService.js';
import { useAuth } from '../context/AuthContext';
import FlashMessage from '../components/FlashMessage';

const SpecialServiceForm = () => {
  const { user } = useAuth();

  // Search and Selection State
  const [selectedChurch, setSelectedChurch] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const resultsRef = useRef(null);

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

  const getInitials = (item) => {
    if (!item?.name) return 'C';
    const words = item.name.trim().split(/\s+/);
    return words.length >= 2 
      ? (words[0][0] + words[1][0]).toUpperCase() 
      : item.name.substring(0, 2).toUpperCase();
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim() && canSearch) {
        setIsLoading(true);
        try {
          const response = await churchService.getChurches({ search: searchTerm });
          const data = Array.isArray(response) ? response : (response.churches || response.data || []);
          setSearchResults(data);
        } catch (error) {
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

  const highlightText = (text) => {
    if (!searchTerm) return text;
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === searchTerm.toLowerCase()
        ? <span key={i} className="bg-yellow-200 font-bold">{part}</span>
        : part
    );
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
            <div className="space-y-4 relative" ref={resultsRef}>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Search size={16} className="text-indigo-500" />
                  Search Church
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setShowResults(true); }}
                    onFocus={() => setShowResults(true)}
                    placeholder="Search for a church..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 transition-all"
                  />
                  
                  {showResults && searchTerm && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-2xl max-h-60 overflow-y-auto z-50 animate-fadeIn custom-scrollbar">
                      {isLoading ? (
                        <div className="p-4 text-center text-slate-500 text-sm italic">Searching...</div>
                      ) : searchResults.length > 0 ? (
                        searchResults.map(church => (
                          <div 
                            key={church._id}
                            onClick={() => handleSelectChurch(church)}
                            className="p-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 border-b border-slate-50 last:border-0"
                          >
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                              {getInitials(church)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-slate-800 truncate">{highlightText(church.name)}</div>
                              {/* Location Icon added below */}
                              <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <MapPin size={10} className="text-slate-400 shrink-0" />
                                <span className="truncate">{church.location || 'Location not specified'}</span>
                              </div>
                            </div>
                            {selectedChurch?._id === church._id && <CheckCircle size={14} className="text-green-500 shrink-0" />}
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-slate-500 text-sm">No results found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {selectedChurch && (
                <div className="flex items-center justify-between p-4 bg-indigo-50 border-2 border-indigo-200 rounded-2xl animate-fadeIn shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-md">
                      {getInitials(selectedChurch)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 leading-tight">{selectedChurch.name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin size={12} className="text-indigo-400" />
                        {selectedChurch.location || 'Location available'}
                      </div>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setSelectedChurch(null)}
                    className="p-2 bg-white hover:bg-red-50 text-red-500 rounded-full shadow-sm border border-slate-100 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className={`space-y-6 ${canSearch ? 'pt-2 border-t border-slate-100' : ''}`}>
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
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
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