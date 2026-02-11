import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Middleware
import { ProtectedRoute } from './middleware/ProtectedRoute';

// Components
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Quiz from './pages/Quiz';
import Result from './pages/Result';
import History from './pages/History';
import Leaderboard from './pages/Leaderboard';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AddQuestion from './pages/AddQuestion';
import ManageQuestions from './pages/ManageQuestions';
import AllScores from './pages/AllScores';
import JudgeDashboard from './pages/JudgeDashboard';
import CreateContest from './pages/CreateContest';
import ManageUsers from './pages/ManageUsers';

function App() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <Router>
                    <div className="min-h-screen flex flex-col transition-colors duration-300">
                        <Navbar />
                        <main className="flex-1">
                            <Routes>
                                {/* Public Routes */}
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/leaderboard" element={<Leaderboard />} />

                                {/* User Routes */}
                                <Route path="/dashboard" element={
                                    <ProtectedRoute>
                                        <Dashboard />
                                    </ProtectedRoute>
                                } />
                                <Route path="/quiz" element={
                                    <ProtectedRoute>
                                        <Quiz />
                                    </ProtectedRoute>
                                } />
                                <Route path="/result" element={
                                    <ProtectedRoute>
                                        <Result />
                                    </ProtectedRoute>
                                } />
                                <Route path="/history" element={
                                    <ProtectedRoute>
                                        <History />
                                    </ProtectedRoute>
                                } />

                                {/* Admin Routes */}
                                <Route path="/admin" element={
                                    <ProtectedRoute adminOnly>
                                        <AdminDashboard />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/create-contest" element={
                                    <ProtectedRoute adminOnly>
                                        <CreateContest />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/add-question" element={
                                    <ProtectedRoute adminOnly>
                                        <AddQuestion />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/edit-question/:id" element={
                                    <ProtectedRoute adminOnly>
                                        <AddQuestion />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/questions" element={
                                    <ProtectedRoute adminOnly>
                                        <ManageQuestions />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/all-scores" element={
                                    <ProtectedRoute adminOnly>
                                        <AllScores />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/users" element={
                                    <ProtectedRoute adminOnly>
                                        <ManageUsers />
                                    </ProtectedRoute>
                                } />

                                {/* Judge Routes */}
                                <Route path="/judge" element={
                                    <ProtectedRoute role="judge">
                                        <JudgeDashboard />
                                    </ProtectedRoute>
                                } />

                                {/* Default Route */}
                                <Route path="/" element={<Navigate to="/dashboard" />} />
                            </Routes>
                        </main>
                        <Toaster position="bottom-right" />
                    </div>
                </Router>
            </ThemeProvider>
        </AuthProvider>
    );
}

export default App;
