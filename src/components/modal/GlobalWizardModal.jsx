import React, { useState, useCallback, useEffect, useRef } from "react";
import { Formik, Form } from "formik";
import FormWizard from "react-form-wizard-component";
import "react-form-wizard-component/dist/style.css";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

export const GlobalWizardModal = ({
  show = false,
  onClose,
  modalTitle,
  initialValues,
  validationSchema,
  onSubmit,
  tabs,
  selectedObj,
  onSuccess,
  headerIcon = null,
  size = "xl",
}) => {
  const [errors, setOtherError] = useState({});
  const [tabsError, setTabsError] = useState([]);
  const [isValidTab, setIsValidTab] = useState([]);
  const [isFirstTabChange, setIsFirstTabChange] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);
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
    }
  }, [show]);

  const getModalSize = () => {
    switch (size) {
      case "xxl":
        return "xxl";
      case "xl":
        return "xl";
      case "lg":
        return "lg";
      case "md":
        return "md";
      case "sm":
        return "sm";
      default:
        return "xl";
    }
  };

  const handleSubmit = useCallback(async (values, { setSubmitting, resetForm, setErrors }) => {
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
  }, [onSubmit, onSuccess]);

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

  const tabChanged = useCallback(async ({ handleNext }, values, setSubmitting, resetForm, setErrors, setFieldError, setFieldTouched) => {
    const currentTabIndex = tabIndex;
    const isLastTab = currentTabIndex === tabs.length - 1;

    if (isFirstTabChange) {
      setIsFirstTabChange(false);
    }

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
          handleSubmit(values, { setSubmitting, resetForm, setErrors });
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
  }, [isFirstTabChange, validateTab, tabIndex, tabs, handleSubmit]);

  return (
    <Modal
      isOpen={show}
      toggle={handleClose}
      size={getModalSize()}
      centered
      backdrop="static"
      keyboard={false}
      style={{ zIndex: 9999 }}
    >
      <ModalHeader toggle={handleClose}>
        {headerIcon && <i className={`${headerIcon} me-2`}></i>}
        {modalTitle}
      </ModalHeader>

      <ModalBody>
        <Formik
          enableReinitialize={true}
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({
            isSubmitting: formikSubmitting,
            setSubmitting,
            values,
            resetForm,
            setErrors,
            setFieldError,
            setFieldTouched,
          }) => {
            formikRef.current = { values, setSubmitting, resetForm, setErrors, setFieldError, setFieldTouched };
            return (
              <Form>
                <FormWizard
                  shape="circle"
                  color="#696cff"
                  stepSize="xs"
                  onTabChange={({ prevIndex, nextIndex }) => {
                    setTimeout(() => setTabIndex(nextIndex), 0);
                  }}
                  backButtonTemplate={(handlePrevious) => (
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      style={{ width: "100px" }}
                      onClick={handlePrevious}
                    >
                      <i className="bx bx-left-arrow-alt me-1"></i> Back
                    </button>
                  )}
                  nextButtonTemplate={(handleNext) => (
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      style={{ width: "100px", marginLeft: "auto" }}
                      onClick={async () =>
                        await tabChanged(
                          { handleNext },
                          values,
                          setSubmitting,
                          resetForm,
                          setErrors,
                          setFieldError,
                          setFieldTouched
                        )
                      }
                    >
                      Next <i className="bx bx-right-arrow-alt ms-1"></i>
                    </button>
                  )}
                  finishButtonTemplate={(handleNext) => (
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      style={{ width: "150px", marginLeft: "auto" }}
                      disabled={isSubmitting}
                      onClick={async () =>
                        await tabChanged(
                          { handleNext },
                          values,
                          setSubmitting,
                          resetForm,
                          setErrors,
                          setFieldError,
                          setFieldTouched
                        )
                      }
                    >
                      {isSubmitting ? (
                        <>
                          <i className="bx bx-loader-alt bx-spin me-1"></i> Saving...
                        </>
                      ) : (
                        <>
                          <i className="bx bx-save me-1"></i> {selectedObj ? "Update" : "Save"}
                        </>
                      )}
                    </button>
                  )}
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

                {errors.non_field_errors && errors.non_field_errors.length > 0 && (
                  <div className="alert alert-danger mx-3 mt-3">
                    {errors.non_field_errors.map((error, index) => (
                      <div key={index}>{error}</div>
                    ))}
                  </div>
                )}
              </Form>
            );
          }}
        </Formik>
      </ModalBody>

      <style>{`
        .form-control, .form-select {
          height: 36px;
          padding: 0.375rem 0.75rem;
          font-size: 1rem;
        }
        textarea.form-control {
          height: auto;
        }
        .wizard-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          width: 100%;
        }
      `}</style>
    </Modal>
  );
};

export default GlobalWizardModal;
