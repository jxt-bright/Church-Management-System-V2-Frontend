
import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Search, UserPlus, Link, UserCheck, X } from 'lucide-react';
import '../assets/styles/AddUser.css';
import memberService from '../services/memberService';
import userService from '../services/userService';
import FlashMessage from '../components/FlashMessage';
import { useAuth } from '../context/AuthContext';

const AddUser = () => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    status: '',
    password: '',
    confirmPassword: '',
    memberId: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);

  const [showResults, setShowResults] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState({ message: '', type: '' });

  const resultsRef = useRef(null);

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

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();

      if (loading) return;
      setLoading(true);

      if (!formData.username || !formData.password || !formData.status || !formData.memberId) {
        setFlash({ message: 'Please fill in all required fields and select a member', type: 'danger' });
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setFlash({ message: 'Passwords do not match', type: 'danger' });
        return;
      }

      // Submit Logic
      const response = await userService.addUser(formData);

      setFlash({ message: response.message, type: 'success' });

      // Reset form data
      setFormData({
        username: '',
        status: '',
        password: '',
        confirmPassword: '',
        memberId: ''
      });
      setSelectedMember(null);
      setSearchTerm('');

    } catch (error) {
      setFlash({
        message: error.response?.data?.message || 'Error registering User',
        type: 'danger'
      });
    } finally {
      setLoading(false);
    }

  };


  const fetchMembers = async () => {
    if (!searchTerm) return;

    if (loading) return;
    setLoading(true);

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
      setFlash({
        message: error.response?.data?.message || 'Error fetching members',
        type: 'danger'
      });
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // const delayDebounceFn = setTimeout(() => {
    //   if (searchTerm) {
    //     fetchMembers();
    //   }
    // }, 0);
    if (searchTerm) {
      fetchMembers();
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
            <UserPlus className="w-8 h-8" />
            User Registration
          </h1>
          <p className="page-subtitle">Create new user accounts and link them to existing members</p>
        </div>

        <div className="registration-card">
          <form className="card-content" onSubmit={handleSubmit}>
            <div className="form-grid">
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

              {/* Password */}
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-wrapper">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Create password"
                    required
                    className="form-input password-input"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle-btn"
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="input-helper-text">
                  Minimum 8 characters with letters and numbers
                </p>
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="password-wrapper">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Re-enter password"
                    required
                    className="form-input password-input"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="password-toggle-btn"
                    tabIndex="-1"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
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
                    // Prevent "Enter" key in search box from submitting the whole form
                    onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                    placeholder="Search members by name..."
                    className="form-input search-input"
                  />
                  {loading && (
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
                        <p>{loading ? 'Searching...' : 'No member(s) found.'}</p>
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

            {/* Submit Button */}
            <div className="submit-container">
              <button
                type="submit"
                className="submit-btn"
              >
                <UserCheck className="w-5 h-5" />
                Create User Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddUser;