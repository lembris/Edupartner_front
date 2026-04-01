import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { dashboardService, searchService } from "../LcQueries";

const LeadClonerDashboard = () => {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [searches, setSearches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Search form state
    const [query, setQuery] = useState("");
    const [location, setLocation] = useState("");
    const [searchType, setSearchType] = useState("google_maps");

    const fetchData = async () => {
        try {
            setLoading(true);
            const [dashboard, searchList] = await Promise.all([
                dashboardService.getDashboard(),
                searchService.getAll({ page: 1, page_size: 10 }),
            ]);
            setDashboardData(dashboard?.data || dashboard);
            setSearches(searchList?.data || searchList?.results || []);
        } catch (err) {
            console.error("Dashboard fetch error:", err);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to load dashboard data.",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) {
            Swal.fire({ icon: "warning", title: "Required", text: "Please enter a search query." });
            return;
        }
        try {
            setSubmitting(true);
            await searchService.create({
                query: query.trim(),
                location: location.trim(),
                search_type: searchType,
            });
            Swal.fire({ icon: "success", title: "Search Created", text: "Your search has been queued.", timer: 1500 });
            setQuery("");
            setLocation("");
            fetchData();
        } catch (err) {
            console.error("Search create error:", err);
            Swal.fire({ icon: "error", title: "Error", text: "Failed to create search." });
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status) => {
        const map = {
            pending: "bg-warning",
            running: "bg-info",
            completed: "bg-success",
            failed: "bg-danger",
        };
        return map[status] || "bg-secondary";
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading Lead Cloner dashboard...</p>
                </div>
            </div>
        );
    }

    const {
        total_searches = 0,
        total_leads = 0,
        total_exports = 0,
    } = dashboardData || {};

    return (
        <>
            {/* Stats Cards */}
            <div className="row mb-4">
                <div className="col-sm-6 col-lg-4 mb-4">
                    <div className="card h-100">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="avatar flex-shrink-0">
                                    <div className="bg-primary rounded p-2">
                                        <i className="bx bx-search text-white"></i>
                                    </div>
                                </div>
                                <div className="ms-3">
                                    <span className="fw-medium d-block mb-1">Total Searches</span>
                                    <h3 className="card-title mb-0">{total_searches}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-sm-6 col-lg-4 mb-4">
                    <div className="card h-100">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="avatar flex-shrink-0">
                                    <div className="bg-success rounded p-2">
                                        <i className="bx bx-group text-white"></i>
                                    </div>
                                </div>
                                <div className="ms-3">
                                    <span className="fw-medium d-block mb-1">Total Leads</span>
                                    <h3 className="card-title mb-0">{total_leads}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-sm-6 col-lg-4 mb-4">
                    <div className="card h-100">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="avatar flex-shrink-0">
                                    <div className="bg-info rounded p-2">
                                        <i className="bx bx-export text-white"></i>
                                    </div>
                                </div>
                                <div className="ms-3">
                                    <span className="fw-medium d-block mb-1">Exports</span>
                                    <h3 className="card-title mb-0">{total_exports}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Form */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="card-title mb-0">
                                <i className="bx bx-search-alt-2 me-2"></i>
                                New Lead Search
                            </h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSearch}>
                                <div className="row g-3">
                                    <div className="col-12 col-sm-6 col-lg-4">
                                        <label className="form-label">Search Query *</label>
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <i className="bx bx-search"></i>
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="e.g. Restaurants, Plumbers, Dentists..."
                                                value={query}
                                                onChange={(e) => setQuery(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12 col-sm-6 col-lg-3">
                                        <label className="form-label">Location</label>
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <i className="bx bx-map"></i>
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="e.g. New York, London..."
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12 col-sm-6 col-lg-3">
                                        <label className="form-label">Search Type</label>
                                        <select
                                            className="form-select"
                                            value={searchType}
                                            onChange={(e) => setSearchType(e.target.value)}
                                        >
                                            <option value="google_maps">Google Maps</option>
                                            <option value="google_search">Google Search</option>
                                        </select>
                                    </div>
                                    <div className="col-12 col-sm-6 col-lg-2 d-flex align-items-end">
                                        <button
                                            type="submit"
                                            className="btn btn-primary w-100"
                                            disabled={submitting}
                                        >
                                            {submitting ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-1"></span>
                                                    Searching...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bx bx-search me-1"></i>
                                                    Search
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Searches Table */}
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">Recent Searches</h5>
                            <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={fetchData}
                            >
                                <i className="bx bx-refresh me-1"></i>
                                Refresh
                            </button>
                        </div>
                        <div className="table-responsive text-nowrap">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Query</th>
                                        <th>Location</th>
                                        <th>Status</th>
                                        <th>Results</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {searches.length > 0 ? (
                                        searches.map((search) => (
                                            <tr
                                                key={search.uid}
                                                style={{ cursor: "pointer" }}
                                                onClick={() => navigate(`/lead-cloner/results/${search.uid}`)}
                                            >
                                                <td>
                                                    <strong>{search.query}</strong>
                                                </td>
                                                <td>{search.location || "—"}</td>
                                                <td>
                                                    <span className={`badge ${getStatusBadge(search.status)}`}>
                                                        {search.status}
                                                    </span>
                                                </td>
                                                <td>{search.result_count || 0}</td>
                                                <td>
                                                    {search.created_at
                                                        ? new Date(search.created_at).toLocaleDateString()
                                                        : "—"}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center py-4 text-muted">
                                                <i className="bx bx-search-alt display-4 d-block mb-2"></i>
                                                No searches yet. Create your first search above!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LeadClonerDashboard;
