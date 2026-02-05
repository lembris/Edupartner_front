import React, { useState } from "react";
import "animate.css";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import BreadCumb from "../../../../layouts/BreadCumb";
import PaginatedTable from "../../../../components/ui-templates/PaginatedTable";
import { formatDate } from "../../../../helpers/DateFormater";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { deleteConsentService, updateConsentService } from "./Queries";
import ServiceSetupModal from "./ServiceSetupModal";
import { hasAccess } from "../../../../hooks/AccessHandler";

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

export const ServiceSetupListPage = () => {
  const [selectedObj, setSelectedObj] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [tableRefresh, setTableRefresh] = useState(0);
  const navigate = useNavigate();
  const user = useSelector((state) => state.userReducer?.data);

  const getCategoryLabel = (categoryValue) => {
    return SERVICE_CATEGORIES.find(c => c.value === categoryValue)?.label || categoryValue;
  };

  const getStatusBadge = (isActive) => {
    return isActive ? "badge bg-success" : "badge bg-secondary";
  };

  const handleDelete = async (service) => {
    if (!service) return;

    try {
      const confirmation = await Swal.fire({
        title: "Are you sure?",
        text: `You're about to delete "${service.name}" service`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        cancelButtonColor: "#aaa",
        confirmButtonText: "Yes, delete it!",
      });

      if (confirmation.isConfirmed) {
        await deleteConsentService(service.uid);
        Swal.fire(
          "Deleted!",
          "The service has been deleted successfully.",
          "success"
        );
        setTableRefresh((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      Swal.fire(
        "Error!",
        "Unable to delete service. Please try again or contact support.",
        "error"
      );
    }
  };

  const handleAddNew = () => {
    setSelectedObj(null);
    setShowModal(true);
  };

  const handleEdit = (service) => {
    setSelectedObj(service);
    setShowModal(true);
  };

  const handleToggleActive = async (service) => {
    try {
      const newStatus = !service.requires_consent;
      const confirmation = await Swal.fire({
        title: "Update Service Status?",
        text: `Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} this service?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#28a745",
        cancelButtonColor: "#aaa",
        confirmButtonText: "Yes, update it!",
      });

      if (confirmation.isConfirmed) {
        await updateConsentService(service.uid, {
          requires_consent: newStatus
        });
        Swal.fire(
          "Updated!",
          "The service status has been updated successfully.",
          "success"
        );
        setTableRefresh((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error updating service:", error);
      Swal.fire(
        "Error!",
        "Unable to update service status. Please try again or contact support.",
        "error"
      );
    }
  };

  const handleExport = async (service) => {
    try {
      const csvContent = [
        ["Service Details"],
        [],
        ["Name", service.name],
        ["Code", service.code],
        ["Category", getCategoryLabel(service.category)],
        ["Description", service.description || "-"],
        ["Requires Consent", service.requires_consent ? "Yes" : "No"],
        ["Version", service.version],
        ["Effective Date", formatDate(service.effective_date)],
        ["Expiry Date", service.expiry_date ? formatDate(service.expiry_date) : "-"],
        ["Min Age Requirement", service.min_age_requirement],
        ["Requires Parental Consent", service.requires_parental_consent ? "Yes" : "No"],
        ["Legal Reference", service.legal_reference || "-"],
      ]
        .map(row => row.map(cell => `"${cell}"`).join(","))
        .join("\n");

      const element = document.createElement("a");
      element.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent));
      element.setAttribute("download", `service_${service.uid}.csv`);
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      Swal.fire("Success!", "Service exported successfully.", "success");
    } catch (error) {
      console.error("Error exporting service:", error);
      Swal.fire(
        "Error!",
        "Unable to export service. Please try again.",
        "error"
      );
    }
  };

  return (
    <>
      <BreadCumb pageList={["Services", "Consent Service Setup"]} />
      
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Consent Services</h4>
        {hasAccess(user?.roles, user?.permissions, [], ["add_consentservice"]) && (
          <button 
            className="btn btn-primary" 
            onClick={handleAddNew}
          >
            <i className="bx bx-plus"></i> New Service
          </button>
        )}
      </div>

      <PaginatedTable
        fetchPath="/unisync360-consent-services/"
        title="Consent Services"
        isRefresh={tableRefresh}
        columns={[
          {
            label: "Service Name",
            render: (item) => (
              <div>
                <Link 
                  to={`/unisync360/service-setup/${item.uid}`}
                  className="text-primary fw-semibold text-decoration-none"
                  style={{ cursor: 'pointer' }}
                >
                  <strong>{item.name}</strong>
                </Link>
                {item.summary && <small className="text-muted d-block">{item.summary.substring(0, 50)}...</small>}
              </div>
            ),
          },
          {
            label: "Code",
            render: (item) => <code className="bg-light px-2 py-1 rounded">{item.code}</code>,
          },
          {
            label: "Category",
            render: (item) => (
              <span className="badge bg-info text-dark">
                {getCategoryLabel(item.category)}
              </span>
            ),
          },
          {
            label: "Version",
            render: (item) => item.version,
          },
          {
            label: "Effective Date",
            render: (item) => formatDate(item.effective_date),
          },
          {
            label: "Requires Consent",
            render: (item) => (
              <span className={getStatusBadge(item.requires_consent)}>
                {item.requires_consent ? "Required" : "Optional"}
              </span>
            ),
          },
          {
            label: "Actions",
            render: (item) => (
              <div className="btn-group btn-group-sm" role="group">
                {hasAccess(user?.roles, user?.permissions, [], ["change_consentservice"]) && (
                  <>
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => handleEdit(item)}
                      title="Edit service"
                    >
                      <i className="bx bx-edit-alt"></i>
                    </button>
                    <button
                      className={`btn btn-outline-${item.requires_consent ? 'warning' : 'success'}`}
                      onClick={() => handleToggleActive(item)}
                      title={item.requires_consent ? "Deactivate" : "Activate"}
                    >
                      <i className={`bx ${item.requires_consent ? 'bx-check' : 'bx-x'}`}></i>
                    </button>
                  </>
                )}
                <button
                  className="btn btn-outline-info"
                  onClick={() => handleExport(item)}
                  title="Export service"
                >
                  <i className="bx bx-download"></i>
                </button>
                {hasAccess(user?.roles, user?.permissions, [], ["delete_consentservice"]) && (
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => handleDelete(item)}
                    title="Delete service"
                  >
                    <i className="bx bx-trash"></i>
                  </button>
                )}
              </div>
            ),
          },
        ]}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ServiceSetupModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedObj(null);
        }}
        service={selectedObj}
        onSuccess={() => {
          setShowModal(false);
          setSelectedObj(null);
          setTableRefresh((prev) => prev + 1);
        }}
        categories={SERVICE_CATEGORIES}
      />
    </>
  );
};

export default ServiceSetupListPage;
