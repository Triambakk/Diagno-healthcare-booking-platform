import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CentersPage } from './pages/CentersPage';
import { CenterDetailPage } from './pages/CenterDetailPage';
import { ScansPage } from './pages/ScansPage';
import { BookingPage } from './pages/BookingPage';
import { BookingConfirmationPage } from './pages/BookingConfirmationPage';
import { PatientDashboardPage } from './pages/PatientDashboardPage';
import { AppointmentDetailPage } from './pages/AppointmentDetailPage';
import { StaffDashboardPage } from './pages/StaffDashboardPage';
import { ManageCentersPage } from './pages/ManageCentersPage';
import { ManageScansPage } from './pages/ManageScansPage';

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <div className="flex flex-col min-h-screen bg-[#FAF8F5] text-[#111110]">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Endpoints */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/centers" element={<CentersPage />} />
                <Route path="/centers/:id" element={<CenterDetailPage />} />
                <Route path="/scans" element={<ScansPage />} />
                <Route path="/book" element={<BookingPage />} />
                <Route path="/booking-confirmation" element={<BookingConfirmationPage />} />

                {/* Patient Protected Endpoints */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <PatientDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/appointments/:id"
                  element={
                    <ProtectedRoute>
                      <AppointmentDetailPage />
                    </ProtectedRoute>
                  }
                />

                {/* Staff Protected Endpoints */}
                <Route
                  path="/staff"
                  element={
                    <ProtectedRoute requireStaff>
                      <StaffDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/staff/centers"
                  element={
                    <ProtectedRoute requireStaff>
                      <ManageCentersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/staff/scans"
                  element={
                    <ProtectedRoute requireStaff>
                      <ManageScansPage />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<LandingPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
