export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  date_joined: string;
}

export type Species = 'cat' | 'dog' | 'other';

export interface Pet {
  id: string;
  name: string;
  species: Species;
  breed?: string;
  gender?: string;
  weight?: string;
  date_of_birth: string | null;
  estimated_age: string;
  photo_key: string;
  photo_url: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
  vaccination_count: number;
  upcoming_vaccinations: number;
  overdue_vaccinations: number;
}

export type VaccinationStatus = 'UPCOMING' | 'DUE_SOON' | 'OVERDUE' | 'COMPLETED';

export interface VaccinationRecord {
  id: string;
  pet: string;
  vaccine_name: string;
  due_date: string;
  is_completed: boolean;
  administered_date: string | null;
  vet_clinic: string;
  next_due_date: string | null;
  notes: string;
  status: VaccinationStatus;
  created_at: string;
  updated_at: string;
}

export interface MedicalReport {
  id: string;
  pet: string;
  title: string;
  document_date: string;
  description: string;
  original_filename: string;
  mime_type: string;
  file_size_bytes: number;
  file_size_display: string;
  file_url: string;
  download_url: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardPetSummary {
  id: string;
  name: string;
  species: Species;
  breed?: string;
  gender?: string;
  weight?: string;
  date_of_birth?: string | null;
  estimated_age?: string;
  has_photo: boolean;
  photo_url: string | null;
  upcoming_count: number;
  overdue_count: number;
  upcoming_vaccinations: {
    id: string;
    vaccine_name: string;
    due_date: string;
    days_until_due: number;
  }[];
  overdue_vaccinations: {
    id: string;
    vaccine_name: string;
    due_date: string;
    days_overdue: number;
  }[];
}

export interface DashboardData {
  pets: DashboardPetSummary[];
  totals: {
    pet_count: number;
    upcoming_vaccinations: number;
    overdue_vaccinations: number;
  };
}

