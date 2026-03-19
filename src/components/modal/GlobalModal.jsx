import React, { useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import "../../css/global-modal.css";

const GlobalModal = ({
  show = false,
  onClose,
  title = "Modal",
  children,
  size = "lg",
  loading = false,
  onSubmit,
  submitText = "Save",
  cancelText = "Cancel",
  showFooter = true,
  footerContent,
  showCloseButton = true,
  scrollable = true,
  modalClassName = "",
  closeOnBackdropClick = false,
  closeOnEscape = false,
  fullWidth = false,
  fullScreen = false,
  customMaxWidth,
}) => {
  const getSizeClass = () => {
    if (fullScreen) return "modal-fullscreen";
    switch (size) {
      case "fullscreen":
        return "modal-fullscreen";
      case "xxl":
        return "modal-xxl";
      case "xl":
        return "modal-xl";
      case "lg":
        return "modal-lg";
      case "md":
        return "modal-md";
      case "sm":
        return "modal-sm";
      default:
        return "modal-md";
    }
  };

  const getSizeStyle = () => {
    if (fullScreen || size === "fullscreen") {
      return { width: "100%", maxWidth: "100%", height: "100%", maxHeight: "100%" };
    }
    if (customMaxWidth) {
      return { maxWidth: customMaxWidth, width: "95%" };
    }
    switch (size) {
      case "xxl":
        return { maxWidth: "1400px", width: "95%" };
      case "xl":
        return { maxWidth: "1140px", width: "95%" };
      case "lg":
        return { maxWidth: "800px", width: "90%" };
      case "md":
        return { maxWidth: "600px", width: "90%" };
      case "sm":
        return { maxMaxWidth: "300px", width: "90%" };
      default:
        return { maxWidth: "600px", width: "90%" };
    }
  };

  const scrollClass = scrollable ? "modal-dialog-scrollable" : "";

  const handleKeyDown = useCallback((e) => {
    if (closeOnEscape && e.key === "Escape") {
      onClose?.();
    }
  }, [onClose, closeOnEscape]);

  const handleBackdropClick = (e) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose?.();
    }
  };

  useEffect(() => {
    if (show) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [show, handleKeyDown]);

  if (!show) return null;

  const renderFooter = () => {
    if (!showFooter) return null;
    
    if (footerContent) {
      return <div className="modal-footer pb-4 px-4">{footerContent}</div>;
    }

    if (onSubmit) {
      return (
        <div className="modal-footer pb-4 px-4">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Saving...
              </>
            ) : (
              <>
                <i className="bx bx-save me-2"></i>
                {submitText}
              </>
            )}
          </button>
        </div>
      );
    }

    return (
      <div className="modal-footer pb-4 px-4">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </button>
      </div>
    );
  };

  const modalContent = (
    <>
      <div
        className="modal-body"
        style={{ maxHeight: scrollable ? "calc(100vh - 280px)" : "none", overflowY: scrollable ? "auto" : "visible" }}
      >
        {children}
      </div>
      {renderFooter()}
    </>
  );

  return (
    <div
      className="modal fade show d-block"
      style={{ 
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999
      }}
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={handleBackdropClick}
    >
      <div
        className={`modal-dialog modal-dialog-centered ${scrollClass} ${getSizeClass()} ${modalClassName}`}
        role="document"
        style={{ ...getSizeStyle(), zIndex: 10000 }}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="modal-title">{title}</h5>
            {showCloseButton && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
                style={{
                  padding: '0.25rem 0.5rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
              >
                <i className="bx bx-x" style={{ fontSize: '1.5rem' }}></i>
              </button>
            )}
          </div>

          {onSubmit ? (
            <form onSubmit={onSubmit}>
              {modalContent}
            </form>
          ) : (
            modalContent
          )}
        </div>
      </div>
    </div>
  );
};

GlobalModal.propTypes = {
  show: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(["sm", "md", "lg", "xl", "xxl", "fullscreen"]),
  loading: PropTypes.bool,
  onSubmit: PropTypes.func,
  submitText: PropTypes.string,
  cancelText: PropTypes.string,
  showFooter: PropTypes.bool,
  footerContent: PropTypes.node,
  showCloseButton: PropTypes.bool,
  scrollable: PropTypes.bool,
  modalClassName: PropTypes.string,
  closeOnBackdropClick: PropTypes.bool,
  closeOnEscape: PropTypes.bool,
  fullWidth: PropTypes.bool,
  fullScreen: PropTypes.bool,
  customMaxWidth: PropTypes.string,
};

export default GlobalModal;
