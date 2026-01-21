import React, { useState } from 'react';

import church_logo_big from '../assets/images/church_logo_big.png';
import carousel1 from '../assets/images/carousel1.jpg';
import carousel2 from '../assets/images/carousel2.jpg';

const ResetPassword = () => {
  // State for toggling visibility of the two different password fields
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State for form data
  const [formData, setFormData] = useState({
    resettoken: '',
    password: '',
    confirm: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple validation check before sending
    if (formData.password !== formData.confirm) {
      alert("Passwords do not match!");
      return;
    }

  };

  return (
    <div className="bg-light min-vh-100 d-flex align-items-center">
      <div className="container-fluid p-0">
        <div className="d-flex h-100">

          <div className="col-12 col-lg-6 d-flex flex-column justify-content-center">
            
            {/* Logo Section */}
            <div className="text-center mb-4">
              <img 
                src={church_logo_big} 
                className="img-fluid w-25" 
                alt="Church Logo" 
              />
            </div>

            {/* Form Container */}
            <div className="row d-flex justify-content-center w-100">
              <div className="col-md-8 col-lg-6">
                
                <form onSubmit={handleSubmit}>
                  
                  {/* Reset Token Input */}
                  <div className="mb-3">
                    <label className="form-label" htmlFor="resettoken">Reset token:</label>
                    <input 
                      className="form-control" 
                      type="number" 
                      name="resettoken" 
                      id="resettoken"
                      placeholder="Enter Reset token"
                      value={formData.resettoken}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* New Password Input */}
                  <div className="mb-3 position-relative">
                    <label htmlFor="password" class="form-label fw-semibold">New Password:</label>
                    <div className="input-group">
                      <input 
                        required 
                        type={showPassword ? "text" : "password"} 
                        className="form-control" 
                        name="password" 
                        id="password" 
                        placeholder="Enter New Password"
                        value={formData.password}
                        onChange={handleChange}
                      />
                      <button 
                        className="btn btn-outline-secondary" 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i className={`bi ${showPassword ? 'bi-eye' : 'bi-eye-slash'}`}></i>
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Input */}
                  <div className="mb-3 position-relative">
                    <label htmlFor="confirm" class="form-label">Confirm New Password:</label>
                    <div className="input-group">
                      <input 
                        required 
                        type={showConfirmPassword ? "text" : "password"} 
                        className="form-control" 
                        name="confirm" 
                        id="confirm"
                        placeholder="Confirm New Password"
                        value={formData.confirm}
                        onChange={handleChange}
                      />
                      <button 
                        className="btn btn-outline-secondary" 
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <i className={`bi ${showConfirmPassword ? 'bi-eye' : 'bi-eye-slash'}`}></i>
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="mb-3 d-grid">
                    <button className="btn btn-primary">Submit</button>
                  </div>

                </form>
              </div>
            </div>
          </div>


          <div className="d-none d-lg-block col-lg-6 p-0">
             <div id="carouselExampleControls" className="carousel slide" data-bs-ride="carousel" style={{height: '100vh'}}>
              <div className="carousel-inner h-100">
                
                {/* Slide 1 */}
                <div className="carousel-item active h-100">
                  <img 
                    src={carousel1} 
                    className="d-block w-100 h-100" 
                    style={{ objectFit: "cover" }} 
                    alt="Church Event 1" 
                  />
                </div>

                {/* Slide 2 */}
                <div className="carousel-item h-100">
                  <img 
                    src={carousel2} 
                    className="d-block w-100 h-100" 
                    style={{ objectFit: "cover" }} 
                    alt="Church Event 2" 
                  />
                </div>

              </div>
              <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleControls" data-bs-slide="prev">
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Previous</span>
              </button>
              <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleControls" data-bs-slide="next">
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Next</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ResetPassword;