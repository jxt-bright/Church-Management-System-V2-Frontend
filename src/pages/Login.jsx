import React from 'react'
import { useState } from 'react'
import { Fragment } from 'react'
import { Accordion } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';


import FlashMessage from '../components/FlashMessage';
import { useAuth } from "../context/AuthContext.jsx";

// Import images
import church_logo_big from '../assets/images/church_logo_big.png';
import church_logo from '../assets/images/church_logo.png'
import carousel1 from '../assets/images/carousel1.jpg';
import carousel2 from '../assets/images/carousel2.jpg';





const Login = () => {

  const navigate = useNavigate();
  const { login } = useAuth();

  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);

  // State for form data
  const [formData, setFormData] = useState({ username: '', password: '' });
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [flash, setflash] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const togglePassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    // If isLoading is false start the process
    setflash('');
    setIsLoading(true);

    try {

      const response = await login(formData);

      if (response.success) {
        navigate('/home', { replace: true });
      } else {
        setflash(response.message);
        setTimeout(() => setflash(''), 3000);
      }

    } catch (err) {
      // Flash error message
      const message = err.response?.data?.message || 'Login failed';
      setflash(message);
      setTimeout(() => {
        setflash('');
      }, 3000);

    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
      <div className="container-fluid min-vh-100 d-flex align-items-center bg-light p-0">

        <div className="row w-100 m-0">

          <div className="col-12 col-lg-6 d-flex flex-column justify-content-center align-items-center mb-4 mb-md-0">

            {/* Logo Area */}
            <div className="text-center mb-5">
              <img
                src={church_logo}
                className="img-fluid mx-auto d-block w-50"
                alt="Church Logo"
              />
            </div>

            {/* Form Area */}
            <div className="w-100 d-flex justify-content-center">
              <div className="col-md-8 col-lg-6">
                <form onSubmit={handleSubmit}>

                  <FlashMessage message={flash} type="danger" onClose={() => setflash('')} />

                  {/* Username */}
                  <div className="mb-3">
                    <label className="form-label" htmlFor="username">Username:</label>
                    <input
                      className="form-control"
                      type="text"
                      name="username"
                      id="username"
                      placeholder="Enter Username"
                      value={formData.username}
                      autoComplete='off'
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className="mb-3 position-relative">
                    <label htmlFor="password" className="form-label">Password:</label>
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        name="password"
                        id="password"
                        placeholder="Enter Password"
                        value={formData.password}
                        autoComplete='off'
                        onChange={handleChange}
                        required
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={togglePassword}
                      >
                        <i className={`bi ${showPassword ? 'bi-eye' : 'bi-eye-slash'}`}></i>
                      </button>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="mb-3 d-grid">
                    <button className="btn btn-primary" disabled={isLoading}>Log In</button>
                  </div>
                </form>

                {/* Forgot Password Accordion */}
                {/* <Accordion className="mt-3" defaultActiveKey={null}>
                  <Accordion.Item eventKey="0">
                    <Accordion.Header>Forgot password?</Accordion.Header>
                    <Accordion.Body>
                      <form action="/resetpassword" method="POST">
                        <div className="mb-2">
                          <label className="form-label" htmlFor="reset-user">Username:</label>
                          <input
                            className="form-control"
                            type="text"
                            name="username"
                            id="reset-user"
                            placeholder="Enter Your Username"
                          />
                        </div>
                        <div className="d-grid">
                          <button className="btn btn-primary btn-sm">Submit</button>
                        </div>
                      </form>
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion> */}

              </div>
            </div>

          </div>


          {/* Carousel */}
          <div className="d-none d-lg-block col-lg-6 p-0">
            <div id="churchCarousel" className="carousel slide shadow-lg" data-bs-ride="carousel">

              {/* Indicators */}
              <div className="carousel-indicators">
                <button type="button" data-bs-target="#churchCarousel" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
                <button type="button" data-bs-target="#churchCarousel" data-bs-slide-to="1" aria-label="Slide 2"></button>
              </div>

              {/* Images */}
              <div className="carousel-inner">
                <div className="carousel-item active">
                  <img
                    src={carousel1}
                    className="d-block w-100"
                    style={{ height: '100vh', objectFit: 'cover' }} // Changed height to 80% of viewport height
                    alt="Church Event 1"
                  />
                </div>

                <div className="carousel-item">
                  <img
                    src={carousel2}
                    className="d-block w-100"
                    style={{ height: '100vh', objectFit: 'cover' }}
                    alt="Church Event 2"
                  />
                </div>
              </div>

              {/* Controls */}
              <button className="carousel-control-prev" type="button" data-bs-target="#churchCarousel" data-bs-slide="prev">
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Previous</span>
              </button>
              <button className="carousel-control-next" type="button" data-bs-target="#churchCarousel" data-bs-slide="next">
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Next</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

export default Login
