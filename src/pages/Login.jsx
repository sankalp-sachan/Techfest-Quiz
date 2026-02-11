import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Mail, Lock, LogIn } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

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

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        try {
            const { data } = await axios.post('/auth/google-login', {
                token: credentialResponse.credential
            });
            login(data);
            toast.success(`Welcome back, ${data.name}!`);
            navigate(data.role === 'admin' ? '/admin' : '/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Google login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
            <div className="glass w-full max-w-md p-8 rounded-3xl shadow-2xl border border-white/40 dark:border-white/10">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold mb-2 text-slate-800 dark:text-white">Welcome Back</h1>
                    <p className="text-slate-500 dark:text-slate-400">Log in to your account to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold px-1 text-slate-700 dark:text-slate-300">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="email"
                                required
                                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm border border-slate-200 dark:border-slate-700"
                                placeholder="email@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold px-1 text-slate-700 dark:text-slate-300">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="password"
                                required
                                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm border border-slate-200 dark:border-slate-700"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-lg transform transition active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processing...' : <><LogIn size={20} /> Login</>}
                    </button>
                </form>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-300 dark:border-slate-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded">Or continue with</span>
                    </div>
                </div>

                <div className="flex justify-center flex-col items-center">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => toast.error('Google Login Failed')}
                        useOneTap
                        theme="filled_blue"
                        shape="pill"
                        text="signin_with"
                    />
                </div>

                <p className="text-center mt-8 text-slate-500 dark:text-slate-400">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Sign Up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
