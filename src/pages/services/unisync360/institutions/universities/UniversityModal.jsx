import React, { useState, useEffect } from "react";
import { createUniversity, updateUniversity, getCountries } from "./Queries";
import showToast from "../../../../../helpers/ToastHelper";
import GlobalModal from "../../../../../components/modal/GlobalModal";

export const UniversityModal = ({ show, selectedObj, onSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    acronym: "",
    type: "Public",
    website: "",
    email: "",
    phone_number: "",
    address: "",
    description: "",
    ranking: "",
    established_year: "",
    is_active: true,
    logo: null,
    country: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoadingCountries(true);
        const result = await getCountries({ page: 1, page_size: 100, paginated: true });
        if (result?.data) {
          setCountries(Array.isArray(result.data) ? result.data : []);
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
      } finally {
        setLoadingCountries(false);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    if (show) {
      if (selectedObj) {
        setFormData({
          name: selectedObj.name || "",
          acronym: selectedObj.acronym || "",
          type: selectedObj.type || "Public",
          website: selectedObj.website || "",
          email: selectedObj.email || "",
          phone_number: selectedObj.phone_number || "",
          address: selectedObj.address || "",
          description: selectedObj.description || "",
          ranking: selectedObj.ranking || "",
          established_year: selectedObj.established_year || "",
          is_active: selectedObj.is_active ?? true,
          logo: null,
          country: selectedObj.country || selectedObj.country_uid || "",
        });
      } else {
        setFormData({
          name: "",
          acronym: "",
          type: "Public",
          website: "",
          email: "",
          phone_number: "",
          address: "",
          description: "",
          ranking: "",
          established_year: "",
          is_active: true,
          logo: null,
          country: "",
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
      newErrors.name = "University name is required";
    }
    if (!formData.country) {
      newErrors.country = "Country is required";
    }
    if (!formData.type) {
      newErrors.type = "Type is required";
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (formData.website && !/^https?:\/\//.test(formData.website)) {
      newErrors.website = "Invalid URL format";
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
        result = await updateUniversity(selectedObj.uid, data);
      } else {
        result = await createUniversity(data);
      }

      if (result) {
        showToast("success", `University ${selectedObj ? 'Updated' : 'Created'} Successfully`);
        onClose();
        if (onSuccess) onSuccess();
      } else {
        showToast("warning", "Process Failed");
      }
    } catch (error) {
      console.error("University submission error:", error);
      if (error.response && error.response.data) {
        setErrors(error.response.data);
        showToast("warning", "Validation Failed");
      } else {
        showToast("error", "Something went wrong while saving university");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlobalModal
      show={show}
      onClose={onClose}
      title={<><i className="bx bxs-school me-2"></i>{selectedObj ? "Update University" : "Add New University"}</>}
      size="lg"
      onSubmit={handleSubmit}
      submitText={selectedObj ? "Update" : "Save"}
      loading={loading}
    >
      <div className="row">
        <div className="col-md-4 mb-3">
          <label htmlFor="name" className="form-label">
            University Name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`form-control ${errors.name ? "is-invalid" : ""}`}
            placeholder="e.g., University of Dar es Salaam"
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>
        <div className="col-md-4 mb-3">
          <label htmlFor="country" className="form-label">Country <span className="text-danger">*</span></label>
          <select
            name="country"
            id="country"
            value={formData.country}
            onChange={handleInputChange}
            className={`form-select ${errors.country ? "is-invalid" : ""}`}
            disabled={loadingCountries}
          >
            <option value="">Select Country</option>
            {countries.map((c) => (
              <option key={c.uid} value={c.uid}>{c.name}</option>
            ))}
          </select>
          {errors.country && <div className="invalid-feedback">{errors.country}</div>}
        </div>
        <div className="col-md-4 mb-3">
          <label htmlFor="acronym" className="form-label">Acronym</label>
          <input
            type="text"
            name="acronym"
            id="acronym"
            value={formData.acronym}
            onChange={handleInputChange}
            className="form-control"
            placeholder="e.g., UDSM"
          />
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label htmlFor="type" className="form-label">Type</label>
          <select
            name="type"
            id="type"
            value={formData.type}
            onChange={handleInputChange}
            className="form-select"
          >
            <option value="Public">Public</option>
            <option value="Private">Private</option>
          </select>
        </div>
        <div className="col-md-6 mb-3">
          <label htmlFor="ranking" className="form-label">World/National Ranking</label>
          <input
            type="number"
            name="ranking"
            id="ranking"
            value={formData.ranking}
            onChange={handleInputChange}
            className="form-control"
            placeholder="e.g., 1"
          />
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label htmlFor="website" className="form-label">Website</label>
          <input
            type="url"
            name="website"
            id="website"
            value={formData.website}
            onChange={handleInputChange}
            className={`form-control ${errors.website ? "is-invalid" : ""}`}
            placeholder="https://..."
          />
          {errors.website && <div className="invalid-feedback">{errors.website}</div>}
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
            placeholder="info@university.ac.tz"
          />
          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label htmlFor="phone_number" className="form-label">Phone Number</label>
          <input
            type="text"
            name="phone_number"
            id="phone_number"
            value={formData.phone_number}
            onChange={handleInputChange}
            className="form-control"
            placeholder="+255..."
          />
        </div>
        <div className="col-md-6 mb-3">
          <label htmlFor="established_year" className="form-label">Established Year</label>
          <input
            type="number"
            name="established_year"
            id="established_year"
            value={formData.established_year}
            onChange={handleInputChange}
            className="form-control"
            placeholder="e.g., 1970"
          />
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="address" className="form-label">Address</label>
        <input
          type="text"
          name="address"
          id="address"
          value={formData.address}
          onChange={handleInputChange}
          className="form-control"
          placeholder="Physical Address"
        />
      </div>

      <div className="mb-3">
        <label htmlFor="description" className="form-label">Description</label>
        <textarea
          name="description"
          id="description"
          value={formData.description}
          onChange={handleInputChange}
          className="form-control"
          rows="3"
          placeholder="Brief description..."
        />
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
