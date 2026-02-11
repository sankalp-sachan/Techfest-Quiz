import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { Trash2, Edit, Plus, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from '../components/Loader';

import { useNavigate, Link } from 'react-router-dom';

const ManageQuestions = () => {
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const { data } = await api.get('/questions');
            setQuestions(data);
        } catch (error) {
            toast.error('Failed to fetch questions');
        } finally {
            setLoading(false);
        }
    };

    const deleteQuestion = async (id) => {
        if (!window.confirm('Are you sure you want to delete this question?')) return;
        try {
            await api.delete(`/questions/${id}`);
            toast.success('Question deleted');
            setQuestions(questions.filter(q => q._id !== id));
        } catch (error) {
            toast.error('Failed to delete question');
        }
    };

    const filteredQuestions = questions.filter(q =>
        q.questionText?.toLowerCase().includes(search.toLowerCase()) ||
        q.category?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Questions Management</h1>
                    <p className="text-slate-500 dark:text-slate-400">View and manage the entire question bank</p>
                </div>
                <Link to="/admin/add-question" className="btn btn-primary px-8 py-4 flex items-center gap-2">
                    <Plus size={20} /> Add Question
                </Link>
            </div>

            <div className="glass p-6 rounded-[2rem] shadow-xl border-white/40 mb-10 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by question text or category..."
                        className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium border-2 border-slate-100 dark:border-slate-800"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <Loader text="Loading questions..." />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AnimatePresence>
                        {filteredQuestions.map((q, idx) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                key={q._id}
                                className="glass p-8 rounded-3xl shadow-lg border-white/40 flex flex-col hover:shadow-2xl transition-all"
                            >
                                <div className="flex justify-between items-start gap-4 mb-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${q.difficulty === 'Easy' ? 'bg-green-100 text-green-600' :
                                        q.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                                        }`}>
                                        {q.difficulty}
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => navigate(`/admin/edit-question/${q._id}`)}
                                            className="p-2 text-slate-400 hover:text-primary-600 transition-colors"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => deleteQuestion(q._id)}
                                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold mb-6 line-clamp-3 h-[4.5rem]">{q.questionText}</h3>

                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex flex-col gap-1">
                                        <span>Category</span>
                                        <span className="text-primary-600">{q.category}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {filteredQuestions.length === 0 && !loading && (
                <div className="text-center p-20 glass rounded-3xl">
                    <p className="text-slate-500">No questions found matching your search.</p>
                </div>
            )}
        </div>
    );
};

export default ManageQuestions;
