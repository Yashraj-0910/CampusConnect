import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Components & Layouts
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ExploreClubs from './pages/ExploreClubs';
import ClubDetails from './pages/ClubDetails';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Roadmap from './pages/Roadmap';
import FAQ from './pages/FAQ';
import ResetPassword from './pages/ResetPassword';
import Venues from './pages/Venues';
import Messages from './pages/Messages';

// Student Pages
import StudentDashboard from './pages/StudentDashboard';
import Profile from './pages/Profile';
import Mentors from './pages/Mentors';

// Admin / Coordinator Dashboards
import AdminDashboard from './pages/AdminDashboard';
import CoordinatorDashboard from './pages/CoordinatorDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <div className="flex flex-col min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-indigo-500 selection:text-white">
            <Navbar />
            <main className="flex-grow pb-20 md:pb-0">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/explore" element={<ExploreClubs />} />
                <Route path="/clubs/:id" element={<ClubDetails />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:id" element={<EventDetails />} />
                <Route path="/venues" element={<Venues />} />
                <Route path="/roadmap" element={<Roadmap />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />

                {/* Messages & Chat Route */}
                <Route
                  path="/messages"
                  element={
                    <ProtectedRoute allowedRoles={['student', 'coordinator', 'admin']}>
                      <Messages />
                    </ProtectedRoute>
                  }
                />

                {/* Student Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute allowedRoles={['student', 'coordinator', 'admin']}>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mentors"
                  element={
                    <ProtectedRoute allowedRoles={['student', 'coordinator', 'admin']}>
                      <Mentors />
                    </ProtectedRoute>
                  }
                />

                {/* Coordinator Protected Routes */}
                <Route
                  path="/coordinator"
                  element={
                    <ProtectedRoute allowedRoles={['coordinator', 'admin']}>
                      <CoordinatorDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Protected Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Home />} />
              </Routes>
            </main>
            <Footer />
            <MobileBottomNav />
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

