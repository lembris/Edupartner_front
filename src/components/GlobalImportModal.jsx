import React, { useState, useEffect, useRef, useCallback } from "react";
import { API_BASE_URL } from "../Costants";
import api from "../api";
import showToast from "../helpers/ToastHelper";
import GlobalModal from "./modal/GlobalModal";

const ENTITY_IMPORT_URL = `${API_BASE_URL}/api/unisync360-entity-import`;

const EntityBulkImportAPI = {
    upload: async (importType, file, options = {}) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('chunk_size', options.chunkSize || 100);
        formData.append('skip_duplicates', options.skipDuplicates !== false);
        formData.append('update_existing', options.updateExisting || false);

        const response = await api.post(`${ENTITY_IMPORT_URL}/${importType}/upload/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    getJob: async (jobId) => {
        const response = await api.get(`${ENTITY_IMPORT_URL}/jobs/detail/${jobId}/`);
        return response.data;
    },

    getProgress: async (jobId) => {
        const response = await api.get(`${ENTITY_IMPORT_URL}/jobs/${jobId}/progress/`);
        return response.data;
    },

    getErrors: async (jobId, queryParams = {}) => {
        const response = await api.get(`${ENTITY_IMPORT_URL}/jobs/${jobId}/errors/`, { params: queryParams });
        return response.data;
    },

    downloadErrorReport: async (jobId) => {
        const response = await api.get(`${ENTITY_IMPORT_URL}/jobs/${jobId}/error-report/`, {
            responseType: 'blob'
        });
        return response.data;
    },

    downloadTemplate: async (importType, format = 'csv') => {
        try {
            const response = await api.get(`${ENTITY_IMPORT_URL}/${importType}/template/`, {
                params: { format },
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error('API Error downloading template:', error);
            throw error;
        }
    }
};

const ENTITY_CONFIG = {
    student: {
        title: 'Students',
        singular: 'Student',
        templateName: 'student_import_template'
    },
    university: {
        title: 'Universities',
        singular: 'University',
        templateName: 'university_import_template'
    },
    school: {
        title: 'Schools',
        singular: 'School',
        templateName: 'school_import_template'
    },
    university_course: {
        title: 'University Courses',
        singular: 'University Course',
        templateName: 'university_course_import_template'
    }
};

export const GlobalImportModal = ({ show, importType, onSuccess, onClose, size = "lg" }) => {
    const config = ENTITY_CONFIG[importType] || ENTITY_CONFIG.university;

    const [step, setStep] = useState(1);
    const [file, setFile] = useState(null);
    const [options, setOptions] = useState({
        chunkSize: 100,
        skipDuplicates: true,
        updateExisting: false
    });
    const [uploading, setUploading] = useState(false);
    const [currentJob, setCurrentJob] = useState(null);
    const [progress, setProgress] = useState(null);
    const [errors, setErrors] = useState([]);

    const fileInputRef = useRef(null);
    const pollIntervalRef = useRef(null);

    useEffect(() => {
        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, []);

    useEffect(() => {
        if (!show) {
            setStep(1);
            setFile(null);
            setCurrentJob(null);
            setProgress(null);
            setErrors([]);
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        }
    }, [show]);

    const pollProgress = useCallback(async (jobId) => {
        try {
            const response = await EntityBulkImportAPI.getProgress(jobId);
            if (response.success) {
                setProgress(response.data);

                if (['completed', 'failed', 'partial', 'cancelled'].includes(response.data.status)) {
                    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

                    const jobResponse = await EntityBulkImportAPI.getJob(jobId);
                    if (jobResponse.success) {
                        setCurrentJob(jobResponse.data);
                    }

                    if (response.data.failed_rows > 0) {
                        const errorsResponse = await EntityBulkImportAPI.getErrors(jobId);
                        if (errorsResponse.success) {
                            setErrors(errorsResponse.data);
                        }
                    }

                    setStep(3);
                }
            }
        } catch (error) {
            console.error('Error polling progress:', error);
        }
    }, []);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const validExtensions = ['.csv', '.xlsx', '.xls'];
            const extension = selectedFile.name.toLowerCase().slice(selectedFile.name.lastIndexOf('.'));

            if (!validExtensions.includes(extension)) {
                showToast('error', 'Please select a CSV or Excel file');
                return;
            }

            if (selectedFile.size > 10 * 1024 * 1024) {
                showToast('error', 'File size must be less than 10MB');
                return;
            }

            setFile(selectedFile);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            showToast('error', 'Please select a file');
            return;
        }

        setUploading(true);
        try {
            const response = await EntityBulkImportAPI.upload(importType, file, options);

            if (response.success) {
                setCurrentJob(response.data);
                setStep(2);

                pollIntervalRef.current = setInterval(() => {
                    pollProgress(response.data.job_id);
                }, 2000);

                pollProgress(response.data.job_id);
            } else {
                showToast('error', response.message || 'Upload failed');
            }
        } catch (error) {
            showToast('error', error.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDownloadTemplate = async (format = 'csv') => {
        try {
            const blob = await EntityBulkImportAPI.downloadTemplate(importType, format);
            if (!blob || blob.size === 0) {
                throw new Error('Empty response received');
            }
            const url = window.URL.createObjectURL(new Blob([blob]));
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `${config.templateName}.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            showToast('success', 'Template downloaded successfully');
        } catch (error) {
            console.error('Template download error:', error);
            showToast('error', 'Failed to download template: ' + (error.message || 'Unknown error'));
        }
    };

    const handleDownloadErrorReport = async () => {
        if (!currentJob?.job_id) return;
        try {
            const blob = await EntityBulkImportAPI.downloadErrorReport(currentJob.job_id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `error_report_${currentJob.job_id}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            showToast('error', 'Failed to download error report');
        }
    };

    const handleClose = () => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        if (step === 3 && currentJob?.successful_rows > 0 && onSuccess) {
            onSuccess();
        }
        if (onClose) onClose();
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: 'bg-secondary',
            processing: 'bg-info',
            completed: 'bg-success',
            failed: 'bg-danger',
            partial: 'bg-warning',
            cancelled: 'bg-dark'
        };
        return badges[status] || 'bg-secondary';
    };

    const renderProgressSteps = () => (
        <div className="d-flex justify-content-between position-relative mb-4">
            <div className="position-absolute top-50 start-0 end-0" style={{ height: '2px', backgroundColor: '#e9ecef', zIndex: 0 }}></div>
            {['Upload', 'Processing', 'Results'].map((label, idx) => (
                <div key={idx} className="text-center position-relative" style={{ zIndex: 1 }}>
                    <div
                        className={`rounded-circle d-inline-flex align-items-center justify-content-center ${
                            step > idx + 1 ? 'bg-success' : step === idx + 1 ? 'bg-primary' : 'bg-secondary'
                        }`}
                        style={{ width: '32px', height: '32px', color: 'white' }}
                    >
                        {step > idx + 1 ? <i className="bx bx-check"></i> : idx + 1}
                    </div>
                    <div className={`small mt-1 ${step === idx + 1 ? 'fw-bold' : 'text-muted'}`}>
                        {label}
                    </div>
                </div>
            ))}
        </div>
    );

    if (!show) return null;

    const renderFooter = () => (
        <div className="d-flex justify-content-end gap-2">
            {step === 1 && (
                <>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleClose}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleUpload}
                        disabled={!file || uploading}
                    >
                        {uploading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-1"></span>
                                Uploading...
                            </>
                        ) : (
                            <>
                                <i className="bx bx-upload me-1"></i>
                                Start Import
                            </>
                        )}
                    </button>
                </>
            )}
            {step === 3 && (
                <>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleClose}
                    >
                        <i className="bx bx-check me-1"></i>
                        Done
                    </button>
                </>
            )}
        </div>
    );

    const renderStep1 = () => (
        <>
            <div className="alert alert-info mb-3">
                <div className="d-flex align-items-center justify-content-between">
                    <div>
                        <i className="bx bx-info-circle me-2"></i>
                        <strong>Download Template:</strong> Use our template for correct format
                    </div>
                    <div className="btn-group">
                        <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleDownloadTemplate('csv')}
                        >
                            <i className="bx bx-file me-1"></i>CSV
                        </button>
                        <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleDownloadTemplate('xlsx')}
                        >
                            <i className="bx bx-file me-1"></i>Excel
                        </button>
                    </div>
                </div>
            </div>

            <div className="mb-3">
                <label className="form-label fw-bold">Select File *</label>
                <div
                    className="border rounded p-4 text-center"
                    style={{
                        borderStyle: 'dashed',
                        cursor: 'pointer',
                        backgroundColor: file ? '#e8f5e9' : '#fafafa'
                    }}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".csv,.xlsx,.xls"
                        style={{ display: 'none' }}
                    />
                    {file ? (
                        <div>
                            <i className="bx bx-check-circle text-success fs-1"></i>
                            <p className="mb-0 mt-2">{file.name}</p>
                            <small className="text-muted">
                                {(file.size / 1024).toFixed(2)} KB
                            </small>
                        </div>
                    ) : (
                        <div>
                            <i className="bx bx-cloud-upload fs-1 text-muted"></i>
                            <p className="mb-0 mt-2">Click to select or drag and drop</p>
                            <small className="text-muted">CSV or Excel files up to 10MB</small>
                        </div>
                    )}
                </div>
            </div>

            <div className="mb-3">
                <label className="form-label fw-bold">Import Options</label>

                <div className="form-check mb-2">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        id="skipDuplicates"
                        checked={options.skipDuplicates}
                        onChange={(e) => setOptions({ ...options, skipDuplicates: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="skipDuplicates">
                        Skip duplicate entries
                    </label>
                </div>

                <div className="form-check mb-2">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        id="updateExisting"
                        checked={options.updateExisting}
                        onChange={(e) => setOptions({ ...options, updateExisting: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="updateExisting">
                        Update existing entries
                    </label>
                </div>

                <div className="mt-3">
                    <label className="form-label">Chunk Size</label>
                    <select
                        className="form-select"
                        value={options.chunkSize}
                        onChange={(e) => setOptions({ ...options, chunkSize: parseInt(e.target.value) })}
                    >
                        <option value="50">50 rows per chunk</option>
                        <option value="100">100 rows per chunk</option>
                        <option value="200">200 rows per chunk</option>
                        <option value="500">500 rows per chunk</option>
                    </select>
                </div>
            </div>
        </>
    );

    const renderStep2 = () => (
        <div className="text-center py-5">
            <div className="mb-4">
                <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Processing...</span>
                </div>
            </div>

            <h5>Processing Import</h5>
            <p className="text-muted">Please wait while we process your file...</p>

            {progress && (
                <div className="mt-4">
                    <div className="progress mb-3" style={{ height: '25px' }}>
                        <div
                            className="progress-bar progress-bar-striped progress-bar-animated"
                            role="progressbar"
                            style={{ width: `${progress.progress_percentage}%` }}
                        >
                            {progress.progress_percentage.toFixed(1)}%
                        </div>
                    </div>

                    <div className="row text-center">
                        <div className="col">
                            <h4 className="mb-0">{progress.processed_rows}</h4>
                            <small className="text-muted">Processed</small>
                        </div>
                        <div className="col">
                            <h4 className="mb-0">{progress.total_rows}</h4>
                            <small className="text-muted">Total</small>
                        </div>
                        <div className="col">
                            <h4 className="mb-0 text-success">{progress.successful_rows}</h4>
                            <small className="text-muted">Success</small>
                        </div>
                        <div className="col">
                            <h4 className="mb-0 text-danger">{progress.failed_rows}</h4>
                            <small className="text-muted">Failed</small>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderStep3 = () => (
        <>
            <div className={`alert ${
                currentJob?.status === 'completed' ? 'alert-success' : 
                currentJob?.status === 'failed' ? 'alert-danger' : 'alert-warning'
            } mb-3`}>
                <div className="d-flex align-items-center">
                    <i className={`bx ${
                        currentJob?.status === 'completed' ? 'bx-check-circle' : 
                        currentJob?.status === 'failed' ? 'bx-x-circle' : 'bx-error'
                    } fs-3 me-3`}></i>
                    <div>
                        <h5 className="mb-1">
                            Import {currentJob?.status === 'completed' ? 'Completed' : 
                                   currentJob?.status === 'failed' ? 'Failed' : 'Partially Completed'}
                        </h5>
                        <span className={`badge ${getStatusBadge(currentJob?.status)}`}>
                            {currentJob?.status?.toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>

            <div className="row g-3 mb-3">
                <div className="col-6 col-md-3">
                    <div className="card border-0 bg-light">
                        <div className="card-body text-center">
                            <h3 className="mb-0">{currentJob?.total_rows || 0}</h3>
                            <small className="text-muted">Total Rows</small>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <div className="card border-0 bg-success bg-opacity-10">
                        <div className="card-body text-center">
                            <h3 className="mb-0 text-success">{currentJob?.successful_rows || 0}</h3>
                            <small className="text-muted">Successful</small>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <div className="card border-0 bg-danger bg-opacity-10">
                        <div className="card-body text-center">
                            <h3 className="mb-0 text-danger">{currentJob?.failed_rows || 0}</h3>
                            <small className="text-muted">Failed</small>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <div className="card border-0 bg-warning bg-opacity-10">
                        <div className="card-body text-center">
                            <h3 className="mb-0 text-warning">{currentJob?.skipped_rows || 0}</h3>
                            <small className="text-muted">Skipped</small>
                        </div>
                    </div>
                </div>
            </div>

            {errors.length > 0 && (
                <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="mb-0">Errors ({errors.length})</h6>
                        <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={handleDownloadErrorReport}
                        >
                            <i className="bx bx-download me-1"></i>
                            Download Error Report
                        </button>
                    </div>
                    <div className="table-responsive" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        <table className="table table-sm table-bordered mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Row</th>
                                    <th>Field</th>
                                    <th>Error</th>
                                </tr>
                            </thead>
                            <tbody>
                                {errors.slice(0, 10).map((error, idx) => (
                                    <tr key={idx}>
                                        <td>{error.row_number}</td>
                                        <td>{error.field_name || '-'}</td>
                                        <td>{error.error_message}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {errors.length > 10 && (
                            <p className="text-muted small mt-2 mb-0">
                                Showing 10 of {errors.length} errors. Download the full report for details.
                            </p>
                        )}
                    </div>
                </div>
            )}

            {currentJob?.duration && (
                <p className="text-muted small">
                    <i className="bx bx-time me-1"></i>
                    Completed in {currentJob.duration.toFixed(2)} seconds
                </p>
            )}
        </>
    );

    return (
        <GlobalModal
            show={show}
            onClose={handleClose}
            title={<><i className="bx bx-import me-2"></i>Bulk Import {config.title}</>}
            size={size}
            showFooter={true}
            footerContent={renderFooter()}
        >
            {renderProgressSteps()}
            
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
        </GlobalModal>
    );
};

export default GlobalImportModal;
