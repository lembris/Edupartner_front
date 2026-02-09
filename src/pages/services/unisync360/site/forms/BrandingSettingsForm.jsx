import React, { useState, useEffect } from 'react';
import { FormGroup, Label, Input, Button, Row, Col } from 'reactstrap';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  logo_alt_text: Yup.string(),
});

const BrandingSettingsForm = ({ data, onSave, isLoading }) => {
  const [logoPreview, setLogoPreview] = useState(data?.logo || null);
  const [faviconPreview, setFaviconPreview] = useState(data?.favicon || null);
  const [logoNewFile, setLogoNewFile] = useState(null);
  const [faviconNewFile, setFaviconNewFile] = useState(null);

  useEffect(() => {
    // Update preview when data changes (when user visits the branding tab)
    setLogoPreview(data?.logo || null);
    setFaviconPreview(data?.favicon || null);
    setLogoNewFile(null);
    setFaviconNewFile(null);
  }, [data]);

  const handleSubmit = async (values, { setFieldValue }) => {
    try {
      const formData = new FormData();
      Object.keys(values).forEach((key) => {
        if (values[key] !== null && values[key] !== undefined) {
          formData.append(key, values[key]);
        }
      });
      await onSave(formData);
      // Clear new file previews after successful save
      setLogoNewFile(null);
      setFaviconNewFile(null);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  return (
    <div className="settings-form">
      <h3 className="section-title mb-4">
        <i className="bx bx-star"></i> Branding Settings
      </h3>

      <Formik
        initialValues={{
          logo: data.logo || null,
          logo_alt_text: data.logo_alt_text || 'Site Logo',
          favicon: data.favicon || null,
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, setFieldValue, isValid }) => (
          <Form>
            <div className="form-section">
              <h5 className="mb-3">Site Logo</h5>
              <FormGroup>
                <Label for="logo">Logo Image</Label>
                <Input
                  type="file"
                  name="logo"
                  id="logo"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.currentTarget.files[0];
                    if (file) {
                      setFieldValue('logo', file);
                      const reader = new FileReader();
                      reader.onloadend = () => setLogoNewFile(reader.result);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <small className="text-muted d-block mt-1">
                  Recommended size: 200x60px
                </small>
              </FormGroup>

              {/* Preview Section */}
              <div className="preview-section mt-4">
                {(logoPreview || logoNewFile) && (
                  <Row>
                    {/* Current Logo */}
                    {logoPreview && !logoNewFile && (
                      <Col md="6">
                        <div className="preview-box">
                          <Label className="preview-label">Current Logo</Label>
                          <div className="p-3 bg-light rounded text-center">
                            <img 
                              src={
                                typeof logoPreview === 'string' && logoPreview.startsWith('http')
                                  ? logoPreview
                                  : logoPreview && typeof logoPreview === 'string'
                                  ? logoPreview.startsWith('/media')
                                    ? logoPreview
                                    : `/media${logoPreview.startsWith('/') ? '' : '/'}${logoPreview}`
                                  : logoPreview
                              }
                              alt="Current logo" 
                              style={{ maxHeight: '80px', maxWidth: '100%' }} 
                            />
                          </div>
                        </div>
                      </Col>
                    )}

                    {/* Before and After Comparison */}
                    {logoNewFile && (
                      <>
                        {logoPreview && (
                          <Col md="6">
                            <div className="preview-box">
                              <Label className="preview-label">Current Logo</Label>
                              <div className="p-3 bg-light rounded text-center">
                                <img 
                                  src={
                                    typeof logoPreview === 'string' && logoPreview.startsWith('http')
                                      ? logoPreview
                                      : logoPreview && typeof logoPreview === 'string'
                                      ? logoPreview.startsWith('/media')
                                        ? logoPreview
                                        : `/media${logoPreview.startsWith('/') ? '' : '/'}${logoPreview}`
                                      : logoPreview
                                  }
                                  alt="Current logo" 
                                  style={{ maxHeight: '80px', maxWidth: '100%' }} 
                                />
                              </div>
                            </div>
                          </Col>
                        )}
                        <Col md={logoPreview ? "6" : "12"}>
                          <div className="preview-box">
                            <Label className="preview-label">New Logo (Preview)</Label>
                            <div className="p-3 bg-success bg-opacity-10 rounded text-center border border-success">
                              <img 
                                src={logoNewFile}
                                alt="New logo preview" 
                                style={{ maxHeight: '80px', maxWidth: '100%' }} 
                              />
                              <small className="text-success d-block mt-2">✓ Ready to upload</small>
                            </div>
                          </div>
                        </Col>
                      </>
                    )}
                  </Row>
                )}
              </div>

              <FormGroup className="mt-3">
                <Label for="logo_alt">Logo Alt Text</Label>
                <Field as={Input} type="text" name="logo_alt_text" placeholder="Site Logo" />
              </FormGroup>
            </div>

            <div className="form-section">
              <h5 className="mb-3">Favicon</h5>
              <FormGroup>
                <Label for="favicon">Favicon Image</Label>
                <Input
                  type="file"
                  name="favicon"
                  id="favicon"
                  accept="image/*,.ico"
                  onChange={(e) => {
                    const file = e.currentTarget.files[0];
                    if (file) {
                      setFieldValue('favicon', file);
                      const reader = new FileReader();
                      reader.onloadend = () => setFaviconNewFile(reader.result);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <small className="text-muted d-block mt-1">
                  Size: 32x32px or 64x64px (PNG, ICO, SVG)
                </small>
              </FormGroup>

              {/* Preview Section */}
              <div className="preview-section mt-4">
                {(faviconPreview || faviconNewFile) && (
                  <Row>
                    {/* Current Favicon */}
                    {faviconPreview && !faviconNewFile && (
                      <Col md="6">
                        <div className="preview-box">
                          <Label className="preview-label">Current Favicon</Label>
                          <div className="p-3 bg-light rounded text-center">
                            <img 
                              src={
                                typeof faviconPreview === 'string' && faviconPreview.startsWith('http')
                                  ? faviconPreview
                                  : faviconPreview && typeof faviconPreview === 'string'
                                  ? faviconPreview.startsWith('/media')
                                    ? faviconPreview
                                    : `/media${faviconPreview.startsWith('/') ? '' : '/'}${faviconPreview}`
                                  : faviconPreview
                              }
                              alt="Current favicon" 
                              style={{ maxWidth: '80px', maxHeight: '80px' }} 
                            />
                          </div>
                        </div>
                      </Col>
                    )}

                    {/* Before and After Comparison */}
                    {faviconNewFile && (
                      <>
                        {faviconPreview && (
                          <Col md="6">
                            <div className="preview-box">
                              <Label className="preview-label">Current Favicon</Label>
                              <div className="p-3 bg-light rounded text-center">
                                <img 
                                   src={
                                     typeof faviconPreview === 'string' && faviconPreview.startsWith('http')
                                       ? faviconPreview
                                       : faviconPreview && typeof faviconPreview === 'string'
                                       ? faviconPreview.startsWith('/media')
                                         ? faviconPreview
                                         : `/media${faviconPreview.startsWith('/') ? '' : '/'}${faviconPreview}`
                                       : faviconPreview
                                   }
                                   alt="Current favicon" 
                                   style={{ maxWidth: '80px', maxHeight: '80px' }} 
                                 />
                              </div>
                            </div>
                          </Col>
                        )}
                        <Col md={faviconPreview ? "6" : "12"}>
                          <div className="preview-box">
                            <Label className="preview-label">New Favicon (Preview)</Label>
                            <div className="p-3 bg-success bg-opacity-10 rounded text-center border border-success">
                              <img 
                                src={faviconNewFile}
                                alt="New favicon preview" 
                                style={{ maxWidth: '80px', maxHeight: '80px' }} 
                              />
                              <small className="text-success d-block mt-2">✓ Ready to upload</small>
                            </div>
                          </div>
                        </Col>
                      </>
                    )}
                  </Row>
                )}
              </div>
            </div>

            <div className="button-group mt-4">
              <Button color="secondary" type="reset" disabled={isLoading} className="me-2">Reset</Button>
              <Button color="primary" type="submit" disabled={!isValid || isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default BrandingSettingsForm;
