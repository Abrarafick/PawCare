import { apiClient } from './client';
import type { DashboardData } from '../types';

export const dashboardApi = {
  async getSummary(): Promise<DashboardData> {
    const res = await apiClient.get<DashboardData>('/dashboard/');
    return res.data;
  },
};
