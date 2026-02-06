import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useLocation, Link } from 'react-router-dom';
import { Trophy, Clock, Calendar, Search, Filter, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Loader from '../components/Loader';

const AllScores = () => {
    const [scores, setScores] = useState([]);
    const [filteredScores, setFilteredScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchAllScores();
    }, []);

    const fetchAllScores = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get('https://techfest-quiz-backend.onrender.com/api/quiz/all-scores', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setScores(data);
            setFilteredScores(data);
        } catch (error) {
            toast.error('Failed to fetch user scores');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const results = scores.filter(score =>
            score.userId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            score.userId?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            score.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredScores(results);
    }, [searchTerm, scores]);

    if (loading) return <Loader text="Loading User Scores..." />;

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <Link to="/admin" className="flex items-center gap-2 text-primary-600 font-bold mb-4 hover:gap-3 transition-all">
                        <ChevronLeft size={20} /> Back to Dashboard
                    </Link>
                    <h1 className="text-4xl font-bold mb-2">User Scores</h1>
                    <p className="text-slate-500 dark:text-slate-400">View and analyze all quiz attempts on the platform</p>
                </div>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name, email or category..."
                        className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="glass overflow-hidden rounded-[2.5rem] shadow-xl border-white/40">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-950/50">
                                <th className="px-8 py-6 text-sm font-bold uppercase tracking-widest text-slate-400">User</th>
                                <th className="px-8 py-6 text-sm font-bold uppercase tracking-widest text-slate-400">Category</th>
                                <th className="px-8 py-6 text-sm font-bold uppercase tracking-widest text-slate-400 text-center">Score</th>
                                <th className="px-8 py-6 text-sm font-bold uppercase tracking-widest text-slate-400 text-center">Time</th>
                                <th className="px-8 py-6 text-sm font-bold uppercase tracking-widest text-slate-400">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredScores.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-12 text-center text-slate-400 font-medium">No quiz attempts found.</td>
                                </tr>
                            ) : (
                                filteredScores.map((score, idx) => (
                                    <motion.tr
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={score._id}
                                        className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group"
                                    >
                                        <td className="px-8 py-6">
                                            <div>
                                                <div className="font-bold text-lg group-hover:text-primary-600 transition-colors">{score.userId?.name || 'Unknown User'}</div>
                                                <div className="text-sm text-slate-400">{score.userId?.email || 'N/A'}</div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/10 text-primary-600 text-xs font-bold uppercase tracking-widest border border-primary-100 dark:border-primary-900/30">
                                                {score.category}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col items-center">
                                                <div className="text-2xl font-black text-slate-800 dark:text-white">
                                                    {score.score}<span className="text-sm text-slate-400 font-medium ml-1">/ {score.totalQuestions}</span>
                                                </div>
                                                <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${score.score / score.totalQuestions >= 0.7 ? 'bg-green-500' : score.score / score.totalQuestions >= 0.4 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                        style={{ width: `${(score.score / score.totalQuestions) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-center gap-2 text-slate-400 font-bold">
                                                <Clock size={16} />
                                                {score.timeTaken}s
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-slate-500 font-medium italic">
                                                <Calendar size={16} className="text-slate-300" />
                                                {new Date(score.submittedAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AllScores;
