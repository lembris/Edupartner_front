import React from 'react';
import { Form, FormGroup, Label, Input, Button, Row, Col } from 'reactstrap';
import { Formik, Field, Form as FormikForm } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  primary_color: Yup.string().required('Primary color is required'),
  secondary_color: Yup.string().required('Secondary color is required'),
  tertiary_color: Yup.string().required('Tertiary color is required'),
});

const AppearanceSettingsForm = ({ data, onSave, isLoading }) => {
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
        <i className="bx bx-palette"></i> Appearance Settings
      </h3>

      <div className="alert alert-info">
        <strong>About:</strong> Customize colors and visual appearance of your site
      </div>

      <Formik
        initialValues={{
          primary_color: data.primary_color || '#1E40AF',
          secondary_color: data.secondary_color || '#7C3AED',
          tertiary_color: data.tertiary_color || '#10B981',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, isValid }) => (
          <FormikForm>
            <div className="form-section">
              <h5 className="mb-3">Color Scheme</h5>

              <Row>
                <Col md={4}>
                  <FormGroup>
                    <Label for="primary_color">Primary Color</Label>
                    <div className="d-flex gap-2">
                      <Field
                        as={Input}
                        type="color"
                        name="primary_color"
                        id="primary_color"
                        style={{ maxWidth: '100px', height: '40px' }}
                      />
                      <Field
                        as={Input}
                        type="text"
                        name="primary_color"
                        placeholder="#1E40AF"
                      />
                    </div>
                    <small className="text-muted d-block mt-1">
                      Used for main buttons and highlights
                    </small>
                  </FormGroup>
                </Col>

                <Col md={4}>
                  <FormGroup>
                    <Label for="secondary_color">Secondary Color</Label>
                    <div className="d-flex gap-2">
                      <Field
                        as={Input}
                        type="color"
                        name="secondary_color"
                        id="secondary_color"
                        style={{ maxWidth: '100px', height: '40px' }}
                      />
                      <Field
                        as={Input}
                        type="text"
                        name="secondary_color"
                        placeholder="#7C3AED"
                      />
                    </div>
                  </FormGroup>
                </Col>

                <Col md={4}>
                  <FormGroup>
                    <Label for="tertiary_color">Tertiary Color</Label>
                    <div className="d-flex gap-2">
                      <Field
                        as={Input}
                        type="color"
                        name="tertiary_color"
                        id="tertiary_color"
                        style={{ maxWidth: '100px', height: '40px' }}
                      />
                      <Field
                        as={Input}
                        type="text"
                        name="tertiary_color"
                        placeholder="#10B981"
                      />
                    </div>
                  </FormGroup>
                </Col>
              </Row>

              <div className="alert alert-info mt-3 mb-0">
                <i className="bx bx-info-circle me-2"></i>
                These colors will be applied across the entire website for consistency
              </div>
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

export default AppearanceSettingsForm;
