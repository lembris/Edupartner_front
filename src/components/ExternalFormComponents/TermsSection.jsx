import React from 'react';
import FormSection from './FormSection';

/**
 * TermsSection - Reusable terms and conditions form section
 * 
 * Props:
 * - agreed: Boolean for agreement status
 * - handleChange: Change handler function
 * - errors: Object with error messages
 * - title: Section title (default: "Terms & Conditions")
 * - stepNumber: Step indicator number
 * - content: HTML content for terms (optional)
 * - showSecurityNotice: Boolean to show security notice (default: true)
 */
export const TermsSection = ({
  agreed,
  handleChange,
  errors,
  title = 'Terms & Conditions',
  stepNumber = 4,
  content,
  showSecurityNotice = true
}) => {
  return (
    <FormSection
      stepNumber={stepNumber}
      icon="bx-file-blank"
      title={title}
      subtitle="Please review and accept the terms"
    >
      {/* Terms Content */}
      {content ? (
        <div className="terms-content mb-4">
          {typeof content === 'string' ? (
            <div dangerouslySetInnerHTML={{ __html: content }} />
          ) : (
            content
          )}
        </div>
      ) : (
        <div className="terms-content mb-4">
          <div className="terms-card p-4 rounded mb-3">
            <h6 className="fw-bold mb-3">Standard Terms & Conditions</h6>
            <p className="text-muted small mb-0">
              By submitting this form, you agree to our service terms and acknowledge that your information will be processed securely.
            </p>
          </div>
        </div>
      )}

      {/* Security Notice */}
      {showSecurityNotice && (
        <div className="alert alert-info mb-4" role="alert">
          <div className="d-flex">
            <i className="bx bx-lock-alt me-2 flex-shrink-0 mt-1"></i>
            <div>
              <strong>Secure & Confidential Submission</strong>
              <p className="text-muted small mb-0 mt-1">
                Your information is encrypted and protected with 256-bit SSL encryption. We never share your data with third parties.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Agreement Checkbox */}
      <div className="form-check">
        <input
          type="checkbox"
          className={`form-check-input ${errors.agreed_to_terms ? 'is-invalid' : ''}`}
          id="agreed_to_terms"
          name="agreed_to_terms"
          checked={agreed}
          onChange={handleChange}
        />
        <label className="form-check-label" htmlFor="agreed_to_terms">
          I agree to the terms and conditions <span className="text-danger">*</span>
        </label>
        {errors.agreed_to_terms && (
          <div className="invalid-feedback d-block">{errors.agreed_to_terms}</div>
        )}
      </div>
    </FormSection>
  );
};

export default TermsSection;
