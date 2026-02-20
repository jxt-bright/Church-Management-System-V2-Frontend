import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FlashMessage from '../components/FlashMessage';
import church_logo from '../assets/images/church_logo.png';
import carousel1 from '../assets/images/carousel1.jpg';
import carousel2 from '../assets/images/carousel2.jpg';
import authService from '../services/authService.js';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [flash, setFlash] = useState({ message: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  
  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    phoneNumber: '',
    code: ['', '', '', '', '', ''], 
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCodeChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    if (value.length > 1) return;
    const newCode = [...formData.code];
    newCode[index] = value;
    setFormData({ ...formData, code: newCode });
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleCodeKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !formData.code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFlash({ message: '', type: '' });
    try {
      await authService.requestPasswordReset({ username: formData.username, phoneNumber: formData.phoneNumber });
      setFlash({ message: 'Verification code sent to your Phone Number', type: 'success' });
      setCurrentStep(2);
    } catch (error) {
      setFlash({ message: error.response?.data?.message || 'Failed to send code', type: 'danger' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    const code = formData.code.join('');
    if (code.length !== 6) {
      setFlash({ message: 'Please enter all 6 digits', type: 'danger' });
      return;
    }
    setIsLoading(true);
    try {
      const response = await authService.authenticateCode({ username: formData.username, code: code });
      if (response.valid) {
        setCurrentStep(3);
      }
    } catch (err) {
      setFlash({ message: 'Invalid code', type: 'danger' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setFlash({ message: 'Passwords do not match', type: 'danger' });
      return;
    }
    setIsLoading(true);
    try {
      await authService.resetPassword({ username: formData.username, password: formData.password });
      navigate('/login', {
        state: { flashMessage: 'Password reset successful', flashType: 'success' }
      });
    } catch (error) {
      setFlash({ message: error.response?.data?.message || 'Failed to reset password', type: 'danger' });
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setFlash({ message: '', type: '' });
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center bg-light p-0">
      <div className="row w-100 m-0">
        
        <div className="col-12 col-lg-6 d-flex flex-column justify-content-center align-items-center mb-4 mb-md-0">
          
          <div className="text-center mb-5">
            <img 
              src={church_logo} 
              className="img-fluid mx-auto d-block w-50" 
              alt="Church Logo" 
            />
          </div>

          <div className="w-100 d-flex justify-content-center">
            <div className="col-md-8 col-lg-6">
              
              <FlashMessage message={flash.message} type={flash.type} onClose={() => setFlash({ message: '', type: '' })} />

              {/* Step 1: Request Code */}
              {currentStep === 1 && (
                <form onSubmit={handleUsernameSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Username:</label>
                    <input className="form-control" type="text" name="username" placeholder="Enter Username" value={formData.username} onChange={handleChange} autoComplete='off' required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone Number:</label>
                    <input className="form-control" type="number" name="phoneNumber" placeholder="Enter Phone Number" value={formData.phoneNumber} onChange={handleChange} autoComplete='off' required />
                  </div>
                  <div className="mb-3 d-grid">
                    <button className="btn btn-primary" type="submit" disabled={isLoading}>{isLoading ? 'Sending...' : 'Send Code'}</button>
                  </div>
                  <div className="text-center">
                    <button className="btn btn-link text-decoration-none p-0" type="button" onClick={goBack}>Back to Login</button>
                  </div>
                </form>
              )}

              {/* Step 2: Verify Code */}
              {currentStep === 2 && (
                <form onSubmit={handleCodeSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Verification Code:</label>
                    <div className="d-flex justify-content-between">
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <input 
                          key={i} id={`code-${i}`} 
                          className="form-control text-center mx-1" 
                          style={{ height: '45px' }}
                          type="text" maxLength="1" 
                          value={formData.code[i]} 
                          onChange={(e) => handleCodeChange(i, e.target.value)} 
                          onKeyDown={(e) => handleCodeKeyDown(i, e)} 
                          autoComplete='off' required 
                        />
                      ))}
                    </div>
                  </div>
                  <div className="mb-3 d-grid">
                    <button className="btn btn-primary" type="submit" disabled={isLoading}>{isLoading ? 'Verifying...' : 'Verify Code'}</button>
                  </div>
                  <div className="text-center">
                    <button className="btn btn-link text-decoration-none p-0" type="button" onClick={goBack}>Back</button>
                  </div>
                </form>
              )}

              {/* Step 3: New Password */}
              {currentStep === 3 && (
                <form onSubmit={handlePasswordSubmit}>
                  {/* Password Field */}
                  <div className="mb-3">
                    <label className="form-label">New Password:</label>
                    <div className="input-group">
                      <input 
                        className="form-control" 
                        type={showPassword ? "text" : "password"} 
                        name="password" 
                        placeholder="New Password" 
                        value={formData.password} 
                        autoComplete='off' 
                        onChange={handleChange} 
                        required 
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

                  {/* Confirm Password Field */}
                  <div className="mb-3">
                    <label className="form-label">Confirm Password:</label>
                    <div className="input-group">
                      <input 
                        className="form-control" 
                        type={showConfirmPassword ? "text" : "password"} 
                        name="confirmPassword" 
                        placeholder="Confirm Password" 
                        value={formData.confirmPassword} 
                        autoComplete='off' 
                        onChange={handleChange} 
                        required 
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

                  <div className="mb-3 d-grid">
                    <button className="btn btn-primary" type="submit" disabled={isLoading}>Reset Password</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="d-none d-lg-block col-lg-6 p-0">
          <div id="churchCarousel" className="carousel slide shadow-lg" data-bs-ride="carousel">
            <div className="carousel-inner">
              <div className="carousel-item active">
                <img src={carousel1} className="d-block w-100" style={{ height: '100vh', objectFit: 'cover' }} alt="Church Event 1" />
              </div>
              <div className="carousel-item">
                <img src={carousel2} className="d-block w-100" style={{ height: '100vh', objectFit: 'cover' }} alt="Church Event 2" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;