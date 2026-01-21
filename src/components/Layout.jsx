import React, { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = ({ children }) => {
  // Initialize state to match Navbar's default (true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Create a function to update state when Navbar toggle is clicked
  const handleSidebarToggle = (isOpen) => {
    setIsSidebarOpen(isOpen);
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* Pass the handler down to Navbar */}
      <Navbar onToggle={handleSidebarToggle} />

      {/* Apply dynamic margin and width to the content wrapper */}
      <div 
        className="flex-grow-1"
        style={{
          marginLeft: isSidebarOpen ? "250px" : "0", 
          width: isSidebarOpen ? "calc(100% - 250px)" : "100%",
          marginTop: "60px",
          transition: "margin-left 0.3s ease-in-out, width 0.3s ease-in-out"
        }}
      >
        {children}
      </div>

      <div 
        style={{
          marginLeft: isSidebarOpen ? "250px" : "0", 
          transition: "margin-left 0.3s ease-in-out"
        }}
      >
        <Footer />
      </div>
    </div>
  );
};

export default Layout;