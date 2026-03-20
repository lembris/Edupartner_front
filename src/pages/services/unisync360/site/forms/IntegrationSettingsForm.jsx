import React from 'react';
import { FormGroup, Label, Input, Button, Row, Col } from 'reactstrap';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  facebook_url: Yup.string().url().nullable(),
  twitter_url: Yup.string().url().nullable(),
  linkedin_url: Yup.string().url().nullable(),
  instagram_url: Yup.string().url().nullable(),
  youtube_url: Yup.string().url().nullable(),
});

const IntegrationSettingsForm = ({ data, onSave, isLoading }) => {
  return (
    <div className="settings-form">
      <h3 className="section-title mb-4">
        <i className="bx bx-link-alt"></i> Integration Settings
      </h3>

      <Formik
        initialValues={{
          facebook_url: data.facebook_url || '',
          twitter_url: data.twitter_url || '',
          linkedin_url: data.linkedin_url || '',
          instagram_url: data.instagram_url || '',
          youtube_url: data.youtube_url || '',
        }}
        validationSchema={validationSchema}
        onSubmit={(values) => onSave(values)}
        enableReinitialize
      >
        {({ isValid }) => (
          <Form>
            <div className="form-section">
              <h5 className="mb-3">Social Media Links</h5>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="facebook">Facebook URL</Label>
                    <Field as={Input} type="url" name="facebook_url" placeholder="https://facebook.com/yourpage" />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="twitter">Twitter URL</Label>
                    <Field as={Input} type="url" name="twitter_url" placeholder="https://twitter.com/yourhandle" />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="linkedin">LinkedIn URL</Label>
                    <Field as={Input} type="url" name="linkedin_url" placeholder="https://linkedin.com/company/yourcompany" />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="instagram">Instagram URL</Label>
                    <Field as={Input} type="url" name="instagram_url" placeholder="https://instagram.com/yourhandle" />
                  </FormGroup>
                </Col>
              </Row>
              <FormGroup>
                <Label for="youtube">YouTube URL</Label>
                <Field as={Input} type="url" name="youtube_url" placeholder="https://youtube.com/c/yourhandle" />
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

export default IntegrationSettingsForm;
