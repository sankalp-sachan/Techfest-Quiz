import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, adminOnly = false, role = null }) => {
    const { user, loading } = useAuth();

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    if (!user) return <Navigate to="/login" />;

    if (adminOnly && user.role !== 'admin') {
        return <Navigate to="/dashboard" />;
    }

    if (role && user.role !== role && user.role !== 'admin') {
        return <Navigate to="/dashboard" />;
    }

    return children;
};
