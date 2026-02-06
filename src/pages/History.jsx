import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { History as HistoryIcon, Calendar, Trophy, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const History = () => {
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const { data } = await axios.get('/quiz/attempts');
            setAttempts(data);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading your history...</div>;

    return (
        <div className="max-w-5xl mx-auto p-6 md:p-10">
            <div className="mb-12 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Quiz History</h1>
                    <p className="text-slate-500 dark:text-slate-400">Track your progress and past performances</p>
                </div>
                <div className="bg-primary-100 dark:bg-primary-900/30 p-4 rounded-3xl">
                    <HistoryIcon className="text-primary-600" size={32} />
                </div>
            </div>

            {attempts.length === 0 ? (
                <div className="glass p-20 text-center rounded-[2.5rem] shadow-xl">
                    <p className="text-slate-500 text-lg mb-6">You haven't attempted any quizzes yet.</p>
                    <button className="btn btn-primary px-8 py-3">Take Your First Quiz</button>
                </div>
            ) : (
                <div className="space-y-6">
                    {attempts.map((attempt, idx) => {
                        const date = new Date(attempt.submittedAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                        });
                        const accuracy = (attempt.score / attempt.totalQuestions) * 100;

                        return (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={attempt._id}
                                className="glass p-6 rounded-3xl shadow-lg border-white/40 flex flex-col md:flex-row items-center gap-6 hover:translate-x-2 transition-transform cursor-pointer group"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl font-black text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                    {idx + 1}
                                </div>

                                <div className="flex-1 space-y-2 text-center md:text-left">
                                    <h3 className="text-xl font-bold">{attempt.category} - {attempt.difficulty}</h3>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5"><Calendar size={14} /> {date}</span>
                                        <span className="flex items-center gap-1.5"><Clock size={14} /> {attempt.timeTaken}s</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8 px-6 border-x-0 md:border-x border-slate-200 dark:border-slate-800">
                                    <div className="text-center">
                                        <div className="text-2xl font-black text-primary-600">{attempt.score}/{attempt.totalQuestions}</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-black text-indigo-600">{accuracy.toFixed(0)}%</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accuracy</div>
                                    </div>
                                    <div className="text-center hidden sm:block">
                                        <div className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${attempt.isAnalysisPublished ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                                            {attempt.isAnalysisPublished ? 'Published' : 'Pending'}
                                        </div>
                                    </div>
                                </div>

                                <div className="ml-auto">
                                    {attempt.isAnalysisPublished ? (
                                        <ArrowRight className="text-slate-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" size={24} />
                                    ) : (
                                        <Clock className="text-slate-300" size={24} />
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default History;
