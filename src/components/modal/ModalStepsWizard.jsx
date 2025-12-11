import React, { useState, useCallback, useEffect, useRef } from "react";
import { Formik, Form } from "formik";
import FormWizard from "react-form-wizard-component";
import "react-form-wizard-component/dist/style.css";

export const ModalStepsWizard = ({
  // Required props
  modalId,
  modalTitle,
  initialValues,
  validationSchema,
  onSubmit,
  tabs,
  selectedObj,

  // Optional props with defaults
  modalSize = "modal-xl",
  enableReinitialize = true,
  shape = "circle",
  color = "#696cff",
  stepSize = "xs",
  showNonFieldErrors = true,

  // Context and state management
  context = null,
  setSelectedObj = null,
  tableRefresh = null,
  setTableRefresh = null,

  // Custom components
  headerIcon = null,
  customFooter = null,

  // Styles
  customStyles = "",
}) => {
  const [errors, setOtherError] = useState({});
  const [tabsError, setTabsError] = useState([]);
  const [isValidTab, setIsValidTab] = useState([]);
  const [isFirstTabChange, setIsFirstTabChange] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formikRef = useRef(null);

  // Initialize tab states based on number of tabs
  useEffect(() => {
    const tabCount = tabs?.length || 0;
    setTabsError(Array(tabCount).fill(false));
    setIsValidTab(Array(tabCount).fill(false));
    setTabIndex(0);
    setIsFirstTabChange(true);
    setOtherError({});
  }, [selectedObj, tabs?.length]);

  const handleSubmit = async (values, { setSubmitting, resetForm, setErrors }) => {
    try {
      setIsSubmitting(true);
      setSubmitting(true);

      const result = await onSubmit(values, { setSubmitting, resetForm, setErrors });

      if (result?.status === 200 || result?.status === 8000 || result?.success) {
        handleClose();
        resetForm();
        if (setTableRefresh) {
          setTableRefresh(prev => prev + 1);
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
    if (setSelectedObj) {
      setSelectedObj(null);
    }
    setIsFirstTabChange(true);
    const modalElement = document.getElementById(modalId);
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) modalInstance.hide();
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

  const tabChanged = useCallback(async (
    { handleNext }
  ) => {
    const currentFormik = formikRef.current;
    if (!currentFormik) return;

    const { values, setSubmitting, resetForm, setErrors, setFieldError, setFieldTouched, setTouched } = currentFormik;
    const currentTabIndex = tabIndex;
    const isLastTab = currentTabIndex === tabs.length - 1;

    if (isFirstTabChange) {
      setIsFirstTabChange(false);
    }

    // console.log("Validating tab", currentTabIndex, "Values:", values);
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
    }, 0);

    return isValid;
  }, [isFirstTabChange, validateTab, tabIndex, tabs]); // Added tabIndex, tabs to deps

  const renderBackButton = (handlePrevious) => (
    <button
      type="button"
      className="btn btn-sm btn-primary"
      style={{ width: "100px" }}
      onClick={handlePrevious}
    >
      <i className="bx bx-left-arrow-alt"></i> Back
    </button>
  );

  const renderNextButton = (handleNext) => {
    const isLastTab = tabIndex === tabs.length - 1;

    return (
      <button
        type="button"
        className="btn btn-sm btn-primary"
        style={{ width: isLastTab ? "150px" : "100px", marginLeft: "auto" }}
        disabled={isSubmitting}
        onClick={async () =>
          await tabChanged(
            { handleNext }
          )
        }
      >
        {isSubmitting ? (
          <>
            <i className="bx bx-loader-alt bx-spin"></i> Saving...
          </>
        ) : isLastTab ? (
          <>
            <i className="bx bx-save"></i> {selectedObj ? "Update" : "Save"}
          </>
        ) : (
          <>
            Next <i className="bx bx-right-arrow-alt"></i>
          </>
        )}
      </button>
    );
  };

  return (
    <div
      className="modal modal-slide-in"
      id={modalId}
      tabIndex="-1"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
    >
      <div className={`modal-dialog ${modalSize}`} role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {headerIcon && <i className={`${headerIcon} me-2`}></i>}
              {modalTitle}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>

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
                    backButtonTemplate={(handlePrevious) => renderBackButton(handlePrevious)}
                    nextButtonTemplate={(handleNext) =>
                      renderNextButton(handleNext)
                    }
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

                  {showNonFieldErrors && errors.non_field_errors && errors.non_field_errors.length > 0 && (
                    <div className="alert alert-danger mx-3">
                      {errors.non_field_errors.map((error, index) => (
                        <div key={index}>{error}</div>
                      ))}
                    </div>
                  )}

                  {customFooter && customFooter(formikProps, handleClose)}

                  <style>{`
                  @import url("https://cdn.jsdelivr.net/gh/lykmapipo/themify-icons@0.1.2/css/themify-icons.css");
                  .form-control, .form-select {
                    height: 36px;
                    padding: 0.375rem 0.75rem;
                    font-size: 1rem;
                  }
                  .wizard-card-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 2rem 2.5rem;
                    width: 100%;
                  }
                  ${customStyles}
                `}</style>
                </Form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default ModalStepsWizard;