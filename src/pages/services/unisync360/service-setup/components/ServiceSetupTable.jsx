import React from 'react';

const ServiceSetupTable = ({
  services,
  selectedServices,
  onSelectService,
  onSelectAll,
  onEdit,
  onDelete,
  categories
}) => {
  const getCategoryLabel = (categoryValue) => {
    return categories.find(c => c.value === categoryValue)?.label || categoryValue;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="table-responsive">
      <table className="table table-hover mb-0">
        <thead className="table-light">
          <tr>
            <th style={{ width: '40px' }}>
              <input
                type="checkbox"
                className="form-check-input"
                checked={selectedServices.length === services.length && services.length > 0}
                onChange={onSelectAll}
              />
            </th>
            <th>Service Name</th>
            <th>Code</th>
            <th>Category</th>
            <th>Effective Date</th>
            <th>Version</th>
            <th>Consent</th>
            <th style={{ width: '100px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service.uid}>
              <td>
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={selectedServices.includes(service.uid)}
                  onChange={() => onSelectService(service.uid)}
                />
              </td>
              <td>
                <div className="fw-medium">{service.name}</div>
                {service.summary && (
                  <small className="text-muted d-block">{service.summary.substring(0, 50)}...</small>
                )}
              </td>
              <td>
                <code className="bg-light px-2 py-1 rounded">{service.code}</code>
              </td>
              <td>
                <span className="badge bg-info text-dark">
                  {getCategoryLabel(service.category)}
                </span>
              </td>
              <td>{formatDate(service.effective_date)}</td>
              <td>{service.version}</td>
              <td>
                {service.requires_consent ? (
                  <span className="badge bg-success">Required</span>
                ) : (
                  <span className="badge bg-secondary">Optional</span>
                )}
              </td>
              <td>
                <div className="btn-group btn-group-sm" role="group">
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => onEdit(service)}
                    title="Edit service"
                  >
                    <i className="bx bx-edit-alt"></i>
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => onDelete(service)}
                    title="Delete service"
                  >
                    <i className="bx bx-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ServiceSetupTable;
