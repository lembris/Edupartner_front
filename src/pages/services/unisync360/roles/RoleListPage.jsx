import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import showToast from "../../../../helpers/ToastHelper";
import BreadCumb from "../../../../layouts/BreadCumb";
import ReactLoading from "react-loading";
import { getRoles, createRole, updateRole, deleteRole } from "./RoleQueries";
import { RoleModal } from "./RoleModal";

export const RoleListPage = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tableRefresh, setTableRefresh] = useState(0);
    const [selectedRole, setSelectedRole] = useState(null);
    const [searchText, setSearchText] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchRoles();
    }, [tableRefresh]);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const response = await getRoles({ pagination: { page_size: 100 } });
            let roleList = [];
            
            if (response.data && Array.isArray(response.data)) {
                roleList = response.data;
            } else if (response.results && Array.isArray(response.results)) {
                roleList = response.results;
            } else if (Array.isArray(response)) {
                roleList = response;
            }
            
            setRoles(roleList);
        } catch (err) {
            console.error("Error fetching roles:", err);
            showToast("error", "Failed to fetch roles");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (roleId) => {
        if (window.confirm("Are you sure you want to delete this role?")) {
            try {
                await deleteRole(roleId);
                showToast("success", "Role deleted successfully");
                setTableRefresh(prev => prev + 1);
            } catch (err) {
                console.error("Error deleting role:", err);
                showToast("error", "Failed to delete role");
            }
        }
    };

    const filteredRoles = roles.filter((role) =>
        role.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        role.description?.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <>
            <BreadCumb
                title="User Roles Management"
                breadcrumbs={[
                    { label: "Home", link: "/" },
                    { label: "UniSync360", link: "/unisync360/dashboard" },
                    { label: "Settings", link: "#" },
                    { label: "User Roles", link: "/unisync360/roles", active: true }
                ]}
            />

            <div className="container-xxl flex-grow-1 container-p-y">
                <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                            <i className="bx bx-shield me-2"></i>User Roles
                        </h5>
                        <button
                            className="btn btn-primary"
                            data-bs-toggle="modal"
                            data-bs-target="#roleModal"
                            onClick={() => setSelectedRole(null)}
                        >
                            <i className="bx bx-plus me-1"></i>Add New Role
                        </button>
                    </div>

                    <div className="card-body">
                        <div className="row mb-3">
                            <div className="col-md-6">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search roles..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                />
                            </div>
                            <div className="col-md-6 text-end">
                                <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => setTableRefresh(prev => prev + 1)}
                                >
                                    <i className="bx bx-refresh me-1"></i>Refresh
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
                                <ReactLoading type="spin" color="#0066ff" height={40} width={40} />
                            </div>
                        ) : filteredRoles.length === 0 ? (
                            <div className="alert alert-info" role="alert">
                                <i className="bx bx-info-circle me-2"></i>
                                No roles found
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Role Name</th>
                                            <th>Description</th>
                                            <th>Status</th>
                                            <th>Created Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRoles.map((role) => (
                                            <tr key={role.id || role.uid}>
                                                <td>
                                                    <strong>{role.name}</strong>
                                                </td>
                                                <td>{role.description || "-"}</td>
                                                <td>
                                                    {role.is_active ? (
                                                        <span className="badge bg-success">Active</span>
                                                    ) : (
                                                        <span className="badge bg-secondary">Inactive</span>
                                                    )}
                                                </td>
                                                <td>{new Date(role.created_at).toLocaleDateString()}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-info me-2"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#roleModal"
                                                        onClick={() => setSelectedRole(role)}
                                                        title="Edit"
                                                    >
                                                        <i className="bx bx-edit"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => handleDelete(role.id || role.uid)}
                                                        title="Delete"
                                                    >
                                                        <i className="bx bx-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <RoleModal
                selectedRole={selectedRole}
                onSuccess={() => {
                    setTableRefresh(prev => prev + 1);
                    setSelectedRole(null);
                }}
            />
        </>
    );
};
