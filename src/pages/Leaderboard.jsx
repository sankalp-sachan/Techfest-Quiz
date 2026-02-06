import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Medal, Star, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

const Leaderboard = () => {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const { data } = await axios.get('/quiz/leaderboard');
            setLeaders(data);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (index) => {
        switch (index) {
            case 0: return <Trophy className="text-yellow-400" size={32} />;
            case 1: return <Medal className="text-slate-400" size={32} />;
            case 2: return <Medal className="text-amber-600" size={32} />;
            default: return <span className="text-xl font-bold text-slate-400">{index + 1}</span>;
        }
    };

    if (loading) return <div className="p-10 text-center text-xl font-bold">Summoning Champions...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10">
            <div className="text-center mb-16">
                <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-yellow-500 via-primary-600 to-indigo-600 bg-clip-text text-transparent italic">HALL OF FAME</h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg">The world's greatest quiz masters in one place</p>
            </div>

            <div className="space-y-4">
                {leaders.map((leader, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        key={leader._id}
                        className={`glass p-6 rounded-3xl flex items-center gap-6 shadow-xl border-white/40 group hover:scale-[1.02] transition-all ${idx === 0 ? 'bg-gradient-to-r from-yellow-50/50 to-white/50 dark:from-yellow-900/10' : ''}`}
                    >
                        <div className={`w-14 h-14 flex items-center justify-center rounded-2xl ${idx < 3 ? 'bg-white shadow-md dark:bg-slate-800' : 'bg-slate-100 dark:bg-slate-900'}`}>
                            {getRankIcon(idx)}
                        </div>

                        <div className="flex-1">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                {leader.name}
                                {idx === 0 && <Star className="text-yellow-400 fill-yellow-400" size={16} />}
                            </h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{leader.attempts} Quizzes Attempted</p>
                        </div>

                        <div className="text-right flex items-center gap-8">
                            <div className="hidden sm:block">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">Avg Accuracy</div>
                                <div className="text-lg font-bold text-indigo-600">{leader.avgScore.toFixed(1)}</div>
                            </div>
                            <div className="text-center bg-primary-600 text-white px-6 py-2 rounded-2xl shadow-lg group-hover:bg-indigo-600 transition-colors">
                                <div className="text-2xl font-black">{leader.totalScore}</div>
                                <div className="text-[10px] font-bold uppercase tracking-tight opacity-70 leading-none">Total Points</div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {leaders.length === 0 && (
                <div className="text-center p-20 glass rounded-[2.5rem]">
                    <p className="text-slate-500">No champions yet. Be the first!</p>
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
