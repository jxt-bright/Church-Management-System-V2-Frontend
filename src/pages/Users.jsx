import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Edit, Trash2, User, MoreVertical, Building2 } from 'lucide-react';
import Swal from 'sweetalert2';
import userService from '../services/userService';
import FlashMessage from '../components/FlashMessage';
import { useAuth } from '../context/AuthContext';
import '../assets/styles/GroupsModern.css';

const UsersView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();


  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [itemsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);

  const [flash, setFlash] = useState({ message: '', type: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);


  // Handle flash messages from previous pages
  useEffect(() => {
    if (location.state && location.state.flashMessage) {
      setFlash({
        message: location.state.flashMessage,
        type: location.state.flashType || 'success'
      });
      window.history.replaceState({}, document.title);
    }
  }, [location]);


  useEffect(() => {
    // const delayDebounceFn = setTimeout(() => {
    //   if (user) {
    //     fetchUsers();
    //   }
    // }, 350);
    fetchUsers();
    // return () => clearTimeout(delayDebounceFn);
  }, [currentPage, searchTerm, user]);

  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    if (activeDropdown) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeDropdown]);



  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
      };

      // Filter by Group ID if the user is not a manager
      if (user && user.status !== 'manager') {
        params.groupId = user.groupId;
      }

      const response = await userService.getUsers(params);

      if (response.users && Array.isArray(response.users)) {
        setUsers(response.users);
        setTotalUsers(response.totalUsers || response.users.length);
        setTotalPages(response.totalPages || 0);
      } else if (Array.isArray(response)) {
        setUsers(response);
        setTotalUsers(response.length);
        setTotalPages(1);
      } else if (response.data && Array.isArray(response.data)) {
        setUsers(response.data);
        setTotalUsers(response.total || response.data.length);
        setTotalPages(response.totalPages || 0);
      } else {
        setUsers([]);
      }
    } catch (error) {
      setFlash({
        message: error.response?.data?.message || 'Error fetching users',
        type: 'danger'
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleEdit = (id) => {
    navigate(`/user/edit/${id}`);
  };

  const handleDelete = (id) => {
    setActiveDropdown(null);

    Swal.fire({
      title: "Delete User?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete user!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await userService.deleteUser(id);

          await Swal.fire({
            title: "Deleted!",
            text: "User has been removed.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false
          });

          if (users.length === 1 && currentPage > 1) {
            setCurrentPage(prev => prev - 1);
          } else {
            fetchUsers();
          }
        } catch (error) {
          console.error("Delete error:", error);
          Swal.fire(
            "Error",
            error.response?.data?.message || "Failed to delete user.",
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

      {/* Header Section */}
      <div className="hero-banner" style={{ minHeight: '120px', paddingBottom: '0' }}>
        <div className="hero-nav" style={{ justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div>
            <h1 style={{ color: 'white', fontSize: '1.75rem', fontWeight: 'bold', margin: 0 }}>
              User Directory
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '0.25rem' }}>
              Manage system users and permissions.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="content-container" style={{ marginTop: '-2rem' }}>

        {/* Search Toolbar */}
        <div className="data-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
          <div className="data-toolbar">
            <div className="search-box" style={{ flex: 1, maxWidth: '400px' }}>
              <Search className="icon-xs" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by username..."
              />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="data-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="table-responsive-custom">
            {loading ? (
              <div className="modern-loading" style={{ padding: '2rem' }}>
                <div className="loading-spinner"></div>
                <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="empty-state" style={{ padding: '3rem' }}>
                <User style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem', opacity: 0.3 }} />
                <h3>No User(s) Found</h3>
                <p>Try adjusting your search or add a new user</p>
              </div>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr className="thead-row">
                    <th className="table-th" style={{ paddingLeft: '1.5rem' }}>UserName</th>
                    <th className="table-th">Church</th>
                    <th className="table-th center">Status</th>
                    <th className="table-th center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((item) => (
                    <tr key={item._id} className="table-row">

                      {/* Name Column */}
                      <td className="table-td" style={{ paddingLeft: '1.5rem' }}>
                        <div className="pastor-cell">
                          <div className="avatar-circle">
                            {item.username ? item.username.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="group-name">{item.username}</div>
                            {item.memberId?.churchId?.churchname && (
                              <div className="group-meta">
                                <Building2 className="icon-xs me-1" />
                                <span>{item.memberId.churchId.churchname}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Church/Group Column */}
                      <td className="table-td">
                        <span
                          className="badge-pill badge-blue"
                          style={{ textTransform: 'capitalize' }}
                        >
                          {item.churchName || 'N/A'}
                        </span>
                      </td>

                      {/* Status Column */}
                      <td className="table-td center">
                        <span
                          className="badge-pill badge-green"
                          style={{ textTransform: 'capitalize' }}
                        >
                          {item.status || 'Active'}
                        </span>
                      </td>

                      {/* Actions Column */}
                      <td className="table-td center">
                        <div className="action-container" style={{ justifyContent: 'center' }}>
                          <button
                            className="action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(activeDropdown === item._id ? null : item._id);
                            }}
                          >
                            <MoreVertical className="icon-sm" style={{ color: '#94a3b8' }} />
                          </button>

                          {activeDropdown === item._id && (
                            <div className="action-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                              <button className="action-dropdown-item" onClick={() => handleEdit(item._id)}>
                                <Edit className="icon-sm me-2" /> Edit User
                              </button>
                              <div style={{ borderTop: '1px solid #f1f5f9', margin: '4px 0' }}></div>
                              <button className="action-dropdown-item danger" onClick={() => handleDelete(item._id)}>
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

        {/* Pagination */}
        {!loading && users.length > 0 && (
          <div className="pagination-container">
            <div className="pagination-info">
              Showing {users.length} of {totalUsers} users
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

export default UsersView;