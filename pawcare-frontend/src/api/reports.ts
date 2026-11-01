import { apiClient } from './client';
import type { MedicalReport } from '../types';

export const reportsApi = {
  async list(petId: string): Promise<MedicalReport[]> {
    const res = await apiClient.get<MedicalReport[]>(`/pets/${petId}/reports/`);
    return res.data;
  },

  async get(petId: string, id: string): Promise<MedicalReport> {
    const res = await apiClient.get<MedicalReport>(`/pets/${petId}/reports/${id}/`);
    return res.data;
  },

  async upload(petId: string, data: { file: File; title: string; document_date: string; description?: string }): Promise<MedicalReport> {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('title', data.title);
    formData.append('document_date', data.document_date);
    if (data.description) {
      formData.append('description', data.description);
    }
    const res = await apiClient.post<MedicalReport>(`/pets/${petId}/reports/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async delete(petId: string, id: string): Promise<void> {
    await apiClient.delete(`/pets/${petId}/reports/${id}/`);
  },

  /**
   * Securely retrieve the file blob using authenticated axios client,
   * enabling private file preview and download without leaking tokens in URL.
   */
  async getFileBlob(petId: string, reportId: string, download = false): Promise<{ blob: Blob; filename: string }> {
    const url = `/pets/${petId}/reports/${reportId}/file/${download ? '?download=true' : ''}`;
    const res = await apiClient.get(url, { responseType: 'blob' });
    
    // Parse filename from Content-Disposition if present
    let filename = 'document';
    const disposition = res.headers['content-disposition'];
    if (disposition && disposition.indexOf('filename=') !== -1) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) filename = match[1];
    }
    return { blob: res.data, filename };
  },
};
