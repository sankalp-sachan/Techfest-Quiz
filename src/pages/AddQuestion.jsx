import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { PlusCircle, Save, X, HelpCircle, Layers, Clock, CheckCircle, Activity, BookOpen, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddQuestion = () => {
    const navigate = useNavigate();
    const [existingQuizNames, setExistingQuizNames] = useState([]);
    const [upcomingContests, setUpcomingContests] = useState([]);
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
                const [namesRes, contestsRes] = await Promise.all([
                    axios.get('/questions/names'),
                    axios.get('/contests')
                ]);
                setExistingQuizNames(namesRes.data);
                // Filter contests that are not ended
                const activeOrUpcoming = contestsRes.data.filter(c => new Date(c.endTime) > new Date());
                setUpcomingContests(activeOrUpcoming);
            } catch (error) {
                console.error('Failed to fetch data');
            }
        };
        fetchData();
    }, []);

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

        try {
            const token = localStorage.getItem('token');
            await axios.post('/questions', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Question added successfully!');
            setFormData({
                questionText: '',
                options: ['', '', '', ''],
                correctAnswer: '',
                category: formData.category, // Keep the category for easy multiple adds
                difficulty: 'Medium',
                timer: 30,
                quizName: formData.quizName // Keep quiz name for flow
            });
        } catch (error) {
            console.error('Add Question Error:', error.response?.data || error.message);
            toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to add question');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10">
            <div className="mb-12">
                <h1 className="text-4xl font-bold mb-2">Create New Question</h1>
                <p className="text-slate-500 dark:text-slate-400">Add a single-choice question to the database</p>
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
                            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 rounded-3xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium min-h-[120px]"
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
                                        className="w-full pl-16 pr-6 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                                        placeholder={`Option ${idx + 1}`}
                                        value={opt}
                                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                        {/* Correct Answer Select */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 px-1">
                                <CheckCircle size={16} className="text-green-500" /> Correct Answer
                            </label>
                            <select
                                required
                                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium appearance-none cursor-pointer"
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

                        {/* Category & Difficulty Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                            <div className="space-y-3 col-span-2">
                                <label className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 px-1">
                                    <Trophy size={16} className="text-indigo-500" /> Link to Upcoming Contest (Required)
                                </label>
                                <select
                                    required
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium appearance-none cursor-pointer"
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            const contest = upcomingContests.find(c => c._id === e.target.value);
                                            const targetName = (contest.quizName && contest.quizName !== 'All') ? contest.quizName : contest.title;
                                            setFormData({
                                                ...formData,
                                                quizName: targetName,
                                                category: contest.category || 'General'
                                            });
                                        }
                                    }}
                                    defaultValue=""
                                >
                                    <option value="">Select a contest to link this question</option>
                                    {upcomingContests.map((contest, idx) => (
                                        <option key={idx} value={contest._id}>
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
                                                ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-600'
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
                    <button type="submit" className="flex-1 btn btn-primary py-5 flex items-center justify-center gap-3 text-lg">
                        <Save size={24} /> Save Question
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/admin/questions')}
                        className="px-10 py-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
                    >
                        <X size={24} /> Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddQuestion;
