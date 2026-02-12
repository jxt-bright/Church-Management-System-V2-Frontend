import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Users, CheckCircle2, ChevronDown } from 'lucide-react';
import churchService from '../services/churchService.js';
import groupService from '../services/groupService.js';
import FlashMessage from '../components/FlashMessage';
import { useAuth } from '../context/AuthContext';

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
                            onClick={(e) => { e.stopPropagation(); onChange(null); }}
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
const AddChurch = () => {
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        location: '',
        pastor: '',
        phoneNumber: '',
        email: '',
        groupId: ''
    });

    const [groups, setGroups] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [flash, setFlash] = useState({ message: '', type: '' });

    useEffect(() => {
        const fetchInitialGroups = async () => {
            if (user?.status === 'manager') {
                setIsLoading(true);
                try {
                    const response = await groupService.getGroups();
                    const groupData = response.groups || response.data || response || [];
                    setGroups(Array.isArray(groupData) ? groupData : []);
                } catch (error) {
                    setFlash({ message: 'Error loading groups.', type: 'danger' });
                } finally {
                    setIsLoading(false);
                }
            }
        };
        if (user) fetchInitialGroups();
    }, [user]);

    const groupOptions = groups.map(g => ({ value: g._id, label: g.name }));

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGroupChange = (val) => {
        setFormData(prev => ({ ...prev, groupId: val }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLoading) return;

        setIsLoading(true);

        try {
            let targetGroupId = user?.status === 'manager' ? formData.groupId : user?.groupId;

            if (!targetGroupId) {
                setFlash({ message: 'Please select a group', type: 'danger' });
                setIsLoading(false);
                return;
            }

            const submitData = { ...formData, groupId: targetGroupId };
            const response = await churchService.addChurch(submitData);

            setFlash({ message: response.message || 'Church created successfully!', type: 'success' });

            setFormData({
                name: '',
                location: '',
                pastor: '',
                phoneNumber: '',
                email: '',
                groupId: ''
            });

        } catch (error) {
            setFlash({
                message: error.response?.data?.message || 'Error registering church',
                type: 'danger'
            });
        } finally {
            setIsLoading(false);
        }
    };

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
                                            {user?.status === 'manager' && (
                                                <div className="col-12">
                                                    <label className="form-label fw-bold">
                                                        Select Group <span className="text-danger">*</span>
                                                    </label>
                                                    <SearchSelect
                                                        options={groupOptions}
                                                        value={formData.groupId}
                                                        onChange={handleGroupChange}
                                                        placeholder="Search and select a group"
                                                        icon={Users}
                                                        label="Group"
                                                        isLoading={isLoading}
                                                    />
                                                </div>
                                            )}

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
                                                    required
                                                />
                                            </div>

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
                                                    required
                                                />
                                            </div>

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
                                                    required
                                                />
                                            </div>

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