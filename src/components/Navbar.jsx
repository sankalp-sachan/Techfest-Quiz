import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut, LayoutDashboard, User, Trophy, BarChart2 } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { darkMode, toggleDarkMode } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="sticky top-0 z-50 glass shadow-sm px-6 py-4 flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
                QuizHub
            </Link>

            <div className="flex items-center gap-6">
                {user && (
                    <div className="hidden md:flex items-center gap-6">
                        <Link to="/dashboard" className="flex items-center gap-2 hover:text-primary-600 font-medium">
                            <LayoutDashboard size={20} /> Dashboard
                        </Link>
                        {user.role === 'admin' && (
                            <Link to="/admin" className="flex items-center gap-2 hover:text-primary-600 font-medium">
                                <BarChart2 size={20} /> Admin
                            </Link>
                        )}
                        {user.role === 'judge' && (
                            <Link to="/judge-dashboard" className="flex items-center gap-2 hover:text-primary-600 font-medium">
                                <BarChart2 size={20} /> Judge Panel
                            </Link>
                        )}
                        {user.role === 'user' && (
                            <>
                                <Link to="/history" className="flex items-center gap-2 hover:text-primary-600 font-medium">
                                    <User size={20} /> History
                                </Link>
                                <Link to="/leaderboard" className="flex items-center gap-2 hover:text-primary-600 font-medium">
                                    <Trophy size={20} /> Leaderboard
                                </Link>
                            </>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="hidden sm:inline font-medium text-sm px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full">
                                {user.name} ({user.role})
                            </span>
                            <button onClick={handleLogout} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full transition-colors">
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-4">
                            <Link to="/login" className="font-medium hover:text-primary-600">Login</Link>
                            <Link to="/register" className="btn btn-primary text-sm px-4 py-1.5">Sign Up</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
