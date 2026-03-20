import React from 'react';
import { FormGroup, Label, Input, Button, Row, Col } from 'reactstrap';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  enable_two_factor: Yup.boolean(),
  session_timeout_minutes: Yup.number().min(5).max(480),
  max_login_attempts: Yup.number().min(1).max(10),
  password_min_length: Yup.number().min(6).max(20),
});

const SecuritySettingsForm = ({ data, onSave, isLoading }) => {
  return (
    <div className="settings-form">
      <h3 className="section-title mb-4">
        <i className="bx bx-shield"></i> Security Settings
      </h3>

      <Formik
        initialValues={{
          enable_two_factor: data.enable_two_factor || false,
          session_timeout_minutes: data.session_timeout_minutes || 30,
          max_login_attempts: data.max_login_attempts || 5,
          password_min_length: data.password_min_length || 8,
        }}
        validationSchema={validationSchema}
        onSubmit={(values) => onSave(values)}
        enableReinitialize
      >
        {({ isValid }) => (
          <Form>
            <div className="form-section">
              <h5 className="mb-3">Authentication</h5>
              <FormGroup check>
                <Label check>
                  <Field as={Input} type="checkbox" name="enable_two_factor" />
                  Enable Two-Factor Authentication
                </Label>
              </FormGroup>
              <Row className="mt-3">
                <Col md={6}>
                  <FormGroup>
                    <Label for="session_timeout">Session Timeout (minutes)</Label>
                    <Field as={Input} type="number" name="session_timeout_minutes" />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="max_login">Max Login Attempts</Label>
                    <Field as={Input} type="number" name="max_login_attempts" />
                  </FormGroup>
                </Col>
              </Row>
            </div>
            <div className="form-section">
              <h5 className="mb-3">Password Policy</h5>
              <FormGroup>
                <Label for="password_min">Minimum Password Length</Label>
                <Field as={Input} type="number" name="password_min_length" />
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

export default SecuritySettingsForm;
