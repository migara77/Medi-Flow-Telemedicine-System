import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Register from './components/Register';
import PatientDashboard from './components/PatientDashboard';
import DoctorList from './components/DoctorList';
import BookAppointment from './components/BookAppointment';
import BookAppointmentComplete from './components/BookAppointmentComplete';
import Payment from './components/Payment';
import PatientAppointments from './components/PatientAppointments';
import MyPrescriptions from './components/MyPrescriptions';
import PatientProfile from './components/PatientProfile';
import MedicalRecords from './components/MedicalRecords';
import DoctorDashboard from './components/DoctorDashboard';
import DoctorPrescriptions from './components/DoctorPrescriptions';
import CreatePrescription from './components/CreatePrescription';
import DoctorAvailability from './components/DoctorAvailability';
import AdminDashboard from './components/AdminDashboard';
import AdminAnalytics from './components/AdminAnalytics';
import { useTheme } from './stores/theme';

function App() {
  const { theme } = useTheme();
  useEffect(() => {
    // Ensure dark class is applied on first paint
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PATIENT */}
        <Route path="/patient-dashboard" element={<ProtectedRoute requiredRole="patient"><PatientDashboard /></ProtectedRoute>} />
        <Route path="/doctors" element={<ProtectedRoute requiredRole="patient"><DoctorList /></ProtectedRoute>} />
        <Route path="/book-appointment" element={<ProtectedRoute requiredRole="patient"><BookAppointment /></ProtectedRoute>} />
        <Route path="/book-appointment/:doctorId" element={<ProtectedRoute requiredRole="patient"><BookAppointment /></ProtectedRoute>} />
        <Route path="/booking-complete" element={<ProtectedRoute requiredRole="patient"><BookAppointmentComplete /></ProtectedRoute>} />
        <Route path="/payment/:appointmentId" element={<ProtectedRoute requiredRole="patient"><Payment /></ProtectedRoute>} />
        <Route path="/my-appointments" element={<ProtectedRoute requiredRole="patient"><PatientAppointments /></ProtectedRoute>} />
        <Route path="/my-prescriptions" element={<ProtectedRoute requiredRole="patient"><MyPrescriptions /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><PatientProfile /></ProtectedRoute>} />
        <Route path="/medical-records" element={<ProtectedRoute requiredRole="patient"><MedicalRecords /></ProtectedRoute>} />

        {/* DOCTOR */}
        <Route path="/doctor-dashboard" element={<ProtectedRoute requiredRole="doctor"><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/doctor-prescriptions" element={<ProtectedRoute requiredRole="doctor"><DoctorPrescriptions /></ProtectedRoute>} />
        <Route path="/create-prescription" element={<ProtectedRoute requiredRole="doctor"><CreatePrescription /></ProtectedRoute>} />
        <Route path="/doctor-availability" element={<ProtectedRoute requiredRole="doctor"><DoctorAvailability /></ProtectedRoute>} />

        {/* ADMIN */}
        <Route path="/admin-dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin-analytics" element={<ProtectedRoute requiredRole="admin"><AdminAnalytics /></ProtectedRoute>} />

        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3500}
        newestOnTop
        pauseOnFocusLoss
        theme={theme === 'dark' ? 'dark' : 'light'}
        toastClassName="!rounded-xl !shadow-soft"
      />
    </Router>
  );
}

export default App;
