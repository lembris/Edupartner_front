import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom/client";
import PropTypes from "prop-types";

/**
 * GlobalModal - A reusable modal component with extensive customization options
 * 
 * Props:
 * - modalId (string, required): Unique identifier for the modal
 * - modalTitle (string, required): Title displayed in modal header
 * - modalSize (string, optional): Bootstrap modal size (modal-sm, modal-md, modal-lg, modal-xl, modal-fullscreen, etc.)
 * - show (boolean, optional): Controls modal visibility
 * - onShowChange (function, optional): Callback when show state changes
 * - backdrop (boolean|string, optional): Modal backdrop behavior (true, false, 'static')
 * - keyboard (boolean, optional): Enable keyboard escape to close
 * - centered (boolean, optional): Vertically center the modal
 * - scrollable (boolean, optional): Enable scrolling for long content
 * - fade (boolean, optional): Enable fade animation
 * - unmountOnClose (boolean, optional): Unmount children when modal is closed
 * - children (ReactNode, required): Content to display in modal body
 * - header (ReactNode, optional): Custom header content (replaces default title)
 * - footer (ReactNode, optional): Custom footer content
 * - headerClassName (string, optional): Additional classes for modal header
 * - bodyClassName (string, optional): Additional classes for modal body
 * - footerClassName (string, optional): Additional classes for modal footer
 * - contentClassName (string, optional): Additional classes for modal content
 * - dialogClassName (string, optional): Additional classes for modal dialog
 * - onSubmit (function, optional): Form submit handler
 * - onCancel (function, optional): Cancel/close handler
 * - onOk (function, optional): OK/confirm handler
 * - confirmLoading (boolean, optional): Show loading state on confirm button
 * - okText (string, optional): Text for confirm button (default: 'OK')
 * - cancelText (string, optional): Text for cancel button (default: 'Cancel')
 * - showOk (boolean, optional): Show confirm button (default: true)
 * - showCancel (boolean, optional): Show cancel button (default: true)
 * - closable (boolean, optional): Show close button in header (default: true)
 * - closeIcon (ReactNode, optional): Custom close icon
 * - maskClosable (boolean, optional): Allow clicking on backdrop to close (default: true)
 * - destroyOnClose (boolean, optional): Destroy modal on close (default: false)
 * - style (object, optional): Inline styles for modal
 * - wrapClassName (string, optional): Additional classes for modal wrapper
 * - zIndex (number, optional): Modal z-index
 * - getContainer (string|HTMLElement|function, optional): Container to render modal into
 * - footerAlign (string, optional): Footer button alignment ('left', 'right', 'center', default: 'right')
 * - buttonLayout (string, optional): Button layout ('vertical', 'horizontal', default: 'horizontal')
 * - title (string, optional): Alternative to modalTitle for backward compatibility
 * - visible (boolean, optional): Alias for show prop
 * - afterOpen (function, optional): Callback after modal opens
 * - afterClose (function, optional): Callback after modal closes
 * - forceRender (boolean, optional): Force render children even when hidden
 * - modalRender (function, optional): Custom modal render function
 * - dialogRender (function, optional): Custom dialog render function
 * - trapFocus (boolean, optional): Trap focus inside modal (default: true)
 * - returnFocus (boolean, optional): Return focus to trigger after close (default: true)
 * - preventScroll (boolean, optional): Prevent scrolling when modal is open (default: true)
 * - keyboard (boolean, optional): Enable ESC to close (default: true)
 * - mousePosition (object, optional): Mouse position for zoom animation
 */

