
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Edit,
  Trash2,
  Phone,
  Users,
  ChevronRight,
  MoreVertical,
  Building2
} from 'lucide-react';
import Swal from 'sweetalert2';
import memberService from '../services/memberService';
import FlashMessage from '../components/FlashMessage';
import '../assets/styles/GroupsModern.css';
import { useAuth } from '../context/AuthContext';

const MembersView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [itemsPerPage] = useState(10);
  const [totalMembers, setTotalMembers] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);

  const [flash, setFlash] = useState({ message: '', type: '' });

  useEffect(() => {
    // const delay = setTimeout(() => {
    //   fetchMembers();
    // }, 0);
    fetchMembers();
    // return () => clearTimeout(delay);
  }, [currentPage, searchTerm]);

  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    if (activeDropdown) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeDropdown]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm
      };

      if (user) {
        const role = user.status.toLowerCase();
        
        if (['groupadmin', 'grouppastor'].includes(role)) {
            params.groupId = user.groupId;
        } 
        else if (['churchadmin', 'churchpastor'].includes(role)) {
            params.churchId = user.churchId;
        }
      }

      const response = await memberService.getMembers(params);

      setMembers(response.members || []);
      setTotalMembers(response.totalMembers || response.members?.length || 0);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      setFlash({
        message: error.response?.data?.message || 'Failed to load members',
        type: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };



  const handleDelete = (id) => {
    setActiveDropdown(null);

    Swal.fire({
      title: "Delete Member?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete member!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await memberService.deleteMember(id);

          await Swal.fire({
            title: "Deleted!",
            text: "Member has been removed.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false
          });


          if (members.length === 1 && currentPage > 1) {
            setCurrentPage(prev => prev - 1);
          } else {
            fetchMembers();
          }
        } catch (error) {
          Swal.fire(
            "Error",
            error.response?.data?.message || "Failed to delete member.",
            "error"
          );
        }
      }
    });
  };

  return (
    <div className="modern-page-bg">
      <FlashMessage
        message={flash.message}
        type={flash.type}
        onClose={() => setFlash({ message: '', type: '' })}
      />


      <div className="hero-banner" style={{ minHeight: '120px', paddingBottom: 0 }}>
        <div className="hero-nav" style={{ justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ color: 'white', fontSize: '1.75rem', fontWeight: 'bold', margin: 0 }}>
              Members Directory
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '0.25rem' }}>
              Manage church membership records
            </p>
          </div>
        </div>
      </div>


      <div className="content-container" style={{ marginTop: '-2rem' }}>

        {/* SEARCH CARD */}
        <div className="data-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
          <div className="data-toolbar">
            <div className="search-box" style={{ flex: 1, maxWidth: '400px' }}>
              <Search className="icon-xs" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search member name or phone..."
              />
            </div>
          </div>
        </div>

        {/* TABLE CARD */}
        <div className="data-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive-custom">

            {loading ? (
              <div className="modern-loading" style={{ padding: '2rem' }}>
                <div className="loading-spinner"></div>
                <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading members...</p>
              </div>
            ) : members.length === 0 ? (
              <div className="empty-state" style={{ padding: '3rem' }}>
                <Users style={{ width: '3rem', height: '3rem', opacity: 0.3 }} />
                <h3>No Member(s) Found</h3>
                <p>Try adjusting your search</p>
              </div>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr className="thead-row">
                    <th className="table-th" style={{ paddingLeft: '1.5rem' }}>Member</th>
                    <th className="table-th hide-on-mobile">Church</th>
                    <th className="table-th hide-on-mobile">Phone</th>
                    <th className="table-th ">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map(member => (
                    <tr key={member._id} className="table-row">

                      {/* NAME */}
                      <td className="table-td" style={{ paddingLeft: '1.5rem' }}>
                        <div className="pastor-cell">
                          <div className="avatar-circle">
                            {member.firstName?.charAt(0) || 'M'}
                          </div>
                          <div>
                            <div className="group-name">
                              {member.lastName} {member.firstName}
                            </div>
                            <div className="group-meta">
                              {member.memberStatus || 'Member'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* CHURCH */}
                      <td className="table-td hide-on-mobile">
                        <span className="badge-pill badge-blue">
                          <Building2 className="icon-xs" />
                          {member.churchId?.name || ''}
                        </span>
                      </td>

                      {/* PHONE */}
                      <td className="table-td hide-on-mobile">
                        <span className="badge-pill badge-green">
                          <Phone className="icon-xs" />
                          {member.phoneNumber ? `${member.phoneNumber}` : 'N/A'}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="table-td center">
                        <div className="action-container" style={{ justifyContent: 'center' }}>
                          <button
                            className="action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(activeDropdown === member._id ? null : member._id);
                            }}
                          >
                            <MoreVertical className="icon-sm" style={{ color: '#94a3b8' }} />
                          </button>

                          {activeDropdown === member._id && (
                            <div className="action-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                              <button
                                className="action-dropdown-item"
                                onClick={() => navigate(`/member/${member._id}`)}
                              >
                                <ChevronRight className="icon-sm me-2" /> View Details
                              </button>

                              <button
                                className="action-dropdown-item"
                                onClick={() => navigate(`/member/edit/${member._id}`)}
                              >
                                <Edit className="icon-sm me-2" /> Edit Member
                              </button>

                              <div style={{ borderTop: '1px solid #f1f5f9', margin: '4px 0' }} />

                              <button
                                className="action-dropdown-item danger"
                                onClick={() => handleDelete(member._id)}
                              >
                                <Trash2 className="icon-sm me-2" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* PAGINATION */}
        {!loading && members.length > 0 && (
          <div className="pagination-container">
            <div className="pagination-info">
              Showing {members.length} of {totalMembers} members
            </div>
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              <span className="pagination-btn" style={{ cursor: 'default', background: 'transparent', border: 'none' }}>
                Page {currentPage} of {totalPages}
              </span>

              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(p => p + 1)}
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

export default MembersView;
