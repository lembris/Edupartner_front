import React, { useState, useEffect } from 'react';
import { Container, Row, Col, TabContent, TabPane, Alert, Spinner } from 'reactstrap';
import { fetchSiteSettings, updateSiteSettings, DEFAULT_SITE_SETTINGS, SITE_SETTING_CATEGORIES } from './Queries';
import BreadCumb from '../../../../layouts/BreadCumb';
import TabsContainer from '../../../../components/ui-templates/TabsContainer';
import GeneralSettingsForm from './forms/GeneralSettingsForm';
import AppearanceSettingsForm from './forms/AppearanceSettingsForm';
import EmailConfigurationForm from './forms/EmailConfigurationForm';
import SecuritySettingsForm from './forms/SecuritySettingsForm';
import IntegrationSettingsForm from './forms/IntegrationSettingsForm';
import BrandingSettingsForm from './forms/BrandingSettingsForm';
import PerformanceSettingsForm from './forms/PerformanceSettingsForm';
import ApiSettingsForm from './forms/ApiSettingsForm';
import Swal from 'sweetalert2';
import './SiteSettings.css';

const SiteSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [currentSettings, setCurrentSettings] = useState(DEFAULT_SITE_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchSiteSettings();
      setCurrentSettings(response.data || DEFAULT_SITE_SETTINGS);
    } catch (err) {
      console.error('Error loading site settings:', err);
      setError('Failed to load site settings. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async (categoryData) => {
    try {
      setIsUpdating(true);
      const response = await updateSiteSettings(categoryData);
      setCurrentSettings(response.data || DEFAULT_SITE_SETTINGS);
      Swal.fire('Success!', 'Settings updated successfully.', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      const message = error.response?.data?.message || 'Failed to update settings';
      Swal.fire('Error!', message, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const getTabsConfig = () => {
    return SITE_SETTING_CATEGORIES.map((category) => ({
      id: category.value,
      label: category.label,
      icon: getCategoryIcon(category.value),
    }));
  };

  const getCategoryIcon = (category) => {
    const icons = {
      general: 'bx bx-cog',
      appearance: 'bx bx-palette',
      email: 'bx bx-envelope',
      security: 'bx bx-shield',
      integration: 'bx bx-link-alt',
      branding: 'bx bx-star',
      performance: 'bx bx-tachometer',
      api: 'bx bx-code-block',
    };
    return icons[category] || 'bx bx-cog';
  };

  if (isLoading) {
    return (
      <>
        <BreadCumb title="Site Settings" parent="Settings" />
        <Container className="py-5 text-center">
          <Spinner color="primary" />
        </Container>
      </>
    );
  }

  return (
    <>
      <BreadCumb pageList={["Settings", "Site Settings"]} />
      <Container fluid className="site-settings-container py-4">
        <Row className="mb-4">
          <Col>
            <h1 className="page-title">
              <i className="bx bx-cog"></i> Site Settings
            </h1>
            <p className="text-muted">
              Manage all critical site details and configuration
            </p>
          </Col>
        </Row>

        {error && (
          <Row className="mb-3">
            <Col>
              <Alert color="danger" isOpen={!!error} toggle={() => setError(null)}>
                {error}
              </Alert>
            </Col>
          </Row>
        )}

        <TabsContainer 
          tabs={getTabsConfig()} 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
        />

        <Row>
          <Col className="content-col">
            <TabContent activeTab={activeTab} className="settings-content">
              {/* General Settings */}
              <TabPane tabId="general">
                <GeneralSettingsForm
                  data={currentSettings}
                  onSave={handleSaveSettings}
                  isLoading={isUpdating}
                />
              </TabPane>

              {/* Appearance Settings */}
              <TabPane tabId="appearance">
                <AppearanceSettingsForm
                  data={currentSettings}
                  onSave={handleSaveSettings}
                  isLoading={isUpdating}
                />
              </TabPane>

              {/* Email Configuration */}
              <TabPane tabId="email">
                <EmailConfigurationForm
                  data={currentSettings}
                  onSave={handleSaveSettings}
                  isLoading={isUpdating}
                />
              </TabPane>

              {/* Security Settings */}
              <TabPane tabId="security">
                <SecuritySettingsForm
                  data={currentSettings}
                  onSave={handleSaveSettings}
                  isLoading={isUpdating}
                />
              </TabPane>

              {/* Integration Settings */}
              <TabPane tabId="integration">
                <IntegrationSettingsForm
                  data={currentSettings}
                  onSave={handleSaveSettings}
                  isLoading={isUpdating}
                />
              </TabPane>

              {/* Branding Settings */}
              <TabPane tabId="branding">
                <BrandingSettingsForm
                  data={currentSettings}
                  onSave={handleSaveSettings}
                  isLoading={isUpdating}
                />
              </TabPane>

              {/* Performance Settings */}
              <TabPane tabId="performance">
                <PerformanceSettingsForm
                  data={currentSettings}
                  onSave={handleSaveSettings}
                  isLoading={isUpdating}
                />
              </TabPane>

              {/* API Settings */}
              <TabPane tabId="api">
                <ApiSettingsForm
                  data={currentSettings}
                  onSave={handleSaveSettings}
                  isLoading={isUpdating}
                />
              </TabPane>
            </TabContent>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default SiteSettingsPage;
