import React, { useState, useRef, useEffect } from 'react';
import { Send, Users, Building2, Target, MessageSquare, CheckCircle2, Search, X, ChevronDown } from 'lucide-react';
import churchService from '../services/churchService.js';
import groupService from '../services/groupService.js';
import messageService from '../services/messageService';
import { useAuth } from '../context/AuthContext';
import { RequireAccess } from '../components/RequireAccess.jsx';
import FlashMessage from '../components/FlashMessage';
import '../assets/styles/SendMessage.css';

// SearchSelect Component 
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
    option.value === 'group' ||
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


// Main Component
function SendMessageApp() {
  const { user } = useAuth();
  const userStatus = user?.status?.toLowerCase();

  const initialFormState = {
    groupId: null,
    churchId: null,
    category: '',
    salutation: '',
    addNames: false,
    message: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [groups, setGroups] = useState([]);
  const [churches, setChurches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [flash, setFlash] = useState({ message: '', type: '' });


// Fetch Initial Data
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        if (userStatus === 'churchpastor' || userStatus === 'churchadmin') {
          setFormData(prev => ({ ...prev, churchId: user?.churchId }));
        }

        if (userStatus === 'manager') {
          const groupRes = await groupService.getGroups();
          setGroups(groupRes.groups || groupRes.data || groupRes || []);
        }

        const churchParams = userStatus !== 'manager' ? { groupId: user?.groupId } : {};
        const churchRes = await churchService.getChurches(churchParams);
        setChurches(churchRes.churches || churchRes.data || churchRes || []);
      } catch (error) {
        setFlash({ message: 'Error loading initial data.', type: 'danger' });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchInitialData();
  }, [user, userStatus]);

  const groupOptions = groups.map(g => ({ value: g._id, label: g.name }));

  const churchOptions = [
    ...(userStatus === 'grouppastor' || userStatus === 'groupadmin'
      ? [{ value: 'group', label: ' Send to Whole Group ' }]
      : []),
    ...churches.map(c => ({ value: c._id, label: c.name || c.churchname }))
  ];

  const handleChange = (field, value) => {
    const isTextField = ['message', 'salutation', 'category'].includes(field);
    const finalValue = (value === "" && !isTextField) ? null : value;
    
    setFormData(prev => ({ ...prev, [field]: finalValue }));
  };

  
// Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitted) return;

    const isWholeGroup = formData.churchId === 'group' || (formData.groupId && !formData.churchId);

    const rawPayload = {
      ...formData,
      churchId: formData.churchId === 'group' ? null : formData.churchId,
      groupId: isWholeGroup ? (formData.groupId || user?.groupId) : formData.groupId,
      targetType: isWholeGroup ? 'group' : 'church'
    };

    const cleanPayload = Object.fromEntries(
      Object.entries(rawPayload).filter(([_, value]) =>
        value !== null && value !== undefined && value !== ''
      )
    );

    if (isWholeGroup) delete cleanPayload.churchId;

    setSubmitted(true);

    try {
      const response = await messageService.send(cleanPayload);

      setFlash({
        message: response?.recipientCount
          ? `Broadcast sent successfully to ${response.recipientCount} members.`
          : 'Broadcast initiated successfully!',
        type: 'success'
      });

      setFormData(initialFormState);

      if (userStatus === 'churchpastor' || userStatus === 'churchadmin') {
        setFormData(prev => ({ ...prev, churchId: user?.churchId }));
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
      setFlash({
        message: error.response?.data?.message || 'Failed to send broadcast.',
        type: 'danger'
      });
    } finally {
      setSubmitted(false);
    }
  };

  const isGroupDisabled = formData.churchId !== null && formData.churchId !== 'group';
  const isChurchDisabled = formData.groupId !== null;

  return (
    <div className="app-container">
      <div className="content-wrapper">
        <FlashMessage
          message={flash.message}
          type={flash.type}
          onClose={() => setFlash({ message: '', type: '' })}
        />

        <div className="page-header">
          <div className="header-icon"><MessageSquare size={28} /></div>
          <div>
            <h1 className="page-title">Broadcast Message</h1>
            <p className="page-subtitle">Send messages to your congregation</p>
          </div>
        </div>

        <div className="form-card">
          <form onSubmit={handleSubmit} className="message-form">
            <div className="form-grid">
              <RequireAccess minStatus="manager">
                <div className="form-field">
                  <label className="field-label">
                    <Users size={16} /> Select Group
                  </label>
                  <SearchSelect
                    options={groupOptions}
                    value={formData.groupId}
                    onChange={(val) => handleChange('groupId', val)}
                    placeholder="Search groups"
                    disabled={isGroupDisabled}
                    icon={Users}
                    label="Group"
                    isLoading={isLoading}
                  />
                </div>
              </RequireAccess>

              <RequireAccess minStatus="groupAdmin">
                <div className="form-field">
                  <label className="field-label">
                    <Building2 size={16} /> Select Church
                  </label>
                  <SearchSelect
                    options={churchOptions}
                    value={formData.churchId}
                    onChange={(val) => handleChange('churchId', val)}
                    placeholder="Search churches"
                    disabled={isChurchDisabled}
                    icon={Building2}
                    label="Church"
                    isLoading={isLoading}
                  />
                </div>
              </RequireAccess>
            </div>

            <div className="form-field">
              <label className="field-label">
                <Target size={16} /> Target Audience <span className="required">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                required
                className="select-input"
              >
                <option value="">Choose recipient category</option>
                <option value="members">All Members</option>
                <option value="workers">Workers</option>
                <option value="adults">Adults</option>
                <option value="youths">Youths</option>
                <option value="males">Males</option>
                <option value="females">Females</option>
              </select>
            </div>

            <div className="form-field">
              <label className="field-label">
                Greeting <span className="optional-badge">Optional</span>
              </label>
              <input
                type="text"
                value={formData.salutation || ''}
                onChange={(e) => handleChange('salutation', e.target.value)}
                placeholder="e.g., Dear Brethren"
                className="text-input"
              />
            </div>

            <div className="form-field">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.addNames}
                  onChange={(e) => handleChange('addNames', e.target.checked)}
                  className="checkbox-input"
                />
                <div className="checkbox-box">
                  {formData.addNames && <CheckCircle2 size={16} strokeWidth={2.5} />}
                </div>
                <div className="checkbox-content">
                  <span className="checkbox-title">Personalize with member names</span>
                  <span className="checkbox-description">Add names to the salutation automatically</span>
                </div>
              </label>
            </div>

            <div className="form-field">
              <label className="field-label">
                <MessageSquare size={16} /> Message Content <span className="required">*</span>
              </label>
              <textarea
                value={formData.message || ''}
                onChange={(e) => handleChange('message', e.target.value)}
                placeholder="Write your message here"
                required
                className="textarea-input"
                rows={6}
              />
              <div className="char-count">
                {(formData.message || '').length} characters
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={submitted}>
              {submitted ? (
                <>
                  <div className="spinner"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send size={18} strokeWidth={2} />
                  Broadcast Message
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SendMessageApp;