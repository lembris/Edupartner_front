import React, { useState } from 'react';
import { Form, FormGroup, Label, Input, Button, Row, Col, FormFeedback } from 'reactstrap';
import { Formik, Field, Form as FormikForm, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  site_name: Yup.string()
    .required('Site name is required')
    .min(3, 'Site name must be at least 3 characters'),
  site_description: Yup.string(),
  site_url: Yup.string().url('Must be a valid URL').nullable(),
  organization_name: Yup.string(),
  organization_email: Yup.string().email('Must be a valid email').nullable(),
  organization_phone: Yup.string(),
  organization_address: Yup.string(),
  organization_website: Yup.string().url('Must be a valid URL').nullable(),
});

const GeneralSettingsForm = ({ data, onSave, isLoading }) => {
  const handleSubmit = async (values) => {
    try {
      await onSave(values);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  return (
    <div className="settings-form">
      <h3 className="section-title mb-4">
        <i className="bx bx-cog"></i> General Settings
      </h3>

      <div className="alert alert-info">
        <strong>About:</strong> Configure basic site information and organization details
      </div>

      <Formik
        initialValues={{
          site_name: data.site_name || '',
          site_description: data.site_description || '',
          site_url: data.site_url || '',
          organization_name: data.organization_name || '',
          organization_email: data.organization_email || '',
          organization_phone: data.organization_phone || '',
          organization_address: data.organization_address || '',
          organization_website: data.organization_website || '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, isValid }) => (
          <FormikForm>
            {/* Site Identity Section */}
            <div className="form-section">
              <h5 className="mb-3">Site Identity</h5>

              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="site_name">
                      Site Name <span className="badge bg-danger">Required</span>
                    </Label>
                    <Field
                      as={Input}
                      type="text"
                      name="site_name"
                      id="site_name"
                      placeholder="Enter site name"
                      invalid={touched.site_name && !!errors.site_name}
                    />
                    {touched.site_name && errors.site_name && (
                      <FormFeedback>{errors.site_name}</FormFeedback>
                    )}
                    <small className="text-muted d-block mt-1">
                      The main title displayed on your website
                    </small>
                  </FormGroup>
                </Col>

                <Col md={6}>
                  <FormGroup>
                    <Label for="site_url">Site URL</Label>
                    <Field
                      as={Input}
                      type="url"
                      name="site_url"
                      id="site_url"
                      placeholder="https://example.com"
                      invalid={touched.site_url && !!errors.site_url}
                    />
                    {touched.site_url && errors.site_url && (
                      <FormFeedback>{errors.site_url}</FormFeedback>
                    )}
                    <small className="text-muted d-block mt-1">
                      Main URL of your website
                    </small>
                  </FormGroup>
                </Col>
              </Row>

              <FormGroup>
                <Label for="site_description">Site Description</Label>
                <Field
                  as={Input}
                  type="textarea"
                  name="site_description"
                  id="site_description"
                  placeholder="Enter site description"
                  rows={4}
                  invalid={touched.site_description && !!errors.site_description}
                />
                {touched.site_description && errors.site_description && (
                  <FormFeedback>{errors.site_description}</FormFeedback>
                )}
                <small className="text-muted d-block mt-1">
                  Brief description of your site for SEO and meta tags
                </small>
              </FormGroup>
            </div>

            {/* Organization Details Section */}
            <div className="form-section">
              <h5 className="mb-3">Organization Details</h5>

              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="organization_name">Organization Name</Label>
                    <Field
                      as={Input}
                      type="text"
                      name="organization_name"
                      id="organization_name"
                      placeholder="Enter organization name"
                      invalid={touched.organization_name && !!errors.organization_name}
                    />
                    {touched.organization_name && errors.organization_name && (
                      <FormFeedback>{errors.organization_name}</FormFeedback>
                    )}
                  </FormGroup>
                </Col>

                <Col md={6}>
                  <FormGroup>
                    <Label for="organization_email">Organization Email</Label>
                    <Field
                      as={Input}
                      type="email"
                      name="organization_email"
                      id="organization_email"
                      placeholder="contact@organization.com"
                      invalid={touched.organization_email && !!errors.organization_email}
                    />
                    {touched.organization_email && errors.organization_email && (
                      <FormFeedback>{errors.organization_email}</FormFeedback>
                    )}
                  </FormGroup>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="organization_phone">Phone Number</Label>
                    <Field
                      as={Input}
                      type="tel"
                      name="organization_phone"
                      id="organization_phone"
                      placeholder="+1 (555) 000-0000"
                      invalid={touched.organization_phone && !!errors.organization_phone}
                    />
                    {touched.organization_phone && errors.organization_phone && (
                      <FormFeedback>{errors.organization_phone}</FormFeedback>
                    )}
                  </FormGroup>
                </Col>

                <Col md={6}>
                  <FormGroup>
                    <Label for="organization_website">Website</Label>
                    <Field
                      as={Input}
                      type="url"
                      name="organization_website"
                      id="organization_website"
                      placeholder="https://organization.com"
                      invalid={touched.organization_website && !!errors.organization_website}
                    />
                    {touched.organization_website && errors.organization_website && (
                      <FormFeedback>{errors.organization_website}</FormFeedback>
                    )}
                  </FormGroup>
                </Col>
              </Row>

              <FormGroup>
                <Label for="organization_address">Address</Label>
                <Field
                  as={Input}
                  type="textarea"
                  name="organization_address"
                  id="organization_address"
                  placeholder="Enter organization address"
                  rows={3}
                  invalid={touched.organization_address && !!errors.organization_address}
                />
                {touched.organization_address && errors.organization_address && (
                  <FormFeedback>{errors.organization_address}</FormFeedback>
                )}
              </FormGroup>
            </div>

            {/* Submit Buttons */}
            <div className="button-group mt-4">
              <Button color="secondary" type="reset" disabled={isLoading} className="me-2">
                Reset
              </Button>
              <Button color="primary" type="submit" disabled={!isValid || isLoading}>
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bx bx-check-circle me-2"></i>
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </FormikForm>
        )}
      </Formik>
    </div>
  );
};

export default GeneralSettingsForm;
