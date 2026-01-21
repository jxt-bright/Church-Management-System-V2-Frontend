
import React from 'react';

const SchoolOrWorkInfo = ({ data, onChange, onNext, onBack }) => {
  
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
      <h4 className="mb-3 text-center ">School / Work Info (Optional)</h4>
      <form onSubmit={continueStep}>
        
        <div className="mb-3">
          <label className="form-label">Name of School / Workplace</label>
          <input
            type="text"
            name="workOrSchool"
            className="form-control"
            onChange={onChange}
            value={data.workOrSchool}
            placeholder="e.g. UMaT or Ghana Health Service"
            autoComplete='off'
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Level In School / Position at Work</label>
          <input
            type="text"
            name="levelOrPosition"
            className="form-control"
            onChange={onChange}
            value={data.levelOrPosition}
            placeholder="e.g. Level 300 or Senior Nurse"
            autoComplete='off'
          />
        </div>

        <div className="mb-4">
          <label className="form-label">Program / Department</label>
          <input
            type="text"
            name="programOrDepartment"
            className="form-control"
            onChange={onChange}
            value={data.programOrDepartment}
            placeholder="e.g. Computer Science or Research Department"
            autoComplete='off'
          />
        </div>
        
        <div className="d-flex justify-content-between">
          <button onClick={backStep} className="btn btn-secondary">
            Back
          </button>
          <button type="submit" className="btn btn-primary">
            Next
          </button>
        </div>
      </form>
    </div>
  );
};

export default SchoolOrWorkInfo;