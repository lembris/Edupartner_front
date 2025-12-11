// CourseApplicationModal.jsx - Course Application Modal for External Counselor
import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, FormGroup, Label, Input, Spinner } from "reactstrap";
import { Formik, Field, ErrorMessage, Form } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import axiosInstance from "../../../../api.jsx";
import { commissionPortalService } from "./Queries.jsx";
import FormikSelect from "../../../../components/ui-templates/form-components/FormikSelect";

const INTAKE_MONTHS = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
];

const currentYear = new Date().getFullYear();
const INTAKE_YEARS = Array.from({ length: 5 }, (_, i) => currentYear + i);

export const CourseApplicationModal = ({ show, onHide, onSuccess, student = null }) => {
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [universityCourses, setUniversityCourses] = useState([]);

    const initialValues = {
        student: student?.uid || "",
        university_course: "",
        university: "",
        intake_year: currentYear,
        intake_month: 9,
        priority: 1,
        expected_start_date: "",
        notes: "",
    };

    const validationSchema = Yup.object().shape({
        student: Yup.string().required("Please select a student"),
        university: Yup.string().required("Please select a university"),
        university_course: Yup.string().required("Please select a course"),
        intake_year: Yup.string().required("Please select intake year"),
        intake_month: Yup.string().required("Please select intake month"),
        expected_start_date: Yup.date().nullable().typeError("Please enter a valid date"),
        notes: Yup.string().nullable(),
        priority: Yup.number().nullable(),
    });

    const fetchUniversityCourses = async (universityUid) => {
        try {
            const response = await axiosInstance.get("unisync360/university-courses/", {
                params: { university: universityUid, page_size: 200 }
            });
            setUniversityCourses(response?.data?.results || []);
        } catch (error) {
            console.error("Error fetching university courses:", error);
            setUniversityCourses([]);
        }
    };

    const handleSubmit = async (values, { setSubmitting, resetForm, setErrors }) => {
        try {
            setSubmitting(true);

            const payload = {
                student: values.student,
                university_course: values.university_course,
                intake_year: parseInt(values.intake_year),
                intake_month: parseInt(values.intake_month),
                priority: parseInt(values.priority),
                status: "pending",
            };

            if (values.expected_start_date) {
                payload.expected_start_date = values.expected_start_date;
            }
            if (values.notes) {
                payload.notes = values.notes;
            }

            await axiosInstance.post("unisync360-applications/course-allocations/", payload);

            resetForm();
            onSuccess && onSuccess();
            handleClose();
        } catch (error) {
            console.error("Submission error:", error);
            const errorMessage = error.response?.data?.detail || 
                               error.response?.data?.message ||
                               Object.values(error.response?.data || {}).flat().join(", ") ||
                               "Failed to submit application. Please try again.";
            Swal.fire({
                icon: "error",
                title: "Submission Failed",
                text: errorMessage,
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setUniversityCourses([]);
        onHide();
    };

    return (
        <Modal isOpen={show} toggle={handleClose} size="lg" centered backdrop="static" keyboard={false}>
            <ModalHeader toggle={handleClose}>
                <i className="bx bx-book-add me-2"></i>
                Apply for Course
            </ModalHeader>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {(formikProps) => {
                    const selectedCourse = universityCourses.find(c => c.uid === formikProps.values.university_course);

                    return (
                        <Form onSubmit={formikProps.handleSubmit}>
                            <ModalBody>
                                {/* Student Selection */}
                                {!student && (
                                    <FormikSelect
                                        name="student"
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

                                {/* University Selection */}
                                <FormikSelect
                                    name="university"
                                    label="Select University *"
                                    url="/unisync360/universities"
                                    containerClass="mb-3"
                                    filters={{ status: 'active', page: 1, page_size: 200 }}
                                    mapOption={(item) => ({ value: item.uid, label: `${item.name} (${item.country?.name})` })}
                                    placeholder="Search universities..."
                                    isRequired={true}
                                    onSelectObject={(selected) => {
                                        if (selected) {
                                            formikProps.setFieldValue('university', selected.value);
                                            formikProps.setFieldValue('university_course', '');
                                            fetchUniversityCourses(selected.value);
                                        }
                                    }}
                                />

                                {/* Course Selection */}
                                <FormGroup>
                                    <Label for="university_course">
                                        Select Course <span className="text-danger">*</span>
                                    </Label>
                                    <Field
                                        as="select"
                                        name="university_course"
                                        id="university_course"
                                        className="form-select"
                                        disabled={!formikProps.values.university}
                                    >
                                        <option value="">
                                            {formikProps.values.university ? "-- Select a course --" : "-- First select a university --"}
                                        </option>
                                        {universityCourses.map((course) => (
                                            <option key={course.uid} value={course.uid}>
                                                {course.course?.name} - {course.course?.level?.name} 
                                                ({course.currency} {parseFloat(course.tuition_fee).toLocaleString()})
                                            </option>
                                        ))}
                                    </Field>
                                    <ErrorMessage name="university_course" component="div" className="text-danger" />
                                </FormGroup>

                                {/* Selected Course Info */}
                                {selectedCourse && (
                                    <div className="alert alert-light border mb-3">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <small className="text-muted">Duration</small>
                                                <p className="mb-0">{selectedCourse.duration_months} months</p>
                                            </div>
                                            <div className="col-md-6">
                                                <small className="text-muted">Tuition Fee</small>
                                                <p className="mb-0">
                                                    {selectedCourse.currency} {parseFloat(selectedCourse.tuition_fee).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        {selectedCourse.scholarship_available && (
                                            <div className="mt-2">
                                                <span className="badge bg-success">
                                                    <i className="bx bx-gift me-1"></i>
                                                    Scholarship Available
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="row">
                                    <div className="col-md-4">
                                        <FormGroup>
                                            <Label for="intake_year">
                                                Intake Year <span className="text-danger">*</span>
                                            </Label>
                                            <Field
                                                as="select"
                                                name="intake_year"
                                                id="intake_year"
                                                className="form-select"
                                            >
                                                {INTAKE_YEARS.map((year) => (
                                                    <option key={year} value={year}>{year}</option>
                                                ))}
                                            </Field>
                                            <ErrorMessage name="intake_year" component="div" className="text-danger" />
                                        </FormGroup>
                                    </div>
                                    <div className="col-md-4">
                                        <FormGroup>
                                            <Label for="intake_month">
                                                Intake Month <span className="text-danger">*</span>
                                            </Label>
                                            <Field
                                                as="select"
                                                name="intake_month"
                                                id="intake_month"
                                                className="form-select"
                                            >
                                                {INTAKE_MONTHS.map((month) => (
                                                    <option key={month.value} value={month.value}>{month.label}</option>
                                                ))}
                                            </Field>
                                            <ErrorMessage name="intake_month" component="div" className="text-danger" />
                                        </FormGroup>
                                    </div>
                                    <div className="col-md-4">
                                        <FormGroup>
                                            <Label for="priority">Priority</Label>
                                            <Field
                                                as="select"
                                                name="priority"
                                                id="priority"
                                                className="form-select"
                                            >
                                                <option value="1">1 (Highest)</option>
                                                <option value="2">2</option>
                                                <option value="3">3</option>
                                                <option value="4">4</option>
                                                <option value="5">5 (Lowest)</option>
                                            </Field>
                                        </FormGroup>
                                    </div>
                                </div>

                                <FormGroup>
                                    <Label for="expected_start_date">Expected Start Date</Label>
                                    <Field
                                        type="date"
                                        name="expected_start_date"
                                        id="expected_start_date"
                                        className="form-control"
                                    />
                                    <ErrorMessage name="expected_start_date" component="div" className="text-danger" />
                                </FormGroup>

                                <FormGroup>
                                    <Label for="notes">Notes</Label>
                                    <Field
                                        as="textarea"
                                        name="notes"
                                        id="notes"
                                        className="form-control"
                                        rows="3"
                                        placeholder="Any additional notes about this application..."
                                    />
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
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bx bx-send me-2"></i>
                                            Submit Application
                                        </>
                                    )}
                                </Button>
                            </ModalFooter>
                        </Form>
                    );
                }}
            </Formik>
        </Modal>
    );
};

export default CourseApplicationModal;
