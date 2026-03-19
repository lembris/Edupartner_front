import React, { useState, useEffect } from "react";
import { createSchool, updateSchool, getRegions, getDistricts } from "./Queries";
import showToast from "../../../../../helpers/ToastHelper";
import GlobalModal from "../../../../../components/modal/GlobalModal";

export const SchoolModal = ({ show, selectedObj, onSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    region: "",
    district: "",
    ownership: "government",
    level: "o_level",
    sex_orientation: "",
    registration_number: "",
    registration_year: "",
    phone: "",
    email: "",
    address: "",
    latitude: "",
    longitude: "",
    total_students: "",
    total_teachers: "",
    is_active: true,
    logo: null,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setLoadingRegions(true);
        const result = await getRegions({ page: 1, page_size: 100, paginated: true });
        if (result?.data) {
          setRegions(Array.isArray(result.data) ? result.data : []);
        }
      } catch (error) {
        console.error("Error fetching regions:", error);
      } finally {
        setLoadingRegions(false);
      }
    };
    fetchRegions();
  }, []);

  useEffect(() => {
    const fetchDistricts = async () => {
      if (!formData.region) {
        setDistricts([]);
        return;
      }
      try {
        setLoadingDistricts(true);
        const result = await getDistricts({ page: 1, page_size: 100, paginated: true, region: formData.region });
        if (result?.data) {
          setDistricts(Array.isArray(result.data) ? result.data : []);
        }
      } catch (error) {
        console.error("Error fetching districts:", error);
      } finally {
        setLoadingDistricts(false);
      }
    };
    fetchDistricts();
  }, [formData.region]);

  useEffect(() => {
    if (show) {
      if (selectedObj) {
        setFormData({
          name: selectedObj.name || "",
          region: selectedObj.region?.uid || selectedObj.region || "",
          district: selectedObj.district?.uid || selectedObj.district || "",
          ownership: selectedObj.ownership || "government",
          level: selectedObj.level || "o_level",
          sex_orientation: selectedObj.sex_orientation || "",
          registration_number: selectedObj.registration_number || "",
          registration_year: selectedObj.registration_year || "",
          phone: selectedObj.phone || "",
          email: selectedObj.email || "",
          address: selectedObj.address || "",
          latitude: selectedObj.latitude || "",
          longitude: selectedObj.longitude || "",
          total_students: selectedObj.total_students || "",
          total_teachers: selectedObj.total_teachers || "",
          is_active: selectedObj.is_active ?? true,
          logo: null,
        });
      } else {
        setFormData({
          name: "",
          region: "",
          district: "",
          ownership: "government",
          level: "o_level",
          sex_orientation: "",
          registration_number: "",
          registration_year: "",
          phone: "",
          email: "",
          address: "",
          latitude: "",
          longitude: "",
          total_students: "",
          total_teachers: "",
          is_active: true,
          logo: null,
        });
      }
      setErrors({});
    }
  }, [selectedObj, show]);

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "file" ? files[0] : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = "School name is required";
    }
    if (!formData.region) {
      newErrors.region = "Region is required";
    }
    if (!formData.district) {
      newErrors.district = "District is required";
    }
    if (!formData.ownership) {
      newErrors.ownership = "Ownership is required";
    }
    if (!formData.level) {
      newErrors.level = "Level is required";
    }
    if (!formData.sex_orientation) {
      newErrors.sex_orientation = "Sex orientation is required";
    }
    if (!formData.registration_number?.trim()) {
      newErrors.registration_number = "Registration number is required";
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (formData.registration_year && (formData.registration_year < 1900 || formData.registration_year > new Date().getFullYear())) {
      newErrors.registration_year = "Invalid year";
    }
    if (formData.total_students && formData.total_students < 0) {
      newErrors.total_students = "Cannot be negative";
    }
    if (formData.total_teachers && formData.total_teachers < 0) {
      newErrors.total_teachers = "Cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined && formData[key] !== "") {
          data.append(key, formData[key]);
        }
      });

      let result;
      if (selectedObj) {
        result = await updateSchool(selectedObj.uid, data);
      } else {
        result = await createSchool(data);
      }

      if (result) {
        showToast("success", `School ${selectedObj ? 'Updated' : 'Created'} Successfully`);
        onClose();
        if (onSuccess) onSuccess();
      } else {
        showToast("warning", "Process Failed");
      }
    } catch (error) {
      console.error("School submission error:", error);
      if (error.response && error.response.data) {
        setErrors(error.response.data);
        showToast("warning", "Validation Failed");
      } else {
        showToast("error", "Something went wrong while saving school");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlobalModal
      show={show}
      onClose={onClose}
      title={<><i className="bx bxs-school me-2"></i>{selectedObj ? "Update School" : "Add New School"}</>}
      size="lg"
      onSubmit={handleSubmit}
      submitText={selectedObj ? "Update" : "Save"}
      loading={loading}
    >
      <div className="row">
        <div className="col-md-12 mb-3">
          <label htmlFor="name" className="form-label">
            School Name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`form-control ${errors.name ? "is-invalid" : ""}`}
            placeholder="e.g., Shaaban Robert Secondary School"
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label htmlFor="region" className="form-label">Region <span className="text-danger">*</span></label>
          <select
            name="region"
            id="region"
            value={formData.region}
            onChange={handleInputChange}
            className={`form-select ${errors.region ? "is-invalid" : ""}`}
            disabled={loadingRegions}
          >
            <option value="">Select Region</option>
            {regions.map((r) => (
              <option key={r.uid} value={r.uid}>{r.name}</option>
            ))}
          </select>
          {errors.region && <div className="invalid-feedback">{errors.region}</div>}
        </div>
        <div className="col-md-6 mb-3">
          <label htmlFor="district" className="form-label">District <span className="text-danger">*</span></label>
          <select
            name="district"
            id="district"
            value={formData.district}
            onChange={handleInputChange}
            className={`form-select ${errors.district ? "is-invalid" : ""}`}
            disabled={loadingDistricts || !formData.region}
          >
            <option value="">Select District</option>
            {districts.map((d) => (
              <option key={d.uid} value={d.uid}>{d.name}</option>
            ))}
          </select>
          {errors.district && <div className="invalid-feedback">{errors.district}</div>}
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label htmlFor="ownership" className="form-label">Ownership <span className="text-danger">*</span></label>
          <select
            name="ownership"
            id="ownership"
            value={formData.ownership}
            onChange={handleInputChange}
            className={`form-select ${errors.ownership ? "is-invalid" : ""}`}
          >
            <option value="government">Government</option>
            <option value="private">Private</option>
            <option value="religious">Religious</option>
            <option value="community">Community</option>
          </select>
          {errors.ownership && <div className="invalid-feedback">{errors.ownership}</div>}
        </div>
        <div className="col-md-6 mb-3">
          <label htmlFor="level" className="form-label">Level <span className="text-danger">*</span></label>
          <select
            name="level"
            id="level"
            value={formData.level}
            onChange={handleInputChange}
            className={`form-select ${errors.level ? "is-invalid" : ""}`}
          >
            <option value="a_level">Advanced Secondary</option>
            <option value="o_level">Ordinary Secondary</option>
            <option value="both">Advanced & Ordinary Secondary</option>
          </select>
          {errors.level && <div className="invalid-feedback">{errors.level}</div>}
        </div>
      </div>

      <div className="row">
        <div className="col-md-12 mb-3">
          <label htmlFor="sex_orientation" className="form-label">Sex Orientation <span className="text-danger">*</span></label>
          <select
            name="sex_orientation"
            id="sex_orientation"
            value={formData.sex_orientation}
            onChange={handleInputChange}
            className={`form-select ${errors.sex_orientation ? "is-invalid" : ""}`}
          >
            <option value="">Select Sex Orientation</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="co_education">Co-education</option>
          </select>
          {errors.sex_orientation && <div className="invalid-feedback">{errors.sex_orientation}</div>}
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label htmlFor="registration_number" className="form-label">Registration Number <span className="text-danger">*</span></label>
          <input
            type="text"
            name="registration_number"
            id="registration_number"
            value={formData.registration_number}
            onChange={handleInputChange}
            className={`form-control ${errors.registration_number ? "is-invalid" : ""}`}
            placeholder="e.g., S.1234"
          />
          {errors.registration_number && <div className="invalid-feedback">{errors.registration_number}</div>}
        </div>
        <div className="col-md-6 mb-3">
          <label htmlFor="registration_year" className="form-label">Registration Year</label>
          <input
            type="number"
            name="registration_year"
            id="registration_year"
            value={formData.registration_year}
            onChange={handleInputChange}
            className={`form-control ${errors.registration_year ? "is-invalid" : ""}`}
            placeholder="e.g., 2005"
          />
          {errors.registration_year && <div className="invalid-feedback">{errors.registration_year}</div>}
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label htmlFor="phone" className="form-label">Phone</label>
          <input
            type="text"
            name="phone"
            id="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="form-control"
            placeholder="+255..."
          />
        </div>
        <div className="col-md-6 mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`form-control ${errors.email ? "is-invalid" : ""}`}
            placeholder="info@school.com"
          />
          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="address" className="form-label">Address</label>
        <textarea
          name="address"
          id="address"
          value={formData.address}
          onChange={handleInputChange}
          className="form-control"
          rows="2"
          placeholder="Physical Address"
        />
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label htmlFor="latitude" className="form-label">Latitude</label>
          <input
            type="number"
            step="any"
            name="latitude"
            id="latitude"
            value={formData.latitude}
            onChange={handleInputChange}
            className="form-control"
            placeholder="e.g., -6.7924"
          />
        </div>
        <div className="col-md-6 mb-3">
          <label htmlFor="longitude" className="form-label">Longitude</label>
          <input
            type="number"
            step="any"
            name="longitude"
            id="longitude"
            value={formData.longitude}
            onChange={handleInputChange}
            className="form-control"
            placeholder="e.g., 39.2083"
          />
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label htmlFor="total_students" className="form-label">Total Students</label>
          <input
            type="number"
            name="total_students"
            id="total_students"
            value={formData.total_students}
            onChange={handleInputChange}
            className={`form-control ${errors.total_students ? "is-invalid" : ""}`}
            placeholder="0"
          />
          {errors.total_students && <div className="invalid-feedback">{errors.total_students}</div>}
        </div>
        <div className="col-md-6 mb-3">
          <label htmlFor="total_teachers" className="form-label">Total Teachers</label>
          <input
            type="number"
            name="total_teachers"
            id="total_teachers"
            value={formData.total_teachers}
            onChange={handleInputChange}
            className={`form-control ${errors.total_teachers ? "is-invalid" : ""}`}
            placeholder="0"
          />
          {errors.total_teachers && <div className="invalid-feedback">{errors.total_teachers}</div>}
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="logo" className="form-label">Logo</label>
        <input
          type="file"
          name="logo"
          id="logo"
          onChange={handleInputChange}
          className="form-control"
        />
        {selectedObj?.logo && (
          <div className="mt-2">
            <small className="text-muted">Current Logo:</small>
            <img src={selectedObj.logo} alt="Current Logo" height="50" className="d-block mt-1 rounded" />
          </div>
        )}
      </div>

      <div className="form-check form-switch">
        <input
          type="checkbox"
          name="is_active"
          id="is_active"
          checked={formData.is_active}
          onChange={handleInputChange}
          className="form-check-input"
        />
        <label className="form-check-label" htmlFor="is_active">
          Active Status
        </label>
      </div>
    </GlobalModal>
  );
};
