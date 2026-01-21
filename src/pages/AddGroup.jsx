import React, { useState } from 'react';
import groupService from '../services/groupService.js';
import FlashMessage from '../components/FlashMessage';

const AddGroup = () => {
    // Initial State for Form Data
    const initialFormState = {
        name: '',
        location: '',
        pastor: '',
        phoneNumber: '',
        email: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [isLoading, setIsLoading] = useState(false);
    const [flash, setFlash] = useState({ message: '', type: '' });

    // Handle Input Change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle Form Submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isLoading) return; 
        setIsLoading(true);

        try {
            const response = await groupService.addGroup(formData);
            
            // Success: Show message and Reset Form
            setFlash({ message: response.message || 'Group created successfully!', type: 'success' });
            setFormData(initialFormState);
            
        } catch (error) {
            setFlash({ 
                message: error.response?.data?.message || 'Error registering group', 
                type: 'danger' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="app-main">
            <FlashMessage
                message={flash.message}
                type={flash.type}
                onClose={() => setFlash({ message: '', type: '' })}
            />

            <div className="app-content-header my-4">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12 text-center">
                            <h2 className="mb-0">Registration Forms</h2>
                        </div>
                    </div>
                </div>
            </div>

            <div className="app-content px-3 pb-5">
                <div className="container-fluid">
                    <div className="row justify-content-center">

                        <div className="col-12 col-md-10 col-lg-8 col-xl-6">
                            <div className="card card-info card-outline shadow-sm mb-4">
                                <div className="card-header">
                                    <div className="card-title">
                                        <h4 className="mb-0">Add Group</h4>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="card-body">
                                        <div className="row g-3">
                                            <div className="col-12">
                                                <label htmlFor="name" className="form-label fw-bold">Group Name <span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="name"
                                                    name="name"
                                                    placeholder="e.g. Accra Central Group"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    required
                                                    autoComplete='off'
                                                />
                                            </div>

                                            {/* Location */}
                                            <div className="col-12">
                                                <label htmlFor="location" className="form-label fw-bold">Location <span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="location"
                                                    name="location"
                                                    placeholder="e.g. Accra, Ghana"
                                                    value={formData.location}
                                                    onChange={handleChange}
                                                    required
                                                    autoComplete='off'
                                                />
                                            </div>

                                            {/* Pastor */}
                                            <div className="col-12">
                                                <label htmlFor="pastor" className="form-label fw-bold">Group Pastor <span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="pastor"
                                                    name="pastor"
                                                    placeholder="e.g. Rev. John Doe"
                                                    value={formData.pastor}
                                                    onChange={handleChange}
                                                    required
                                                    autoComplete='off'
                                                />
                                            </div>

                                            {/* Phone Number and Email */}
                                            <div className="col-md-6">
                                                <label htmlFor="phoneNumber" className="form-label fw-bold">Phone Number <span className="text-danger">*</span></label>
                                                <input
                                                    type="tel"
                                                    className="form-control"
                                                    id="phoneNumber"
                                                    name="phoneNumber"
                                                    placeholder="e.g. 0244123456"
                                                    value={formData.phoneNumber}
                                                    onChange={handleChange}
                                                    required
                                                    autoComplete='off'
                                                />
                                            </div>

                                            <div className="col-md-6">
                                                <label htmlFor="email" className="form-label fw-bold">Email (Optional)</label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    id="email"
                                                    name="email"
                                                    placeholder="e.g. group@example.com"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    autoComplete='off'
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card-footer d-flex justify-content-end gap-2 p-3 bg-light">
                                        <button
                                            className="btn btn-info px-4 text-white fw-bold"
                                            type="submit"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Submitting...
                                                </>
                                            ) : 'Create Group'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default AddGroup;