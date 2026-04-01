import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
    getVisits,
    getVitals,
    getConsultations,
    getDiagnoses,
    getLabOrders,
    getLabOrderItems,
    getPrescriptions,
    getPrescriptionItems,
    getPayments,
} from "../Queries";

export const VisitSummaryModal = ({ patient, visit, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [vitals, setVitals] = useState([]);
    const [consultations, setConsultations] = useState([]);
    const [diagnoses, setDiagnoses] = useState([]);
    const [labOrders, setLabOrders] = useState([]);
    const [labOrderItems, setLabOrderItems] = useState({});
    const [prescriptions, setPrescriptions] = useState([]);
    const [prescriptionItems, setPrescriptionItems] = useState({});
    const [payments, setPayments] = useState([]);
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        document.body.style.overflow = "hidden";
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose?.();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.body.style.overflow = "";
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]);

    useEffect(() => {
        if (visit?.uid) {
            loadAllData();
        }
    }, [visit?.uid]);

    const loadAllData = async () => {
        setLoading(true);
        try {
            const visitUid = visit.uid;

            const [vitalsRes, consultationsRes, diagnosesRes, labOrdersRes, prescriptionsRes, paymentsRes] = await Promise.all([
                getVitals({ search: visitUid }),
                getConsultations({ search: visitUid }),
                getDiagnoses({ search: visitUid }),
                getLabOrders({ search: visitUid }),
                getPrescriptions({ search: visitUid }),
                getPayments({ search: visitUid }),
            ]);

            if (vitalsRes?.status === 8000) {
                const vitalsData = vitalsRes.data?.results || vitalsRes.data || [];
                setVitals(vitalsData.filter(v => v.visit === visitUid || v.visit?.uid === visitUid));
            }

            if (consultationsRes?.status === 8000) {
                const consData = consultationsRes.data?.results || consultationsRes.data || [];
                setConsultations(consData.filter(c => c.visit === visitUid));
            }

            if (diagnosesRes?.status === 8000) {
                const diagData = diagnosesRes.data?.results || diagnosesRes.data || [];
                setDiagnoses(diagData.filter(d => d.consultation && consultations.some(c => c.uid === d.consultation)));
            }

            if (labOrdersRes?.status === 8000) {
                const orders = labOrdersRes.data?.results || labOrdersRes.data || [];
                const visitOrders = orders.filter(o => o.consultation && consultations.some(c => c.uid === o.consultation));
                setLabOrders(visitOrders);

                const orderUids = visitOrders.map(o => o.uid).filter(Boolean);
                if (orderUids.length > 0) {
                    const itemsRes = await getLabOrderItems({ pagination: { page_size: 100 } });
                    if (itemsRes?.status === 8000) {
                        const allItems = itemsRes.data?.results || itemsRes.data || [];
                        const itemsByOrder = {};
                        allItems.filter(i => orderUids.includes(i.lab_order)).forEach(item => {
                            if (!itemsByOrder[item.lab_order]) itemsByOrder[item.lab_order] = [];
                            itemsByOrder[item.lab_order].push(item);
                        });
                        setLabOrderItems(itemsByOrder);
                    }
                }
            }

            if (prescriptionsRes?.status === 8000) {
                const pres = prescriptionsRes.data?.results || prescriptionsRes.data || [];
                const visitPres = pres.filter(p => p.consultation && consultations.some(c => c.uid === p.consultation));
                setPrescriptions(visitPres);

                const presUids = visitPres.map(p => p.uid).filter(Boolean);
                if (presUids.length > 0) {
                    const itemsRes = await getPrescriptionItems({ pagination: { page_size: 100 } });
                    if (itemsRes?.status === 8000) {
                        const allItems = itemsRes.data?.results || itemsRes.data || [];
                        const itemsByPres = {};
                        allItems.filter(i => presUids.includes(i.prescription)).forEach(item => {
                            if (!itemsByPres[item.prescription]) itemsByPres[item.prescription] = [];
                            itemsByPres[item.prescription].push(item);
                        });
                        setPrescriptionItems(itemsByPres);
                    }
                }
            }

            if (paymentsRes?.status === 8000) {
                const payData = paymentsRes.data?.results || paymentsRes.data || [];
                setPayments(payData.filter(p => p.visit === visitUid || p.visit?.uid === visitUid));
            }
        } catch (err) {
            console.error("Error loading visit summary:", err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("en-GB", {
            day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
        });
    };

    const totalLabCharges = labOrders.reduce((sum, order) => {
        const items = labOrderItems[order.uid] || [];
        return sum + items.reduce((s, i) => s + (parseFloat(i.charge) || 0), 0);
    }, 0);

    const totalPrescriptionCharges = prescriptions.reduce((sum, pres) => {
        const items = prescriptionItems[pres.uid] || [];
        return sum + items.reduce((s, i) => s + (parseFloat(i.total_price) || 0), 0);
    }, 0);

    const totalPayments = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    return createPortal(
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
        }}>
            <div style={{
                width: "900px", maxWidth: "98vw", maxHeight: "90vh",
                display: "flex", flexDirection: "column", borderRadius: "0.5rem",
                overflow: "hidden", backgroundColor: "#fff",
            }}>
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "1rem 1.5rem", borderBottom: "1px solid #e2e8f0",
                    backgroundColor: "#f1f5f9", flexShrink: 0,
                }}>
                    <h5 style={{ margin: 0, fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <i className="bx bx-file"></i>
                        Patient Visit Summary
                    </h5>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            border: "none", background: "#6b7280", color: "#fff",
                            borderRadius: "50%", width: "1.75rem", height: "1.75rem",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", fontSize: "1.1rem", padding: 0, lineHeight: 1,
                        }}
                    >
                        <i className="bx bx-x"></i>
                    </button>
                </div>

                <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #e2e8f0" }}>
                    <div className="d-flex flex-wrap gap-3">
                        <div className="badge bg-primary bg-opacity-10 text-primary px-3 py-2">
                            <i className="bx bx-user me-1"></i>
                            {patient?.first_name} {patient?.last_name}
                            {patient?.patient_id && <span className="ms-1 opacity-75">({patient.patient_id})</span>}
                        </div>
                        <div className="badge bg-info bg-opacity-10 text-info px-3 py-2">
                            <i className="bx bx-calendar me-1"></i>
                            Visit: {visit?.visit_number || visit?.uid?.substring(0, 8)}
                            {visit?.visit_type && <span className="ms-1">({visit.visit_type})</span>}
                        </div>
                        <div className="badge bg-success bg-opacity-10 text-success px-3 py-2">
                            <i className="bx bx-time me-1"></i>
                            {formatDate(visit?.visit_date || visit?.created_at)}
                        </div>
                    </div>
                </div>

                <ul className="nav nav-tabs px-3 pt-2" style={{ flexShrink: 0 }}>
                    {[
                        { key: "overview", label: "Overview", icon: "bx bx-grid-alt" },
                        { key: "vitals", label: `Vitals (${vitals.length})`, icon: "bx bx-heart" },
                        { key: "consultations", label: `Consultations (${consultations.length})`, icon: "bx bx-message-square" },
                        { key: "labs", label: `Lab Orders (${labOrders.length})`, icon: "bx bx-test-tube" },
                        { key: "prescriptions", label: `Prescriptions (${prescriptions.length})`, icon: "bx bx-capsule" },
                        { key: "payments", label: `Payments (${payments.length})`, icon: "bx bx-money" },
                    ].map(tab => (
                        <li className="nav-item" key={tab.key}>
                            <button
                                className={`nav-link ${activeTab === tab.key ? "active" : ""} btn-link`}
                                onClick={() => setActiveTab(tab.key)}
                                style={{ cursor: "pointer" }}
                            >
                                <i className={`${tab.icon} me-1`}></i>
                                {tab.label}
                            </button>
                        </li>
                    ))}
                </ul>

                <div className="modal-body" style={{ overflowY: "auto", flex: 1, padding: "1rem 1.5rem" }}>
                    {loading ? (
                        <div className="d-flex justify-content-center align-items-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            {activeTab === "overview" && (
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <div className="card border-0 shadow-sm">
                                            <div className="card-header bg-light py-2">
                                                <h6 className="mb-0"><i className="bx bx-heart text-danger me-2"></i>Vital Signs</h6>
                                            </div>
                                            <div className="card-body py-2">
                                                {vitals.length === 0 ? (
                                                    <p className="text-muted mb-0 small">No vitals recorded</p>
                                                ) : (
                                                    <div className="row g-2 small">
                                                        {vitals[0] && (
                                                            <>
                                                                <div className="col-6"><strong>BP:</strong> {vitals[0].blood_pressure_systolic}/{vitals[0].blood_pressure_diastolic} mmHg</div>
                                                                <div className="col-6"><strong>HR:</strong> {vitals[0].heart_rate} bpm</div>
                                                                <div className="col-6"><strong>Temp:</strong> {vitals[0].temperature} °C</div>
                                                                <div className="col-6"><strong>RR:</strong> {vitals[0].respiratory_rate}/min</div>
                                                                <div className="col-6"><strong>SpO2:</strong> {vitals[0].oxygen_saturation}%</div>
                                                                <div className="col-6"><strong>Weight:</strong> {vitals[0].weight} kg</div>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="card border-0 shadow-sm">
                                            <div className="card-header bg-light py-2">
                                                <h6 className="mb-0"><i className="bx bx-message-square text-success me-2"></i>Consultations</h6>
                                            </div>
                                            <div className="card-body py-2">
                                                {consultations.length === 0 ? (
                                                    <p className="text-muted mb-0 small">No consultations</p>
                                                ) : (
                                                    <ul className="list-unstyled mb-0 small">
                                                        {consultations.slice(0, 3).map(c => (
                                                            <li key={c.uid} className="mb-1">
                                                                <strong>{c.consultation_type || "General"}</strong>
                                                                <br /><span className="text-muted">{c.symptoms?.substring(0, 60) || "—"}...</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="card border-0 shadow-sm">
                                            <div className="card-header bg-light py-2">
                                                <h6 className="mb-0"><i className="bx bx-test-tube text-warning me-2"></i>Lab Orders</h6>
                                            </div>
                                            <div className="card-body py-2">
                                                {labOrders.length === 0 ? (
                                                    <p className="text-muted mb-0 small">No lab orders</p>
                                                ) : (
                                                    <div className="d-flex justify-content-between small mb-1">
                                                        <span>{labOrders.length} order(s)</span>
                                                        <span className="fw-bold">{totalLabCharges.toLocaleString()} TZS</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="card border-0 shadow-sm">
                                            <div className="card-header bg-light py-2">
                                                <h6 className="mb-0"><i className="bx bx-capsule text-secondary me-2"></i>Prescriptions</h6>
                                            </div>
                                            <div className="card-body py-2">
                                                {prescriptions.length === 0 ? (
                                                    <p className="text-muted mb-0 small">No prescriptions</p>
                                                ) : (
                                                    <div className="d-flex justify-content-between small mb-1">
                                                        <span>{prescriptions.length} prescription(s)</span>
                                                        <span className="fw-bold">{totalPrescriptionCharges.toLocaleString()} TZS</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-12">
                                        <div className="card border-0 shadow-sm bg-primary bg-opacity-5">
                                            <div className="card-body py-3">
                                                <h6 className="mb-3">Financial Summary</h6>
                                                <div className="row g-3">
                                                    <div className="col-md-4">
                                                        <div className="d-flex justify-content-between">
                                                            <span>Lab Charges:</span>
                                                            <span className="fw-bold">{totalLabCharges.toLocaleString()} TZS</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <div className="d-flex justify-content-between">
                                                            <span>Pharmacy Charges:</span>
                                                            <span className="fw-bold">{totalPrescriptionCharges.toLocaleString()} TZS</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <div className="d-flex justify-content-between">
                                                            <span>Total Paid:</span>
                                                            <span className="fw-bold text-success">{totalPayments.toLocaleString()} TZS</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "vitals" && (
                                <div>
                                    {vitals.length === 0 ? (
                                        <div className="text-center py-4 text-muted">
                                            <i className="bx bx-heart fs-1 d-block mb-2"></i>
                                            No vital signs recorded
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-sm table-bordered">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Recorded</th>
                                                        <th>BP (mmHg)</th>
                                                        <th>HR (bpm)</th>
                                                        <th>Temp (°C)</th>
                                                        <th>RR</th>
                                                        <th>SpO2 (%)</th>
                                                        <th>Weight (kg)</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {vitals.map(v => (
                                                        <tr key={v.uid}>
                                                            <td>{formatDate(v.recorded_at)}</td>
                                                            <td>{v.blood_pressure_systolic}/{v.blood_pressure_diastolic}</td>
                                                            <td>{v.heart_rate}</td>
                                                            <td>{v.temperature}</td>
                                                            <td>{v.respiratory_rate}</td>
                                                            <td>{v.oxygen_saturation}</td>
                                                            <td>{v.weight}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "consultations" && (
                                <div>
                                    {consultations.length === 0 ? (
                                        <div className="text-center py-4 text-muted">
                                            <i className="bx bx-message-square fs-1 d-block mb-2"></i>
                                            No consultations
                                        </div>
                                    ) : (
                                        consultations.map(c => (
                                            <div key={c.uid} className="card border-0 shadow-sm mb-3">
                                                <div className="card-header bg-light py-2 d-flex justify-content-between">
                                                    <span className="fw-bold">{c.consultation_type || "General Consultation"}</span>
                                                    <small className="text-muted">{formatDate(c.consultation_start)}</small>
                                                </div>
                                                <div className="card-body py-2">
                                                    <div className="row">
                                                        <div className="col-md-6 mb-2">
                                                            <small className="text-muted d-block">Chief Complaint</small>
                                                            <span>{c.chief_complaint || c.symptoms || "—"}</span>
                                                        </div>
                                                        <div className="col-md-6 mb-2">
                                                            <small className="text-muted d-block">Assessment</small>
                                                            <span>{c.assessment || "—"}</span>
                                                        </div>
                                                        <div className="col-md-6 mb-2">
                                                            <small className="text-muted d-block">Plan</small>
                                                            <span>{c.plan || "—"}</span>
                                                        </div>
                                                        <div className="col-md-6 mb-2">
                                                            <small className="text-muted d-block">Doctor</small>
                                                            <span>{c.created_by_name || c.doctor_name || "—"}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {activeTab === "labs" && (
                                <div>
                                    {labOrders.length === 0 ? (
                                        <div className="text-center py-4 text-muted">
                                            <i className="bx bx-test-tube fs-1 d-block mb-2"></i>
                                            No lab orders
                                        </div>
                                    ) : (
                                        labOrders.map(order => (
                                            <div key={order.uid} className="card border-0 shadow-sm mb-3">
                                                <div className="card-header bg-light py-2 d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <span className="fw-bold me-2">Order #{order.order_number}</span>
                                                        <span className={`badge ${order.status === "COMPLETED" ? "bg-success" : order.status === "IN_PROGRESS" ? "bg-warning" : "bg-secondary"}`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                    <small className="text-muted">{formatDate(order.ordered_at)}</small>
                                                </div>
                                                <div className="card-body py-2">
                                                    <table className="table table-sm mb-0">
                                                        <thead>
                                                            <tr>
                                                                <th>Test</th>
                                                                <th>Specimen</th>
                                                                <th>Result</th>
                                                                <th>Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {(labOrderItems[order.uid] || []).map(item => (
                                                                <tr key={item.uid}>
                                                                    <td>{item.test_name}</td>
                                                                    <td>{item.specimen_type || "—"}</td>
                                                                    <td>{item.result_value || item.result_text || "—"}</td>
                                                                    <td>
                                                                        <span className={`badge ${item.status === "COMPLETED" ? "bg-success" : "bg-warning"}`}>
                                                                            {item.status}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {activeTab === "prescriptions" && (
                                <div>
                                    {prescriptions.length === 0 ? (
                                        <div className="text-center py-4 text-muted">
                                            <i className="bx bx-capsule fs-1 d-block mb-2"></i>
                                            No prescriptions
                                        </div>
                                    ) : (
                                        prescriptions.map(pres => (
                                            <div key={pres.uid} className="card border-0 shadow-sm mb-3">
                                                <div className="card-header bg-light py-2 d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <span className="fw-bold me-2">Rx #{pres.prescription_number}</span>
                                                        <span className={`badge ${pres.status === "DISPENSED" ? "bg-success" : "bg-secondary"}`}>
                                                            {pres.status || "Active"}
                                                        </span>
                                                    </div>
                                                    <small className="text-muted">{formatDate(pres.prescribed_at)}</small>
                                                </div>
                                                <div className="card-body py-2">
                                                    <table className="table table-sm mb-0">
                                                        <thead>
                                                            <tr>
                                                                <th>Medicine</th>
                                                                <th>Qty</th>
                                                                <th>Dosage</th>
                                                                <th>Frequency</th>
                                                                <th>Duration</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {(prescriptionItems[pres.uid] || []).map(item => (
                                                                <tr key={item.uid}>
                                                                    <td>
                                                                        <div>{item.drug_name}</div>
                                                                        <small className="text-muted">{item.strength} {item.form}</small>
                                                                    </td>
                                                                    <td>{item.quantity_prescribed}</td>
                                                                    <td>{item.dosage || "—"}</td>
                                                                    <td>{item.frequency || "—"}</td>
                                                                    <td>{item.duration || "—"}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {activeTab === "payments" && (
                                <div>
                                    {payments.length === 0 ? (
                                        <div className="text-center py-4 text-muted">
                                            <i className="bx bx-money fs-1 d-block mb-2"></i>
                                            No payments recorded
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-sm table-bordered">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Date</th>
                                                        <th>Receipt #</th>
                                                        <th>Method</th>
                                                        <th>Amount</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {payments.map(p => (
                                                        <tr key={p.uid}>
                                                            <td>{formatDate(p.payment_date)}</td>
                                                            <td>{p.receipt_number || p.uid?.substring(0, 8)}</td>
                                                            <td>{p.payment_method || "—"}</td>
                                                            <td className="fw-bold">{parseFloat(p.amount || 0).toLocaleString()} TZS</td>
                                                            <td>
                                                                <span className={`badge ${p.status === "COMPLETED" ? "bg-success" : "bg-warning"}`}>
                                                                    {p.status || "Pending"}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot className="table-light">
                                                    <tr>
                                                        <td colSpan={3} className="text-end fw-bold">Total:</td>
                                                        <td className="fw-bold">{totalPayments.toLocaleString()} TZS</td>
                                                        <td></td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};
