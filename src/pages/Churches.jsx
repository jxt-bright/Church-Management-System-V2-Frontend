import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Search, MapPin, Phone, Building2,
    MoreVertical, Edit, Trash2, ChevronRight
} from 'lucide-react';
import Swal from 'sweetalert2';
import churchService from '../services/churchService';
import FlashMessage from '../components/FlashMessage';
import '../assets/styles/GroupsModern.css';
import { useAuth } from '../context/AuthContext';

const ChurchesView = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    // Data & State
    const [churches, setChurches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalChurches, setTotalChurches] = useState(0);
    const [itemsPerPage] = useState(12);

    const [flash, setFlash] = useState({ message: '', type: '' });
    const [activeDropdown, setActiveDropdown] = useState(null);

    // Fetch Data
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchChurches();
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

    const fetchChurches = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: itemsPerPage,
                search: searchTerm,
            };

            // If user is NOT a manager, filter by their groupId
            if (user && user.status !== 'manager') {
                params.groupId = user.groupId;
            }

            const response = await churchService.getChurches(params);

            if (response.churches && Array.isArray(response.churches)) {
                setChurches(response.churches);
                setTotalChurches(response.totalChurches || response.churches.length);
                setTotalPages(response.totalPages || 1);
            } else if (Array.isArray(response)) {
                setChurches(response);
                setTotalChurches(response.length);
                setTotalPages(1);
            } else if (response.data && Array.isArray(response.data)) {
                setChurches(response.data);
                setTotalChurches(response.total || response.data.length);
                setTotalPages(response.totalPages || 1);
            } else {
                setChurches([]);
                setTotalPages(0);
            }
        } catch (error) {
            setFlash({
                message: error.response?.data?.message || 'Error fetching churches',
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
            title: "Delete Church?",
            text: "This action cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await churchService.deleteChurch(id);

                    await Swal.fire({
                        title: "Deleted!",
                        text: "Church has been removed.",
                        icon: "success",
                        timer: 1500,
                        showConfirmButton: false
                    });

                    if (churches.length === 1 && currentPage > 1) {
                        setCurrentPage(prev => prev - 1);
                    } else {
                        fetchChurches();
                    }
                } catch (error) {
                    console.error("Delete error:", error);
                    Swal.fire(
                        "Error",
                        error.response?.data?.message || "Failed to delete church.",
                        "error"
                    );
                }
            }
        });
    };

    const handleEdit = (id) => navigate(`/church/edit/${id}`);

    return (
        <div className="modern-page-bg">
            <FlashMessage
                message={flash.message}
                type={flash.type}
                onClose={() => setFlash({ message: '', type: '' })}
            />

            <div className="hero-banner" style={{ minHeight: '120px', paddingBottom: '0' }}>
                <div className="hero-nav" style={{ justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div>
                        <h1 style={{ color: 'white', fontSize: '1.75rem', fontWeight: 'bold', margin: 0 }}>
                            Churches Directory
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '0.25rem' }}>
                            Manage congregations, pastors, and locations.
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
                                placeholder="Search churches"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </div>
                        {/* <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                                <b>{totalChurches}</b> Total Churches
                            </span>
                        </div> */}
                    </div>
                </div>

                {/* Grid of Churches */}
                {loading ? (
                    <div className="modern-loading">
                        <div className="loading-spinner"></div>
                    </div>
                ) : churches.length > 0 ? (
                    <div className="grid-list">
                        {churches.map((church) => (
                            <div key={church._id || church.id} className="grid-item-card" onClick={() => handleViewDetails(church._id)}>
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
                                                setActiveDropdown(activeDropdown === church._id ? null : church._id);
                                            }}
                                        >
                                            <MoreVertical className="icon-sm" style={{ color: '#94a3b8' }} />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {activeDropdown === church._id && (
                                            <div className="action-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                                                {/* <button className="action-dropdown-item" onClick={() => handleViewDetails(church._id)}>
                                                    <ChevronRight className="icon-sm me-2" /> View Details
                                                </button> */}
                                                <button className="action-dropdown-item" onClick={() => handleEdit(church._id)}>
                                                    <Edit className="icon-sm me-2" /> Edit Church
                                                </button>
                                                <div style={{ borderTop: '1px solid #f1f5f9', margin: '4px 0' }}></div>
                                                <button className="action-dropdown-item danger" onClick={() => handleDelete(church._id)}>
                                                    <Trash2 className="icon-sm me-2" /> Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Card Info */}
                                <div className="gic-info">
                                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{church.name}</h4>

                                    <div style={{ display: 'flex', alignItems: 'center', color: '#64748b', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                        <MapPin className="icon-xs me-1" style={{ width: '14px' }} />
                                        <span className="text-truncate">{church.location || 'No Location'}</span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                                        <Phone className="icon-xs me-1" style={{ width: '14px' }} />
                                        <span className="text-truncate">{church.phone || church.phoneNumber || ''}</span>
                                    </div>
                                </div>

                                {/* Card Footer / Stats */}
                                <div className="gic-stat" style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                        Pastor: <span style={{ color: '#0f172a', fontWeight: '500' }}>{church.pastor || ''}</span>
                                    </div>
                                    <span className="badge-pill badge-green">
                                        {church.memberCount || (Array.isArray(church.members) ? church.members.length : church.members) || 0} Member(s)
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <Building2 style={{ width: '3rem', height: '3rem', marginBottom: '1rem', opacity: 0.3 }} />
                        <h3>No Churches Found</h3>
                        <p>Try adjusting your search.</p>
                    </div>
                )}

                {/* Pagination */}
                {!loading && churches.length > 0 && (
                    <div className="pagination-container">
                        <div className="pagination-info">
                            Showing {churches.length} of {totalChurches} churches
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

export default ChurchesView;