import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Formik, Field } from "formik";
import * as Yup from "yup";
import { createStudent, updateStudent } from "./Queries";
import showToast from "../../../../helpers/ToastHelper";
import FormikSelect from "../../../../components/ui-templates/form-components/FormikSelect";
import GlobalWizardModal from "../../../../components/modal/GlobalWizardModal";
import { useSelector } from "react-redux";

export const StudentModal = ({ show, selectedObj, onSuccess, onClose, isLeadLancer = false }) => {
    const [errors, setOtherError] = useState({});
    const [loading, setLoading] = useState(false);
    
    const user = useSelector((state) => state.userReducer?.data);
    const isAdmin = user?.is_superuser || user?.groups?.some(g => 
        g.includes('admin') || g.includes('super_admin')
    );
    
    const isLeadLancerAddingStudent = isLeadLancer && !selectedObj;
    
    const [leadLancerSourceId, setLeadLancerSourceId] = useState(null);
    const [reviewStatusId, setReviewStatusId] = useState(null);

    useEffect(() => {
        const fetchSourceAndStatus = async () => {
            if (isLeadLancerAddingStudent) {
                try {
                    const sourcesResponse = await fetch("/unisync360-students/sources/?page=1&page_size=100&search=Lead%20Lancer");
                    const sourcesData = await sourcesResponse.json();
                    const leadLancerSource = sourcesData.results?.find(s => s.name === "Lead Lancer");
                    if (leadLancerSource) {
                        setLeadLancerSourceId(leadLancerSource.uid);
                    }

                    const statusResponse = await fetch("/unisync360-students/statuses/?page=1&page_size=100&search=Review");
                    const statusData = await statusResponse.json();
                    const reviewStatus = statusData.results?.find(s => s.name === "Review");
                    if (reviewStatus) {
                        setReviewStatusId(reviewStatus.uid);
                    }
                } catch (error) {
                    console.error("Error fetching source and status:", error);
                }
            }
        };
        fetchSourceAndStatus();
    }, [isLeadLancerAddingStudent]);

    const initialValues = useMemo(() => ({
        first_name: selectedObj?.first_name || "",
        middle_name: selectedObj?.middle_name || "",
        last_name: selectedObj?.last_name || "",
        date_of_birth: selectedObj?.date_of_birth || "",
        gender: selectedObj?.gender || "",
        marital_status: selectedObj?.marital_status || "",
        nationality: selectedObj?.nationality?.uid || selectedObj?.nationality || "",
        passport_number: selectedObj?.passport_number || "",
        passport_expiry: selectedObj?.passport_expiry || "",
        personal_email: selectedObj?.personal_email || "",
        personal_phone: selectedObj?.personal_phone || "",
        whatsapp_number: selectedObj?.whatsapp_number || "",
        address: selectedObj?.address || "",
        emergency_contact_name: selectedObj?.emergency_contact_name || "",
        emergency_contact_phone: selectedObj?.emergency_contact_phone || "",
        emergency_contact_relationship: selectedObj?.emergency_contact_relationship || "",
        highest_qualification: selectedObj?.highest_qualification || "",
        previous_school: selectedObj?.previous_school || "",
        previous_school_id: selectedObj?.previous_school_id?.uid || selectedObj?.previous_school_id || "",
        graduation_year: selectedObj?.graduation_year || "",
        source: isLeadLancerAddingStudent && leadLancerSourceId 
            ? leadLancerSourceId 
            : (selectedObj?.source?.uid || selectedObj?.source || ""),
        status: isLeadLancerAddingStudent && reviewStatusId
            ? reviewStatusId
            : (selectedObj?.status?.uid || selectedObj?.status || ""),
        assigned_counselor: selectedObj?.assigned_counselor?.uid || selectedObj?.assigned_counselor 
            || (!isAdmin && !isLeadLancerAddingStudent && user?.guid ? user.guid : ""),
    }), [selectedObj, isLeadLancerAddingStudent, leadLancerSourceId, reviewStatusId, isAdmin, user?.guid]);

    const validationSchema = Yup.object().shape({
        first_name: Yup.string().required("First Name is required"),
        middle_name: Yup.string().nullable(),
        last_name: Yup.string().required("Last Name is required"),
        date_of_birth: Yup.string().required("Date of Birth is required"),
        gender: Yup.string().required("Gender is required"),
        marital_status: Yup.string().nullable(),
        nationality: Yup.string().required("Nationality is required"),
        passport_number: Yup.string().nullable(),
        passport_expiry: Yup.date().nullable(),
        personal_email: Yup.string().email("Invalid email format").required("Email is required"),
        personal_phone: Yup.string().required("Phone number is required"),
        whatsapp_number: Yup.string().nullable(),
        address: Yup.string().required("Address is required"),
        emergency_contact_name: Yup.string().required("Emergency Contact Name is required"),
        emergency_contact_phone: Yup.string().required("Emergency Contact Phone is required"),
        emergency_contact_relationship: Yup.string().required("Relationship is required"),
        highest_qualification: Yup.string().nullable(),
        previous_school: Yup.string().nullable(),
        graduation_year: Yup.number().nullable(),
        source: Yup.string().required("Source is required"),
        status: Yup.string().required("Status is required"),
        assigned_counselor: Yup.string().nullable(),
    });

    const genderOptions = useMemo(() => [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' },
    ], []);

    const maritalStatusOptions = useMemo(() => [
        { value: 'single', label: 'Single' },
        { value: 'married', label: 'Married' },
        { value: 'divorced', label: 'Divorced' },
        { value: 'widowed', label: 'Widowed' },
    ], []);

    const relationshipOptions = useMemo(() => [
        { value: 'parent', label: 'Parent' },
        { value: 'guardian', label: 'Guardian' },
        { value: 'sibling', label: 'Sibling' },
        { value: 'relative', label: 'Relative' },
        { value: 'friend', label: 'Friend' },
        { value: 'other', label: 'Other' },
    ], []);

    const highestQualificationOptions = useMemo(() => [
        { value: 'advanced_secondary', label: 'Advanced Secondary' },
        { value: 'ordinary_secondary', label: 'Ordinary Secondary' },
        { value: 'higher_education', label: 'Higher education' },
        { value: 'others', label: 'Others' },
    ], []);

    const handleSubmit = async (values, { setErrors, resetForm }) => {
        try {
            const submitData = { ...values };
            if (!submitData.middle_name) delete submitData.middle_name;
            if (!submitData.whatsapp_number) delete submitData.whatsapp_number;
            if (!submitData.passport_number) delete submitData.passport_number;
            if (!submitData.passport_expiry) delete submitData.passport_expiry;
            if (!submitData.highest_qualification) delete submitData.highest_qualification;
            if (!submitData.marital_status) delete submitData.marital_status;
            
            if (isLeadLancerAddingStudent) {
                delete submitData.assigned_counselor;
            }

            if (submitData.highest_qualification === 'advanced_secondary' || submitData.highest_qualification === 'ordinary_secondary') {
                if (submitData.previous_school_id) {
                    submitData.previous_school_id = submitData.previous_school_id;
                }
                delete submitData.previous_school;
            } else {
                if (submitData.previous_school) {
                    submitData.previous_school = submitData.previous_school;
                }
                delete submitData.previous_school_id;
            }

            setLoading(true);
            let result;
            if (selectedObj?.uid) {
                result = await updateStudent(selectedObj.uid, submitData);
            } else {
                result = await createStudent(submitData);
            }

            if (result?.status === 200 || result?.status === 8000) {
                showToast("success", `Student ${selectedObj ? 'Updated' : 'Created'} Successfully`);
                if (onClose) onClose();
                resetForm();
                if (onSuccess) onSuccess();
                return result;
            } else if (result?.status === 8002) {
                setErrors(result.data);
                setOtherError(result.data);
                showToast("warning", "Validation Failed");
                return result;
            } else {
                showToast("error", result?.message || "Something went wrong");
                return result;
            }
        } catch (error) {
            console.error("Student submission error:", error);
            const errorData = error.response?.data;
            if (errorData) {
                setErrors(errorData);
                setOtherError(errorData);
                showToast("warning", "Validation Failed");
            } else {
                showToast("error", "Something went wrong while saving student");
            }
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const personalInfoTab = {
        key: "personal-info",
        title: "Personal Info",
        icon: "bx bx-user",
        validateFields: ["first_name", "last_name", "date_of_birth", "gender", "nationality"],
        content: (
            <div className="row">
                <div className="col-md-4 mb-3">
                    <label className="form-label">First Name *</label>
                    <Field name="first_name" className="form-control" placeholder="John" />
                </div>
                <div className="col-md-4 mb-3">
                    <label className="form-label">Middle Name</label>
                    <Field name="middle_name" className="form-control" placeholder="Doe" />
                </div>
                <div className="col-md-4 mb-3">
                    <label className="form-label">Last Name *</label>
                    <Field name="last_name" className="form-control" placeholder="Smith" />
                </div>
            </div>
        ),
    };

    const basicInfoFields = (
        <>
            <div className="row">
                <div className="col-md-4 mb-3">
                    <label className="form-label">Date of Birth *</label>
                    <Field type="date" name="date_of_birth" className="form-control" />
                </div>
                <div className="col-md-4 mb-3">
                    <label className="form-label">Gender *</label>
                    <Field as="select" name="gender" className="form-select">
                        <option value="">Select Gender</option>
                        {genderOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </Field>
                </div>
                <div className="col-md-4 mb-3">
                    <label className="form-label">Marital Status</label>
                    <Field as="select" name="marital_status" className="form-select">
                        <option value="">Select Status</option>
                        {maritalStatusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </Field>
                </div>
            </div>
            <div className="row">
                <div className="col-md-4 mb-3">
                    <FormikSelect
                        name="nationality"
                        label="Nationality *"
                        url="/countries/"
                        containerClass="mb-0"
                        filters={{ page: 1, page_size: 100, paginated: true }}
                        mapOption={(item) => ({ value: item.uid, label: item.name })}
                        placeholder="Select Country"
                        isRequired={true}
                    />
                </div>
                <div className="col-md-4 mb-3">
                    <label className="form-label">Passport Number</label>
                    <Field name="passport_number" className="form-control" placeholder="Optional" />
                </div>
                <div className="col-md-4 mb-3">
                    <label className="form-label">Passport Expiry</label>
                    <Field type="date" name="passport_expiry" className="form-control" />
                </div>
            </div>
        </>
    );

    const contactInfoTab = {
        key: "contact-info",
        title: "Contact Info",
        icon: "bx bx-phone",
        validateFields: ["personal_email", "personal_phone", "address", "emergency_contact_name", "emergency_contact_phone", "emergency_contact_relationship"],
        content: (
            <>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Personal Email *</label>
                        <Field type="email" name="personal_email" className="form-control" placeholder="john@example.com" />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Personal Phone *</label>
                        <Field name="personal_phone" className="form-control" placeholder="+1234567890" />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">WhatsApp Number</label>
                        <Field name="whatsapp_number" className="form-control" placeholder="+1234567890" />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Address *</label>
                        <Field as="textarea" name="address" className="form-control" rows="2" placeholder="Full Address" />
                    </div>
                </div>
                <hr />
                <h6 className="text-primary">Emergency Contact</h6>
                <div className="row">
                    <div className="col-md-4 mb-3">
                        <label className="form-label">Contact Name *</label>
                        <Field name="emergency_contact_name" className="form-control" />
                    </div>
                    <div className="col-md-4 mb-3">
                        <label className="form-label">Contact Phone *</label>
                        <Field name="emergency_contact_phone" className="form-control" />
                    </div>
                    <div className="col-md-4 mb-3">
                        <label className="form-label">Relationship *</label>
                        <Field as="select" name="emergency_contact_relationship" className="form-select">
                            <option value="">Select Relationship</option>
                            {relationshipOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </Field>
                    </div>
                </div>
            </>
        ),
    };

    const academicStatusTab = {
        key: "academic-status",
        title: "Academic & Status",
        icon: "bx bx-book",
        validateFields: ["graduation_year", "source", "status", "assigned_counselor"],
        content: (
            <>
                <div className="row">
                    <div className="col-md-4 mb-3">
                        <label className="form-label">Highest Qualification</label>
                        <Field as="select" name="highest_qualification" className="form-select">
                            <option value="">Select Qualification</option>
                            {highestQualificationOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </Field>
                    </div>
                    <div className="col-md-4 mb-3">
                        <label className="form-label">Previous School</label>
                        <Field name="previous_school" className="form-control" placeholder="Enter school name" />
                    </div>
                    <div className="col-md-4 mb-3">
                        <label className="form-label">Graduation Year</label>
                        <Field type="number" name="graduation_year" className="form-control" placeholder="YYYY" />
                    </div>
                </div>
                {!isLeadLancer && (
                    <div className="row">
                        <div className="col-md-4 mb-3">
                            <FormikSelect
                                name="source"
                                label="Source *"
                                url="/unisync360-students/sources/"
                                containerClass="mb-0"
                                filters={{ page: 1, page_size: 100, paginated: true }}
                                mapOption={(item) => ({ value: item.uid, label: item.name })}
                                placeholder="Select Source"
                                isRequired={true}
                            />
                        </div>
                        <div className="col-md-4 mb-3">
                            <FormikSelect
                                name="status"
                                label="Status *"
                                url="/unisync360-students/statuses/"
                                containerClass="mb-0"
                                filters={{ page: 1, page_size: 100, paginated: true }}
                                mapOption={(item) => ({ value: item.uid, label: item.name })}
                                placeholder="Select Status"
                                isRequired={true}
                            />
                        </div>
                        <div className="col-md-4 mb-3">
                            <FormikSelect
                                name="assigned_counselor"
                                label="Counselor *"
                                url="/users-list/"
                                containerClass="mb-0"
                                filters={{ page: 1, page_size: 100, paginated: true }}
                                mapOption={(item) => ({ value: item.guid || item.uid || item.id, label: `${item.first_name} ${item.last_name}` })}
                                placeholder="Assign Counselor"
                                isRequired={true}
                            />
                        </div>
                    </div>
                )}
            </>
        ),
    };

    const tabs = [
        {
            key: "personal-info",
            title: "Personal Info",
            icon: "bx bx-user",
            validateFields: ["first_name", "last_name", "date_of_birth", "gender", "nationality"],
            content: (
                <>
                    {personalInfoTab.content}
                    {basicInfoFields}
                </>
            ),
        },
        contactInfoTab,
        academicStatusTab,
    ];

    return (
        <GlobalWizardModal
            show={show}
            onClose={onClose}
            onSuccess={onSuccess}
            modalTitle={selectedObj ? "Update Student" : "Create New Student"}
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            tabs={tabs}
            selectedObj={selectedObj}
            headerIcon="bx bx-user"
            size="lg"
        />
    );
};

export default StudentModal;
