import React from 'react';
import { Form, FormGroup, Label, Input, Button, Row, Col } from 'reactstrap';
import { Formik, Field, Form as FormikForm } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  smtp_server: Yup.string(),
  smtp_port: Yup.number().min(1).max(65535),
  email_from_address: Yup.string().email('Invalid email'),
});

const EmailConfigurationForm = ({ data, onSave, isLoading }) => {
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
        <i className="bx bx-envelope"></i> Email Configuration
      </h3>

      <div className="alert alert-warning">
        <strong>Important:</strong> Configure these settings to enable email notifications
      </div>

      <Formik
        initialValues={{
          smtp_server: data.smtp_server || '',
          smtp_port: data.smtp_port || 587,
          smtp_user: data.smtp_user || '',
          smtp_password: data.smtp_password || '',
          smtp_use_tls: data.smtp_use_tls || true,
          email_from_address: data.email_from_address || '',
          email_from_name: data.email_from_name || '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, isValid }) => (
          <FormikForm>
            <div className="form-section">
              <h5 className="mb-3">SMTP Configuration</h5>

              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="smtp_server">SMTP Server</Label>
                    <Field as={Input} type="text" name="smtp_server" placeholder="smtp.gmail.com" />
                  </FormGroup>
                </Col>

                <Col md={6}>
                  <FormGroup>
                    <Label for="smtp_port">SMTP Port</Label>
                    <Field as={Input} type="number" name="smtp_port" placeholder="587" />
                    <small className="text-muted">Common ports: 25, 465 (SSL), 587 (TLS)</small>
                  </FormGroup>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="smtp_user">SMTP Username</Label>
                    <Field as={Input} type="text" name="smtp_user" placeholder="your-email@domain.com" />
                  </FormGroup>
                </Col>

                <Col md={6}>
                  <FormGroup>
                    <Label for="smtp_password">SMTP Password</Label>
                    <Field as={Input} type="password" name="smtp_password" placeholder="••••••••" />
                  </FormGroup>
                </Col>
              </Row>

              <FormGroup check>
                <Label check>
                  <Field as={Input} type="checkbox" name="smtp_use_tls" />
                  Use TLS Encryption
                </Label>
              </FormGroup>
            </div>

            <div className="form-section">
              <h5 className="mb-3">Email From Address</h5>

              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="email_from_address">From Email Address</Label>
                    <Field as={Input} type="email" name="email_from_address" placeholder="noreply@example.com" />
                  </FormGroup>
                </Col>

                <Col md={6}>
                  <FormGroup>
                    <Label for="email_from_name">From Name</Label>
                    <Field as={Input} type="text" name="email_from_name" placeholder="UniSync 360" />
                  </FormGroup>
                </Col>
              </Row>
            </div>

            <div className="button-group mt-4">
              <Button color="secondary" type="reset" disabled={isLoading} className="me-2">
                Reset
              </Button>
              <Button color="primary" type="submit" disabled={!isValid || isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </FormikForm>
        )}
      </Formik>
    </div>
  );
};

export default EmailConfigurationForm;