const GlobalModal = ({
  // Required props
  modalId,
  modalTitle,
  children,
  
  // Size and positioning
  modalSize = "",
  centered = false,
  scrollable = false,
  
  // Visibility control
  show = false,
  visible, // Alias for show
  
  // Backdrop and keyboard
  backdrop = true,
  keyboard = true,
  
  // Animation
  fade = true,
  
  // Lifecycle
  unmountOnClose = false,
  destroyOnClose = false,
  forceRender = false,
  
  // Events
  onShowChange,
  onOk,
  onCancel,
  afterOpen,
  afterClose,
  
  // Footer
  showOk = true,
  showCancel = true,
  okText = "OK",
  cancelText = "Cancel",
  confirmLoading = false,
  footerAlign = "right",
  buttonLayout = "horizontal",
  
  // Header
  closable = true,
  closeIcon,
  header,
  
  // Custom content
  footer,
  
  // Styling
  headerClassName = "",
  bodyClassName = "",
  footerClassName = "",
  contentClassName = "",
  dialogClassName = "",
  wrapClassName = "",
  style = {},
  
  // Advanced
  getContainer = document.body,
  zIndex = 1050,
  maskClosable = true,
  trapFocus = true,
  returnFocus = true,
  preventScroll = true,
  mousePosition,
  
  // Render props
  modalRender,
  dialogRender,
  
  // Legacy/compatibility
  title, // Alternative to modalTitle
}) => {
  // Use visible prop if provided, otherwise use show
  const isVisible = visible !== undefined ? visible : show;
  
  // Ref for modal element
  const modalRef = useRef(null);
  
  // State for animation
  const [animated, setAnimated] = useState(false);
  
  // Handle modal open
  const handleShow = useCallback(() => {
    setAnimated(true);
    if (afterOpen) afterOpen();
    if (onShowChange) onShowChange(true);
  }, [afterOpen, onShowChange]);
  
  // Handle modal close
  const handleHide = useCallback(() => {
    setAnimated(false);
    if (afterClose) afterClose();
    if (onShowChange) onShowChange(false);
    
    // Call cancel handler if provided
    if (onCancel) onCancel();
  }, [afterClose, onCancel, onShowChange]);
  
  // Handle OK button click
  const handleOk = useCallback(() => {
    if (onOk) {
      const result = onOk();
      // If promise returned and resolves, close modal
      if (result && typeof result.then === 'function') {
        result.then(() => handleHide());
      } else {
        handleHide();
      }
    } else {
      handleHide();
    }
  }, [onOk, handleHide]);
  
  // Handle backdrop click
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget && maskClosable) {
      handleHide();
    }
  }, [maskClosable, handleHide]);
  
  // Handle escape key
  const handleEscapeKeyDown = useCallback((e) => {
    if (keyboard && e.key === 'Escape') {
      e.stopPropagation();
      handleHide();
    }
  }, [keyboard, handleHide]);
  
  // Handle modal render
  const getModalContent = useCallback((props) => {
    if (modalRender) {
      return modalRender(props);
    }
    
    // Default modal content
    return (
      <div
        ref={modalRef}
        {...props}
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        style={{
          display: props.style?.display || 'none',
          ...style,
          zIndex: zIndex,
        }}
        className={`${fade ? 'fade' : ''} ${animated ? 'show' : ''} ${wrapClassName}`}
      >
        <div
          className={`modal-dialog${centered ? ' modal-dialog-centered' : ''}${scrollable ? ' modal-dialog-scrollable' : ''}${modalSize ? ` ${modalSize}` : ''} ${dialogClassName}`}
          role="document"
          content=""
        >
          <div className={`modal-content ${contentClassName}`}>
            {/* Header */}
            {(closable || header) && (
              <div className={`modal-header ${headerClassName}`}>
                {!header && (
                  <h5 className="modal-title">
                    {title || modalTitle}
                  </h5>
                )}
                {header}
                {closable && (
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleHide}
                    aria-label="Close"
                  >
                    {closeIcon || (
                      <span aria-hidden="true">&times;</span>
                    )}
                  </button>
                )}
              </div>
            )}
            
            {/* Body */}
            <div className={`modal-body ${bodyClassName}`}>
              {forceRender || isVisible ? children : null}
            </div>
            
            {/* Footer */}
            {footer || (showOk || showCancel) && (
              <div className={`modal-footer ${footerClassName} d-flex justify-content-${footerAlign}`}>
                {buttonLayout === 'vertical' ? (
                  <div className="d-flex flex-column">
                    {showCancel && (
                      <button
                        type="button"
                        className="btn btn-secondary mb-2 me-2"
                        onClick={handleHide}
                      >
                        {cancelText}
                      </button>
                    )}
                    {showOk && (
                      <button
                        type="button"
                        className="btn btn-primary mb-2"
                        disabled={confirmLoading}
                        onClick={handleOk}
                      >
                        {confirmLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                            Saving...
                          </>
                        ) : okText}
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    {showCancel && (
                      <button
                        type="button"
                        className="btn btn-secondary me-2"
                        onClick={handleHide}
                      >
                        {cancelText}
                      </button>
                    )}
                    {showOk && (
                      <button
                        type="button"
                        className="btn btn-primary"
                        disabled={confirmLoading}
                        onClick={handleOk}
                      >
                        {confirmLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                            Saving...
                          </>
                        ) : okText}
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }, [
    modalRef,
    modalRender,
    closable,
    header,
    title,
    modalTitle,
    closeIcon,
    handleHide,
    children,
    isVisible,
    forceRender,
    footer,
    showOk,
    showCancel,
    okText,
    cancelText,
    confirmLoading,
    handleOk,
    footerClassName,
    footerAlign,
    buttonLayout,
    headerClassName,
    bodyClassName,
    contentClassName,
    dialogClassName,
    wrapClassName,
    centered,
    scrollable,
    modalSize,
    fade,
    animated,
    style,
    zIndex,
    keyboard,
    maskClosable
  ]);
  
  // Render portal or direct
  if (typeof getContainer === 'function') {
    const container = getContainer();
    return container ? ReactDOM.createPortal(getModalContent({ style: { display: isVisible ? 'block' : 'none' } }), container) : null;
  } else if (getContainer instanceof HTMLElement) {
    return ReactDOM.createPortal(getModalContent({ style: { display: isVisible ? 'block' : 'none' } }), getContainer);
  } else {
    // Default to appending to body
    return ReactDOM.createPortal(getModalContent({ style: { display: isVisible ? 'block' : 'none' } }), document.body);
  }
};

// PropTypes
GlobalModal.propTypes = {
  // Required props
  modalId: PropTypes.string.isRequired,
  modalTitle: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  
  // Size and positioning
  modalSize: PropTypes.string,
  centered: PropTypes.bool,
  scrollable: PropTypes.bool,
  
  // Visibility control
  show: PropTypes.bool,
  visible: PropTypes.bool,
  
  // Backdrop and keyboard
  backdrop: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf(['static'])]),
  keyboard: PropTypes.bool,
  
  // Animation
  fade: PropTypes.bool,
  
  // Lifecycle
  unmountOnClose: PropTypes.bool,
  destroyOnClose: PropTypes.bool,
  forceRender: PropTypes.bool,
  
  // Events
  onShowChange: PropTypes.func,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
  afterOpen: PropTypes.func,
  afterClose: PropTypes.func,
  
  // Footer
  showOk: PropTypes.bool,
  showCancel: PropTypes.bool,
  okText: PropTypes.string,
  cancelText: PropTypes.string,
  confirmLoading: PropTypes.bool,
  footerAlign: PropTypes.oneOf(['left', 'right', 'center']),
  buttonLayout: PropTypes.oneOf(['vertical', 'horizontal']),
  
  // Header
  closable: PropTypes.bool,
  closeIcon: PropTypes.node,
  header: PropTypes.node,
  
  // Custom content
  footer: PropTypes.node,
  
  // Styling
  headerClassName: PropTypes.string,
  bodyClassName: PropTypes.string,
  footerClassName: PropTypes.string,
  contentClassName: PropTypes.string,
  dialogClassName: PropTypes.string,
  wrapClassName: PropTypes.string,
  style: PropTypes.object,
  
  // Advanced
  getContainer: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(HTMLElement), PropTypes.func]),
  zIndex: PropTypes.number,
  maskClosable: PropTypes.bool,
  trapFocus: PropTypes.bool,
  returnFocus: PropTypes.bool,
  preventScroll: PropTypes.bool,
  mousePosition: PropTypes.object,
  
  // Render props
  modalRender: PropTypes.func,
  dialogRender: PropTypes.func,
  
  // Legacy/compatibility
  title: PropTypes.string,
};

// Default props
GlobalModal.defaultProps = {
  modalSize: "",
  centered: false,
  scrollable: false,
  show: false,
  visible: undefined,
  backdrop: true,
  keyboard: true,
  fade: true,
  unmountOnClose: false,
  destroyOnClose: false,
  forceRender: false,
  onShowChange: undefined,
  onOk: undefined,
  onCancel: undefined,
  afterOpen: undefined,
  afterClose: undefined,
  showOk: true,
  showCancel: true,
  okText: "OK",
  cancelText: "Cancel",
  confirmLoading: false,
  footerAlign: "right",
  buttonLayout: "horizontal",
  closable: true,
  closeIcon: undefined,
  header: undefined,
  footer: undefined,
  headerClassName: "",
  bodyClassName: "",
  footerClassName: "",
  contentClassName: "",
  dialogClassName: "",
  wrapClassName: "",
  style: {},
  getContainer: document.body,
  zIndex: 1050,
  maskClosable: true,
  trapFocus: true,
  returnFocus: true,
  preventScroll: true,
  mousePosition: undefined,
  modalRender: undefined,
  dialogRender: undefined,
  title: undefined,
};

export default GlobalModal;