import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Swal from 'sweetalert2';
import { fetchConsentServices, createConsentService, updateConsentService, deleteConsentService } from './Queries';
import ServiceSetupTable from './components/ServiceSetupTable';
import ServiceSetupForm from './components/ServiceSetupForm';
import './service-setup.css';

const SERVICE_CATEGORIES = [
  { value: 'academic', label: 'Academic Services' },
  { value: 'financial', label: 'Financial Services' },
  { value: 'counseling', label: 'Counseling Services' },
  { value: 'career', label: 'Career Services' },
  { value: 'housing', label: 'Housing Services' },
  { value: 'health', label: 'Health Services' },
  { value: 'immigration', label: 'Immigration Services' },
  { value: 'other', label: 'Other Services' },
];

export const ServiceSetupPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [formLoading, setFormLoading] = useState(false);

  // Load services on mount
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchConsentServices();
      const serviceList = data.results || data || [];
      setServices(Array.isArray(serviceList) ? serviceList : []);
    } catch (error) {
      console.error('Error loading services:', error);
      Swal.fire('Error', 'Failed to load consent services', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter services
  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesSearch = service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.code?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || service.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [services, searchTerm, selectedCategory]);

  // Handle create/edit form submit
  const handleFormSubmit = useCallback(async (formData) => {
    try {
      setFormLoading(true);

      if (editingService) {
        // Update
        await updateConsentService(editingService.uid, formData);
        Swal.fire('Success', 'Service updated successfully', 'success');
      } else {
        // Create
        await createConsentService(formData);
        Swal.fire('Success', 'Service created successfully', 'success');
      }

      setShowForm(false);
      setEditingService(null);
      loadServices();
    } catch (error) {
      console.error('Error saving service:', error);
      Swal.fire('Error', error.response?.data?.detail || 'Failed to save service', 'error');
    } finally {
      setFormLoading(false);
    }
  }, [editingService, loadServices]);

  // Handle edit
  const handleEdit = useCallback((service) => {
    setEditingService(service);
    setShowForm(true);
    window.scrollTo(0, 0);
  }, []);

  // Handle delete
  const handleDelete = useCallback((service) => {
    Swal.fire({
      title: 'Delete Service?',
      text: `Are you sure you want to delete "${service.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#dc3545',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteConsentService(service.uid);
          Swal.fire('Deleted', 'Service deleted successfully', 'success');
          loadServices();
        } catch (error) {
          console.error('Error deleting service:', error);
          Swal.fire('Error', 'Failed to delete service', 'error');
        }
      }
    });
  }, [loadServices]);

  // Handle bulk delete
  const handleBulkDelete = useCallback(() => {
    if (selectedServices.length === 0) {
      Swal.fire('Info', 'Please select services to delete', 'info');
      return;
    }

    Swal.fire({
      title: 'Delete Selected Services?',
      text: `You are about to delete ${selectedServices.length} service(s). This cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete All',
      confirmButtonColor: '#dc3545',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoading(true);
          const promises = selectedServices.map(uid => deleteConsentService(uid));
          await Promise.all(promises);
          Swal.fire('Deleted', `${selectedServices.length} service(s) deleted successfully`, 'success');
          setSelectedServices([]);
          loadServices();
        } catch (error) {
          console.error('Error deleting services:', error);
          Swal.fire('Error', 'Failed to delete some services', 'error');
        } finally {
          setLoading(false);
        }
      }
    });
  }, [selectedServices, loadServices]);

  // Handle checkbox change
  const handleSelectService = useCallback((uid) => {
    setSelectedServices(prev => {
      if (prev.includes(uid)) {
        return prev.filter(id => id !== uid);
      } else {
        return [...prev, uid];
      }
    });
  }, []);

  // Handle select all
  const handleSelectAll = useCallback(() => {
    if (selectedServices.length === filteredServices.length && filteredServices.length > 0) {
      setSelectedServices([]);
    } else {
      setSelectedServices(filteredServices.map(s => s.uid));
    }
  }, [selectedServices, filteredServices]);

  return (
    <div className="service-setup-container">
      {/* Header */}
      <div className="service-setup-header mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title mb-1">Consent Service Setup</h1>
            <p className="text-muted">Manage consent services offered to students</p>
          </div>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => {
              setEditingService(null);
              setShowForm(true);
            }}
          >
            <i className="bx bx-plus me-2"></i>Add New Service
          </button>
        </div>
      </div>

      {/* Form Section */}
      {showForm && (
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-light">
            <h5 className="mb-0">
              {editingService ? 'Edit Service' : 'Create New Service'}
            </h5>
          </div>
          <div className="card-body">
            <ServiceSetupForm
              service={editingService}
              categories={SERVICE_CATEGORIES}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingService(null);
              }}
              loading={formLoading}
            />
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            {/* Search */}
            <div className="col-md-6">
              <label className="form-label fw-medium">Search</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div className="col-md-6">
              <label className="form-label fw-medium">Category</label>
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {SERVICE_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="card shadow-sm">
        <div className="card-header bg-light d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            Services ({filteredServices.length})
          </h5>
          {selectedServices.length > 0 && (
            <button
              className="btn btn-sm btn-danger"
              onClick={handleBulkDelete}
            >
              <i className="bx bx-trash me-1"></i>
              Delete Selected ({selectedServices.length})
            </button>
          )}
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bx bx-package text-muted fs-1"></i>
              <p className="mt-3">No services found</p>
            </div>
          ) : (
            <ServiceSetupTable
              services={filteredServices}
              selectedServices={selectedServices}
              onSelectService={handleSelectService}
              onSelectAll={handleSelectAll}
              onEdit={handleEdit}
              onDelete={handleDelete}
              categories={SERVICE_CATEGORIES}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceSetupPage;
