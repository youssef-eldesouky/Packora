import React, { useState } from 'react';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import './BulkOrder.css';
import Step1Warehouse from './Step1Warehouse';
import Step2Upload from './Step2Upload';
import Step3Review from './Step3Review';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function BulkOrder() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const { clearCart, bulkExcelData, setBulkExcelData, bulkWarehouseData, setBulkWarehouseData } = useCart();
  const navigate = useNavigate();

  const handleNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleUploadComplete = (data) => {
    setBulkExcelData(data);
    handleNextStep();
  };

  const handleConfirmOrder = () => {
    // Clear cart and show success
    clearCart();
    setBulkExcelData([]);
    setBulkWarehouseData({
      warehouseName: '',
      addressLine: '',
      city: '',
      postalCode: '',
      contactNumber: ''
    });
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="bulk-order-page">
        <Navbar />
        <main className="bulk-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="step-container" style={{ textAlign: 'center', padding: '60px 40px' }}>
            <CheckCircle2 size={80} color="#22c55e" style={{ margin: '0 auto 20px auto' }} />
            <h2 className="bulk-title">Order Confirmed!</h2>
            <p className="bulk-subtitle" style={{ marginBottom: '40px' }}>
              Your bulk order addresses have been successfully processed.
            </p>
            <button 
              className="btn-next" 
              onClick={() => navigate('/HomePage')}
            >
              Return to Dashboard
            </button>
            
            <button 
              className="btn-next" 
              onClick={() => navigate('/Track')}
            >
              Track Your Order
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bulk-order-page">
      <Navbar />
      
      <main className="bulk-main">
        <div className="bulk-header">
          <h1 className="bulk-title">Bulk Order Upload</h1>
          <p className="bulk-subtitle">Easily manage multiple delivery addresses using an Excel file.</p>
        </div>

        {/* Progress Indicator */}
        <div className="bulk-progress">
          <div className={`progress-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
            <div className="step-number">{currentStep > 1 ? '✓' : '1'}</div>
            <span className="step-label">Sender Info</span>
          </div>
          <div className={`progress-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
            <div className="step-number">{currentStep > 2 ? '✓' : '2'}</div>
            <span className="step-label">Upload File</span>
          </div>
          <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <span className="step-label">Review & Confirm</span>
          </div>
        </div>

        {/* Dynamic Step Content */}
        {currentStep === 1 && (
          <Step1Warehouse 
            data={bulkWarehouseData} 
            onChange={setBulkWarehouseData} 
            onNext={handleNextStep} 
          />
        )}
        
        {currentStep === 2 && (
          <Step2Upload 
            onUploadComplete={handleUploadComplete} 
            onBack={handlePrevStep} 
          />
        )}
        
        {currentStep === 3 && (
          <Step3Review 
            data={bulkExcelData} 
            onBack={handlePrevStep} 
            onConfirm={handleConfirmOrder}
          />
        )}

      </main>

      <Footer />
    </div>
  );
}
