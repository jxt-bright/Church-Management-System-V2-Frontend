
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Building2, MapPin, User, Phone, Mail } from 'lucide-react';
import churchService from '../services/churchService.js';
import groupService from '../services/groupService.js';
import FlashMessage from '../components/FlashMessage';
import { useAuth } from '../context/AuthContext';

const AddChurch = () => {
    const { user } = useAuth();

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        pastor: '',
        phoneNumber: '',
        email: '',
        groupId: ''
    });

    // Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [flash, setFlash] = useState({ message: '', type: '' });

    const resultsRef = useRef(null);

    // Helper Functions
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

    // Handlers
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setShowResults(value.trim() !== '');
        if (!value.trim()) {
            setGroups([]);
        }
    };

    const handleGroupSelect = (group) => {
        setSelectedGroup(group);
        setFormData(prev => ({ ...prev, groupId: group._id }));
        setSearchTerm('');
        setShowResults(false);
    };

    const handleRemoveGroup = () => {
        setSelectedGroup(null);
        setFormData(prev => ({ ...prev, groupId: '' }));
    };

    const handleSubmit = async (e) => {
        try {
            e.preventDefault();

            if (isLoading) return;
            setIsLoading(true);

            // Determine the correct Group ID based on role
            let targetGroupId;

            if (user?.status === 'manager') {
                // Manager: Use the ID from search selection
                targetGroupId = formData.groupId;
            } else {
                // Group Admin/Pastor: Use their own assigned Group ID
                targetGroupId = user?.groupId;
            }

            if (!targetGroupId) {
                setFlash({ message: 'Please select a group', type: 'danger' });
                setIsLoading(false);
                return;
            }

            const submitData = {
                name: formData.name,
                location: formData.location,
                pastor: formData.pastor,
                phoneNumber: formData.phoneNumber,
                email: formData.email,
                groupId: targetGroupId
            };

            const response = await churchService.addChurch(submitData);

            setFlash({ message: response.message || 'Church created successfully!', type: 'success' });

            // Reset form
            setFormData({
                name: '',
                location: '',
                pastor: '',
                phoneNumber: '',
                email: '',
                groupId: ''
            });
            setSelectedGroup(null);
            setSearchTerm('');

        } catch (error) {
            setFlash({
                message: error.response?.data?.message || 'Error registering church',
                type: 'danger'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch Groups
    const fetchGroups = async () => {
        if (!searchTerm) return;

        setIsLoading(true);

        try {
            const params = { search: searchTerm };
            const response = await groupService.getGroups(params);

            let groupData = [];
            if (Array.isArray(response)) {
                groupData = response;
            } else if (response.groups && Array.isArray(response.groups)) {
                groupData = response.groups;
            } else if (response.data && Array.isArray(response.data)) {
                groupData = response.data;
            }

            setGroups(groupData);

            if (groupData.length > 0) {
                setShowResults(true);
            }
        } catch (error) {
            setFlash({
                message: error.response?.data?.message || 'Error fetching groups',
                type: 'danger'
            });
            setGroups([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Effects
    useEffect(() => {
        // const delayDebounceFn = setTimeout(() => {
        //     if (searchTerm && user?.status === 'manager') {
        //         fetchGroups();
        //     }
        // }, 350);
        if (searchTerm && user?.status === 'manager') {
            fetchGroups();
        }

        // return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (resultsRef.current && !resultsRef.current.contains(e.target)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <main className="app-main">
            <FlashMessage
                message={flash.message}
                type={flash.type}
                onClose={() => setFlash({ message: '', type: '' })}
            />

            <div className="app-content-header my-4">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12 text-center">
                            <h2 className="mb-0">Registration Forms</h2>
                        </div>
                    </div>
                </div>
            </div>

            <div className="app-content px-3 pb-5">
                <div className="container-fluid">
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-10 col-lg-8 col-xl-6">
                            <div className="card card-info card-outline shadow-sm mb-4">
                                <div className="card-header">
                                    <div className="card-title">
                                        <h4 className="mb-0">Add Church</h4>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="card-body">
                                        <div className="row g-3">

                                            {/* Group Search - Only for Managers */}
                                            {user?.status === 'manager' && (
                                                <div className="col-12">
                                                    <label className="form-label fw-bold">
                                                        Select Group <span className="text-danger">*</span>
                                                    </label>

                                                    {/* Search Input */}
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
                                                                onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                                                                placeholder="Search groups by name..."
                                                                className="form-control form-control-lg"
                                                                style={{ paddingLeft: '45px' }}
                                                                autoComplete="off"
                                                            />
                                                        </div>

                                                        {/* Search Results Dropdown */}
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
                                                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                                                    zIndex: 1000
                                                                }}
                                                            >
                                                                {groups.length === 0 ? (
                                                                    <div style={{ padding: '1rem', textAlign: 'center', color: '#6c757d' }}>
                                                                        {isLoading ? 'Searching...' : 'No group(s) found.'}
                                                                    </div>
                                                                ) : (
                                                                    groups.map(group => (
                                                                        <div
                                                                            key={group._id}
                                                                            onClick={() => handleGroupSelect(group)}
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
                                                                                {getInitials(group)}
                                                                            </div>
                                                                            <div>
                                                                                <div style={{ fontWeight: '600', color: '#212529' }}>
                                                                                    {highlightText(group.name)}
                                                                                </div>
                                                                                <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                                                                                    {group.location}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Selected Group Display */}
                                                    {selectedGroup && (
                                                        <div
                                                            style={{
                                                                marginTop: '1rem',
                                                                padding: '1rem',
                                                                backgroundColor: '#f8f9fa',
                                                                borderRadius: '8px',
                                                                border: '2px solid #0dcaf0',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '1rem',
                                                                position: 'relative'
                                                            }}
                                                        >
                                                            <button
                                                                type="button"
                                                                onClick={handleRemoveGroup}
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
                                                                fontSize: '1rem'
                                                            }}>
                                                                {getInitials(selectedGroup)}
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: 'bold', color: '#212529', fontSize: '1.1rem' }}>
                                                                    {selectedGroup.name}
                                                                </div>
                                                                <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                                                                    Selected Group
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Church Name */}
                                            <div className="col-12">
                                                <label htmlFor="name" className="form-label fw-bold">
                                                    Church Name <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-lg"
                                                    id="name"
                                                    name="name"
                                                    placeholder="Enter church name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    autoComplete="off"
                                                    required
                                                />
                                            </div>

                                            {/* Location */}
                                            <div className="col-12">
                                                <label htmlFor="location" className="form-label fw-bold">
                                                    Location <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-lg"
                                                    id="location"
                                                    name="location"
                                                    placeholder="e.g. Accra, Ghana"
                                                    value={formData.location}
                                                    onChange={handleInputChange}
                                                    autoComplete="off"
                                                    required
                                                />
                                            </div>

                                            {/* Church Pastor */}
                                            <div className="col-12">
                                                <label htmlFor="pastor" className="form-label fw-bold">
                                                    Church Pastor <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-lg"
                                                    id="pastor"
                                                    name="pastor"
                                                    placeholder="e.g. Rev. John Doe"
                                                    value={formData.pastor}
                                                    onChange={handleInputChange}
                                                    autoComplete="off"
                                                    required
                                                />
                                            </div>

                                            {/* Phone Number & Email */}
                                            <div className="col-md-6">
                                                <label htmlFor="phoneNumber" className="form-label fw-bold">
                                                    Phone Number <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="tel"
                                                    className="form-control form-control-lg"
                                                    id="phoneNumber"
                                                    name="phoneNumber"
                                                    placeholder="e.g. 0244123456"
                                                    value={formData.phoneNumber}
                                                    onChange={handleInputChange}
                                                    autoComplete="off"
                                                    required
                                                />
                                            </div>

                                            <div className="col-md-6">
                                                <label htmlFor="email" className="form-label fw-bold">
                                                    Email (Optional)
                                                </label>
                                                <input
                                                    type="email"
                                                    className="form-control form-control-lg"
                                                    id="email"
                                                    name="email"
                                                    placeholder="e.g. church@example.com"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    autoComplete="off"
                                                />
                                            </div>

                                        </div>
                                    </div>

                                    <div className="card-footer d-flex justify-content-end gap-2 p-3 bg-light">
                                        <button
                                            className="btn btn-info px-4 text-white fw-bold"
                                            type="submit"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Submitting...
                                                </>
                                            ) : 'Create Church'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default AddChurch;