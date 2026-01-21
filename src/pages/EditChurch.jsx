import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, X, Loader2, Search, Building2 } from 'lucide-react';
import churchService from '../services/churchService';
import groupService from '../services/groupService';
import FlashMessage from '../components/FlashMessage';
import { useAuth } from '../context/AuthContext';

const ChurchEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    pastor: '',
    phoneNumber: '',
    email: '',
    groupId: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const resultsRef = useRef(null);

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flash, setFlash] = useState({ message: '', type: '' });

  const highlightText = (text) => {
    if (!searchTerm) return text;
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === searchTerm.toLowerCase()
        ? <span key={i} style={{ backgroundColor: '#fef08a', fontWeight: 'bold' }}>{part}</span>
        : part
    );
  };

  const getInitials = (group) => {
    if (!group?.name) return 'G';
    const words = group.name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return group.name.substring(0, 2).toUpperCase();
  };

  useEffect(() => {
    const fetchChurchData = async () => {
      try {
        const response = await churchService.getChurchById(id);

        // Set basic form data
        setFormData({
          name: response.name || '',
          location: response.location || '',
          pastor: response.pastor || '',
          phoneNumber: response.phoneNumber || '',
          email: response.email || '',
          groupId: response.groupId?._id || response.groupId || ''
        });

        // Handle Group Pre-selection logic
        if (response.groupId) {
          if (typeof response.groupId === 'object') {
            setSelectedGroup(response.groupId);
          } else if (typeof response.groupId === 'string') {
            try {
              const groupDetails = await groupService.getGroupById(response.groupId);
              setSelectedGroup(groupDetails);
            } catch (groupError) { }
          }
        }

      } catch (error) {
        setFlash({
          message: error.response?.data?.message || 'Failed to fetch church details',
          type: 'danger'
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchChurchData();
    }
  }, [id]);

  const fetchGroups = async () => {
    if (!searchTerm) return;
    try {
      const params = { search: searchTerm };
      const response = await groupService.getGroups(params);

      let groupData = [];
      if (Array.isArray(response)) groupData = response;
      else if (response.groups) groupData = response.groups;
      else if (response.data) groupData = response.data;

      setGroups(groupData);
      if (groupData.length > 0) setShowResults(true);
    } catch (error) {
      console.error("Group search error", error);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm && user?.status === 'manager') {
        fetchGroups();
      }
    }, 350);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (resultsRef.current && !resultsRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (!e.target.value.trim()) setGroups([]);
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setFormData(prev => ({ ...prev, groupId: group._id }));
    setSearchTerm('');
    setShowResults(false);
    if (errors.groupId) setErrors(prev => ({ ...prev, groupId: '' }));
  };

  const handleRemoveGroup = () => {
    setSelectedGroup(null);
    setFormData(prev => ({ ...prev, groupId: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Church name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.pastor.trim()) newErrors.pastor = 'Pastor name is required';
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';

    if (user?.status === 'manager' && !formData.groupId) {
      newErrors.groupId = 'Please select a group';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validateForm()) return;

    setIsSubmitting(true);
    setFlash({ message: '', type: '' });

    try {
      await churchService.updateChurch(id, formData);
      navigate('/churches', {
        state: {
          flashMessage: 'Church updated successfully!',
          flashType: 'success'
        }
      });
    } catch (error) {
      setFlash({
        message: error.response?.data?.message || 'Failed to update church',
        type: 'danger'
      });
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => navigate(-1);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-500">Loading church details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <FlashMessage
        message={flash.message}
        type={flash.type}
        onClose={() => setFlash({ message: '', type: '' })}
      />

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Building2 className="w-6 h-6" />
            Edit Church
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* GROUP SELECTION */}
            {user?.status === 'manager' && (
              <div className="border-b border-gray-100 pb-6 mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Group <span className="text-red-500">*</span>
                </label>

                <div ref={resultsRef} style={{ position: 'relative' }}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      onFocus={() => { if (searchTerm) setShowResults(true); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                      placeholder="Search groups by name..."
                      className={`w-full pl-10 pr-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.groupId ? 'border-red-500' : 'border-gray-300'
                        }`}
                      autoComplete="off"
                    />
                  </div>

                  {/* Dropdown Results */}
                  {showResults && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, right: 0,
                      backgroundColor: 'white', border: '1px solid #dee2e6',
                      borderRadius: '8px', marginTop: '0.5rem', maxHeight: '300px',
                      overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 50
                    }}>
                      {groups.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">No groups found.</div>
                      ) : (
                        groups.map(group => (
                          <div
                            key={group._id}
                            onClick={() => handleGroupSelect(group)}
                            className="p-3 cursor-pointer flex items-center gap-3 hover:bg-gray-50 border-b border-gray-50 last:border-0"
                          >
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '50%',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: 'white', fontWeight: 'bold', fontSize: '0.75rem'
                            }}>
                              {getInitials(group)}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{highlightText(group.name)}</div>
                              <div className="text-xs text-gray-500">{group.location}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Group Card */}
                {selectedGroup && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-cyan-400 flex items-center gap-4 relative">
                    <button
                      type="button"
                      onClick={handleRemoveGroup}
                      className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div style={{
                      width: '45px', height: '45px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 'bold', fontSize: '1rem'
                    }}>
                      {getInitials(selectedGroup)}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-lg">{selectedGroup.name}</div>
                      <div className="text-sm text-gray-500">Selected Group</div>
                    </div>
                  </div>
                )}
                {errors.groupId && <p className="mt-1 text-sm text-red-600">{errors.groupId}</p>}
              </div>
            )}

            {/* CHURCH DETAILS FORM */}
            <div className="grid gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Church Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.location ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
              </div>

              <div>
                <label htmlFor="pastor" className="block text-sm font-medium text-gray-700 mb-1">
                  Pastor <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="pastor"
                  name="pastor"
                  value={formData.pastor}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.pastor ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.pastor && <p className="mt-1 text-sm text-red-600">{errors.pastor}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-100 mt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChurchEditPage;