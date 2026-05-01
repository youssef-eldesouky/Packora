import React from 'react';

export default function Step1Warehouse({ data, onChange, onNext }) {
  const handleChange = (e) => {
    onChange({ ...data, [e.target.name]: e.target.value });
  };

  const isComplete = data.warehouseName && data.addressLine && data.city && data.postalCode && data.contactNumber;

  return (
    <div className="step-container">
      <h2 className="bulk-title" style={{fontSize: '1.8rem', textAlign: 'left'}}>Sender Information</h2>
      <p className="bulk-subtitle" style={{marginBottom: '30px', textAlign: 'left'}}>
        Confirm the warehouse or sender details for this bulk order.
      </p>

      <form className="warehouse-form" onSubmit={(e) => { e.preventDefault(); onNext(); }}>
        <div className="form-group full-width">
          <label>Warehouse Name</label>
          <input 
            type="text" 
            name="warehouseName" 
            value={data.warehouseName} 
            onChange={handleChange} 
            placeholder="e.g. Main Distribution Center" 
            required
          />
        </div>
        
        <div className="form-group full-width">
          <label>Address Line</label>
          <input 
            type="text" 
            name="addressLine" 
            value={data.addressLine} 
            onChange={handleChange} 
            placeholder="e.g. 123 Packaging Way" 
            required
          />
        </div>

        <div className="form-group">
          <label>City</label>
          <input 
            type="text" 
            name="city" 
            value={data.city} 
            onChange={handleChange} 
            placeholder="City" 
            required
          />
        </div>

        <div className="form-group">
          <label>Postal Code</label>
          <input 
            type="text" 
            name="postalCode" 
            value={data.postalCode} 
            onChange={handleChange} 
            placeholder="ZIP or Postal Code" 
            required
          />
        </div>

        <div className="form-group full-width">
          <label>Contact Number</label>
          <input 
            type="tel" 
            name="contactNumber" 
            value={data.contactNumber} 
            onChange={handleChange} 
            placeholder="Phone number" 
            required
          />
        </div>

        <div className="step-actions" style={{gridColumn: '1 / -1'}}>
          <div /> {/* Placeholder to push Next button right */}
          <button type="submit" className="btn-next" disabled={!isComplete}>
            Next Step →
          </button>
        </div>
      </form>
    </div>
  );
}
