import React, { useState, useEffect, useRef } from 'react';
import { Search, UserCog, Link, UserCheck, X, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import '../assets/styles/AddUser.css';
import memberService from '../services/memberService';
import userService from '../services/userService';
import FlashMessage from '../components/FlashMessage';
import { useAuth } from '../context/AuthContext';

const EditUser = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    status: '',
    memberId: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);

  // UI States
  const [showResults, setShowResults] = useState(false);
  const [pageLoading, setPageLoading] = useState(true); // For initial fetch
  const [submitting, setSubmitting] = useState(false);  // For update action
  const [loadingSearch, setLoadingSearch] = useState(false); // For member search
  const [flash, setFlash] = useState({ message: '', type: '' });

  const resultsRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await userService.getUserById(id);

        // Populate form
        setFormData({
          username: userData.username || '',
          status: userData.status || '',
          memberId: userData.memberId?._id || userData.memberId || ''
        });

        if (userData.memberId && typeof userData.memberId === 'object') {
          setSelectedMember(userData.memberId);
        }

      } catch (error) {
        setFlash({
          message: error.response?.data?.message || 'Failed to load user details',
          type: 'danger'
        });
      } finally {
        setPageLoading(false);
      }
    };

    if (id) {
      fetchUserData();
    }
  }, [id]);

  const getFullName = (member) => {
    if (!member) return '';
    return `${member.firstName || ''} ${member.lastName || ''}`;
  };

  const getInitials = (member) => {
    if (!member?.firstName || !member?.lastName) return '';
    return (member.firstName[0] + member.lastName[0]).toUpperCase();
  };

  const highlightText = (text) => {
    if (!searchTerm) return text;
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === searchTerm.toLowerCase()
        ? <span key={i} className="highlight-text">{part}</span>
        : part
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'username') {
      setFormData(prev => ({ ...prev, [name]: value.replace(/[^a-zA-Z0-9_]/g, '') }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowResults(value.trim() !== '');
    if (!value.trim()) {
      setMembers([]);
    }
  };

  const handleMemberSelect = (member) => {
    setSelectedMember(member);
    setFormData(prev => ({ ...prev, memberId: member._id }));
    setSearchTerm('');
    setShowResults(false);
  };

  const handleRemoveMember = () => {
    setSelectedMember(null);
    setFormData(prev => ({ ...prev, memberId: '' }));
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();

      if (submitting) return;
      setSubmitting(true);

      if (!formData.username || !formData.status || !formData.memberId) {
        setFlash({ message: 'Please fill in all required fields and select a member', type: 'danger' });
        setSubmitting(false);
        return;
      }

      // Submit Logic
      await userService.updateUser(id, formData);

      setFlash({ message: 'User updated successfully', type: 'success' });

      // Redirect after success
      // setTimeout(() => {
      //    navigate('/users'); 
      // }, 1500);
      navigate('/users', {
        state: {
          flashMessage: response.message || 'User updated successfully!',
          flashType: 'success'
        }
      });

    } catch (error) {
      setFlash({
        message: error.response?.data?.message || 'Error updating User',
        type: 'danger'
      });
      setSubmitting(false);
    }
  };

  const fetchMembers = async () => {
    if (!searchTerm) return;
    if (loadingSearch) return;

    setLoadingSearch(true);

    try {
      const params = { search: searchTerm };
      const response = await memberService.getMembers(params);

      let memberData = [];
      if (Array.isArray(response)) {
        memberData = response;
      } else if (response.members && Array.isArray(response.members)) {
        memberData = response.members;
      } else if (response.data && Array.isArray(response.data)) {
        memberData = response.data;
      }

      setMembers(memberData);

      if (memberData.length > 0) {
        setShowResults(true);
      }
    } catch (error) {
      setMembers([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  useEffect(() => {
    // const delayDebounceFn = setTimeout(() => {
    //   if (searchTerm) {
    //     fetchMembers();
    //   }
    // }, 350);
    fetchMembers();

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

  if (pageLoading) {
    return (
      <div className="registration-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="registration-container">
      {flash.message && (
        <FlashMessage
          message={flash.message}
          type={flash.type}
          onClose={() => setFlash({ message: '', type: '' })}
        />
      )}

      <div className="content-wrapper">
        <div className="page-header">
          <h1 className="page-title">
            <UserCog className="w-8 h-8" />
            Edit User
          </h1>
          <p className="page-subtitle">Update user account information and member linkage</p>
        </div>

        <div className="registration-card">
          <form className="card-content" onSubmit={handleSubmit}>
            <div className="form-grid">
              {/* Username */}
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter username"
                  required
                  className="form-input"
                  autoComplete='off'
                />
                <p className="input-helper-text">
                  Must be 4-20 characters, letters and numbers only
                </p>
              </div>

              {/* User Status */}
              <div className="form-group">
                <label htmlFor="status">User Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                >
                  <option value="">Select User Status</option>
                  <option value="churchPastor">Church Pastor</option>
                  <option value="churchAdmin">Church Admin</option>
                  {(user?.status === 'manager' || user?.status === 'groupPastor' || user?.status === 'groupAdmin') && (
                    <>
                      <option value="groupPastor">Group Pastor</option>
                      <option value="groupAdmin">Group Admin</option>
                    </>
                  )}
                  {(user?.status === 'manager') && (
                    <option value="manager">Manager</option>
                  )}
                </select>
              </div>
            </div>

            {/* Member Link Section */}
            <div className="link-section">
              <div className="link-header">
                <h3 className="link-title">
                  <Link className="w-5 h-5" />
                  Link to a Member
                </h3>
              </div>

              <p className="page-subtitle" style={{ marginBottom: '1rem' }}>
                Search for an existing member to link to this user account.
              </p>

              {/* Search Input */}
              <div className="search-container" ref={resultsRef}>
                <div style={{ position: 'relative' }}>
                  <Search className="search-icon" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={() => { if (searchTerm) setShowResults(true); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                    placeholder="Search members by name..."
                    className="form-input search-input"
                  />
                  {loadingSearch && (
                    <div style={{ position: 'absolute', right: '10px', top: '12px', fontSize: '0.8rem', color: '#666' }}>
                      Loading...
                    </div>
                  )}
                </div>

                {/* Results Container */}
                {showResults && (
                  <div className="search-results-dropdown" style={{ zIndex: 1000, backgroundColor: 'white' }}>
                    {members.length === 0 ? (
                      <div className="no-results">
                        <p>{loadingSearch ? 'Searching...' : 'No members found.'}</p>
                      </div>
                    ) : (
                      members.map(member => (
                        <div
                          key={member._id || Math.random()}
                          onClick={() => handleMemberSelect(member)}
                          className="result-item"
                        >
                          <div className="avatar">
                            {getInitials(member)}
                          </div>
                          <div className="font-semibold text-gray-800">
                            {highlightText(getFullName(member))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Selected Member Display */}
              {selectedMember && (
                <div className="selected-member-card">
                  <button
                    type="button"
                    onClick={handleRemoveMember}
                    className="remove-member-btn"
                    title="Remove member"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="avatar large">
                    {getInitials(selectedMember)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">
                      {getFullName(selectedMember)}
                    </div>
                    <div className="text-sm text-gray-600">Linked Member</div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="submit-container" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                type="submit"
                className="submit-btn"
                disabled={submitting}
                style={{ flex: 1 }}
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserCheck className="w-5 h-5" />}
                {submitting ? 'Updating...' : 'Update User Account'}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  backgroundColor: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d1d5db'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
              >
                <X className="w-5 h-5" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUser;