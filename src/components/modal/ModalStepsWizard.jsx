import React, { useState, useCallback, useEffect, useRef } from "react";
import { Formik, Form } from "formik";
import FormWizard from "react-form-wizard-component";
import "react-form-wizard-component/dist/style.css";
import "../../assets/css/themify-icons.css";
import "../../css/global-modal.css";
import GlobalModal from "./GlobalModal";

export const ModalStepsWizard = ({
  show = false,
  modalTitle,
  initialValues,
  validationSchema,
  onSubmit,
  tabs,
  selectedObj,
  onClose,
  onSuccess,

  size = "xl",
  enableReinitialize = true,
  shape = "circle",
  color = "#696cff",
  stepSize = "xs",
  showNonFieldErrors = true,

  headerIcon = null,
  customFooter = null,
  customStyles = "",
}) => {
  const [errors, setOtherError] = useState({});
  const [tabsError, setTabsError] = useState([]);
  const [isValidTab, setIsValidTab] = useState([]);
  const [isFirstTabChange, setIsFirstTabChange] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);
  const [isTabChanging, setIsTabChanging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formikRef = useRef(null);

  useEffect(() => {
    const tabCount = tabs?.length || 0;
    setTabsError(Array(tabCount).fill(false));
    setIsValidTab(Array(tabCount).fill(false));
    setTabIndex(0);
    setIsFirstTabChange(true);
    setOtherError({});
  }, [selectedObj, tabs?.length]);

  useEffect(() => {
    if (!show) {
      setTabIndex(0);
      setIsFirstTabChange(true);
      setOtherError({});
      setIsTabChanging(false);
    }
  }, [show]);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        const selectors = [
          '.wizard-btn-back',
          '.wizard-btn-next', 
          '.wizard-btn-finish',
          '.wizard-button-back',
          '.wizard-button-next',
          '.wizard-button-finish',
          '.wizard-footer button',
          '.wizard-card-footer button',
          '.wizard-buttons button',
          '.shapla-wizard-card .wizard-footer button',
          '[class*="wizard"] button',
          'div.wizard button'
        ];
        
        selectors.forEach(selector => {
          document.querySelectorAll(selector).forEach(el => {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
          });
        });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [show, tabIndex]);

  const handleSubmit = async (values, { setSubmitting, resetForm, setErrors }) => {
    try {
      setIsSubmitting(true);
      setSubmitting(true);

      const result = await onSubmit(values, { setSubmitting, resetForm, setErrors });

      if (result?.status === 200 || result?.status === 8000 || result?.success) {
        handleClose();
        resetForm();
        if (onSuccess) {
          onSuccess();
        }
      } else if (result?.status === 8002) {
        setErrors(result.data);
        setOtherError(result.data);
      }

      return result;
    } catch (error) {
      console.error("Form submission error:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsFirstTabChange(true);
    if (onClose) {
      onClose();
    }
  };

  const validateTab = useCallback(async (values, setFieldError, setFieldTouched, currentTabIndex) => {
    try {
      const currentTab = tabs?.[currentTabIndex];
      let isValid = true;

      if (currentTab?.validateFields) {
        for (const field of currentTab.validateFields) {
          try {
            await validationSchema.validateAt(field, values);
          } catch (err) {
            isValid = false;
            if (err.path && err.message) {
              setFieldTouched(err.path, true, false);
              setFieldError(err.path, err.message);
            }
          }
        }
      }
      return isValid;
    } catch (err) {
      console.error("Tab validation error:", err);
      return false;
    }
  }, [tabs, validationSchema]);

  const tabChanged = useCallback(async ({ handleNext }) => {
    const currentFormik = formikRef.current;
    if (!currentFormik || isTabChanging) return;

    const { values, setSubmitting, resetForm, setErrors, setFieldError, setFieldTouched, setTouched } = currentFormik;
    const currentTabIndex = tabIndex;
    const isLastTab = currentTabIndex === tabs.length - 1;

    if (isFirstTabChange) {
      setIsFirstTabChange(false);
    }

    setIsTabChanging(true);
    const isValid = await validateTab(values, setFieldError, setFieldTouched, currentTabIndex);

    setTimeout(() => {
      if (isValid) {
        setIsValidTab((prev) => {
          const updated = [...prev];
          updated[currentTabIndex] = true;
          return updated;
        });
        setTabsError((prev) => {
          const updated = [...prev];
          updated[currentTabIndex] = false;
          return updated;
        });

        if (isLastTab) {
          handleSubmit(values, { setSubmitting, resetForm, setErrors, setTouched });
        } else {
          handleNext();
        }
      } else {
        setIsValidTab((prev) => {
          const updated = [...prev];
          updated[currentTabIndex] = false;
          return updated;
        });
        setTabsError((prev) => {
          const updated = [...prev];
          updated[currentTabIndex] = true;
          return updated;
        });
      }
      setIsTabChanging(false);
    }, 0);

    return isValid;
  }, [isFirstTabChange, validateTab, tabIndex, tabs, isTabChanging]);

  if (!show) return null;

  return (
    <GlobalModal
      show={show}
      onClose={handleClose}
      title={
        <span>
          {headerIcon && <i className={`${headerIcon} me-2`}></i>}
          {modalTitle}
        </span>
      }
      size={size}
      showFooter={true}
      footerContent={
        <div className="d-flex justify-content-between align-items-center w-100">
          {tabIndex > 0 ? (
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              style={{ width: "100px" }}
              onClick={() => {
                const prevBtn = document.querySelector('.wizard-btn-back');
                if (prevBtn) prevBtn.click();
              }}
            >
              <i className="bx bx-left-arrow-alt me-1"></i> Back
            </button>
          ) : (
            <div style={{ width: "100px" }}></div>
          )}
          
          <button
            type="button"
            className="btn btn-sm btn-primary"
            style={{ width: tabIndex === tabs.length - 1 ? "150px" : "100px" }}
            disabled={isSubmitting}
            onClick={async () => await tabChanged({ handleNext: () => {} })}
          >
            {isSubmitting ? (
              <>
                <i className="bx bx-loader-alt bx-spin"></i> Saving...
              </>
            ) : tabIndex === tabs.length - 1 ? (
              <>
                <i className="bx bx-save me-1"></i> {selectedObj ? "Update" : "Save"}
              </>
            ) : (
              <>
                Next <i className="bx bx-right-arrow-alt ms-1"></i>
              </>
            )}
          </button>
        </div>
      }
      closeOnBackdropClick={false}
      closeOnEscape={false}
      scrollable={true}
    >
      <style>{`
        .form-label { text-align: left !important; }
        ${customStyles}
      `}</style>

      <Formik
        enableReinitialize={enableReinitialize}
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {(formikProps) => {
          formikRef.current = formikProps;
          return (
            <Form>
              <FormWizard
                shape={shape}
                color={color}
                stepSize={stepSize}
                onTabChange={({ prevIndex, nextIndex }) => {
                  setTimeout(() => setTabIndex(nextIndex), 0);
                }}
                backButtonTemplate={() => <span style={{ display: 'none' }}></span>}
                nextButtonTemplate={() => <span style={{ display: 'none' }}></span>}
                finishButtonTemplate={() => <span style={{ display: 'none' }}></span>}
              >
                {tabs?.map((tab, index) => (
                  <FormWizard.TabContent
                    key={tab.key || index}
                    title={tab.title}
                    icon={tab.icon}
                    isValid={true}
                    showErrorOnTab={tabsError[index]}
                  >
                    <div className="p-3">
                      {tab.content}
                    </div>
                  </FormWizard.TabContent>
                ))}
              </FormWizard>
            </Form>
          );
        }}
      </Formik>

      {showNonFieldErrors && errors.non_field_errors && errors.non_field_errors.length > 0 && (
        <div className="alert alert-danger mx-3">
          {errors.non_field_errors.map((error, index) => (
            <div key={index}>{error}</div>
          ))}
        </div>
      )}
    </GlobalModal>
  );
};

export default ModalStepsWizard;
