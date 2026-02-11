import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { Save, X, HelpCircle, Layers, Clock, CheckCircle, Activity, Trophy } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Loader from '../components/Loader';

const AddQuestion = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [upcomingContests, setUpcomingContests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        category: '',
        difficulty: 'Medium',
        timer: 30,
        quizName: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: contests } = await api.get('/contests');
                // Filter contests that are not ended
                const activeOrUpcoming = contests.filter(c => new Date(c.endTime) > new Date());
                setUpcomingContests(activeOrUpcoming);

                if (id) {
                    setLoading(true);
                    const { data: questions } = await api.get('/questions');
                    const question = questions.find(q => q._id === id);
                    if (question) {
                        setFormData({
                            questionText: question.questionText || '',
                            options: question.options || ['', '', '', ''],
                            correctAnswer: question.correctAnswer || '',
                            category: question.category || '',
                            difficulty: question.difficulty || 'Medium',
                            timer: question.timer || 30,
                            quizName: question.quizName || ''
                        });
                    } else {
                        toast.error('Question not found');
                        navigate('/admin/questions');
                    }
                }
            } catch (error) {
                console.error('Failed to fetch data');
                toast.error('Failed to load data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate]);

    const handleOptionChange = (index, value) => {
        const newOptions = [...formData.options];
        const oldVal = newOptions[index];
        newOptions[index] = value;

        let newCorrectAnswer = formData.correctAnswer;
        if (formData.correctAnswer === oldVal) {
            newCorrectAnswer = value;
        }

        setFormData({ ...formData, options: newOptions, correctAnswer: newCorrectAnswer });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.correctAnswer || !formData.options.includes(formData.correctAnswer)) {
            toast.error('Correct answer must be one of the four options');
            return;
        }

        setLoading(true);
        try {
            if (id) {
                await api.put(`/questions/${id}`, formData);
                toast.success('Question updated successfully!');
                navigate('/admin/questions');
            } else {
                await api.post('/questions', formData);
                toast.success('Question added successfully!');
                setFormData({
                    ...formData,
                    questionText: '',
                    options: ['', '', '', ''],
                    correctAnswer: ''
                });
            }
        } catch (error) {
            console.error('Save Question Error:', error);
            toast.error(error.response?.data?.message || 'Failed to save question');
        } finally {
            setLoading(false);
        }
    };

    if (loading && id) return <Loader text="Loading question details..." />;

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10">
            <div className="mb-12">
                <h1 className="text-4xl font-bold mb-2">{id ? 'Edit Question' : 'Create New Question'}</h1>
                <p className="text-slate-500 dark:text-slate-400">{id ? 'Modify existing question details' : 'Add a single-choice question to the database'}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="glass p-8 rounded-[2.5rem] shadow-xl border-white/40 space-y-8">
                    {/* Question Text */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 px-1">
                            <HelpCircle size={16} className="text-primary-600" /> Question Text
                        </label>
                        <textarea
                            required
                            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 rounded-3xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium min-h-[120px] dark:border dark:border-slate-800"
                            placeholder="What is the capital of France?"
                            value={formData.questionText}
                            onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                        ></textarea>
                    </div>

                    {/* Options Grid */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 px-1">
                            <Layers size={16} className="text-primary-600" /> Options (Add exactly 4)
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {formData.options.map((opt, idx) => (
                                <div key={idx} className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">
                                        {String.fromCharCode(65 + idx)}
                                    </span>
                                    <input
                                        required
                                        type="text"
                                        className="w-full pl-16 pr-6 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium dark:border dark:border-slate-800"
                                        placeholder={`Option ${idx + 1}`}
                                        value={opt}
                                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Correct Answer Select */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 px-1">
                                <CheckCircle size={16} className="text-green-500" /> Correct Answer
                            </label>
                            <select
                                required
                                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium appearance-none cursor-pointer dark:border dark:border-slate-800"
                                value={formData.correctAnswer}
                                onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                            >
                                <option value="">Select Correct Option</option>
                                {formData.options.map((opt, idx) => (
                                    <option key={idx} value={opt} disabled={!opt}>
                                        {opt ? `Option ${String.fromCharCode(65 + idx)}: ${opt}` : `Option ${String.fromCharCode(65 + idx)} (Empty)`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Timer Settings */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 px-1">
                                <Clock size={16} className="text-blue-500" /> Timer (Seconds)
                            </label>
                            <input
                                type="number"
                                required
                                min="5"
                                max="300"
                                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium dark:border dark:border-slate-800"
                                value={formData.timer}
                                onChange={(e) => setFormData({ ...formData, timer: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 px-1">
                                    <Trophy size={16} className="text-indigo-500" /> Link to Contest (Required)
                                </label>
                                <select
                                    required
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium appearance-none cursor-pointer dark:border dark:border-slate-800"
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            const contest = upcomingContests.find(c => c._id === e.target.value);
                                            const targetName = (contest.quizName && contest.quizName !== 'All') ? contest.quizName : contest.title;
                                            setFormData(prev => ({
                                                ...prev,
                                                quizName: targetName,
                                                category: contest.category || 'General'
                                            }));
                                        }
                                    }}
                                    value={upcomingContests.find(c => c.quizName === formData.quizName || c.title === formData.quizName)?._id || ""}
                                >
                                    <option value="">Select a contest to link</option>
                                    {upcomingContests.map((contest) => (
                                        <option key={contest._id} value={contest._id}>
                                            {contest.title} - {contest.category}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 px-1">
                                    <Activity size={16} className="text-amber-500" /> Difficulty Level
                                </label>
                                <div className="flex gap-4">
                                    {['Easy', 'Medium', 'Hard'].map(d => (
                                        <button
                                            key={d}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, difficulty: d })}
                                            className={`flex-1 py-3 rounded-xl border-2 font-bold text-xs uppercase tracking-widest transition-all ${formData.difficulty === d
                                                ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-600 shadow-sm'
                                                : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-400'
                                                }`}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 pt-8">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 btn btn-primary py-5 flex items-center justify-center gap-3 text-lg shadow-xl shadow-primary-500/20"
                    >
                        {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={24} />}
                        {id ? 'Update Question' : 'Save Question'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/admin/questions')}
                        className="px-10 py-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-2 text-slate-600 dark:text-slate-400"
                    >
                        <X size={24} /> Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddQuestion;
