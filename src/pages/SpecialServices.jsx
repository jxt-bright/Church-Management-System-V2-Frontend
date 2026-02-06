import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Church, Edit, Trash2, Search, 
  MapPin, Eye, MoreVertical, X, AlertCircle, Filter, CheckCircle,
  ChevronLeft, ChevronRight 
} from 'lucide-react';
import Swal from 'sweetalert2';
import specialService from '../services/specialService';
import churchService from '../services/churchService'; 
import FlashMessage from '../components/FlashMessage';
import { useAuth } from '../context/AuthContext';
import '../assets/styles/GroupsModern.css';
import '../assets/styles/Attendance.css'; 

const SpecialServiceList = () => {
  const { user } = useAuth();
  
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  // Data & UI State
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Home Caring Fellowship');
  const [filterDate, setFilterDate] = useState(getCurrentMonth()); 
  
  // Search States
  const [selectedChurch, setSelectedChurch] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const resultsRef = useRef(null);

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [flash, setFlash] = useState({ message: '', type: '' });
  
  // Edit Modal States
  const [selectedService, setSelectedService] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    category: '',
    date: '',
    adults: 0,
    youths: 0,
    children: 0
  });

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [itemsPerPage] = useState(6);

  const tabs = ['Home Caring Fellowship', 'GCK', 'Seminar'];
  const userStatus = user?.status?.toLowerCase() || '';
  
  const canSearch = ['manager', 'grouppastor', 'groupadmin'].includes(userStatus);
  const isLocalLeader = ['churchpastor', 'churchadmin'].includes(userStatus);
  const isGroupLeader = ['grouppastor', 'groupadmin'].includes(userStatus);

  // --- Search Logic ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim() && canSearch) {
        setIsSearching(true);
        try {
          const response = await churchService.getChurches({ search: searchTerm });
          let data = Array.isArray(response) ? response : (response.churches || response.data || []);
          setSearchResults(data);
        } catch (error) {
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, canSearch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (resultsRef.current && !resultsRef.current.contains(e.target)) setShowResults(false);
      if (!e.target.closest('.action-btn') && !e.target.closest('.action-dropdown-menu')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- API Fetch Logic ---
  useEffect(() => {
    fetchAttendance();
  }, [currentPage, filterDate, activeTab, selectedChurch, user]);

  const fetchAttendance = async () => {
    if (!user || !filterDate) {
      setServices([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const queryParams = {
        page: currentPage,
        limit: itemsPerPage,
        month: filterDate,
        category: activeTab,
      };

      if (selectedChurch) {
        queryParams.churchId = selectedChurch._id;
      } else if (isLocalLeader) {
        queryParams.churchId = user.churchId;
      } else if (isGroupLeader) {
        queryParams.groupId = user.groupId;
      } 

      const response = await specialService.getAttendance({ params: queryParams });
      
      // Standardize response data
      const data = response.data || response.services || response;
      setServices(Array.isArray(data) ? data : []);
      
      // Update pagination info from backend response
      setTotalPages(response.totalPages || 1);
      setTotalRecords(response.totalRecords || (Array.isArray(data) ? data.length : 0));
    } catch (error) {
      setFlash({ message: 'Error fetching records', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---
  const handleEditClick = (service) => {
    setSelectedService(service);
    setEditFormData({
      category: service.category,
      date: service.date.split('T')[0],
      adults: service.adults,
      youths: service.youths,
      children: service.children
    });
    setShowEditModal(true);
    setActiveDropdown(null);
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await specialService.update(selectedService._id, editFormData);
      setFlash({ message: 'Record updated successfully!', type: 'success' });
      setShowEditModal(false);
      fetchAttendance();
    } catch (error) {
      setFlash({ message: error.response?.data?.message || 'Update failed', type: 'danger' });
    }
  };

  const handleDeleteClick = (service) => {
    setActiveDropdown(null);
    Swal.fire({
      title: 'Are you sure?',
      text: `Delete record for ${service.churchName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await specialService.delete(service._id);
          Swal.fire('Deleted!', 'Record has been removed.', 'success');
          fetchAttendance();
        } catch (error) {
          Swal.fire('Error!', 'Failed to delete record.', 'error');
        }
      }
    });
  };

  const handleSelectChurch = (church) => {
    setSelectedChurch(church);
    setSearchTerm('');
    setShowResults(false);
    setCurrentPage(1);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setActiveDropdown(null);
  };

  const getInitials = (item) => {
    if (!item?.name) return 'C';
    const words = item.name.trim().split(/\s+/);
    return words.length >= 2 ? (words[0][0] + words[1][0]).toUpperCase() : item.name.substring(0, 2).toUpperCase();
  };

  const highlightText = (text) => {
    if (!searchTerm) return text;
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === searchTerm.toLowerCase() ? <span key={i} className="highlight">{part}</span> : part
    );
  };

  const getBadgeStyle = (category) => {
    switch (category) {
      case 'Home Caring Fellowship': return { bg: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe' };
      case 'GCK': return { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' };
      case 'Seminar': return { bg: '#fdf2f8', text: '#db2777', border: '#fbcfe8' };
      default: return { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' };
    }
  };

  return (
    <div className="modern-page-bg">
      <FlashMessage message={flash.message} type={flash.type} onClose={() => setFlash({ message: '', type: '' })} />

      <div className="hero-banner" style={{ minHeight: '120px', paddingBottom: '0' }}>
        <div className="hero-nav" style={{ justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div>
            <h1 style={{ color: 'white', fontSize: '1.75rem', fontWeight: 'bold', margin: 0 }}>Special Services</h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '0.25rem' }}>Attendance management and reporting.</p>
          </div>
        </div>
      </div>

      <div className="content-container" style={{ marginTop: '-2rem' }}>
        <div className="data-card" style={{ marginBottom: '1.5rem', padding: '0', overflow: 'visible' }}>
          <div style={{ padding: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            
            {canSearch && (
              <div className="search-container" style={{ flex: '2 1 0%', minWidth: '300px' }} ref={resultsRef}>
                <div className="search-input-wrapper">
                  <Search className="search-icon" />
                  <input 
                    type="text" 
                    className="search-input"
                    placeholder="Search Church Name..." 
                    value={searchTerm} 
                    onChange={(e) => { setSearchTerm(e.target.value); setShowResults(true); }}
                    onFocus={() => searchTerm && setShowResults(true)}
                  />
                  {showResults && (
                    <div className="search-dropdown animate-fadeIn">
                      {searchResults.length === 0 ? (
                        <div className="dropdown-empty">
                          {isSearching ? <><span className="custom-spinner me-2"></span>Searching...</> : 'No church found.'}
                        </div>
                      ) : (
                        <div className="flex flex-col bg-white overflow-hidden">
                          {searchResults.map((church) => (
                            <div key={church._id} onClick={() => handleSelectChurch(church)} className="p-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 border-b border-slate-50 last:border-0 transition-colors">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                                {getInitials(church)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-slate-800 truncate">{highlightText(church.name)}</div>
                                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                  <MapPin size={10} className="text-slate-400 shrink-0" />
                                  <span className="truncate">{church.location || 'No location'}</span>
                                </div>
                              </div>
                              {selectedChurch?._id === church._id && <CheckCircle size={14} className="text-green-500 shrink-0" />}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {selectedChurch && (
                  <div className="flex items-center justify-between p-4 bg-indigo-50 border-2 border-indigo-200 rounded-2xl animate-fadeIn shadow-sm mt-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                        {getInitials(selectedChurch)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 leading-tight truncate">{selectedChurch.name}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <MapPin size={12} className="text-indigo-400 shrink-0" />
                          <span className="truncate">{selectedChurch.location || 'Location available'}</span>
                        </div>
                      </div>
                    </div>
                    <button type="button" onClick={() => setSelectedChurch(null)} className="p-2 bg-white hover:bg-red-50 text-red-500 rounded-full shadow-sm border border-slate-100 transition-colors shrink-0">
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}

            <div style={{ flex: '1 1 0%', minWidth: '200px', position: 'relative', display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', padding: '0 1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', height: '45px' }} className="date-filter-wrapper">
                <Filter size={16} className="text-indigo-500" style={{ marginRight: '10px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <span style={{ fontSize: '0.6rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Filter by Month</span>
                    <input type="month" value={filterDate} onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }} style={{ backgroundColor: 'transparent', fontSize: '0.85rem', color: filterDate ? '#1e293b' : '#ef4444', fontWeight: '700', outline: 'none', width: '100%', cursor: 'pointer' }} />
                </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '550px', margin: '0 auto' }}>
              {tabs.map((tab) => (
                <button key={tab} onClick={() => handleTabChange(tab)} className="tab-button" style={{ padding: '1.15rem 0.5rem', fontSize: '0.95rem', fontWeight: '700', color: activeTab === tab ? '#4f46e5' : '#64748b', borderBottom: activeTab === tab ? '3px solid #4f46e5' : '3px solid transparent', transition: 'all 0.2s ease', cursor: 'pointer', backgroundColor: 'transparent', flex: '1', textAlign: 'center', outline: 'none' }}>{tab}</button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="modern-loading"><div className="loading-spinner"></div></div>
        ) : services.length > 0 ? (
          <div className="grid-list">
            {services.map((service) => {
              const badge = getBadgeStyle(service.category);
              return (
                <div key={service._id} className="grid-item-card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ backgroundColor: badge.bg, color: badge.text, border: `1px solid ${badge.border}`, padding: '4px 12px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>{service.category}</div>
                      </div>
                      <span style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>{new Date(service.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>

                    <div style={{ position: 'relative' }}>
                      <button className="action-btn" onClick={() => setActiveDropdown(activeDropdown === service._id ? null : service._id)}><MoreVertical className="icon-sm" style={{ color: '#94a3b8' }} /></button>
                      {activeDropdown === service._id && (
                        <div className="action-dropdown-menu" style={{ right: 0 }}>
                          <button className="action-dropdown-item" onClick={() => handleEditClick(service)}><Edit className="icon-sm me-2" /> Edit Record</button>
                          <button className="action-dropdown-item danger" onClick={() => handleDeleteClick(service)}><Trash2 className="icon-sm me-2" /> Delete</button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="gic-info" style={{ marginTop: '1.25rem' }}>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{service.churchName}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                      <MapPin className="icon-xs me-1" style={{ width: '14px' }} />
                      <span className="text-truncate">{service.churchLocation}</span>
                    </div>
                  </div>

                  <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', textAlign: 'center' }}>
                      <div><p style={{ fontSize: '0.6rem', fontWeight: 'bold', color: '#94a3b8', margin: 0 }}>ADULTS</p><p style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>{service.adults}</p></div>
                      <div><p style={{ fontSize: '0.6rem', fontWeight: 'bold', color: '#94a3b8', margin: 0 }}>YOUTHS</p><p style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>{service.youths}</p></div>
                      <div><p style={{ fontSize: '0.6rem', fontWeight: 'bold', color: '#94a3b8', margin: 0 }}>KIDS</p><p style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>{service.children}</p></div>
                    </div>
                    <div className="mt-2">
                      <span className="badge-pill badge-green" style={{ width: '100%', display: 'block', textAlign: 'center', fontSize: '0.95rem', fontWeight: '900', padding: '8px 0' }}>
                        Total Attendance: {service.total}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <AlertCircle style={{ width: '3rem', height: '3rem', marginBottom: '1rem', opacity: 0.3 }} />
            <h3>No Records Found</h3>
            <p>{filterDate ? 'Try selecting a different month or adjusting your filters.' : 'Please select a month to view records.'}</p>
          </div>
        )}

        {/* PAGINATION FOOTER - Added logic here */}
        {!loading && filterDate && services.length > 0 && (
          <div className="pagination-container">
            <div className="pagination-info">
              Showing {services.length} of {totalRecords} records
            </div>
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="pagination-btn" style={{ cursor: 'default', backgroundColor: 'transparent',}}>
                Page {currentPage} of {totalPages || 1}
              </span>
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage >= totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal Component */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fadeIn" onClick={() => setShowEditModal(false)}>
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full overflow-hidden animate-scaleIn" onClick={(e) => e.stopPropagation()} style={{ borderRadius: '32px' }}>
            <div className="bg-indigo-600 p-8 text-center text-white relative">
              <button onClick={() => setShowEditModal(false)} className="absolute right-6 top-6 p-2 hover:bg-white/20 rounded-full transition-colors"><X size={24} /></button>
              <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-2xl mb-4"><Edit size={28} /></div>
              <h2 className="text-2xl font-bold">Edit Record</h2>
              <p className="opacity-80 text-sm mt-1">{selectedService?.churchName}</p>
            </div>

            <form onSubmit={handleEditSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Category</label>
                  <select name="category" value={editFormData.category} onChange={handleEditChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 transition-all">
                    {tabs.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Date</label>
                  <input type="date" name="date" value={editFormData.date} onChange={handleEditChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="text-center space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Adults</label>
                  <input type="number" name="adults" value={editFormData.adults} onChange={handleEditChange} className="w-full p-3 text-center text-lg font-bold rounded-xl border border-slate-200 bg-white" />
                </div>
                <div className="text-center space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Youths</label>
                  <input type="number" name="youths" value={editFormData.youths} onChange={handleEditChange} className="w-full p-3 text-center text-lg font-bold rounded-xl border border-slate-200 bg-white" />
                </div>
                <div className="text-center space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Children</label>
                  <input type="number" name="children" value={editFormData.children} onChange={handleEditChange} className="w-full p-3 text-center text-lg font-bold rounded-xl border border-slate-200 bg-white" />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-4 font-bold transition-all" style={{ borderRadius: '50px', backgroundColor: '#f1f5f9', color: '#475569'}}>Cancel</button>
                <button type="submit" className="flex-1 py-4 text-white font-bold shadow-lg transition-all" style={{ borderRadius: '50px', backgroundColor: '#4f46e5'}}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
        .animate-scaleIn { animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .tab-button:hover { color: #4f46e5 !important; }
        .date-filter-wrapper:focus-within { border-color: #4f46e5 !important; }
      `}</style>
    </div>
  );
};

export default SpecialServiceList;