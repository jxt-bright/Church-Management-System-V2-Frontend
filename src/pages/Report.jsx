import React, { useState, useEffect, useRef } from 'react';

// Lucide React Icons (simple inline versions)
const Search = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </svg>
);

const Calendar = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const FileText = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const ChevronDown = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const SearchSelect = ({ label, options, value, onChange, placeholder, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className="search-select-container" ref={dropdownRef}>
      <label className="form-label">{label}</label>
      <div className={`search-select ${disabled ? 'disabled' : ''}`}>
        <button
          type="button"
          className="select-trigger"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
        >
          <span className={selectedOption ? '' : 'placeholder'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <div className="select-actions">
            {selectedOption && !disabled && (
              <button
                type="button"
                className="clear-button"
                onClick={handleClear}
                title="Clear selection"
              >
                ×
              </button>
            )}
            <ChevronDown size={20} className={`chevron ${isOpen ? 'open' : ''}`} />
          </div>
        </button>

        {isOpen && !disabled && (
          <div className="dropdown-menu">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
            <div className="options-list">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`option ${value === option.value ? 'selected' : ''}`}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                  >
                    {option.label}
                  </div>
                ))
              ) : (
                <div className="no-results">No results found</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MonthlyAttendanceReport = () => {
  const [showModal, setShowModal] = useState(true);
  const [formData, setFormData] = useState({
    groupId: '',
    churchId: 'church2', // Faith Baptist Church
    month: '2026-01' // January 2026
  });
  const modalRef = useRef(null);

  const [groups] = useState([
    { _id: 'group1', name: 'North Zone Group' },
    { _id: 'group2', name: 'South Zone Group' },
    { _id: 'group3', name: 'East Zone Group' },
    { _id: 'group4', name: 'West Zone Group' },
    { _id: 'group5', name: 'Central Zone Group' }
  ]);

  const [churches] = useState([
    { _id: 'church1', churchname: 'Grace Community Church' },
    { _id: 'church2', churchname: 'Faith Baptist Church' },
    { _id: 'church3', churchname: 'Hope Presbyterian Church' },
    { _id: 'church4', churchname: 'Cornerstone Fellowship' },
    { _id: 'church5', churchname: 'New Life Assembly' },
    { _id: 'church6', churchname: 'River Valley Church' },
    { _id: 'church7', churchname: 'Mountain View Chapel' }
  ]);

  const [userStatus] = useState('manager');

  const sampleData = {
    monday: [
      { adults: {m: 45, f: 52, t: 97}, youth: {m: 12, f: 15, t: 27}, children: {m: 8, f: 10, t: 18}, newcomers: {m: 2, f: 3, t: 5}, offering: {first: 450, second: 320, total: 770}, totalAttendance: 147 },
      { adults: {m: 48, f: 55, t: 103}, youth: {m: 14, f: 16, t: 30}, children: {m: 9, f: 11, t: 20}, newcomers: {m: 1, f: 2, t: 3}, offering: {first: 480, second: 340, total: 820}, totalAttendance: 156 },
      { adults: {m: 42, f: 50, t: 92}, youth: {m: 11, f: 14, t: 25}, children: {m: 7, f: 9, t: 16}, newcomers: {m: 3, f: 4, t: 7}, offering: {first: 420, second: 300, total: 720}, totalAttendance: 140 },
      { adults: {m: 50, f: 58, t: 108}, youth: {m: 15, f: 18, t: 33}, children: {m: 10, f: 12, t: 22}, newcomers: {m: 2, f: 2, t: 4}, offering: {first: 500, second: 360, total: 860}, totalAttendance: 167 }
    ],
    thursday: [
      { adults: {m: 35, f: 42, t: 77}, youth: {m: 10, f: 12, t: 22}, children: {m: 6, f: 8, t: 14}, newcomers: {m: 1, f: 2, t: 3}, offering: {first: 350, second: 250, total: 600}, totalAttendance: 116 },
      { adults: {m: 38, f: 45, t: 83}, youth: {m: 11, f: 13, t: 24}, children: {m: 7, f: 9, t: 16}, newcomers: {m: 2, f: 1, t: 3}, offering: {first: 380, second: 270, total: 650}, totalAttendance: 126 },
      { adults: {m: 32, f: 40, t: 72}, youth: {m: 9, f: 11, t: 20}, children: {m: 5, f: 7, t: 12}, newcomers: {m: 1, f: 1, t: 2}, offering: {first: 320, second: 230, total: 550}, totalAttendance: 106 },
      { adults: {m: 40, f: 48, t: 88}, youth: {m: 12, f: 14, t: 26}, children: {m: 8, f: 10, t: 18}, newcomers: {m: 2, f: 3, t: 5}, offering: {first: 400, second: 290, total: 690}, totalAttendance: 137 }
    ],
    sunday: [
      { adults: {m: 65, f: 75, t: 140}, youth: {m: 20, f: 25, t: 45}, children: {m: 15, f: 18, t: 33}, newcomers: {m: 4, f: 5, t: 9}, offering: {first: 850, second: 620, total: 1470}, totalAttendance: 227 },
      { adults: {m: 68, f: 78, t: 146}, youth: {m: 22, f: 26, t: 48}, children: {m: 16, f: 19, t: 35}, newcomers: {m: 3, f: 6, t: 9}, offering: {first: 880, second: 650, total: 1530}, totalAttendance: 238 },
      { adults: {m: 62, f: 72, t: 134}, youth: {m: 19, f: 24, t: 43}, children: {m: 14, f: 17, t: 31}, newcomers: {m: 5, f: 4, t: 9}, offering: {first: 820, second: 590, total: 1410}, totalAttendance: 217 },
      { adults: {m: 70, f: 80, t: 150}, youth: {m: 23, f: 27, t: 50}, children: {m: 17, f: 20, t: 37}, newcomers: {m: 4, f: 6, t: 10}, offering: {first: 900, second: 680, total: 1580}, totalAttendance: 247 }
    ]
  };

  const [reportData] = useState(sampleData);

  const groupOptions = groups.map(group => ({
    value: group._id,
    label: group.name
  }));

  const churchOptions = [
    ...churches.map(church => ({
      value: church._id,
      label: church.churchname
    })),
    ...(userStatus === 'grouppastor' || userStatus === 'groupadmin'
      ? [{ value: 'group', label: 'Generate for whole group' }]
      : [])
  ];

  const getCurrentMonth = () => {
    const now = new Date();
    return now.toISOString().slice(0, 7);
  };

  const formatMonthDisplay = (monthValue) => {
    const date = new Date(monthValue + '-01');
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  const formatChurchName = (churchId) => {
    if (churchId === 'group') return 'Whole Group';
    const church = churches.find(c => c._id === churchId);
    return church ? church.churchname : '';
  };

  const formatGroupName = (groupId) => {
    const group = groups.find(g => g._id === groupId);
    return group ? group.name : '';
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowModal(false);
      }
    };

    if (showModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModal]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // In production, replace this with actual API call
    // fetch(`/attendance/attendancereport_monthly`, {
    //   method: 'POST',
    //   body: JSON.stringify(formData),
    //   headers: { 'Content-Type': 'application/json' }
    // })
    // .then(response => response.json())
    // .then(data => setReportData(data))
    
    setShowModal(false);
  };

  const calculateMonthlySummary = () => {
    let totalAdults = 0, totalYouth = 0, totalChildren = 0, totalNewcomers = 0, totalOffering = 0;

    ['monday', 'thursday', 'sunday'].forEach(service => {
      reportData[service].forEach(week => {
        totalAdults += week.adults.t;
        totalYouth += week.youth.t;
        totalChildren += week.children.t;
        totalNewcomers += week.newcomers.t;
        totalOffering += week.offering.total;
      });
    });

    return {
      totalAdults,
      totalYouth,
      totalChildren,
      totalNewcomers,
      grandTotal: totalAdults + totalYouth + totalChildren,
      totalOffering
    };
  };

  const ServiceTable = ({ title, data, colorClass }) => (
    <div className="service-section">
      <div className={`service-title ${colorClass}`}>{title}</div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th className="main-header" rowSpan="2">Week</th>
              <th className="main-header" colSpan="3">Adults</th>
              <th className="main-header" colSpan="3">Youth</th>
              <th className="main-header" colSpan="3">Children</th>
              <th className="main-header" colSpan="3">Newcomers</th>
              <th className="main-header" rowSpan="2">Total Attendance</th>
              <th className="main-header" colSpan="3">Offering</th>
            </tr>
            <tr>
              <th className="sub-header">Males</th>
              <th className="sub-header">Females</th>
              <th className="sub-header">Total</th>
              <th className="sub-header">Males</th>
              <th className="sub-header">Females</th>
              <th className="sub-header">Total</th>
              <th className="sub-header">Males</th>
              <th className="sub-header">Females</th>
              <th className="sub-header">Total</th>
              <th className="sub-header">Males</th>
              <th className="sub-header">Females</th>
              <th className="sub-header">Total</th>
              <th className="sub-header">1st</th>
              <th className="sub-header">2nd</th>
              <th className="sub-header">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.map((week, index) => (
              <tr key={index}>
                <td className="week-label">Week {index + 1}</td>
                <td>{week.adults.m}</td>
                <td>{week.adults.f}</td>
                <td className="total-cell">{week.adults.t}</td>
                <td>{week.youth.m}</td>
                <td>{week.youth.f}</td>
                <td className="total-cell">{week.youth.t}</td>
                <td>{week.children.m}</td>
                <td>{week.children.f}</td>
                <td className="total-cell">{week.children.t}</td>
                <td>{week.newcomers.m}</td>
                <td>{week.newcomers.f}</td>
                <td className="total-cell">{week.newcomers.t}</td>
                <td className="attendance-total-cell">{week.totalAttendance}</td>
                <td className="offering-cell">{week.offering.first.toFixed(2)}</td>
                <td className="offering-cell">{week.offering.second.toFixed(2)}</td>
                <td className="offering-total-cell">{week.offering.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const summary = calculateMonthlySummary();

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .app-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          padding: 2.5rem 2rem;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-header {
          text-align: center;
          margin-bottom: 30px;
          color: #4f46e5;
        }

        .modal-header svg {
          margin-bottom: 1rem;
        }

        .modal-header h2 {
          font-size: 2em;
          margin-bottom: 10px;
          color: #374151;
        }

        .modal-header p {
          color: #6c757d;
          font-size: 1em;
        }

        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }

        .form-group,
        .search-select-container {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          font-size: 0.95rem;
          font-weight: 600;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .search-select {
          position: relative;
        }

        .search-select.disabled {
          opacity: 0.5;
          pointer-events: none;
        }

        .select-trigger {
          width: 100%;
          padding: 0.875rem 1rem;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          color: #374151;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.2s;
        }

        .select-trigger:hover:not(:disabled) {
          border-color: #4f46e5;
          background: #fafafa;
        }

        .select-trigger:focus {
          outline: none;
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.08);
        }

        .select-trigger .placeholder {
          color: #9ca3af;
        }

        .select-actions {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .clear-button {
          background: none;
          border: none;
          color: #6b7280;
          font-size: 1.5rem;
          line-height: 1;
          cursor: pointer;
          padding: 0 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.15s;
          width: 24px;
          height: 24px;
        }

        .clear-button:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .chevron {
          transition: transform 0.2s;
          color: #6b7280;
        }

        .chevron.open {
          transform: rotate(180deg);
        }

        .dropdown-menu {
          position: absolute;
          top: calc(100% + 0.5rem);
          left: 0;
          right: 0;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          overflow: hidden;
          animation: dropdownOpen 0.2s ease-out;
        }

        @keyframes dropdownOpen {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .search-box {
          padding: 0.75rem;
          border-bottom: 2px solid #f3f4f6;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #f9fafb;
        }

        .search-box svg {
          color: #9ca3af;
        }

        .search-box input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 0.95rem;
          outline: none;
          color: #374151;
        }

        .options-list {
          max-height: 250px;
          overflow-y: auto;
        }

        .option {
          padding: 0.875rem 1rem;
          cursor: pointer;
          transition: background 0.15s;
          color: #374151;
          font-size: 0.95rem;
        }

        .option:hover {
          background: #f3f4f6;
        }

        .option.selected {
          background: #eef2ff;
          color: #4f46e5;
          font-weight: 500;
        }

        .no-results {
          padding: 1.5rem;
          text-align: center;
          color: #9ca3af;
          font-size: 0.9rem;
        }

        .month-input {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          color: #374151;
          transition: all 0.2s;
          background: white;
        }

        .month-input:hover {
          border-color: #4f46e5;
          background: #fafafa;
        }

        .month-input:focus {
          outline: none;
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.08);
        }

        .submit-button {
          width: 100%;
          padding: 1rem;
          background: #4f46e5;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1.05rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
          box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);
        }

        .submit-button:hover {
          background: #4338ca;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
        }

        .submit-button:active {
          transform: translateY(1px);
        }

        .container {
          max-width: 1600px;
          margin: 0 auto;
          background: white;
          border-radius: 15px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          overflow: hidden;
        }

        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }

        .header h1 {
          font-size: 2.5em;
          margin-bottom: 10px;
        }

        .header p {
          font-size: 1.2em;
          opacity: 0.9;
        }

        .report-info {
          padding: 20px 30px;
          background: #f8f9fa;
          border-bottom: 2px solid #e9ecef;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
        }

        .report-info-group {
          display: flex;
          gap: 30px;
          flex-wrap: wrap;
        }

        .report-info-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .report-info-label {
          font-weight: 600;
          color: #495057;
          font-size: 1.1em;
        }

        .report-info-value {
          font-size: 1.1em;
          color: #667eea;
          font-weight: 700;
        }

        .change-btn {
          padding: 10px 20px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .change-btn:hover {
          background: #5568d3;
        }

        .content {
          padding: 30px;
        }

        .service-section {
          margin-bottom: 50px;
        }

        .service-title {
          font-size: 1.5em;
          font-weight: 700;
          padding: 15px 20px;
          border-radius: 10px;
          margin-bottom: 20px;
          color: white;
          text-align: center;
        }

        .service-title.monday {
          background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%);
        }

        .service-title.thursday {
          background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
        }

        .service-title.sunday {
          background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
        }

        .table-wrapper {
          overflow-x: auto;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        table {
          width: 100%;
          border-collapse: collapse;
          background: white;
        }

        th {
          background: #495057;
          color: white;
          padding: 12px 8px;
          text-align: center;
          font-size: 0.9em;
          font-weight: 600;
          border: 1px solid #343a40;
        }

        th.main-header {
          background: #343a40;
          font-size: 1em;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        th.sub-header {
          background: #6c757d;
          font-size: 0.85em;
        }

        td {
          padding: 10px 8px;
          text-align: center;
          border: 1px solid #dee2e6;
          font-size: 0.95em;
        }

        td.week-label {
          background: #f8f9fa;
          font-weight: 700;
          color: #495057;
          text-align: left;
          padding-left: 20px;
        }

        td.total-cell {
          background: #e7f5ff;
          font-weight: 700;
          color: #0c5ba1;
        }

        td.offering-cell {
          background: #fff3cd;
        }

        td.offering-total-cell {
          background: #ffc107;
          font-weight: 700;
          color: #856404;
        }

        td.attendance-total-cell {
          background: #d1fae5;
          font-weight: 700;
          color: #065f46;
        }

        .summary-section {
          margin-top: 40px;
          padding: 30px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          color: white;
        }

        .summary-title {
          font-size: 1.8em;
          font-weight: 700;
          margin-bottom: 25px;
          text-align: center;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .summary-card {
          background: rgba(255,255,255,0.2);
          padding: 20px;
          border-radius: 10px;
          text-align: center;
          backdrop-filter: blur(10px);
        }

        .summary-card .label {
          font-size: 1em;
          opacity: 0.9;
          margin-bottom: 10px;
          font-weight: 500;
        }

        .summary-card .value {
          font-size: 2.5em;
          font-weight: 700;
        }

        .button-container {
          text-align: center;
          margin-top: 25px;
        }

        .print-button {
          background: #28a745;
          color: white;
          border: none;
          padding: 15px 40px;
          font-size: 1.1em;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          box-shadow: 0 4px 6px rgba(0,0,0,0.2);
          transition: all 0.3s ease;
        }

        .print-button:hover {
          background: #218838;
          transform: translateY(-2px);
          box-shadow: 0 6px 8px rgba(0,0,0,0.3);
        }

        @media print {
          .app-container {
            background: white;
            padding: 0;
          }
          .print-button, .change-btn {
            display: none;
          }
          .report-info {
            border: none;
          }
        }

        @media screen and (max-width: 768px) {
          .header h1 {
            font-size: 1.8em;
          }
          
          th, td {
            padding: 6px 4px;
            font-size: 0.75em;
          }

          .report-info {
            flex-direction: column;
            align-items: flex-start;
          }

          .modal-content {
            padding: 30px 20px;
          }

          .report-info-group {
            flex-direction: column;
            gap: 10px;
          }
        }
      `}</style>

      <div className="app-container">
        <div className="container">
          <div className="header">
            <h1>📊 Monthly Attendance Report</h1>
            <p>Comprehensive Service Tracking & Analysis</p>
          </div>

          <div className="report-info">
            <div className="report-info-group">
              {formData.groupId && (
                <div className="report-info-item">
                  <span className="report-info-label">Group:</span>
                  <span className="report-info-value">{formatGroupName(formData.groupId)}</span>
                </div>
              )}
              {formData.churchId && (
                <div className="report-info-item">
                  <span className="report-info-label">Church:</span>
                  <span className="report-info-value">{formatChurchName(formData.churchId)}</span>
                </div>
              )}
              <div className="report-info-item">
                <span className="report-info-label">Month:</span>
                <span className="report-info-value">{formData.month ? formatMonthDisplay(formData.month) : '-'}</span>
              </div>
            </div>
            <button className="change-btn" onClick={() => setShowModal(true)}>
              Change Selection
            </button>
          </div>

          <div className="content">
            <ServiceTable 
              title="📖 Monday Bible Studies"
              data={reportData.monday}
              colorClass="monday"
            />

            <ServiceTable 
              title="🔥 Thursday Revival and Evangelism Training"
              data={reportData.thursday}
              colorClass="thursday"
            />

            <ServiceTable 
              title="⛪ Sunday Worship Service"
              data={reportData.sunday}
              colorClass="sunday"
            />

            <div className="summary-section">
              <div className="summary-title">📈 Monthly Summary</div>
              <div className="summary-grid">
                <div className="summary-card">
                  <div className="label">Total Adults</div>
                  <div className="value">{summary.totalAdults}</div>
                </div>
                <div className="summary-card">
                  <div className="label">Total Youth</div>
                  <div className="value">{summary.totalYouth}</div>
                </div>
                <div className="summary-card">
                  <div className="label">Total Children</div>
                  <div className="value">{summary.totalChildren}</div>
                </div>
                <div className="summary-card">
                  <div className="label">Total Newcomers</div>
                  <div className="value">{summary.totalNewcomers}</div>
                </div>
                <div className="summary-card">
                  <div className="label">Grand Total Attendance</div>
                  <div className="value">{summary.grandTotal}</div>
                </div>
                <div className="summary-card">
                  <div className="label">Total Offering</div>
                  <div className="value">${summary.totalOffering.toFixed(2)}</div>
                </div>
              </div>
              <div className="button-container">
                <button className="print-button" onClick={() => window.print()}>
                  🖨️ Print Report
                </button>
              </div>
            </div>
          </div>
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content" ref={modalRef}>
              <div className="modal-header">
                <FileText size={28} />
                <h2>📊 Select Report Parameters</h2>
                <p>Choose church and month to view attendance report</p>
              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                {userStatus === 'manager' && (
                  <SearchSelect
                    label="Select Group"
                    options={groupOptions}
                    value={formData.groupId}
                    onChange={(value) => setFormData({ 
                      ...formData, 
                      groupId: value, 
                      churchId: value !== '' ? '' : formData.churchId 
                    })}
                    placeholder="Search and select a group..."
                    disabled={formData.churchId !== ''}
                  />
                )}

                {(userStatus === 'manager' || userStatus === 'grouppastor' || userStatus === 'groupadmin') && (
                  <SearchSelect
                    label="Select Church"
                    options={churchOptions}
                    value={formData.churchId}
                    onChange={(value) => setFormData({ 
                      ...formData, 
                      churchId: value, 
                      groupId: value !== '' ? '' : formData.groupId 
                    })}
                    placeholder="Search and select a church..."
                    disabled={formData.groupId !== ''}
                  />
                )}

                <div className="form-group">
                  <label className="form-label">
                    <Calendar size={18} />
                    Select Month
                  </label>
                  <input
                    type="month"
                    className="month-input"
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    required
                    min="2020-01"
                    max={getCurrentMonth()}
                  />
                </div>

                <button type="submit" className="submit-button">
                  <FileText size={20} />
                  Load Report
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MonthlyAttendanceReport;