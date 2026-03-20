# External Form Components - Usage Examples

## Example 1: Simple Contact Form

```jsx
import React, { useState } from 'react';
import ExternalFormPage from '../../layouts/ExternalFormPage';
import {
  FormHeader,
  FormTopBar,
  FormSection,
  FormActions
} from './index';

export const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    // Validation and API call
    console.log('Submitting:', formData);
  };

  return (
    <ExternalFormPage
      topBarContent={
        <FormTopBar
          leftLogo="/assets/logo.png"
          badges={[{ icon: 'bx-envelope', label: 'Get in Touch', color: 'primary' }]}
        />
      }
    >
      <FormHeader
        title="Contact Us"
        subtitle="We'd love to hear from you. Send us a message!"
        badge={{ icon: 'bx-envelope', label: 'Contact Form' }}
      />

      <form>
        <FormSection title="Your Information" stepNumber={1} icon="bx-user">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-medium">Name *</label>
              <input
                type="text"
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium">Email *</label>
              <input
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>
          </div>
        </FormSection>

        <FormSection title="Your Message" stepNumber={2} icon="bx-message">
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label fw-medium">Subject *</label>
              <input
                type="text"
                className={`form-control ${errors.subject ? 'is-invalid' : ''}`}
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-12">
              <label className="form-label fw-medium">Message *</label>
              <textarea
                className={`form-control ${errors.message ? 'is-invalid' : ''}`}
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows="5"
              ></textarea>
            </div>
          </div>
        </FormSection>

        <FormActions
          onSubmit={handleSubmit}
          loading={loading}
          submitText="Send Message"
          showReset={true}
        />
      </form>
    </ExternalFormPage>
  );
};
```

---

## Example 2: Student Registration Form with Address

```jsx
import React, { useState } from 'react';
import ExternalFormPage from '../../layouts/ExternalFormPage';
import {
  FormHeader,
  FormTopBar,
  PersonalInfoSection,
  FormSection,
  TermsSection,
  FormActions
} from './index';

export const StudentRegistrationPage = () => {
  const [formData, setFormData] = useState({
    // Personal
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    // Address
    street_address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    // Terms
    agreed_to_terms: false
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async () => {
    // Validation and submission
  };

  return (
    <ExternalFormPage
      topBarContent={
        <FormTopBar
          leftLogo="/assets/school-logo.png"
          badges={[{ icon: 'bx-user-plus', label: 'Student Registration', color: 'primary' }]}
        />
      }
    >
      <FormHeader
        title="Student Registration"
        subtitle="Register as a new student in our institution"
        badge={{ icon: 'bx-graduation', label: 'Academic Portal' }}
        stats={[
          { icon: 'bx-check-circle', label: 'Easy Enrollment', color: 'success' },
          { icon: 'bx-lock-alt', label: 'Secure', color: 'primary' },
          { icon: 'bx-time', label: '10 Minutes', color: 'warning' }
        ]}
      />

      <form>
        <PersonalInfoSection
          formData={formData}
          errors={errors}
          handleInputChange={handleInputChange}
          showMiddleName={false}
          showDOB={true}
        />

        <FormSection
          stepNumber={2}
          icon="bx-home"
          title="Address Information"
          subtitle="Where can we reach you?"
        >
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label fw-medium">Street Address *</label>
              <input
                type="text"
                className={`form-control ${errors.street_address ? 'is-invalid' : ''}`}
                name="street_address"
                value={formData.street_address}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium">City *</label>
              <input
                type="text"
                className="form-control"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium">State/Province</label>
              <input
                type="text"
                className="form-control"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium">Postal Code</label>
              <input
                type="text"
                className="form-control"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium">Country</label>
              <input
                type="text"
                className="form-control"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </FormSection>

        <TermsSection
          agreed={formData.agreed_to_terms}
          handleChange={handleInputChange}
          errors={errors}
          stepNumber={3}
          content={
            <div className="terms-card p-4 rounded mb-3">
              <h6 className="fw-bold mb-3">Registration Terms</h6>
              <ul className="text-muted small">
                <li>You agree to follow the student code of conduct</li>
                <li>Your information will be kept confidential</li>
                <li>You will receive updates via email</li>
              </ul>
            </div>
          }
        />

        <FormActions
          onSubmit={handleSubmit}
          loading={loading}
          submitText="Complete Registration"
          resetText="Clear Form"
        />
      </form>
    </ExternalFormPage>
  );
};
```

---

## Example 3: Survey Form with Dynamic Questions

