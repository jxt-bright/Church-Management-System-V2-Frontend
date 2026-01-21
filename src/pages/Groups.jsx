import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Search, MapPin, Phone, User, Mail, // Added Mail icon
    MoreVertical, Edit, Trash2, ChevronRight, Building2
} from 'lucide-react';
import Swal from 'sweetalert2';
import groupService from '../services/groupService';
import FlashMessage from '../components/FlashMessage';
import '../assets/styles/GroupsModern.css';

const GroupsView = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Data & State
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalGroups, setTotalGroups] = useState(0);
    const [itemsPerPage] = useState(12);

    const [flash, setFlash] = useState({ message: '', type: '' });
    const [activeDropdown, setActiveDropdown] = useState(null);

    // Fetch Data
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchGroups();
        }, 350);
        return () => clearTimeout(delayDebounceFn);
    }, [currentPage, searchTerm]);

    useEffect(() => {
        const handleClickOutside = () => setActiveDropdown(null);
        if (activeDropdown) document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [activeDropdown]);

    useEffect(() => {
        if (location.state && location.state.flashMessage) {
            setFlash({
                message: location.state.flashMessage,
                type: location.state.flashType || 'success'
            });
            window.history.replaceState({}, document.title)
        }
    }, [location]);

    const fetchGroups = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: itemsPerPage,
                search: searchTerm,
            };

            const response = await groupService.getGroups(params);

            if (response.groups && Array.isArray(response.groups)) {
                setGroups(response.groups);
                setTotalGroups(response.totalGroups || response.groups.length);
                setTotalPages(response.totalPages || 1);
            } else if (Array.isArray(response)) {
                setGroups(response);
                setTotalGroups(response.length);
                setTotalPages(1);
            } else if (response.data && Array.isArray(response.data)) {
                setGroups(response.data);
                setTotalGroups(response.total || response.data.length);
                setTotalPages(response.totalPages || 1);
            } else {
                setGroups([]);
                setTotalPages(0);
            }
        } catch (error) {
            setFlash({
                message: error.response?.data?.message || 'Error fetching groups',
                type: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    // Handlers
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleDelete = (id) => {
        setActiveDropdown(null);

        Swal.fire({
            title: "Delete Group?",
            text: "This action cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await groupService.deleteGroup(id);

                    await Swal.fire({
                        title: "Deleted!",
                        text: "Group has been removed.",
                        icon: "success",
                        timer: 1500,
                        showConfirmButton: false
                    });

                    // Logic to handle empty pages after deletion
                    if (groups.length === 1 && currentPage > 1) {
                        setCurrentPage(prev => prev - 1);
                    } else {
                        fetchGroups();
                    }

                } catch (error) {
                    console.error("Delete error:", error);
                    Swal.fire(
                        "Error",
                        error.response?.data?.message || "Failed to delete group.",
                        "error"
                    );
                }
            }
        });
    };

    const handleEdit = (id) => navigate(`/group/edit/${id}`);

    return (
        <div className="modern-page-bg">
            <FlashMessage
                message={flash.message}
                type={flash.type}
                onClose={() => setFlash({ message: '', type: '' })}
            />

            {/* Top Header Area */}
            <div className="hero-banner" style={{ minHeight: '120px', paddingBottom: '0' }}>
                <div className="hero-nav" style={{ justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div>
                        <h1 style={{ color: 'white', fontSize: '1.75rem', fontWeight: 'bold', margin: 0 }}>
                            Groups Directory
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '0.25rem' }}>
                            Manage and oversee all church groups.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content Container */}
            <div className="content-container" style={{ marginTop: '-2rem' }}>

                {/* Toolbar Card */}
                <div className="data-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
                    <div className="data-toolbar">
                        <div className="search-box" style={{ flex: 1, maxWidth: '400px' }}>
                            <Search className="icon-xs" />
                            <input
                                type="text"
                                placeholder="Search groups..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </div>
                        {/* <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                                <b>{totalGroups}</b> Total Groups
                            </span>
                        </div> */}
                    </div>
                </div>

                {/* Grid of Groups */}
                {loading ? (
                    <div className="modern-loading">
                        <div className="loading-spinner"></div>
                    </div>
                ) : groups.length > 0 ? (
                    <div className="grid-list">
                        {groups.map((group) => (
                            <div key={group._id || group.id} className="grid-item-card" onClick={() => handleViewDetails(group._id)}>
                                {/* Card Header / Icon */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <div className="gic-icon">
                                        <Building2 className="icon-sm" />
                                    </div>

                                    {/* Dropdown Menu Trigger */}
                                    <div style={{ position: 'relative' }}>
                                        <button
                                            className="action-btn"
                                            style={{ padding: '4px' }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveDropdown(activeDropdown === group._id ? null : group._id);
                                            }}
                                        >
                                            <MoreVertical className="icon-sm" style={{ color: '#94a3b8' }} />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {activeDropdown === group._id && (
                                            <div className="action-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                                                {/* <button className="action-dropdown-item" onClick={() => handleViewDetails(group._id)}>
                                                    <ChevronRight className="icon-sm me-2" /> View Details
                                                </button> */}
                                                <button className="action-dropdown-item" onClick={() => handleEdit(group._id)}>
                                                    <Edit className="icon-sm me-2" /> Edit Group
                                                </button>
                                                <div style={{ borderTop: '1px solid #f1f5f9', margin: '4px 0' }}></div>
                                                <button className="action-dropdown-item danger" onClick={() => handleDelete(group._id)}>
                                                    <Trash2 className="icon-sm me-2" /> Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Card Info (Body) */}
                                <div className="gic-info" style={{ marginBottom: '1rem' }}>
                                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{group.name}</h4>

                                    <div style={{ display: 'flex', alignItems: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                                        <MapPin className="icon-xs me-1" style={{ width: '14px' }} />
                                        <span className="text-truncate">{group.location || 'No Location'}</span>
                                    </div>
                                </div>

                                {/* Card Footer - Split Layout */}
                                <div className="gic-stat" style={{
                                    marginTop: 'auto',
                                    paddingTop: '0.75rem',
                                    borderTop: '1px solid #f1f5f9',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-end'
                                }}>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '55%' }}>
                                        {/* Pastor */}
                                        <div style={{ display: 'flex', alignItems: 'center', color: '#0f172a', fontSize: '0.85rem', fontWeight: '500' }}>
                                            <User className="icon-xs me-1" style={{ width: '14px', color: '#64748b' }} />
                                            <span className="text-truncate">{group.pastor || 'No Pastor'}</span>
                                        </div>
                                        {/* Phone */}
                                        <div style={{ display: 'flex', alignItems: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                                            <Phone className="icon-xs me-1" style={{ width: '14px' }} />
                                            <span className="text-truncate">{group.phone || group.phoneNumber || 'N/A'}</span>
                                        </div>
                                        {/* Email (NEW) */}
                                        <div style={{ display: 'flex', alignItems: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                                            <Mail className="icon-xs me-1" style={{ width: '14px' }} />
                                            <span className="text-truncate" title={group.email}>
                                                {group.email || 'No Email'}
                                            </span>
                                        </div>
                                    </div>


                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                                        <span className="badge-pill badge-blue" style={{ fontSize: '0.8rem', padding: '0.25rem 0.6rem' }}>
                                            {group.churches || 0} Church(es)
                                        </span>
                                        <span className="badge-pill badge-green" style={{ fontSize: '0.8rem', padding: '0.25rem 0.6rem' }}>
                                            {group.members || 0} Member(s)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <Building2 style={{ width: '3rem', height: '3rem', marginBottom: '1rem', opacity: 0.3 }} />
                        <h3>No Groups Found</h3>
                        <p>Try adjusting your search.</p>
                    </div>
                )}

                {/* Pagination */}
                {!loading && groups.length > 0 && (
                    <div className="pagination-container">
                        <div className="pagination-info">
                            Showing {groups.length} of {totalGroups} groups
                        </div>
                        <div className="pagination-controls">
                            <button
                                className="pagination-btn"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            <span className="pagination-btn" style={{ cursor: 'default', backgroundColor: 'transparent', border: 'none' }}>
                                Page {currentPage} of {totalPages || 1}
                            </span>
                            <button
                                className="pagination-btn"
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                disabled={currentPage >= totalPages}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GroupsView;