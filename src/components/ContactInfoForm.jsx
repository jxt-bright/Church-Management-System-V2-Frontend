
import React from 'react';

const ContactInfoForm = ({ data, onChange, onNext, onBack }) => {

    const continueStep = (e) => {
        e.preventDefault();
        onNext();
    };

    const backStep = (e) => {
        e.preventDefault();
        onBack();
    };

    return (
        <div>
            <h4 className="mb-3 text-center">Contact Details</h4>
            <form onSubmit={continueStep}>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Personal Phone Number</label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            className="form-control"
                            onChange={onChange}
                            value={data.phoneNumber}
                            autoComplete='off'
                            required
                        />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">GPS Address</label>
                        <input
                            type="text"
                            name="gpsAddress"
                            className="form-control"
                            onChange={onChange}
                            value={data.gpsAddress}
                            autoComplete='off'
                            placeholder="e.g. AK-039-4942"
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="form-label">House Address / Location</label>
                    <input
                        type="text"
                        name="houseAddress"
                        className="form-control"
                        onChange={onChange}
                        value={data.houseAddress}
                        autoComplete='off'
                        placeholder="e.g. House No. 5, Block B, Kumasi"
                    />
                </div>

                <hr className="my-4" />

                {/* Emergency Contact Section */}
                <h5 className="text-muted fs-6 mb-3">Emergency Contact</h5>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Emergency Contact</label>
                        <input
                            type="tel"
                            name="emergencyContact"
                            className="form-control"
                            onChange={onChange}
                            value={data.emergencyContact}
                            autoComplete='off'
                            required
                        />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Emergency Contact Name</label>
                        <input
                            type="text"
                            name="emergencyName"
                            className="form-control"
                            onChange={onChange}
                            value={data.emergencyName}
                            autoComplete='off'
                            required
                        />
                    </div>

                </div>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Relationship with Emergency Contact</label>
                        <input
                            type="text"
                            name="emergencyRelation"
                            className="form-control"
                            onChange={onChange}
                            value={data.emergencyRelation}
                            placeholder="e.g. Mother, Spouse, sibling"
                            autoComplete='off'
                            required
                        />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Emergency Contact Address(optional)</label>
                        <input
                            type="text"
                            name="emergencyAddress"
                            className="form-control"
                            onChange={onChange}
                            value={data.emergencyAddress}
                            autoComplete='off'
                            placeholder="e.g. House No / GPS Address"
                        />
                    </div>
                </div>

                <div className="d-flex justify-content-between mt-3">
                    <button onClick={backStep} className="btn btn-secondary">
                        Back
                    </button>
                    <button type="submit" className="btn btn-primary">
                        Review Details
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ContactInfoForm;