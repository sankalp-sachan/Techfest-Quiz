import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Users, BookOpen, BarChart3, Activity, Plus, Search, ChevronRight, Gavel, UserCog } from 'lucide-react';
import { motion } from 'framer-motion';
import Loader from '../components/Loader';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { data } = await axios.get('/quiz/analytics');
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader text="Loading Analytics..." />;

    const cards = [
        { title: 'Total Users', value: stats?.totalUsers, icon: <Users size={24} />, color: 'bg-blue-500' },
        { title: 'Total Attempts', value: stats?.totalAttempts, icon: <Activity size={24} />, color: 'bg-indigo-500' },
        { title: 'Average Score', value: stats?.avgScore?.toFixed(1), icon: <BarChart3 size={24} />, color: 'bg-green-500' },
        { title: 'Categories', value: stats?.categoryDist?.length, icon: <BookOpen size={24} />, color: 'bg-purple-500' },
    ];

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage questions and monitor platform performance</p>
                </div>
                <div className="flex gap-4">
                    <Link to="/admin/create-contest" className="btn btn-primary flex items-center gap-2">
                        <Plus size={20} /> Create Contest
                    </Link>
                    <Link to="/admin/add-question" className="px-6 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-800 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-2">
                        <Plus size={20} /> Add Question
                    </Link>
                    <Link to="/admin/questions" className="px-6 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-800 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-2">
                        <Search size={20} /> Manage Questions
                    </Link>
                    <Link to="/admin/users" className="px-6 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-800 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-2">
                        <UserCog size={20} /> Users
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                {cards.map((card, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={card.title}
                        className="glass p-8 rounded-[2rem] shadow-xl border-white/40 group overflow-hidden relative"
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 ${card.color} opacity-5 -mr-8 -mt-8 rounded-full transition-transform group-hover:scale-150`}></div>
                        <div className={`${card.color} text-white p-4 rounded-2xl w-fit mb-6 shadow-lg shadow-${card.color.split('-')[1]}-500/20`}>
                            {card.icon}
                        </div>
                        <h3 className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">{card.title}</h3>
                        <p className="text-4xl font-black">{card.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="glass p-8 rounded-[2rem] shadow-xl border-white/40">
                    <h3 className="text-xl font-bold mb-8">Quick Actions</h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Register New Admin', link: '/register', icon: <Users size={18} /> },
                            { label: 'Add New Question', link: '/admin/add-question', icon: <Plus size={18} /> },
                            { label: 'View All User Scores', link: '/admin/all-scores', icon: <BarChart3 size={18} /> },
                            { label: 'View Judge Dashboard', link: '/judge', icon: <Gavel size={18} /> },
                            { label: 'Manage All Questions', link: '/admin/questions', icon: <BookOpen size={18} /> },
                            { label: 'Manage Users & Roles', link: '/admin/users', icon: <UserCog size={18} /> },
                        ].map((item, idx) => (
                            <Link key={idx} to={item.link} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-transparent hover:border-primary-500 transition-all group">
                                <span className="flex items-center gap-4 font-bold">
                                    <span className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm text-primary-600">{item.icon}</span>
                                    {item.label}
                                </span>
                                <ChevronRight size={20} className="text-slate-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="glass p-8 rounded-[2rem] shadow-xl border-white/40">
                    <h3 className="text-xl font-bold mb-8 font-poppins">Popular Categories</h3>
                    <div className="space-y-6">
                        {stats?.categoryDist?.map((cat, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex justify-between text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 px-1">
                                    <span>{cat._id}</span>
                                    <span>{cat.count} Attempts</span>
                                </div>
                                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full">
                                    <div className="h-full bg-primary-600 rounded-full" style={{ width: `${(cat.count / stats.totalAttempts) * 100}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
