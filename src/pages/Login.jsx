import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Mail, Lock, LogIn } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.post('/auth/login', formData);
            login(data);
            toast.success(`Welcome back, ${data.name}!`);
            navigate(data.role === 'admin' ? '/admin' : '/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100-80px)] flex items-center justify-center p-6">
            <div className="glass w-full max-w-md p-8 rounded-3xl shadow-2xl border-white/40">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold mb-2">Welcome Back</h1>
                    <p className="text-slate-500 dark:text-slate-400">Log in to your account to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold px-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="email"
                                required
                                className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                placeholder="email@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold px-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="password"
                                required
                                className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn btn-primary py-4 flex items-center justify-center gap-2 text-lg"
                    >
                        {loading ? 'Logging in...' : <><LogIn size={20} /> Login</>}
                    </button>
                </form>

                <p className="text-center mt-8 text-slate-500 dark:text-slate-400">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary-600 font-bold hover:underline">Sign Up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
