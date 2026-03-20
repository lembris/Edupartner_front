import React from 'react';

/**
 * FormActions - Reusable form action buttons section
 * 
 * Props:
 * - onSubmit: Submit handler function
 * - onReset: Reset handler function (optional)
 * - loading: Boolean for loading state
 * - submitText: Submit button text (default: "Submit")
 * - resetText: Reset button text (default: "Clear Form")
 * - showReset: Boolean to show reset button (default: true)
 * - submitIcon: Icon class for submit button
 * - resetIcon: Icon class for reset button
 * - submitVariant: Bootstrap button variant (default: "primary")
 * - resetVariant: Bootstrap button variant (default: "outline-secondary")
 */
export const FormActions = ({
  onSubmit,
  onReset,
  loading = false,
  submitText = 'Submit',
  resetText = 'Clear Form',
  showReset = true,
  submitIcon = 'bx-check-circle',
  resetIcon = 'bx-reset',
  submitVariant = 'primary',
  resetVariant = 'outline-secondary'
}) => {
  return (
    <div className="form-actions mt-5 pt-4 border-top">
      <div className="row g-3">
        <div className="col-12 d-flex gap-2 justify-content-center">
          {/* Submit Button */}
          <button
            type="button"
            className={`btn btn-${submitVariant} btn-lg`}
            onClick={onSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Processing...
              </>
            ) : (
              <>
                <i className={`bx ${submitIcon} me-2`}></i>
                {submitText}
              </>
            )}
          </button>

          {/* Reset Button */}
          {showReset && onReset && (
            <button
              type="button"
              className={`btn btn-${resetVariant} btn-lg`}
              onClick={onReset}
              disabled={loading}
            >
              <i className={`bx ${resetIcon} me-2`}></i>
              {resetText}
            </button>
          )}
        </div>
      </div>

      {/* Security Notice */}
      <div className="text-center mt-4 pt-3">
        <p className="text-muted small">
          <i className="bx bx-shield-alt me-1"></i>
          Your submission is protected by 256-bit SSL encryption.
          All fields marked with <span className="text-danger">*</span> are required.
        </p>
      </div>
    </div>
  );
};

export default FormActions;
