import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { PetProvider } from './context/PetContext';
import { PetThemeProvider, usePetTheme } from './context/PetThemeContext';
import { NavigationDirectionController } from './components/NavigationDirectionController';
import { FixedBackgroundLayer } from './components/FixedBackgroundLayer';
import { SlidingPageContainer } from './components/SlidingPageContainer';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { FloatingBottomNav } from './components/FloatingBottomNav';

import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { PetsPage } from './pages/PetsPage';
import { PetOverviewPage } from './pages/PetOverviewPage';
import { PetFormPage } from './pages/PetFormPage';
import { VaccinationsPage } from './pages/VaccinationsPage';
import { VaccinationHistoryPage } from './pages/VaccinationHistoryPage';
import { MedicalReportsPage } from './pages/MedicalReportsPage';
import { HealthRedirectPage } from './pages/HealthRedirectPage';
import { ProfilePage } from './pages/ProfilePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const AppContent: React.FC = () => {
  const { theme } = usePetTheme();

  return (
    <div className={`app-container theme-${theme}`}>
      {/* Fixed Stationary Background Layer
          Stays completely fixed in viewport space.
          Only cross-fades Dog/Cat/Neutral themes when pet selection changes.
          Never shifts or participates in horizontal page transitions. */}
      <FixedBackgroundLayer />

      {/* Sticky Top Navbar */}
      <Navbar />

      {/* Foreground Content with Direction-Aware Sliding Page Transitions */}
      <main className="main-content">
        <SlidingPageContainer>
          <Routes>
            {/* Public Authentication routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Application routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/pets" element={<PetsPage />} />
              <Route path="/pets/new" element={<PetFormPage />} />
              <Route path="/pets/:petId" element={<PetOverviewPage />} />
              <Route path="/pets/:petId/edit" element={<PetFormPage />} />
              <Route path="/pets/:petId/vaccinations" element={<VaccinationsPage />} />
              <Route path="/pets/:petId/history" element={<VaccinationHistoryPage />} />
              <Route path="/pets/:petId/reports" element={<MedicalReportsPage />} />
              <Route path="/health" element={<HealthRedirectPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SlidingPageContainer>
      </main>

      {/* Floating Pill Bottom Navigation Dock */}
      <FloatingBottomNav />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PetProvider>
          <PetThemeProvider>
            <BrowserRouter>
              <NavigationDirectionController>
                <AppContent />
              </NavigationDirectionController>
            </BrowserRouter>
          </PetThemeProvider>
        </PetProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
