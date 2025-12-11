import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { BulkImportAPI } from "./Queries";
import showToast from "../../../../helpers/ToastHelper";

export const BulkImportModal = ({ onSuccess, onClose }) => {
    const [step, setStep] = useState(1); // 1: Upload, 2: Processing, 3: Results
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
    
    const modalRef = useRef(null);
    const [modalInstance, setModalInstance] = useState(null);
    const pollIntervalRef = useRef(null);
    const fileInputRef = useRef(null);

    // Initialize modal
    useEffect(() => {
        let modal = null;
        if (modalRef.current && window.bootstrap) {
            modal = new window.bootstrap.Modal(modalRef.current, {
                backdrop: 'static',
                keyboard: false
            });
            setModalInstance(modal);
            modal.show();
        }
        return () => {
            if (modal) modal.hide();
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, []);

    // Handle modal close
    useEffect(() => {
        const handleHidden = () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            if (onClose) onClose();
        };
        if (modalRef.current) {
            modalRef.current.addEventListener('hidden.bs.modal', handleHidden);
        }
        return () => {
            if (modalRef.current) {
                modalRef.current.removeEventListener('hidden.bs.modal', handleHidden);
            }
        };
    }, [onClose]);

    // Poll for progress
    const pollProgress = useCallback(async (jobId) => {
        try {
            const response = await BulkImportAPI.getProgress(jobId);
            const progressData = response.data;
            setProgress(progressData);

            if (['completed', 'failed', 'partial', 'cancelled'].includes(progressData.status)) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
                
                // Fetch final job details
                const jobResponse = await BulkImportAPI.getJob(jobId);
                setCurrentJob(jobResponse.data);
                
                // Fetch errors if any
                if (progressData.failed_rows > 0) {
                    const errorsResponse = await BulkImportAPI.getErrors(jobId);
                    setErrors(errorsResponse.data?.results || []);
                }
                
                setStep(3);
            }
        } catch (error) {
            console.error('Error polling progress:', error);
        }
    }, []);

    // Handle file selection
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const validTypes = ['.csv', '.xlsx', '.xls'];
            const fileExt = '.' + selectedFile.name.split('.').pop().toLowerCase();
            
            if (!validTypes.includes(fileExt)) {
                showToast('error', 'Invalid file type. Please upload CSV or Excel file.');
                return;
            }
            
            if (selectedFile.size > 10 * 1024 * 1024) {
                showToast('error', 'File too large. Maximum size is 10MB.');
                return;
            }
            
            setFile(selectedFile);
        }
    };

    // Handle upload
    const handleUpload = async () => {
        if (!file) {
            showToast('warning', 'Please select a file to upload');
            return;
        }

        setUploading(true);
        try {
            const response = await BulkImportAPI.upload(file, options);
            const job = response.data;
            setCurrentJob(job);
            setStep(2);
            
            // Start polling for progress
            pollIntervalRef.current = setInterval(() => pollProgress(job.job_id), 2000);
            pollProgress(job.job_id);
            
            showToast('success', 'Import job started successfully');
        } catch (error) {
            console.error('Upload error:', error);
            showToast('error', error.response?.data?.message || 'Failed to start import');
        } finally {
            setUploading(false);
        }
    };

    // Download template
    const handleDownloadTemplate = async (format = 'csv') => {
        try {
            const blob = await BulkImportAPI.downloadTemplate(format);
            if (!blob || blob.size === 0) {
                throw new Error('Empty response received');
            }
            const url = window.URL.createObjectURL(new Blob([blob]));
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `student_import_template.${format}`;
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

    // Download error report
    const handleDownloadErrorReport = async () => {
        if (!currentJob?.job_id) return;
        try {
            const blob = await BulkImportAPI.downloadErrorReport(currentJob.job_id);
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

    // Close modal
    const handleClose = () => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        if (modalInstance) modalInstance.hide();
        if (step === 3 && currentJob?.successful_rows > 0 && onSuccess) {
            onSuccess();
        }
    };

    // Render upload step
    const renderUploadStep = () => (
        <div className="p-3">
            {/* Template Download Section */}
            <div className="alert alert-info mb-4">
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

            {/* File Upload */}
            <div className="mb-4">
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
                        ref={fileInputRef}
                        type="file"
                        className="d-none"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileChange}
                    />
                    {file ? (
                        <div>
                            <i className="bx bx-check-circle text-success display-4"></i>
                            <p className="mb-0 mt-2 fw-medium">{file.name}</p>
                            <small className="text-muted">
                                {(file.size / 1024).toFixed(2)} KB
                            </small>
                        </div>
                    ) : (
                        <div>
                            <i className="bx bx-cloud-upload text-primary display-4"></i>
                            <p className="mb-0 mt-2">Click to select CSV or Excel file</p>
                            <small className="text-muted">Max file size: 10MB</small>
                        </div>
                    )}
                </div>
            </div>

            {/* Options */}
            <div className="row mb-4">
                <div className="col-md-4">
                    <label className="form-label">Chunk Size</label>
                    <select 
                        className="form-select"
                        value={options.chunkSize}
                        onChange={(e) => setOptions({...options, chunkSize: parseInt(e.target.value)})}
                    >
                        <option value={100}>100 rows per batch</option>
                        <option value={500}>500 rows per batch</option>
                        <option value={1000}>1000 rows per batch</option>
                    </select>
                </div>
                <div className="col-md-4">
                    <label className="form-label d-block">&nbsp;</label>
                    <div className="form-check">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            id="skipDuplicates"
                            checked={options.skipDuplicates}
                            onChange={(e) => setOptions({
                                ...options, 
                                skipDuplicates: e.target.checked,
                                updateExisting: e.target.checked ? options.updateExisting : true
                            })}
                        />
                        <label className="form-check-label" htmlFor="skipDuplicates">
                            Skip duplicate emails
                        </label>
                    </div>
                </div>
                <div className="col-md-4">
                    <label className="form-label d-block">&nbsp;</label>
                    <div className="form-check">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            id="updateExisting"
                            checked={options.updateExisting}
                            disabled={!options.skipDuplicates}
                            onChange={(e) => setOptions({...options, updateExisting: e.target.checked})}
                        />
                        <label className="form-check-label" htmlFor="updateExisting">
                            Update existing records
                        </label>
                    </div>
                </div>
            </div>

            {/* Required Fields Info */}
            <div className="alert alert-secondary">
                <h6 className="alert-heading mb-2">
                    <i className="bx bx-list-check me-1"></i>Required Fields:
                </h6>
                <small>
                    first_name, last_name, date_of_birth, gender, personal_email, personal_phone, 
                    address, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship
                </small>
            </div>
        </div>
    );

    // Render processing step
    const renderProcessingStep = () => (
        <div className="p-4 text-center">
            <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Processing...</span>
            </div>
            <h5>Processing Import</h5>
            <p className="text-muted mb-4">
                Job ID: <strong>{currentJob?.job_id}</strong>
            </p>

            {progress && (
                <>
                    <div className="progress mb-3" style={{ height: '25px' }}>
                        <div
                            className="progress-bar progress-bar-striped progress-bar-animated"
                            role="progressbar"
                            style={{ width: `${progress.progress_percentage}%` }}
                        >
                            {progress.progress_percentage}%
                        </div>
                    </div>

                    <div className="row text-center">
                        <div className="col">
                            <h4 className="mb-0">{progress.processed_rows}</h4>
                            <small className="text-muted">Processed</small>
                        </div>
                        <div className="col">
                            <h4 className="mb-0 text-success">{progress.successful_rows}</h4>
                            <small className="text-muted">Successful</small>
                        </div>
                        <div className="col">
                            <h4 className="mb-0 text-danger">{progress.failed_rows}</h4>
                            <small className="text-muted">Failed</small>
                        </div>
                        <div className="col">
                            <h4 className="mb-0 text-warning">{progress.skipped_rows}</h4>
                            <small className="text-muted">Skipped</small>
                        </div>
                    </div>
                </>
            )}

            <p className="text-muted mt-4">
                <i className="bx bx-info-circle me-1"></i>
                You can close this window. The import will continue in the background.
            </p>
        </div>
    );

    // Render results step
    const renderResultsStep = () => {
        const isSuccess = currentJob?.status === 'completed';
        const isPartial = currentJob?.status === 'partial';
        const isFailed = currentJob?.status === 'failed';

        return (
            <div className="p-4">
                <div className="text-center mb-4">
                    {isSuccess && (
                        <i className="bx bx-check-circle text-success display-1"></i>
                    )}
                    {isPartial && (
                        <i className="bx bx-error-circle text-warning display-1"></i>
                    )}
                    {isFailed && (
                        <i className="bx bx-x-circle text-danger display-1"></i>
                    )}
                    <h4 className="mt-3">
                        {isSuccess && 'Import Completed Successfully'}
                        {isPartial && 'Import Partially Completed'}
                        {isFailed && 'Import Failed'}
                    </h4>
                </div>

                {/* Summary Stats */}
                <div className="row text-center mb-4">
                    <div className="col-3">
                        <div className="border rounded p-3">
                            <h3 className="mb-0">{currentJob?.total_rows || 0}</h3>
                            <small className="text-muted">Total Rows</small>
                        </div>
                    </div>
                    <div className="col-3">
                        <div className="border rounded p-3 bg-success bg-opacity-10">
                            <h3 className="mb-0 text-success">{currentJob?.successful_rows || 0}</h3>
                            <small className="text-muted">Imported</small>
                        </div>
                    </div>
                    <div className="col-3">
                        <div className="border rounded p-3 bg-danger bg-opacity-10">
                            <h3 className="mb-0 text-danger">{currentJob?.failed_rows || 0}</h3>
                            <small className="text-muted">Failed</small>
                        </div>
                    </div>
                    <div className="col-3">
                        <div className="border rounded p-3 bg-warning bg-opacity-10">
                            <h3 className="mb-0 text-warning">{currentJob?.skipped_rows || 0}</h3>
                            <small className="text-muted">Skipped</small>
                        </div>
                    </div>
                </div>

                {/* Error Details */}
                {errors.length > 0 && (
                    <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="mb-0">Error Details (First 10)</h6>
                            <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={handleDownloadErrorReport}
                            >
                                <i className="bx bx-download me-1"></i>
                                Download Full Report
                            </button>
                        </div>
                        <div className="table-responsive" style={{ maxHeight: '200px' }}>
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
                        </div>
                    </div>
                )}

                {currentJob?.error_message && (
                    <div className="alert alert-danger">
                        <strong>Error:</strong> {currentJob.error_message}
                    </div>
                )}
            </div>
        );
    };

    return createPortal(
        <div
            ref={modalRef}
            className="modal fade"
            tabIndex="-1"
            aria-hidden="true"
        >
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title">
                            <i className="bx bx-upload me-2"></i>
                            Bulk Student Import
                        </h5>
                        <button
                            type="button"
                            className="btn-close btn-close-white"
                            onClick={handleClose}
                            aria-label="Close"
                        ></button>
                    </div>

                    {/* Progress Steps */}
                    <div className="modal-body border-bottom py-3">
                        <div className="d-flex justify-content-center">
                            <div className={`step-indicator ${step >= 1 ? 'active' : ''}`}>
                                <span className="step-number">1</span>
                                <span className="step-label">Upload</span>
                            </div>
                            <div className="step-connector"></div>
                            <div className={`step-indicator ${step >= 2 ? 'active' : ''}`}>
                                <span className="step-number">2</span>
                                <span className="step-label">Processing</span>
                            </div>
                            <div className="step-connector"></div>
                            <div className={`step-indicator ${step >= 3 ? 'active' : ''}`}>
                                <span className="step-number">3</span>
                                <span className="step-label">Results</span>
                            </div>
                        </div>
                    </div>

                    <div className="modal-body p-0">
                        {step === 1 && renderUploadStep()}
                        {step === 2 && renderProcessingStep()}
                        {step === 3 && renderResultsStep()}
                    </div>

                    <div className="modal-footer">
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
                        {step === 2 && (
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleClose}
                            >
                                Close (Continue in Background)
                            </button>
                        )}
                        {step === 3 && (
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleClose}
                            >
                                Done
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .step-indicator {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    opacity: 0.5;
                }
                .step-indicator.active {
                    opacity: 1;
                }
                .step-number {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: #e9ecef;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    margin-bottom: 4px;
                }
                .step-indicator.active .step-number {
                    background: #696cff;
                    color: white;
                }
                .step-label {
                    font-size: 12px;
                    color: #697a8d;
                }
                .step-connector {
                    width: 60px;
                    height: 2px;
                    background: #e9ecef;
                    margin: 16px 8px 0;
                }
            `}</style>
        </div>,
        document.body
    );
};

export default BulkImportModal;
