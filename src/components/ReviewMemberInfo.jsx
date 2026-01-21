
import React from 'react';
import { Spinner } from 'react-bootstrap';

const ReviewMemberInfo = ({ onBack, data, onSubmit, isLoading }) => {

    const backStep = (e) => {
        e.preventDefault();
        onBack();
    };

    const submitForm = (e) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <div>
            <h4 className="mb-4 text-center">Review Member Information</h4>

            {/* Profile Image Preview */}
            <div className="mb-4">
                {data.profileImage ? (
                    <img
                        src={data.profileImage}
                        alt="Profile Preview"
                        className="d-block mx-auto"
                        style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '50%', border: '3px solid #dee2e6' }}
                    />
                ) : (
                    <div
                        className="d-block mx-auto rounded-circle bg-light border text-center"
                        style={{ width: '120px', height: '120px', lineHeight: '120px' }}
                    >
                        No Photo
                    </div>
                )}
            </div>

            <div className="row">
                {/* Personal Details */}
                <div className="col-md-6 mb-3">
                    <div className="card h-100">
                        <div className="card-header bg-light fw-bold">Personal Details</div>
                        <div className="card-body">
                            <p className="mb-1"><strong>Name:</strong> {data.firstName} {data.lastName}</p>
                            <p className="mb-1"><strong>Gender:</strong> {data.gender}</p>
                            <p className="mb-1"><strong>Email:</strong> {data.email}</p>
                            <p className="mb-1"><strong>Relationship Status:</strong> {data.relationshipStatus}</p>
                            <p className="mb-1"><strong>Category:</strong> {data.category}</p>
                            <p className="mb-0"><strong>Member status:</strong> {data.memberStatus}</p>
                        </div>
                    </div>
                </div>

                {/* Academic / Work */}
                <div className="col-md-6 mb-3">
                    <div className="card h-100">
                        <div className="card-header bg-light fw-bold">Work / Academic Details</div>
                        <div className="card-body">
                            <p className="mb-1"><strong>Institution:</strong> {data.workOrSchool || null}</p>
                            <p className="mb-1"><strong>Level/Position:</strong> {data.levelOrPosition || null}</p>
                            <p className="mb-0"><strong>Department:</strong> {data.programOrDepartment || null}</p>
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="col-md-6 mb-3">
                    <div className="card h-100">
                        <div className="card-header bg-light fw-bold">Contact Info</div>
                        <div className="card-body">
                            <p className="mb-1"><strong>Phone:</strong> {data.phoneNumber}</p>
                            <p className="mb-1"><strong>House Address:</strong> {data.houseAddress}</p>
                            <p className="mb-0"><strong>GPS:</strong> {data.gpsAddress}</p>
                        </div>
                    </div>
                </div>

                {/* Emergency Contact */}
                <div className="col-md-6 mb-3">
                    <div className="card h-100">
                        <div className="card-header bg-light fw-bold">Emergency Contact</div>
                        <div className="card-body">
                            <p className="mb-1"><strong>Name:</strong> {data.emergencyName}</p>
                            <p className="mb-1"><strong>Contact:</strong> {data.emergencyContact}</p>
                            <p className="mb-1"><strong>Relationship:</strong> {data.emergencyRelation}</p>
                            <p className="mb-0"><strong>Address:</strong> {data.emergencyAddress}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="d-flex justify-content-between mt-3">
                <button onClick={backStep} className="btn btn-secondary" disabled={isLoading}>
                    Back
                </button>
                <button onClick={submitForm} className="btn btn-success" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="me-2"
                            />
                            Submitting...
                        </>
                    ) : (
                        'Confirm & Submit'
                    )}
                </button>
            </div>
        </div>
    );
};

export default ReviewMemberInfo;