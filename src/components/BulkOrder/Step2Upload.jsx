import React, { useState, useRef } from 'react';
import { UploadCloud, Download, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function Step2Upload({ onUploadComplete, onBack }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const processFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        // Parse directly to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        onUploadComplete(jsonData);
      } catch (error) {
        alert("Error parsing file. Please ensure it's a valid Excel or CSV file.");
        console.error(error);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const downloadTemplate = () => {
    // Generate simple excel template
    const templateData = [
      { 'Customer Name': '', 'Phone Number': '', 'Address Line': '', 'City': '','Order Details': '', 'Notes': '' },
      { 'Customer Name': '', 'Phone Number': '', 'Address Line': '', 'City': '','Order Details': '', 'Notes': '' }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Addresses");
    XLSX.writeFile(wb, "Packora_Bulk_Addresses_Template.xlsx");
  };

  return (
    <div className="step-container">
      <h2 className="bulk-title" style={{fontSize: '1.8rem', textAlign: 'left'}}>Upload Delivery Addresses</h2>
      <p className="bulk-subtitle" style={{marginBottom: '30px', textAlign: 'left'}}>
        Upload an Excel or CSV file containing your delivery addresses.
      </p>

      <div className="upload-options">
        <div className="template-section">
          <div className="template-info">
            <FileText className="dropzone-icon" size={24} />
            <div>
              <p style={{fontWeight: 600, color: 'var(--text-main)'}}>Need a template?</p>
              <p style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>Download our standard format to ensure smooth processing.</p>
            </div>
          </div>
          <button type="button" className="template-btn" onClick={downloadTemplate}>
            <Download size={18} />
            Download Template
          </button>
        </div>

        <div 
          className={`dropzone ${isDragging ? 'drag-active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
            accept=".xlsx, .xls, .csv"
          />
          <UploadCloud size={48} className="dropzone-icon" />
          <p className="dropzone-text">Click to upload or drag and drop</p>
          <p className="dropzone-subtext">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
          <p className="dropzone-subtext" style={{marginTop: '10px'}}>Supports .xlsx and .csv files up to 5MB</p>
        </div>
      </div>

      <div className="step-actions">
        <button type="button" className="btn-back" onClick={onBack}>
          ← Back
        </button>
        <button type="button" className="btn-next" disabled style={{opacity: 0.5}}>
          Upload to Continue
        </button>
      </div>
    </div>
  );
}
