import React, { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function Step3Review({ data, onBack, onConfirm }) {
  const { cartItems } = useCart();
  const [isConfirming, setIsConfirming] = useState(false);

  const totalBoxes = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  const { validRows, errors, processedData } = useMemo(() => {
    const processed = [];
    let validCount = 0;
    let errorCount = 0;

    data.forEach((row, index) => {
      const name = row['Customer Name'] || '';
      const phone = row['Phone Number'] || '';
      const address = row['Address Line'] || '';
      const city = row['City'] || '';
      const notes = row['Notes'] || '';

      const rowErrors = {};
      if (!name) rowErrors.name = true;
      if (!phone) rowErrors.phone = true;
      if (!address) rowErrors.address = true;
      if (!city) rowErrors.city = true;

      const hasError = Object.keys(rowErrors).length > 0;
      if (hasError) {
        errorCount++;
      } else {
        validCount++;
      }

      processed.push({
        id: index,
        name,
        phone,
        address,
        city,
        notes,
        rowErrors,
        hasError
      });
    });

    return { validRows: validCount, errors: errorCount, processedData: processed };
  }, [data]);

  const isQuantityMatch = validRows === totalBoxes;
  const canConfirm = errors === 0 && totalBoxes > 0 && isQuantityMatch;

  const handleConfirm = () => {
    setIsConfirming(true);
    // Simulate API call
    setTimeout(() => {
      onConfirm();
    }, 1500);
  };

  return (
    <div className="step-container" style={{maxWidth: '1000px'}}>
      <h2 className="bulk-title" style={{fontSize: '1.8rem', textAlign: 'left'}}>Review & Confirm</h2>
      <p className="bulk-subtitle" style={{marginBottom: '30px', textAlign: 'left'}}>
        Review your uploaded addresses and match them with your order.
      </p>

      <div className="review-section">
        {errors > 0 && (
          <div className="validation-banner error">
            <AlertCircle size={20} />
            <span>Please fix the {errors} highlighted errors in your uploaded file and try again. Missing required fields are highlighted in red.</span>
          </div>
        )}

        {!isQuantityMatch && errors === 0 && totalBoxes > 0 && (
          <div className="validation-banner error">
            <AlertCircle size={20} />
            <span>Error: The number of addresses ({validRows}) must exactly match the number of items in your cart ({totalBoxes}). Please adjust your cart or upload a new file.</span>
          </div>
        )}

        {isQuantityMatch && errors === 0 && (
          <div className="validation-banner success">
            <CheckCircle2 size={20} />
            <span>Perfect! You have exactly {validRows} addresses for your {totalBoxes} boxes.</span>
          </div>
        )}

        {totalBoxes === 0 && (
          <div className="validation-banner error">
            <AlertCircle size={20} />
            <span>Your cart is empty. Please add items to your cart before confirming the bulk order.</span>
          </div>
        )}

        <div className="table-container">
          <table className="addresses-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Customer Name</th>
                <th>Phone Number</th>
                <th>Address Line</th>
                <th>City</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {processedData.map((row) => (
                <tr key={row.id}>
                  <td>{row.id + 1}</td>
                  <td className={row.rowErrors.name ? 'error-cell' : ''}>
                    {row.name || 'Missing Name'}
                  </td>
                  <td className={row.rowErrors.phone ? 'error-cell' : ''}>
                    {row.phone || 'Missing Phone'}
                  </td>
                  <td className={row.rowErrors.address ? 'error-cell' : ''}>
                    {row.address || 'Missing Address'}
                  </td>
                  <td className={row.rowErrors.city ? 'error-cell' : ''}>
                    {row.city || 'Missing City'}
                  </td>
                  <td>{row.notes}</td>
                </tr>
              ))}
              {processedData.length === 0 && (
                <tr>
                  <td colSpan="6" style={{textAlign: 'center', padding: '30px', color: 'var(--text-muted)'}}>
                    No addresses found in the file.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="step-actions">
        <button type="button" className="btn-back" onClick={onBack} disabled={isConfirming}>
          ← Back to Upload
        </button>
        <button 
          type="button" 
          className="btn-next" 
          onClick={handleConfirm}
          disabled={!canConfirm || isConfirming}
        >
          {isConfirming ? 'Processing...' : 'Confirm Order'}
        </button>
      </div>
    </div>
  );
}
