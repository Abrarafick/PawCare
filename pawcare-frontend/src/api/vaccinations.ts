import { apiClient } from './client';
import type { VaccinationRecord } from '../types';

export const vaccinationsApi = {
  async list(petId: string, status?: 'UPCOMING' | 'OVERDUE' | 'COMPLETED' | 'PENDING'): Promise<VaccinationRecord[]> {
    const params = status ? { status } : {};
    const res = await apiClient.get<VaccinationRecord[]>(`/pets/${petId}/vaccinations/`, { params });
    return res.data;
  },

  async get(petId: string, id: string): Promise<VaccinationRecord> {
    const res = await apiClient.get<VaccinationRecord>(`/pets/${petId}/vaccinations/${id}/`);
    return res.data;
  },

  async create(petId: string, data: {
    vaccine_name: string;
    due_date: string;
    vet_clinic?: string;
    next_due_date?: string | null;
    notes?: string;
  }): Promise<VaccinationRecord> {
    const res = await apiClient.post<VaccinationRecord>(`/pets/${petId}/vaccinations/`, data);
    return res.data;
  },

  async update(petId: string, id: string, data: Partial<VaccinationRecord>): Promise<VaccinationRecord> {
    const res = await apiClient.patch<VaccinationRecord>(`/pets/${petId}/vaccinations/${id}/`, data);
    return res.data;
  },

  async markComplete(
    petId: string,
    id: string,
    data: {
      administered_date: string;
      vet_clinic?: string;
      next_due_date?: string | null;
      notes?: string;
    }
  ): Promise<VaccinationRecord> {
    const res = await apiClient.patch<VaccinationRecord>(`/pets/${petId}/vaccinations/${id}/complete/`, data);
    return res.data;
  },

  async delete(petId: string, id: string): Promise<void> {
    await apiClient.delete(`/pets/${petId}/vaccinations/${id}/`);
  },
};
