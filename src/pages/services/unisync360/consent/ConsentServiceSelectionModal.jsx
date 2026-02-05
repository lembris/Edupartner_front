import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { fetchConsentServices, createConsentServiceSelection } from "./Queries";

const ConsentServiceSelectionModal = ({ show, onHide, consentRequestId, onSuccess }) => {
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState("");
    const [agreed, setAgreed] = useState(false);
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingServices, setLoadingServices] = useState(true);

    useEffect(() => {
        if (show) {
            loadServices();
        }
    }, [show]);

    const loadServices = async () => {
        try {
            setLoadingServices(true);
            const data = await fetchConsentServices();
            setServices(data.results || data);
        } catch (error) {
            console.error("Error loading services:", error);
            Swal.fire("Error!", "Failed to load services.", "error");
        } finally {
            setLoadingServices(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedService) {
            Swal.fire("Error!", "Please select a service.", "error");
            return;
        }

        try {
            setLoading(true);
            await createConsentServiceSelection({
                consent_request: consentRequestId,
                consent_service: selectedService,
                agreed,
                notes
            });
            Swal.fire("Success!", "Service selection added successfully.", "success");
            setSelectedService("");
            setAgreed(false);
            setNotes("");
            onSuccess();
        } catch (error) {
            console.error("Error adding service selection:", error);
            Swal.fire("Error!", error.message || "Failed to add service selection.", "error");
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Add Service Selection</h5>
                        <button type="button" className="btn-close" onClick={onHide}></button>
                    </div>
                    <div className="modal-body">
                        {loadingServices ? (
                            <p>Loading services...</p>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Service *</label>
                                    <select
                                        value={selectedService}
                                        onChange={(e) => setSelectedService(e.target.value)}
                                        className="form-select"
                                    >
                                        <option value="">Select a service...</option>
                                        {services.map((service) => (
                                            <option key={service.uid} value={service.uid}>
                                                {service.name} ({service.category})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedService && (
                                    <div className="alert alert-info">
                                        {services.find(s => s.uid === selectedService)?.description}
                                    </div>
                                )}

                                <div className="mb-3">
                                    <div className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="agreeTerms"
                                            checked={agreed}
                                            onChange={(e) => setAgreed(e.target.checked)}
                                        />
                                        <label className="form-check-label" htmlFor="agreeTerms">
                                            I agree to this service terms
                                        </label>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Notes (Optional)</label>
                                    <textarea
                                        rows={3}
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="form-control"
                                        placeholder="Add any additional notes..."
                                    />
                                </div>
                            </form>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onHide}>
                            Cancel
                        </button>
                        <button 
                            type="button"
                            className="btn btn-primary" 
                            onClick={handleSubmit}
                            disabled={loading || !selectedService || loadingServices}
                        >
                            {loading ? "Adding..." : "Add Service"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConsentServiceSelectionModal;
