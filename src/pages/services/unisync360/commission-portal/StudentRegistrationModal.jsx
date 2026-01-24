// StudentRegistrationModal.jsx - Minimal Student Registration for Recruiters
import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input, Row, Col, Spinner } from "reactstrap";
import { Formik, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { commissionPortalService } from "./Queries.jsx";
import axiosInstance from "../../../../api.jsx";
import FormikSelect from "../../../../components/ui-templates/form-components/FormikSelect";

export const StudentRegistrationModal = ({ show, onHide, onSuccess }) => {
    const [loading, setLoading] = useState(false);

    const initialValues = {
        first_name: "",
        last_name: "",
        personal_phone: "",
        personal_email: "",
        nationality: "",
        date_of_birth: "",
        gender: "",
        address: "",
        source: "",
        status: "",
    };

    const validationSchema = Yup.object().shape({
        first_name: Yup.string().required("First name is required"),
        last_name: Yup.string().required("Last name is required"),
        personal_phone: Yup.string().required("Phone number is required"),
        personal_email: Yup.string().email("Invalid email").nullable(),
        nationality: Yup.string().required("Nationality is required"),
        date_of_birth: Yup.date().required("Date of birth is required").typeError("Please enter a valid date"),
        gender: Yup.string().required("Gender is required"),
        address: Yup.string().nullable(),
        source: Yup.string().nullable(),
        status: Yup.string().nullable(),
    });

    const handleSubmit = async (values, { setSubmitting, resetForm, setErrors }) => {
        try {
            setLoading(true);
            const submitData = { ...values };

            // Remove empty optional fields
            if (!submitData.personal_email) delete submitData.personal_email;
            if (!submitData.address) delete submitData.address;
            if (!submitData.source) delete submitData.source;
            if (!submitData.status) delete submitData.status;

            // Validate age (must be at least 16)
            const dob = new Date(values.date_of_birth);
            const today = new Date();
            const age = today.getFullYear() - dob.getFullYear();
            if (age < 16) {
                setErrors({ date_of_birth: "Student must be at least 16 years old" });
                setLoading(false);
                setSubmitting(false);
                return;
            }

            await commissionPortalService.registerStudent(submitData);

            resetForm();
            if (onSuccess) onSuccess();
            handleClose();
        } catch (error) {
            console.error("Error registering student:", error);
            const errorMessage = error.response?.data?.message || "Failed to register student";
            Swal.fire({
                icon: "error",
                title: "Registration Failed",
                text: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        onHide();
    };

    return (
        <Modal isOpen={show} toggle={handleClose} size="lg" centered backdrop="static" keyboard={false}>
            <ModalHeader toggle={handleClose}>
                <i className="bx bx-user-plus me-2"></i>
                Register New Student
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
                            <div className="alert alert-info mb-4">
                                <i className="bx bx-info-circle me-2"></i>
                                Quick registration with minimal required information. Additional details can be added later.
                            </div>

                            <Row>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label for="first_name">
                                            First Name <span className="text-danger">*</span>
                                        </Label>
                                        <Field
                                            type="text"
                                            name="first_name"
                                            id="first_name"
                                            className="form-control"
                                            placeholder="Enter first name"
                                        />
                                        <ErrorMessage name="first_name" component="div" className="text-danger" />
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label for="last_name">
                                            Last Name <span className="text-danger">*</span>
                                        </Label>
                                        <Field
                                            type="text"
                                            name="last_name"
                                            id="last_name"
                                            className="form-control"
                                            placeholder="Enter last name"
                                        />
                                        <ErrorMessage name="last_name" component="div" className="text-danger" />
                                    </FormGroup>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label for="personal_phone">
                                            Phone Number <span className="text-danger">*</span>
                                        </Label>
                                        <Field
                                            type="text"
                                            name="personal_phone"
                                            id="personal_phone"
                                            className="form-control"
                                            placeholder="+255 XXX XXX XXX"
                                        />
                                        <ErrorMessage name="personal_phone" component="div" className="text-danger" />
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label for="personal_email">Email (Optional)</Label>
                                        <Field
                                            type="email"
                                            name="personal_email"
                                            id="personal_email"
                                            className="form-control"
                                            placeholder="email@example.com"
                                        />
                                        <ErrorMessage name="personal_email" component="div" className="text-danger" />
                                    </FormGroup>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <FormikSelect
                                        name="nationality"
                                        label="Nationality *"
                                        url="/countries/"
                                        containerClass="mb-3"
                                        filters={{ page: 1, page_size: 10, paginated: true }}
                                        mapOption={(item) => ({ value: item.uid, label: item.name })}
                                        placeholder="Select Nationality"
                                        isRequired={true}
                                    />
                                </Col>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label for="date_of_birth">
                                            Date of Birth <span className="text-danger">*</span>
                                        </Label>
                                        <Field
                                            type="date"
                                            name="date_of_birth"
                                            id="date_of_birth"
                                            className="form-control"
                                        />
                                        <ErrorMessage name="date_of_birth" component="div" className="text-danger" />
                                    </FormGroup>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label for="gender">
                                            Gender <span className="text-danger">*</span>
                                        </Label>
                                        <Field as="select" name="gender" id="gender" className="form-select">
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </Field>
                                        <ErrorMessage name="gender" component="div" className="text-danger" />
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormikSelect
                                        name="source"
                                        label="Source (Optional)"
                                        url="/unisync360-students/sources/"
                                        containerClass="mb-3"
                                        filters={{ page: 1, page_size: 10, paginated: true }}
                                        mapOption={(item) => ({ value: item.uid, label: item.name })}
                                        placeholder="Select Source"
                                    />
                                </Col>
                            </Row>

                            <Row>
                                <Col md={12}>
                                    <FormGroup>
                                        <Label for="address">Address (Optional)</Label>
                                        <Field
                                            as="textarea"
                                            name="address"
                                            id="address"
                                            className="form-control"
                                            rows={2}
                                            placeholder="Enter address"
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="secondary" onClick={handleClose} disabled={loading || formikProps.isSubmitting}>
                                Cancel
                            </Button>
                            <Button color="primary" type="submit" disabled={loading || formikProps.isSubmitting}>
                                {loading || formikProps.isSubmitting ? (
                                    <>
                                        <Spinner size="sm" className="me-2" />
                                        Registering...
                                    </>
                                ) : (
                                    <>
                                        <i className="bx bx-save me-2"></i>
                                        Register Student
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

export default StudentRegistrationModal;
