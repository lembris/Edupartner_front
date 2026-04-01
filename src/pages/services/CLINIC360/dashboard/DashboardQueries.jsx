import { fetchData } from "../../../../utils/GlobalQueries.jsx";

export const dashboardService = {
  getAllDashboardData: async () => {
    try {
      const response = await fetchData({
        url: '/clinic360-dashboard/',
      });
      return response.data || response;
    } catch (error) {
      console.error('Clinic Dashboard Data Error:', error);
      throw error;
    }
  },
};

export default dashboardService;
