import React, { useState, useEffect } from 'react';
import Loader from '../components/Loader';
import axios from 'axios';
import api from '../utils/api';
import { Gavel, Users, BarChart3, Clock, X, ChevronLeft, Calendar, AlertTriangle, CheckCircle2, Trophy, FileCheck, Eye, EyeOff, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const JudgeDashboard = () => {
    const { user } = useAuth();
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAttempt, setSelectedAttempt] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ show: false, type: null });
    const [stats, setStats] = useState(null);

    const [activeContest, setActiveContest] = useState(null);
    const [allContests, setAllContests] = useState([]);
    const [selectedContestFilter, setSelectedContestFilter] = useState('all');
    const [confirmInput, setConfirmInput] = useState('');

    const openConfirmModal = (type) => {
        setConfirmInput('');
        setConfirmModal({ show: true, type });
    };

    const filteredScores = scores.filter(score => {
        if (selectedContestFilter === 'all') return true;
        if (selectedContestFilter === 'practice') return !score.contestId;
        return score.contestId === selectedContestFilter;
    });

    const isAllLeaderboardPublished = filteredScores.length > 0 && filteredScores.every(s => s.isPublished);
    const isAllAnalysisPublished = filteredScores.length > 0 && filteredScores.every(s => s.isAnalysisPublished);

    useEffect(() => {
        fetchScores();
        fetchStats();
        fetchActiveContest();
    }, []);

    const fetchActiveContest = async () => {
        try {
            const { data } = await api.get('/contests');
            setAllContests(data);
            // Find current active contest
            const now = new Date();
            const current = data.find(c => new Date(c.startTime) <= now && new Date(c.endTime) >= now);
            setActiveContest(current);
        } catch (error) {
            console.error(error);
        }
    }

    const currentAvgScore = filteredScores.length > 0
        ? (filteredScores.reduce((acc, curr) => acc + curr.score, 0) / filteredScores.length)
        : 0;

    const uniqueParticipants = new Set(filteredScores.map(s => s.userId?._id)).size;


    const handleToggleBacktracking = async (contestId, currentStatus) => {
        try {
            const { data } = await api.patch(`/contests/${contestId}`, {
                allowBacktracking: !currentStatus
            });

            setAllContests(prev => prev.map(c => c._id === contestId ? { ...c, allowBacktracking: !currentStatus } : c));

            if (activeContest && activeContest._id === contestId) {
                setActiveContest(prev => ({ ...prev, allowBacktracking: !currentStatus }));
            }

            toast.success(`Backtracking ${!currentStatus ? 'Enabled' : 'Disabled'}`);
        } catch (error) {
            toast.error('Failed to update settings');
        }
    };

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/quiz/analytics');
            setStats(data);
        } catch (error) {
            console.error(error);
        }
    }

    const fetchScores = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await api.get('/quiz/all-scores');
            setScores(data);
        } catch (error) {
            console.error('Error fetching scores:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePublish = async (id, currentStatus, field) => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await api.patch(`/quiz/publish/${id}`, {
                publish: !currentStatus,
                field
            });
            toast.success(`${field === 'leaderboard' ? 'Leaderboard' : 'Analysis'} ${!currentStatus ? 'Published' : 'Hidden'}!`);

            // Update local state for immediate feedback in modal
            if (selectedAttempt && selectedAttempt._id === id) {
                setSelectedAttempt(data);
            }
            fetchScores();
        } catch (error) {
            toast.error('Failed to update status');
        }
    }

    const handlePublishAll = async (type) => {
        try {
            const token = localStorage.getItem('token');
            const endpoint = type === 'leaderboard' ? 'publish-leaderboard' : 'publish-analysis';
            const currentBulkStatus = type === 'leaderboard' ? isAllLeaderboardPublished : isAllAnalysisPublished;

            await api.post(`/quiz/${endpoint}`, {
                publish: !currentBulkStatus,
                contestId: selectedContestFilter
            });

            toast.success(`${type === 'leaderboard' ? 'Leaderboard' : 'Analysis'} ${!currentBulkStatus ? 'Published' : 'Hidden'}!`);
            setConfirmModal({ show: false, type: null });
            fetchScores();
        } catch (error) {
            toast.error(`Failed to update ${type}`);
        }
    }


    // ... (existing imports)

    // ...

    if (loading) return <Loader text="Loading Judge Panel..." />;

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-10 min-h-screen">
            {/* Header Section */}
            <div className="relative mb-12">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-3xl -z-10 rounded-full" />
                <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-center">
                        <div>
                            {user?.role === 'admin' && (
                                <Link to="/admin" className="flex items-center gap-2 text-slate-500 hover:text-primary-600 font-bold mb-4 transition-all group">
                                    <div className="p-2 rounded-full bg-white dark:bg-slate-800 shadow-sm group-hover:shadow-md transition-all">
                                        <ChevronLeft size={16} />
                                    </div>
                                    <span>Back to Admin Dashboard</span>
                                </Link>
                            )}

                            {selectedContestFilter !== 'all' && (
                                <button
                                    onClick={() => setSelectedContestFilter('all')}
                                    className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black mb-2 hover:underline"
                                >
                                    <Layers size={16} /> View All Contests
                                </button>
                            )}

                            <h1 className="text-4xl md:text-5xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 filter drop-shadow-sm flex items-center gap-4">
                                <span className="p-3 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
                                    <Gavel size={32} />
                                </span>
                                {selectedContestFilter === 'all' ? 'Judge Panel' : (
                                    selectedContestFilter === 'practice' ? 'Practice Arena' :
                                        (allContests.find(c => c._id === selectedContestFilter)?.title || 'Contest Details')
                                )}
                            </h1>
                            <p className="text-xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl">
                                {selectedContestFilter === 'all'
                                    ? 'Select a contest below to review submissions, manage results, and publish leaderboards.'
                                    : 'Manage participant results and publication status for this specific event.'}
                            </p>
                        </div>

                        {/* Action Buttons - Only visible in Detailed View */}
                        {selectedContestFilter !== 'all' && (
                            <div className="flex flex-wrap gap-3 items-center">
                                {/* Admin Backtracking Settings - Available for ANY selected contest */}
                                {user?.role === 'admin' && (() => {
                                    const targetContest = allContests.find(c => c._id === selectedContestFilter);
                                    if (!targetContest) return null;

                                    return (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleToggleBacktracking(targetContest._id, targetContest.allowBacktracking)}
                                            className={`px-6 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-lg backdrop-blur-md transition-all border ${targetContest.allowBacktracking
                                                ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                                                : 'bg-slate-500/10 border-slate-500/20 text-slate-600 dark:text-slate-400'
                                                }`}
                                        >
                                            <div className={`p-1.5 rounded-lg ${targetContest.allowBacktracking ? 'bg-amber-500 text-white' : 'bg-slate-500 text-white'}`}>
                                                {targetContest.allowBacktracking ? <CheckCircle2 size={16} /> : <X size={16} />}
                                            </div>
                                            {targetContest.allowBacktracking ? 'Backtracking ON' : 'Backtracking OFF'}
                                        </motion.button>
                                    );
                                })()}

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => openConfirmModal('leaderboard')}
                                    className={`px-6 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-lg backdrop-blur-md transition-all border ${isAllLeaderboardPublished
                                        ? 'bg-slate-800 text-white border-slate-700 shadow-slate-900/20'
                                        : 'bg-white dark:bg-slate-800 text-indigo-600 border-indigo-100 dark:border-indigo-900/50 shadow-indigo-500/10'
                                        }`}
                                >
                                    <div className={`p-1.5 rounded-lg ${isAllLeaderboardPublished ? 'bg-slate-600 text-slate-300' : 'bg-indigo-600 text-white'}`}>
                                        {isAllLeaderboardPublished ? <EyeOff size={16} /> : <Trophy size={16} />}
                                    </div>
                                    {isAllLeaderboardPublished ? 'Hide LB' : 'Publish LB'}
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => openConfirmModal('analysis')}
                                    className={`px-6 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-lg shadow-primary-500/20 transition-all border ${isAllAnalysisPublished
                                        ? 'bg-slate-800 text-white border-slate-700'
                                        : 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white border-transparent'
                                        }`}
                                >
                                    <div className={`p-1.5 rounded-lg ${isAllAnalysisPublished ? 'bg-slate-600 text-slate-300' : 'bg-white/20 text-white'}`}>
                                        {isAllAnalysisPublished ? <EyeOff size={16} /> : <FileCheck size={16} />}
                                    </div>
                                    {isAllAnalysisPublished ? 'Hide Results' : 'Publish Results'}
                                </motion.button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Switcher */}
            {selectedContestFilter === 'all' ? (
                /* GALLERY VIEW */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Practice Card */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        onClick={() => setSelectedContestFilter('practice')}
                        className="cursor-pointer group relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 p-8 shadow-2xl transition-all hover:border-indigo-500/50 hover:shadow-indigo-500/20"
                    >
                        <div className="absolute top-0 right-0 p-24 bg-indigo-500/10 blur-3xl rounded-full -mr-10 -mt-10 transition-all group-hover:bg-indigo-500/20" />
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-8">
                                <div className="p-4 rounded-2xl bg-slate-800 text-indigo-400 mb-4 shadow-inner">
                                    <Layers size={32} />
                                </div>
                                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    Always Open
                                </span>
                            </div>
                            <h3 className="text-3xl font-black text-white mb-2">Practice Arena</h3>
                            <p className="text-slate-400 font-medium mb-8">General quizzes and practice problems.</p>

                            <div className="flex items-center gap-4 text-slate-400 text-sm font-bold uppercase tracking-widest">
                                <Users size={16} />
                                {scores.filter(s => !s.contestId).length} Attempts
                            </div>

                            <div className="mt-8 flex items-center gap-2 text-indigo-400 font-bold group-hover:translate-x-2 transition-transform">
                                View Participants <ChevronLeft className="rotate-180" size={16} />
                            </div>
                        </div>
                    </motion.div>

                    {/* Contest Cards */}
                    {allContests.map((contest) => {
                        const isLive = new Date(contest.startTime) <= new Date() && new Date(contest.endTime) >= new Date();
                        const isEnded = new Date(contest.endTime) < new Date();
                        const participantCount = scores.filter(s => s.contestId === contest._id).length;

                        return (
                            <motion.div
                                key={contest._id}
                                whileHover={{ y: -5 }}
                                onClick={() => setSelectedContestFilter(contest._id)}
                                className="cursor-pointer group relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 p-8 shadow-2xl transition-all hover:border-purple-500/50 hover:shadow-purple-500/20"
                            >
                                <div className="absolute top-0 right-0 p-24 bg-purple-500/10 blur-3xl rounded-full -mr-10 -mt-10 transition-all group-hover:bg-purple-500/20" />
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="p-4 rounded-2xl bg-slate-800 text-purple-400 mb-4 shadow-inner">
                                            <Trophy size={32} />
                                        </div>
                                        {isLive ? (
                                            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Live
                                            </span>
                                        ) : isEnded ? (
                                            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-slate-500/10 text-slate-400 border border-slate-500/20">
                                                Ended
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                Upcoming
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-3xl font-black text-white mb-2 line-clamp-1">{contest.title}</h3>
                                    <div className="flex items-center gap-2 text-slate-400 font-medium mb-8">
                                        <Calendar size={16} />
                                        {new Date(contest.startTime).toLocaleDateString()}
                                    </div>

                                    <div className="flex items-center gap-4 text-slate-400 text-sm font-bold uppercase tracking-widest">
                                        <Users size={16} />
                                        {participantCount} Attempts
                                    </div>

                                    <div className="mt-8 flex items-center gap-2 text-purple-400 font-bold group-hover:translate-x-2 transition-transform">
                                        Manage Results <ChevronLeft className="rotate-180" size={16} />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                /* DETAILED VIEW - STATS & TABLE */
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {[
                            { label: 'Participants', value: uniqueParticipants, icon: Users, color: 'blue', grad: 'from-blue-500 to-cyan-500' },
                            { label: 'Avg. Score', value: currentAvgScore.toFixed(1), icon: BarChart3, color: 'indigo', grad: 'from-indigo-500 to-purple-500' },
                            { label: 'Status', value: activeContest && activeContest._id === selectedContestFilter ? 'Live' : 'Offline', icon: Clock, color: 'amber', grad: 'from-amber-500 to-orange-500' },
                            { label: 'Total Attempts', value: filteredScores.length, icon: FileCheck, color: 'emerald', grad: 'from-emerald-500 to-teal-500' }
                        ].map((stat, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={idx}
                                className="relative overflow-hidden p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl group"
                            >
                                <div className={`absolute top-0 right-0 p-32 bg-gradient-to-br ${stat.grad} opacity-[0.03] group-hover:opacity-10 transition-opacity rounded-full blur-2xl -mt-10 -mr-10`} />
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.grad} text-white shadow-lg`}>
                                        <stat.icon size={24} />
                                    </div>
                                    <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-${stat.color}-50 text-${stat.color}-600 dark:bg-${stat.color}-900/30 dark:text-${stat.color}-400`}>
                                        {selectedContestFilter === 'all' ? 'All Time' : 'Filtered'}
                                    </span>
                                </div>
                                <h3 className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs mb-1">{stat.label}</h3>
                                <p className="text-4xl font-black text-slate-800 dark:text-white">{stat.value}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Participants Table */}
                    <div className="glass overflow-hidden rounded-[2.5rem] shadow-2xl border-white/40 mb-12 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
                        <div className="p-8 border-b border-white/20 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-slate-50/50 to-white/50 dark:from-slate-900/50 dark:to-slate-900/10">
                            <div>
                                <h3 className="text-2xl font-bold flex items-center gap-2">
                                    <Users className="text-slate-400" /> Participant Attempts
                                </h3>
                                <p className="text-slate-500 text-sm font-medium">Real-time submission tracking</p>
                            </div>
                            <div className="text-sm font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl">
                                {filteredScores.length} Records Found
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800">
                                        <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-400">Participant</th>
                                        <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-400">Score Performance</th>
                                        <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-400">Publication Status</th>
                                        <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                    {filteredScores.map((score, idx) => (
                                        <motion.tr
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                            key={score._id}
                                            className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors group"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-sm">
                                                        {score.userId?.name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-700 dark:text-slate-200">{score.userId?.name || 'Unknown'}</div>
                                                        <div className="text-xs text-slate-400 font-mono">{score.userId?.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                                                        {score.score}
                                                    </div>
                                                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                                                        / {score.totalQuestions}
                                                    </span>
                                                </div>
                                                <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(score.score / score.totalQuestions) * 100}%` }}
                                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`p-1 rounded-full ${score.isPublished ? 'bg-green-500/20 text-green-600' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                                                            <Trophy size={12} />
                                                        </div>
                                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${score.isPublished ? 'text-green-600' : 'text-slate-400'}`}>
                                                            {score.isPublished ? 'On Leaderboard' : 'Leaderboard Hidden'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`p-1 rounded-full ${score.isAnalysisPublished ? 'bg-indigo-500/20 text-indigo-600' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                                                            <FileCheck size={12} />
                                                        </div>
                                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${score.isAnalysisPublished ? 'text-indigo-600' : 'text-slate-400'}`}>
                                                            {score.isAnalysisPublished ? 'Analysis Visible' : 'Analysis Hidden'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button
                                                    onClick={() => setSelectedAttempt(score)}
                                                    className="px-6 py-3 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 font-bold text-xs hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm group-hover:shadow-md"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Detailed Answers Modal */}
            <AnimatePresence>
                {selectedAttempt && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl border border-white/20 flex flex-col relative"
                        >
                            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-indigo-500/5 to-purple-500/5 z-0" />
                            <div className="p-8 border-b border-indigo-100 dark:border-slate-800 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-indigo-500/30">
                                        {selectedAttempt.userId?.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-800 dark:text-white">{selectedAttempt.userId?.name}'s Performance</h3>
                                        <p className="text-slate-500 font-medium flex items-center gap-2">
                                            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                            Detailed Analysis View
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedAttempt(null)} className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-8 overflow-y-auto space-y-6 z-10 bg-slate-50/50 dark:bg-slate-950/50 min-h-0">
                                {selectedAttempt.questions.map((q, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={idx}
                                        className={`p-8 rounded-[2rem] border transition-all hover:shadow-lg ${q.isCorrect
                                            ? 'bg-white dark:bg-slate-900 border-green-200 dark:border-green-900/30 shadow-green-500/5'
                                            : 'bg-white dark:bg-slate-900 border-red-200 dark:border-red-900/30 shadow-red-500/5'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start gap-4 mb-6">
                                            <div className="flex items-center gap-3">
                                                <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 text-sm">
                                                    {idx + 1}
                                                </span>
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${q.isCorrect ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}>
                                                    {q.isCorrect ? 'Correct Answer' : 'Incorrect Answer'}
                                                </span>
                                            </div>
                                        </div>
                                        <h4 className="text-xl font-bold mb-8 text-slate-800 dark:text-slate-200 leading-relaxed">{q.questionText}</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className={`p-5 rounded-2xl border-2 ${q.isCorrect ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
                                                } dark:bg-slate-950/50 dark:border-slate-800`}>
                                                <span className="text-[10px] font-black opacity-60 uppercase block mb-2 flex items-center gap-2">
                                                    User's Answer
                                                </span>
                                                <span className={`font-bold text-lg ${q.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                                    {q.selectedAnswer || 'Not Answered'}
                                                </span>
                                            </div>
                                            <div className="p-5 rounded-2xl bg-white dark:bg-slate-950/50 border-2 border-slate-100 dark:border-slate-800">
                                                <span className="text-[10px] font-black text-slate-400 uppercase block mb-2 flex items-center gap-2">
                                                    <CheckCircle2 size={12} className="text-green-500" /> Correct Answer
                                                </span>
                                                <span className="font-bold text-lg text-green-600">{q.correctAnswer}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="p-8 border-t border-indigo-100 dark:border-slate-800 flex flex-wrap justify-end gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl z-20">
                                <button
                                    onClick={() => handlePublish(selectedAttempt._id, selectedAttempt.isPublished, 'leaderboard')}
                                    className={`px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all ${selectedAttempt.isPublished
                                        ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                        : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:scale-105'
                                        }`}
                                >
                                    {selectedAttempt.isPublished ? <EyeOff size={18} /> : <Trophy size={18} />}
                                    {selectedAttempt.isPublished ? 'Hide from Leaderboard' : 'Promote to Leaderboard'}
                                </button>

                                <button
                                    onClick={() => handlePublish(selectedAttempt._id, selectedAttempt.isAnalysisPublished, 'analysis')}
                                    className={`px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all ${selectedAttempt.isAnalysisPublished
                                        ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                        : 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-lg shadow-primary-500/30 hover:scale-105'
                                        }`}
                                >
                                    {selectedAttempt.isAnalysisPublished ? <EyeOff size={18} /> : <FileCheck size={18} />}
                                    {selectedAttempt.isAnalysisPublished ? 'Hide Analysis' : 'Release Analysis'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Global Confirmation Modal */}
            <AnimatePresence>
                {confirmModal.show && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/70 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-lg p-10 rounded-[3rem] shadow-2xl border border-white/10 text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-indigo-50 to-transparent dark:from-indigo-900/20 pointer-events-none" />

                            <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl rotate-3 transition-transform hover:rotate-6
                                ${confirmModal.type === 'leaderboard'
                                    ? (isAllLeaderboardPublished ? 'bg-slate-100 text-slate-500' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white')
                                    : (isAllAnalysisPublished ? 'bg-slate-100 text-slate-500' : 'bg-gradient-to-br from-primary-500 to-pink-600 text-white')}`}>
                                {confirmModal.type === 'leaderboard'
                                    ? (isAllLeaderboardPublished ? <EyeOff size={40} /> : <Trophy size={40} />)
                                    : (isAllAnalysisPublished ? <EyeOff size={40} /> : <FileCheck size={40} />)}
                            </div>

                            <h3 className="text-3xl font-black mb-4 text-slate-800 dark:text-white">
                                {confirmModal.type === 'leaderboard'
                                    ? (isAllLeaderboardPublished ? 'Hide Leaderboard?' : 'Publish Leaderboard?')
                                    : (isAllAnalysisPublished ? 'Hide All Analyses?' : 'Publish All Results?')}
                            </h3>

                            <div className="mb-0">
                                <span className="inline-block px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm mb-4 border border-slate-200 dark:border-slate-700">
                                    Target Scope: {selectedContestFilter === 'all' ? 'All Quizzes' : (selectedContestFilter === 'practice' ? 'Practice Quizzes' : (allContests.find(c => c._id === selectedContestFilter)?.title || 'Selected Contest'))}
                                </span>
                                <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto mb-8">
                                    {confirmModal.type === 'leaderboard'
                                        ? (isAllLeaderboardPublished
                                            ? 'This will instantly hide rankings for the selected scope.'
                                            : 'Ready to show the world? This will update the leaderboard for everyone in this scope!')
                                        : (isAllAnalysisPublished
                                            ? 'Participants in this scope will lose access to detailed performance reviews.'
                                            : 'Empower your participants! They will be able to see exactly where they excelled.')}
                                </p>

                                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 mb-8">
                                    <label className="block text-sm font-bold text-slate-500 mb-3">
                                        Type <span className="text-indigo-600 font-black">
                                            "{selectedContestFilter === 'all' ? 'Confirm All' : (selectedContestFilter === 'practice' ? 'Practice' : (allContests.find(c => c._id === selectedContestFilter)?.title || 'Confirm'))}"
                                        </span> to verify:
                                    </label>
                                    <input
                                        type="text"
                                        value={confirmInput}
                                        onChange={(e) => setConfirmInput(e.target.value)}
                                        className="w-full px-4 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-center text-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-300"
                                        placeholder="Type verification name..."
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setConfirmModal({ show: false, type: null })}
                                    className="flex-1 py-5 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handlePublishAll(confirmModal.type)}
                                    disabled={confirmInput !== (selectedContestFilter === 'all' ? 'Confirm All' : (selectedContestFilter === 'practice' ? 'Practice' : (allContests.find(c => c._id === selectedContestFilter)?.title || 'Confirm')))}
                                    className={`flex-1 py-5 rounded-2xl font-bold shadow-xl flex items-center justify-center gap-2 transition-all 
                                        ${confirmInput !== (selectedContestFilter === 'all' ? 'Confirm All' : (selectedContestFilter === 'practice' ? 'Practice' : (allContests.find(c => c._id === selectedContestFilter)?.title || 'Confirm')))
                                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-70'
                                            : `hover:scale-105 ${confirmModal.type === 'leaderboard'
                                                ? (isAllLeaderboardPublished ? 'bg-slate-700 text-white' : 'bg-indigo-600 text-white shadow-indigo-500/30')
                                                : (isAllAnalysisPublished ? 'bg-slate-700 text-white' : 'bg-primary-600 text-white shadow-primary-500/30')}`
                                        }`}
                                >
                                    {confirmModal.type === 'leaderboard'
                                        ? (isAllLeaderboardPublished ? 'Hide It' : 'Publish It!')
                                        : (isAllAnalysisPublished ? 'Hide It' : 'Release It!')}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default JudgeDashboard;
