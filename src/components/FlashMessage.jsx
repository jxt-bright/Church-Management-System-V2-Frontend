import React, { useEffect } from 'react';



const FlashMessage = ({ message, type, onClose, duration = 3000 }) => {
  
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose(); 
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  // If message is empty, don't show anything
  if (!message) return null;

  return (
    //  Use the 'type' prop to change color (alert-danger, alert-success)
    <div 
      className={`alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3 shadow`} 
      style={{ zIndex: 1050, minWidth: '300px', textAlign: 'center' }}
    >
      {/* Display the message */}
      {message}
      
      <button type="button" className="btn-close" onClick={onClose}></button>
    </div>
  );
};

export default FlashMessage;