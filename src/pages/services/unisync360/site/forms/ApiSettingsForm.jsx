import React from 'react';
import { FormGroup, Label, Input, Button, Row, Col } from 'reactstrap';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  api_rate_limit: Yup.number().min(100).max(10000),
  api_key_expiry_days: Yup.number().min(1).max(3650),
});

const ApiSettingsForm = ({ data, onSave, isLoading }) => {
  return (
    <div className="settings-form">
      <h3 className="section-title mb-4">
        <i className="bx bx-code-block"></i> API Configuration
      </h3>

      <Formik
        initialValues={{
          api_rate_limit: data.api_rate_limit || 1000,
          enable_api_documentation: data.enable_api_documentation || true,
          api_key_expiry_days: data.api_key_expiry_days || 365,
        }}
        validationSchema={validationSchema}
        onSubmit={(values) => onSave(values)}
        enableReinitialize
      >
        {({ isValid }) => (
          <Form>
            <div className="form-section">
              <h5 className="mb-3">Rate Limiting</h5>
              <FormGroup>
                <Label for="api_rate">API Rate Limit (requests/hour)</Label>
                <Field as={Input} type="number" name="api_rate_limit" min="100" max="10000" />
                <small className="text-muted d-block mt-1">
                  Maximum API requests allowed per hour per user
                </small>
              </FormGroup>
            </div>

            <div className="form-section">
              <h5 className="mb-3">API Keys</h5>
              <FormGroup>
                <Label for="api_expiry">API Key Expiry (days)</Label>
                <Field as={Input} type="number" name="api_key_expiry_days" min="1" max="3650" />
                <small className="text-muted d-block mt-1">
                  Days before API keys automatically expire
                </small>
              </FormGroup>
            </div>

            <div className="form-section">
              <h5 className="mb-3">Documentation</h5>
              <FormGroup check>
                <Label check>
                  <Field as={Input} type="checkbox" name="enable_api_documentation" />
                  Enable API Documentation
                </Label>
                <small className="text-muted d-block mt-2">
                  Make Swagger/ReDoc API documentation publicly accessible
                </small>
              </FormGroup>
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

export default ApiSettingsForm;
