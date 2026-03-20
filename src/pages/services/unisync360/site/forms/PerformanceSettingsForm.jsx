import React from 'react';
import { FormGroup, Label, Input, Button, Row, Col } from 'reactstrap';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  max_file_upload_size_mb: Yup.number().min(1).max(100),
});

const PerformanceSettingsForm = ({ data, onSave, isLoading }) => {
  return (
    <div className="settings-form">
      <h3 className="section-title mb-4">
        <i className="bx bx-tachometer"></i> Performance Settings
      </h3>

      <Formik
        initialValues={{
          max_file_upload_size_mb: data.max_file_upload_size_mb || 10,
          allowed_file_extensions: data.allowed_file_extensions || 'jpg,jpeg,png,pdf,doc,docx,xls,xlsx,txt',
        }}
        validationSchema={validationSchema}
        onSubmit={(values) => onSave(values)}
        enableReinitialize
      >
        {({ isValid }) => (
          <Form>
            <div className="form-section">
              <h5 className="mb-3">File Upload Settings</h5>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="max_file">Max File Upload Size (MB)</Label>
                    <Field as={Input} type="number" name="max_file_upload_size_mb" min="1" max="100" />
                    <small className="text-muted d-block mt-1">
                      Maximum file size allowed for uploads
                    </small>
                  </FormGroup>
                </Col>
              </Row>
              <FormGroup>
                <Label for="extensions">Allowed File Extensions</Label>
                <Field as={Input} type="text" name="allowed_file_extensions" 
                       placeholder="jpg,jpeg,png,pdf,doc,docx" />
                <small className="text-muted d-block mt-1">
                  Comma-separated list of allowed extensions
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

export default PerformanceSettingsForm;
