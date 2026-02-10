
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import church_logo from '../assets/images/church_logo.png';
import '../assets/styles/Navbar.css';
import RequireAccess from './RequireAccess.jsx';
import { useAuth } from "../context/AuthContext.jsx";

const Navbar = ({ onToggle }) => {
  const { logout } = useAuth(); 
  const location = useLocation();
  const navigate = useNavigate();
  const BREAKPOINT = 992;

  const [isOpen, setIsOpen] = useState(window.innerWidth >= BREAKPOINT);
  const [isMobile, setIsMobile] = useState(window.innerWidth < BREAKPOINT);
  
  const [openMenus, setOpenMenus] = useState({
    registration: false,
    views: false,
    specialService: false,
    reports: false
  });

  // Helper to check if link is active
  const isActive = (path) => {
    return location.pathname === path ? "active bg-primary text-white rounded shadow-sm" : "text-light";
  };

  // Check if a dropdown parent should be highlighted
  const isParentActive = (paths) => {
    return paths.includes(location.pathname) ? "text-warning fw-bold" : "text-light";
  };

  const toggleMenu = (menuName) => {
    setOpenMenus((prev) => ({
      registration: false,
      views: false,
      specialService: false,
      reports: false,
      [menuName]: !prev[menuName]
    }));
  };

  // Logout Handler
  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      handleMobileLinkClick();
      await logout();
      // Redirect to login
      window.location.replace("/");
    } catch (error) {
      window.location.replace("/");
    }
  };

  useEffect(() => {
    if (onToggle) onToggle(isOpen);

    // AUTO-OPEN MENUS based on current URL
    const path = location.pathname;
    setOpenMenus({
      registration: ['/addgroup', '/addchurch', '/adduser', '/addmember'].includes(path),
      views: ['/groups', '/churches', '/members', '/users'].includes(path),
      specialService: ['/attendance', '/addspecialservice', '/specialservices'].includes(path),
      reports: ['/attendance/monthlyreport', '/attendance/report'].includes(path),
    });

    const handleResize = () => {
      let mobile = window.innerWidth < BREAKPOINT;
      setIsMobile(mobile);

      if (mobile) {
        setIsOpen(false);
        if (onToggle) onToggle(false);
      } else {
        setIsOpen(true);
        if (onToggle) onToggle(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [location.pathname, onToggle]);

  const toggleSidebar = (e) => {
    e.preventDefault();
    const newState = !isOpen;
    setIsOpen(newState);
    if (onToggle) onToggle(newState);
  };

  const handleMobileLinkClick = () => {
    if (isMobile) {
      setIsOpen(false);
      if (onToggle) onToggle(false);
    }
  };

  return (
    <>
      {/* Top Navbar */}
      <nav
        className="app-header navbar navbar-expand bg-light fixed-top border-bottom"
        style={{
          marginLeft: (isOpen && !isMobile) ? "250px" : "0",
          width: (isOpen && !isMobile) ? "calc(100% - 250px)" : "100%",
        }}
      >
        <div className="container-fluid">
          <ul className="navbar-nav">
            <li className="nav-item">
              <a className="nav-link" href="#" role="button" onClick={toggleSidebar}>
                <i className="bi bi-list"></i>
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className="app-sidebar bg-body-secondary shadow"
        data-bs-theme="dark"
        style={{
          left: isOpen ? "0" : "-250px",
        }}
      >
        {/* Brand Logo */}
        <div className="sidebar-brand border-bottom border-secondary">
          <Link to="/home" className="brand-link d-flex align-items-center justify-content-center text-decoration-none w-100" onClick={handleMobileLinkClick}>
            <img src={church_logo} alt="Church Logo" className="brand-image opacity-75 shadow me-2" style={{ width: "40px", height: "40px" }} />
            <span className="brand-text fw-bold fs-5 text-light">DCLM</span>
          </Link>
        </div>

        {/* Sidebar Menu */}
        <div className="sidebar-wrapper pb-5 sidebar-scroll">
          <nav className="mt-2">
            <ul className="nav sidebar-menu flex-column" role="menu">

              {/* Home */}
              <li className="nav-item">
                <Link to="/home" className={`nav-link d-flex align-items-center ${isActive('/home')}`} onClick={handleMobileLinkClick}>
                  <i className="nav-icon bi bi-house-fill me-2"></i>
                  <p className="mb-0">Home</p>
                </Link>
              </li>

              <hr className="sidebar-divider my-2 border-secondary opacity-50" />

              {/* Registration */}
              <li className={`nav-item ${openMenus.registration ? 'menu-open' : ''}`}>
                <a href="#"
                  className={`nav-link ${isParentActive(['/addgroup', '/addchurch', '/adduser', '/addmember'])}`}
                  onClick={(e) => { e.preventDefault(); toggleMenu('registration'); }}>
                  <i className="nav-icon bi bi-pencil-square me-2"></i>
                  <p className="d-inline">
                    Registration
                    <i className={`nav-arrow bi ${openMenus.registration ? 'bi-chevron-down' : 'bi-chevron-right'} float-end`}></i>
                  </p>
                </a>
                <ul className="nav nav-treeview ms-3 flex-column" style={{ display: openMenus.registration ? 'block' : 'none' }}>
                  <RequireAccess minStatus="manager">
                    <li className="nav-item">
                      <Link to="/addgroup" className={`nav-link d-flex align-items-center ${isActive('/addgroup')}`} onClick={handleMobileLinkClick}>
                        <i className="nav-icon bi bi-circle me-2"></i>
                        <p className="mb-0">Add a Group</p>
                      </Link>
                    </li>
                  </RequireAccess>
                  <RequireAccess minStatus="groupAdmin">
                    <li className="nav-item">
                      <Link to="/addchurch" className={`nav-link d-flex align-items-center ${isActive('/addchurch')}`} onClick={handleMobileLinkClick}>
                        <i className="nav-icon bi bi-circle me-2"></i>
                        <p className="mb-0">Add a Church</p>
                      </Link>
                    </li>
                  </RequireAccess>
                  <RequireAccess minStatus="churchPastor">
                    <li className="nav-item">
                      <Link to="/adduser" className={`nav-link d-flex align-items-center ${isActive('/adduser')}`} onClick={handleMobileLinkClick}>
                        <i className="nav-icon bi bi-circle me-2"></i>
                        <p className="mb-0">Add a User</p>
                      </Link>
                    </li>
                  </RequireAccess>
                  <RequireAccess minStatus="churchAdmin">
                    <li className="nav-item">
                      <Link to="/addmember" className={`nav-link d-flex align-items-center ${isActive('/addmember')}`} onClick={handleMobileLinkClick}>
                        <i className="nav-icon bi bi-circle me-2"></i>
                        <p className="mb-0">Add a Member</p>
                      </Link>
                    </li>
                  </RequireAccess>
                </ul>
              </li>

              <hr className="sidebar-divider my-2 border-secondary opacity-50" />

              {/* Views */}
              <li className={`nav-item ${openMenus.views ? 'menu-open' : ''}`}>
                <a href="#"
                  className={`nav-link ${isParentActive(['/groups', '/churches', '/members', '/users'])}`}
                  onClick={(e) => { e.preventDefault(); toggleMenu('views'); }}>
                  <i className="nav-icon bi bi-view-list me-2"></i>
                  <p className="d-inline">
                    Views
                    <i className={`nav-arrow bi ${openMenus.views ? 'bi-chevron-down' : 'bi-chevron-right'} float-end`}></i>
                  </p>
                </a>
                <ul className="nav nav-treeview ms-3 flex-column" style={{ display: openMenus.views ? 'block' : 'none' }}>
                  <RequireAccess minStatus="manager">
                    <li className="nav-item">
                      <Link to="/groups" className={`nav-link d-flex align-items-center ${isActive('/groups')}`} onClick={handleMobileLinkClick}>
                        <i className="nav-icon bi bi-circle me-2"></i>
                        <p className="mb-0">Groups</p>
                      </Link>
                    </li>
                  </RequireAccess>
                  <RequireAccess minStatus="groupAdmin">
                    <li className="nav-item">
                      <Link to="/churches" className={`nav-link d-flex align-items-center ${isActive('/churches')}`} onClick={handleMobileLinkClick}>
                        <i className="nav-icon bi bi-circle me-2"></i>
                        <p className="mb-0">Churches</p>
                      </Link>
                    </li>
                  </RequireAccess>
                  <RequireAccess minStatus="churchPastor">
                    <li className="nav-item">
                      <Link to="/users" className={`nav-link d-flex align-items-center ${isActive('/users')}`} onClick={handleMobileLinkClick}>
                        <i className="nav-icon bi bi-circle me-2"></i>
                        <p className="mb-0">Users</p>
                      </Link>
                    </li>
                  </RequireAccess>
                  <RequireAccess minStatus="churchAdmin">
                    <li className="nav-item">
                      <Link to="/members" className={`nav-link d-flex align-items-center ${isActive('/members')}`} onClick={handleMobileLinkClick}>
                        <i className="nav-icon bi bi-circle me-2"></i>
                        <p className="mb-0">Members</p>
                      </Link>
                    </li>
                  </RequireAccess>
                </ul>
              </li>

              <hr className="sidebar-divider my-2 border-secondary opacity-50" />

              {/* Special Service */}
              <RequireAccess minStatus="churchAdmin">
                <li className={`nav-item ${openMenus.specialService ? 'menu-open' : ''}`}>
                  <a href="#"
                    className={`nav-link ${isParentActive(['/addspecialservice', '/specialservices', '/attendance'])}`}
                    onClick={(e) => { e.preventDefault(); toggleMenu('specialService'); }}>
                    <i className="nav-icon bi bi-journal-bookmark me-2"></i>
                    <p className="d-inline">
                      Service Records
                      <i className={`nav-arrow bi ${openMenus.specialService ? 'bi-chevron-down' : 'bi-chevron-right'} float-end`}></i>
                    </p>
                  </a>
                  <ul className="nav nav-treeview ms-3 flex-column" style={{ display: openMenus.specialService ? 'block' : 'none' }}>
                    <li className="nav-item">
                      <Link to="/attendance" className={`nav-link d-flex align-items-center ${isActive('/attendance')}`} onClick={handleMobileLinkClick}>
                        <i className="nav-icon bi bi-table me-2"></i>
                        <p className="mb-0">Attendance</p>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/addspecialservice" className={`nav-link d-flex align-items-center ${isActive('/addspecialservice')}`} onClick={handleMobileLinkClick}>
                        <i className="nav-icon bi bi-plus-circle me-2"></i>
                        <p className="mb-0">Add Special Service</p>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/specialservices" className={`nav-link d-flex align-items-center ${isActive('/specialservices')}`} onClick={handleMobileLinkClick}>
                        <i className="nav-icon bi bi-list-task me-2"></i>
                        <p className="mb-0">View Special Service</p>
                      </Link>
                    </li>
                  </ul>
                </li>
              </RequireAccess>

              <hr className="sidebar-divider my-2 border-secondary opacity-50" />

              {/* Reports */}
              <RequireAccess minStatus="churchAdmin">
                <li className={`nav-item ${openMenus.reports ? 'menu-open' : ''}`}>
                  <a href="#"
                    className={`nav-link ${isParentActive(['/attendance/monthlyreport', '/attendance/report'])}`}
                    onClick={(e) => { e.preventDefault(); toggleMenu('reports'); }}>
                    <i className="nav-icon bi bi-envelope-paper me-2"></i>
                    <p className="d-inline">
                      Generate Report
                      <i className={`nav-arrow bi ${openMenus.reports ? 'bi-chevron-down' : 'bi-chevron-right'} float-end`}></i>
                    </p>
                  </a>
                  <ul className="nav nav-treeview ms-3 flex-column" style={{ display: openMenus.reports ? 'block' : 'none' }}>
                    <li className="nav-item">
                      <Link to="/home" className={`nav-link d-flex align-items-center ${isActive('/attendance/monthlyreport')}`} onClick={handleMobileLinkClick}>
                        <i className="nav-icon bi bi-circle me-2"></i>
                        <p className="mb-0">Monthly Report</p>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/home" className={`nav-link d-flex align-items-center ${isActive('/attendance/report')}`} onClick={handleMobileLinkClick}>
                        <i className="nav-icon bi bi-circle me-2"></i>
                        <p className="mb-0">General Report</p>
                      </Link>
                    </li>
                  </ul>
                </li>
              </RequireAccess>

              <hr className="sidebar-divider my-2 border-secondary opacity-50" />

              <RequireAccess minStatus="churchAdmin">
                <li className="nav-item">
                  <Link to="/messages" className={`nav-link d-flex align-items-center ${isActive('/messages')}`} onClick={handleMobileLinkClick}>
                    <i className="nav-icon bi bi-envelope-arrow-up me-2"></i>
                    <p className="mb-0">Send Message</p>
                  </Link>
                </li>
                {/* Final Integrated Logout Link */}
                <li className="nav-item">
                  <Link 
                    to="" 
                    className="nav-link text-danger d-flex align-items-center" 
                    onClick={handleLogout}
                  >
                    <i className="nav-icon bi bi-box-arrow-right me-2"></i>
                    <p className="mb-0">Logout</p>
                  </Link>
                </li>
              </RequireAccess>

            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Navbar;