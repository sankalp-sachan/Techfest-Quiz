import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { User, Mail, Lock, UserPlus, Phone } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.post('/auth/register', formData);
            login(data);
            toast.success('Account created successfully!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        try {
            const { data } = await axios.post('/auth/google-login', {
                token: credentialResponse.credential
            });
            login(data);
            toast.success(`Welcome, ${data.name}!`);
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Google registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
            <div className="glass w-full max-w-md p-8 rounded-3xl shadow-2xl border border-white/40 dark:border-white/10">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold mb-2 text-slate-800 dark:text-white">Create Account</h1>
                    <p className="text-slate-500 dark:text-slate-400">Join our quiz community today</p>
                </div>

                <div className="flex justify-center mb-6">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => toast.error('Google Sign Up Failed')}
                        useOneTap
                        theme="filled_blue"
                        shape="pill"
                        text="signup_with"
                        width="100%"
                    />
                </div>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-300 dark:border-slate-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded">Or register with email</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-semibold px-1 text-slate-700 dark:text-slate-300">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                required
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold px-1 text-slate-700 dark:text-slate-300">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="email"
                                required
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                                placeholder="email@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold px-1 text-slate-700 dark:text-slate-300">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="password"
                                required
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold px-1 text-slate-700 dark:text-slate-300">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="tel"
                                required
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                                placeholder="1234567890"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-lg mt-4 transform transition active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating account...' : <><UserPlus size={20} /> Sign Up</>}
                    </button>
                </form>

                <p className="text-center mt-8 text-slate-500 dark:text-slate-400">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Log In</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
