// DashboardQueries.jsx
import { fetchData } from "../../../../utils/GlobalQueries";

export const dashboardService = {
  // Get comprehensive dashboard data
  getAllDashboardData: async () => {
    try {
      // Get main dashboard overview
      const dashboardResponse = await fetchData({
        url: '/unisync360-dashboard/overview/',
      });

      const dashboardData = dashboardResponse.data || {};

      // Get additional data in parallel for better performance
      const [
        studentMetricsResponse,
        revenueChartResponse,
        applicationStatusResponse,
        performanceMetricsResponse
      ] = await Promise.all([
        fetchData({ url: '/unisync360-dashboard/widgets/student-metrics/' }),
        fetchData({ url: '/unisync360-dashboard/widgets/revenue-chart/' }),
        fetchData({ url: '/unisync360-dashboard/widgets/application-status/' }),
        fetchData({ url: '/unisync360-dashboard/widgets/performance-metrics/' })
      ]);

      return {
        ...dashboardData,
        student_metrics: studentMetricsResponse.data || dashboardData.student_metrics,
        revenue_chart: revenueChartResponse.data || dashboardData.revenue_chart,
        application_status_chart: applicationStatusResponse.data || dashboardData.application_status_chart,
        performance_metrics: performanceMetricsResponse.data || dashboardData.performance_metrics
      };
    } catch (error) {
      console.error('Dashboard Data Error:', error);
      throw error;
    }
  },

  // Get counselor-specific dashboard
  getCounselorDashboard: async () => {
    const response = await fetchData({ url: '/unisync360-dashboard/counselor/' });
    return response.data || {};
  },

  // Get manager dashboard
  getManagerDashboard: async () => {
    const response = await fetchData({ url: '/unisync360-dashboard/manager/' });
    return response.data || {};
  },

  // Export dashboard data
  exportDashboard: async (format = 'json', type = 'overview') => {
    return fetchData({
      url: '/unisync360-dashboard/export/',
      filter: { format, type }
    });
  }
};

export default dashboardService;