```jsx
import React, { useState } from 'react';
import ExternalFormPage from '../../layouts/ExternalFormPage';
import {
  FormHeader,
  FormTopBar,
  FormSection,
  FormActions
} from './index';

export const SurveyPage = () => {
  const [formData, setFormData] = useState({
    satisfaction: '',
    recommendation: '',
    comments: '',
    followup: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <ExternalFormPage
      topBarContent={
        <FormTopBar
          leftLogo="/assets/logo.png"
          badges={[{ icon: 'bx-clipboard', label: 'Quick Survey', color: 'primary' }]}
        />
      }
    >
      <FormHeader
        title="Service Feedback Survey"
        subtitle="Help us improve by sharing your feedback (2 minutes)"
        badge={{ icon: 'bx-clipboard', label: 'Feedback Form' }}
      />

      <form>
        <FormSection stepNumber={1} icon="bx-star" title="Overall Satisfaction">
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label fw-medium">How satisfied are you with our service? *</label>
              <div className="form-check">
                <input
                  type="radio"
                  className="form-check-input"
                  name="satisfaction"
                  id="very_satisfied"
                  value="very_satisfied"
                  checked={formData.satisfaction === 'very_satisfied'}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="very_satisfied">
                  Very Satisfied
                </label>
              </div>
              <div className="form-check">
                <input
                  type="radio"
                  className="form-check-input"
                  name="satisfaction"
                  id="satisfied"
                  value="satisfied"
                  checked={formData.satisfaction === 'satisfied'}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="satisfied">
                  Satisfied
                </label>
              </div>
              <div className="form-check">
                <input
                  type="radio"
                  className="form-check-input"
                  name="satisfaction"
                  id="neutral"
                  value="neutral"
                  checked={formData.satisfaction === 'neutral'}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="neutral">
                  Neutral
                </label>
              </div>
            </div>
          </div>
        </FormSection>

        <FormSection stepNumber={2} icon="bx-thumbs-up" title="Recommendation">
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label fw-medium">Would you recommend us? *</label>
              <div className="form-check">
                <input
                  type="radio"
                  className="form-check-input"
                  name="recommendation"
                  id="yes"
                  value="yes"
                  checked={formData.recommendation === 'yes'}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="yes">
                  Yes, definitely
                </label>
              </div>
              <div className="form-check">
                <input
                  type="radio"
                  className="form-check-input"
                  name="recommendation"
                  id="maybe"
                  value="maybe"
                  checked={formData.recommendation === 'maybe'}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="maybe">
                  Maybe
                </label>
              </div>
              <div className="form-check">
                <input
                  type="radio"
                  className="form-check-input"
                  name="recommendation"
                  id="no"
                  value="no"
                  checked={formData.recommendation === 'no'}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="no">
                  No
                </label>
              </div>
            </div>
          </div>
        </FormSection>

        <FormSection stepNumber={3} icon="bx-comment" title="Additional Comments">
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label fw-medium">Any additional feedback?</label>
              <textarea
                className="form-control"
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                rows="4"
                placeholder="Share your thoughts..."
              ></textarea>
            </div>
            <div className="col-12">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  name="followup"
                  id="followup"
                  checked={formData.followup}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="followup">
                  I'd like to discuss this feedback further
                </label>
              </div>
            </div>
          </div>
        </FormSection>

        <FormActions
          onSubmit={() => console.log('Survey submitted:', formData)}
          loading={false}
          submitText="Submit Survey"
          showReset={false}
        />
      </form>
    </ExternalFormPage>
  );
};
```

---

## Example 4: Event Registration with Attendees

```jsx
import React, { useState } from 'react';
import ExternalFormPage from '../../layouts/ExternalFormPage';
import {
  FormHeader,
  FormTopBar,
  FormSection,
  FormActions
} from './index';

export const EventRegistrationPage = () => {
  const [formData, setFormData] = useState({
    attendee_name: '',
    attendee_email: '',
    attendee_phone: '',
    event_date: '',
    num_tickets: 1,
    special_requirements: '',
    agreed_terms: false
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <ExternalFormPage
      topBarContent={
        <FormTopBar
          leftLogo="/assets/logo.png"
          badges={[{ icon: 'bx-calendar', label: 'Event Registration', color: 'primary' }]}
        />
      }
    >
      <FormHeader
        title="Event Registration"
        subtitle="Register for our upcoming event"
        badge={{ icon: 'bx-calendar-event', label: 'Register Now' }}
        stats={[
          { icon: 'bx-calendar', label: 'March 15, 2025', color: 'primary' },
          { icon: 'bx-map', label: 'Virtual Event', color: 'info' },
          { icon: 'bx-users', label: '500+ Attendees', color: 'success' }
        ]}
      />

      <form>
        <FormSection stepNumber={1} icon="bx-user-circle" title="Attendee Information">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-medium">Full Name *</label>
              <input
                type="text"
                className={`form-control ${errors.attendee_name ? 'is-invalid' : ''}`}
                name="attendee_name"
                value={formData.attendee_name}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium">Email *</label>
              <input
                type="email"
                className={`form-control ${errors.attendee_email ? 'is-invalid' : ''}`}
                name="attendee_email"
                value={formData.attendee_email}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium">Phone *</label>
              <input
                type="tel"
                className="form-control"
                name="attendee_phone"
                value={formData.attendee_phone}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </FormSection>

        <FormSection stepNumber={2} icon="bx-ticket" title="Event Details">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-medium">Number of Tickets *</label>
              <input
                type="number"
                className="form-control"
                name="num_tickets"
                min="1"
                max="10"
                value={formData.num_tickets}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium">Special Requirements</label>
              <input
                type="text"
                className="form-control"
                name="special_requirements"
                value={formData.special_requirements}
                onChange={handleInputChange}
                placeholder="e.g., Accessibility needs"
              />
            </div>
          </div>
        </FormSection>

        <FormSection stepNumber={3} icon="bx-check-circle" title="Confirmation">
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              name="agreed_terms"
              id="agreed_terms"
              checked={formData.agreed_terms}
              onChange={handleInputChange}
            />
            <label className="form-check-label" htmlFor="agreed_terms">
              I confirm my attendance and agree to the event terms *
            </label>
          </div>
        </FormSection>

        <FormActions
          onSubmit={() => console.log('Registering:', formData)}
          loading={loading}
          submitText="Complete Registration"
        />
      </form>
    </ExternalFormPage>
  );
};
```

---

## Tips for Creating Custom Forms

1. **Use FormSection** for custom form sections not covered by pre-built components
2. **Leverage grid system** (`col-md-6`, `col-12`, etc.) for responsive layouts
3. **Keep error handling consistent** with the pattern shown
4. **Add loading state** to prevent double submissions
5. **Use the CSS classes** from `external-form-page.css` for consistency
6. **Test on mobile** - responsive design is built-in but verify your custom fields
7. **Follow Bootstrap form conventions** for better browser compatibility

