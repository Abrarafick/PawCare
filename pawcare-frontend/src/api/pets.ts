import { apiClient } from './client';
import type { Pet } from '../types';

export const petsApi = {
  async list(): Promise<Pet[]> {
    const res = await apiClient.get<Pet[]>('/pets/');
    return res.data;
  },

  async get(id: string): Promise<Pet> {
    const res = await apiClient.get<Pet>(`/pets/${id}/`);
    return res.data;
  },

  async create(data: Partial<Pet>): Promise<Pet> {
    const res = await apiClient.post<Pet>('/pets/', data);
    return res.data;
  },

  async update(id: string, data: Partial<Pet>): Promise<Pet> {
    const res = await apiClient.patch<Pet>(`/pets/${id}/`, data);
    return res.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/pets/${id}/`);
  },

  async uploadPhoto(id: string, file: File): Promise<Pet> {
    const formData = new FormData();
    formData.append('photo', file);
    const res = await apiClient.post<Pet>(`/pets/${id}/photo/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async deletePhoto(id: string): Promise<void> {
    await apiClient.delete(`/pets/${id}/photo/`);
  },
};
