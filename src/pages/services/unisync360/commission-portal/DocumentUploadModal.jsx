// DocumentUploadModal.jsx - Document Upload Modal for External Counselor
import React, { useState, useCallback } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, FormGroup, Label, Input, Spinner } from "reactstrap";
import { Formik, Field, ErrorMessage, Form } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import axiosInstance from "../../../../api.jsx";
import { commissionPortalService } from "./Queries.jsx";
import FormikSelect from "../../../../components/ui-templates/form-components/FormikSelect";

export const DocumentUploadModal = ({ show, onHide, onSuccess, student = null }) => {
    const [dragActive, setDragActive] = useState(false);
    const [fileError, setFileError] = useState(null);
    const [fileData, setFileData] = useState(null);

    const initialValues = {
        student_uid: student?.uid || "",
        document_type: "academic",
        requirement: "",
        document_name: "",
        notes: "",
        expiry_date: "",
    };

    const validationSchema = Yup.object().shape({
        student_uid: Yup.string().required("Please select a student"),
        document_type: Yup.string().required("Please select document type"),
        requirement: Yup.string().nullable(),
        document_name: Yup.string().nullable(),
        notes: Yup.string().nullable(),
        expiry_date: Yup.date().nullable().typeError("Please enter a valid date"),
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        handleFile(file);
    };

    const handleFile = (file) => {
        if (file) {
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                setFileError("File size must be less than 10MB");
                setFileData(null);
                return;
            }

            const allowedTypes = [
                'application/pdf',
                'image/jpeg',
                'image/png',
                'image/gif',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ];

            if (!allowedTypes.includes(file.type)) {
                setFileError("Invalid file type. Allowed: PDF, Images, Word documents");
                setFileData(null);
                return;
            }

            setFileData(file);
            setFileError(null);
        }
    };

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleSubmit = async (values, { setSubmitting, resetForm, setErrors }) => {
        if (!fileData) {
            setFileError("Please select a file to upload");
            setSubmitting(false);
            return;
        }

        try {
            const data = new FormData();
            data.append("file", fileData);
            data.append("document_type", values.document_type);
            
            if (values.requirement) {
                data.append("requirement", values.requirement);
            }
            if (values.document_name) {
                data.append("document_name", values.document_name);
            }
            if (values.notes) {
                data.append("notes", values.notes);
            }
            if (values.expiry_date) {
                data.append("expiry_date", values.expiry_date);
            }

            await axiosInstance.post(
                `unisync360-applications/students/${values.student_uid}/documents/`,
                data,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            resetForm();
            setFileData(null);
            setFileError(null);
            onSuccess && onSuccess();
            handleClose();
        } catch (error) {
            console.error("Upload error:", error);
            Swal.fire({
                icon: "error",
                title: "Upload Failed",
                text: error.response?.data?.detail || "Failed to upload document. Please try again.",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setFileData(null);
        setFileError(null);
        onHide();
    };

    return (
        <Modal isOpen={show} toggle={handleClose} size="lg" centered backdrop="static" keyboard={false}>
            <ModalHeader toggle={handleClose}>
                <i className="bx bx-upload me-2"></i>
                Upload Document
            </ModalHeader>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {(formikProps) => (
                    <Form onSubmit={formikProps.handleSubmit}>
                        <ModalBody>
                            {/* Student Selection */}
                            {!student && (
                                <FormikSelect
                                    name="student_uid"
                                    label="Select Student *"
                                    url="/unisync360-commission/my-students"
                                    containerClass="mb-3"
                                    filters={{ page: 1, page_size: 100 }}
                                    mapOption={(item) => ({ 
                                        value: item.student_details?.uid, 
                                        label: `${item.student_details?.full_name} (${item.student_details?.personal_email || item.student_details?.personal_phone})` 
                                    })}
                                    placeholder="Search students..."
                                    isRequired={true}
                                />
                            )}

                            {student && (
                                <div className="alert alert-info mb-3">
                                    <strong>Student:</strong> {student.full_name}
                                </div>
                            )}

                            <div className="row">
                                <div className="col-md-6">
                                    <FormGroup>
                                        <Label for="document_type">
                                            Document Type <span className="text-danger">*</span>
                                        </Label>
                                        <Field
                                            as="select"
                                            name="document_type"
                                            id="document_type"
                                            className="form-select"
                                        >
                                            <option value="academic">Academic</option>
                                            <option value="identity">Identity</option>
                                            <option value="financial">Financial</option>
                                            <option value="other">Other</option>
                                        </Field>
                                        <ErrorMessage name="document_type" component="div" className="text-danger" />
                                    </FormGroup>
                                </div>
                                <div className="col-md-6">
                                    <FormikSelect
                                        name="requirement"
                                        label="Document Requirement"
                                        url="/unisync360-applications/document-requirements"
                                        containerClass="mb-3"
                                        filters={{ page: 1, page_size: 50 }}
                                        mapOption={(item) => ({ value: item.uid, label: `${item.name}${item.is_required ? " (Required)" : ""}` })}
                                        placeholder="Select requirement (optional)"
                                    />
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <FormGroup>
                                        <Label for="document_name">Document Name</Label>
                                        <Field
                                            type="text"
                                            name="document_name"
                                            id="document_name"
                                            className="form-control"
                                            placeholder="e.g., Passport, Transcript"
                                        />
                                        <ErrorMessage name="document_name" component="div" className="text-danger" />
                                    </FormGroup>
                                </div>
                                <div className="col-md-6">
                                    <FormGroup>
                                        <Label for="expiry_date">Expiry Date (Optional)</Label>
                                        <Field
                                            type="date"
                                            name="expiry_date"
                                            id="expiry_date"
                                            className="form-control"
                                        />
                                        <ErrorMessage name="expiry_date" component="div" className="text-danger" />
                                    </FormGroup>
                                </div>
                            </div>

                            <FormGroup>
                                <Label for="notes">Notes</Label>
                                <Field
                                    as="textarea"
                                    name="notes"
                                    id="notes"
                                    className="form-control"
                                    rows="2"
                                    placeholder="Any additional notes about this document..."
                                />
                            </FormGroup>

                            {/* File Upload Area */}
                            <FormGroup>
                                <Label>
                                    Upload File <span className="text-danger">*</span>
                                </Label>
                                <div
                                    className={`border rounded p-4 text-center ${dragActive ? 'border-primary bg-light' : 'border-dashed'}`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    style={{ 
                                        borderStyle: 'dashed',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onClick={() => document.getElementById('file-input').click()}
                                >
                                    <input
                                        type="file"
                                        id="file-input"
                                        style={{ display: 'none' }}
                                        onChange={handleFileChange}
                                        accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
                                    />
                                    
                                    {fileData ? (
                                        <div>
                                            <i className="bx bx-check-circle text-success" style={{ fontSize: "3rem" }}></i>
                                            <p className="mb-1 mt-2">
                                                <strong>{fileData.name}</strong>
                                            </p>
                                            <small className="text-muted">
                                                {(fileData.size / 1024 / 1024).toFixed(2)} MB
                                            </small>
                                            <br />
                                            <Button 
                                                color="link" 
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFileData(null);
                                                }}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ) : (
                                        <div>
                                            <i className="bx bx-cloud-upload text-primary" style={{ fontSize: "3rem" }}></i>
                                            <p className="mb-1 mt-2">
                                                <strong>Drag and drop file here</strong>
                                            </p>
                                            <p className="text-muted mb-0">or click to browse</p>
                                            <small className="text-muted">
                                                Supported: PDF, Images, Word documents (max 10MB)
                                            </small>
                                        </div>
                                    )}
                                </div>
                                {fileError && (
                                    <div className="text-danger small mt-1">{fileError}</div>
                                )}
                            </FormGroup>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="secondary" onClick={handleClose} disabled={formikProps.isSubmitting}>
                                Cancel
                            </Button>
                            <Button color="primary" type="submit" disabled={formikProps.isSubmitting}>
                                {formikProps.isSubmitting ? (
                                    <>
                                        <Spinner size="sm" className="me-2" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <i className="bx bx-upload me-2"></i>
                                        Upload Document
                                    </>
                                )}
                            </Button>
                        </ModalFooter>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};

export default DocumentUploadModal;
