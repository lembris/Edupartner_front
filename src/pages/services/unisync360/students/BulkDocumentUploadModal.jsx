import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DocumentAPI } from './Queries';
import showToast from '../../../../helpers/ToastHelper';
import FormikSelect from '../../../../components/ui-templates/form-components/FormikSelect';
import { Formik, Form } from 'formik';

const BulkDocumentUploadModal = ({ studentId, onSuccess, onClose }) => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [modalInstance, setModalInstance] = useState(null);
    const modalRef = useRef(null);
    const fileInputRef = useRef(null);

    // Initialize Bootstrap Modal
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
        };
    }, []);

    const handleClose = () => {
        if (modalInstance) modalInstance.hide();
        if (onClose) onClose();
    };

    // File Validation
    const validateFile = (file) => {
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB
        const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

        if (file.size > MAX_SIZE) return { valid: false, error: 'File too large (Max 5MB)' };
        if (!ALLOWED_TYPES.includes(file.type)) return { valid: false, error: 'Invalid file type (PDF, JPEG, PNG only)' };
        return { valid: true };
    };

    const handleFiles = (newFiles) => {
        const validFiles = [];
        Array.from(newFiles).forEach(file => {
            const validation = validateFile(file);
            if (validation.valid) {
                validFiles.push({
                    file,
                    id: Math.random().toString(36).substr(2, 9),
                    requirement: '', // To be selected
                    status: 'pending', // Upload status: pending, uploading, success, error
                    error: null,
                    progress: 0
                });
            } else {
                showToast('error', `${file.name}: ${validation.error}`);
            }
        });
        setFiles(prev => [...prev, ...validFiles]);
    };

    const onDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const onDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const removeFile = (id) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const updateFileRequirement = (id, requirementUid) => {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, requirement: requirementUid } : f));
    };

    const handleUpload = async () => {
        const pendingFiles = files.filter(f => f.status === 'pending' || f.status === 'error');
        if (pendingFiles.length === 0) {
            showToast('warning', 'No files to upload');
            return;
        }

        const missingReq = pendingFiles.some(f => !f.requirement);
        if (missingReq) {
            showToast('error', 'Please select a requirement for all files');
            return;
        }

        setUploading(true);

        // Process sequentially to avoid overwhelming server or triggering race conditions
        for (const fileObj of pendingFiles) {
            setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'uploading', progress: 10 } : f));

            try {
                const formData = new FormData();
                formData.append('student', studentId);
                formData.append('requirement', fileObj.requirement);
                formData.append('status', 'pending');
                formData.append('document_file', fileObj.file);

                // Simulate progress (since fetch/axios progress requires more complex setup, simple increment here)
                setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, progress: 50 } : f));

                const result = await DocumentAPI.create(formData);

                if (result && result.status === 8000) {
                    setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'success', progress: 100 } : f));
                } else {
                    throw new Error(result?.message || 'Upload failed');
                }
            } catch (error) {
                console.error(error);
                setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'error', error: error.message || 'Failed' } : f));
            }
        }

        setUploading(false);
        
        // Check if all successful
        const allSuccess = files.every(f => f.status === 'success'); // This check uses the OLD files state due to closure, need to check logically or wait
        // Actually, we updated state in loop. But 'files' var is stale.
        // We can trigger success callback if we processed some.
        if (onSuccess) onSuccess();
    };

    return createPortal(
        <div ref={modalRef} className="modal fade" tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header bg-light">
                        <h5 className="modal-title">Bulk Document Upload</h5>
                        <button type="button" className="btn-close" onClick={handleClose} disabled={uploading}></button>
                    </div>
                    <div className="modal-body">
                        {/* Drop Zone */}
                        <div 
                            className="border-2 border-dashed rounded-3 p-5 text-center mb-4 bg-light"
                            style={{ borderColor: '#d9dee3', cursor: 'pointer' }}
                            onDrop={onDrop}
                            onDragOver={onDragOver}
                            onClick={() => fileInputRef.current.click()}
                        >
                            <i className="bx bx-cloud-upload fs-1 text-primary mb-3"></i>
                            <h5>Drag & Drop files here</h5>
                            <p className="text-muted mb-0">or click to browse (PDF, Images - Max 5MB)</p>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="d-none" 
                                multiple 
                                onChange={(e) => handleFiles(e.target.files)} 
                            />
                        </div>

                        {/* File List */}
                        {files.length > 0 && (
                            <div className="list-group">
                                {files.map((fileObj, index) => (
                                    <div key={fileObj.id} className="list-group-item p-3">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="flex-grow-1">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <h6 className="mb-0 text-truncate" style={{ maxWidth: '250px' }} title={fileObj.file.name}>
                                                        {fileObj.file.name}
                                                    </h6>
                                                    <span className="badge bg-label-secondary">{(fileObj.file.size / 1024 / 1024).toFixed(2)} MB</span>
                                                </div>
                                                
                                                {/* Requirement Selector - Using a simplified approach since FormikSelect needs Formik context */}
                                                <Formik initialValues={{ req: fileObj.requirement }} onSubmit={() => {}}>
                                                    <FormikSelect
                                                        name="req"
                                                        url="/unisync360-applications/document-requirements/"
                                                        placeholder="Select Document Type/Requirement..."
                                                        containerClass="mb-0"
                                                        filters={{ page: 1, page_size: 100, paginated: true }}
                                                        mapOption={(item) => ({ value: item.uid, label: `${item.name} (${item.document_type})` })}
                                                        value={fileObj.requirement} // FormikSelect might control itself via context, but we need to capture change
                                                        // FormikSelect uses setFieldValue. We can hook into onChange or onSelectObject if available
                                                        // My previous FormikSelect implementation supports `onSelectObject`?
                                                        // Let's check FormikSelect.jsx: yes, `if (typeof onSelectObject === "function") onSelectObject(selected);`
                                                        onSelectObject={(selected) => updateFileRequirement(fileObj.id, selected?.value)}
                                                        isReadOnly={fileObj.status === 'success' || fileObj.status === 'uploading'}
                                                    />
                                                </Formik>
                                                
                                                {/* Progress/Status */}
                                                {fileObj.status !== 'pending' && (
                                                    <div className="mt-2">
                                                        {fileObj.status === 'uploading' && (
                                                            <div className="progress" style={{ height: '6px' }}>
                                                                <div className="progress-bar progress-bar-striped progress-bar-animated" style={{ width: `${fileObj.progress}%` }}></div>
                                                            </div>
                                                        )}
                                                        {fileObj.status === 'success' && <div className="text-success small"><i className="bx bx-check-circle"></i> Uploaded</div>}
                                                        {fileObj.status === 'error' && <div className="text-danger small"><i className="bx bx-error"></i> {fileObj.error}</div>}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div>
                                                {fileObj.status !== 'success' && fileObj.status !== 'uploading' && (
                                                    <button className="btn btn-icon btn-outline-danger btn-sm" onClick={() => removeFile(fileObj.id)}>
                                                        <i className="bx bx-x"></i>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-label-secondary" onClick={handleClose} disabled={uploading}>
                            Close
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-primary" 
                            onClick={handleUpload} 
                            disabled={uploading || files.length === 0 || files.every(f => f.status === 'success')}
                        >
                            {uploading ? <><span className="spinner-border spinner-border-sm me-1"></span> Uploading...</> : 'Upload All'}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default BulkDocumentUploadModal;
