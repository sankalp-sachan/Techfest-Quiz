import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Timer, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Quiz = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { category, difficulty, limit, contestId, duration, allowBacktracking } = location.state || { category: 'All', difficulty: 'All', limit: 10 };

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [timeLeft, setTimeLeft] = useState(duration ? duration * 60 : 1800); // Global timer
    const [loading, setLoading] = useState(true);
    const [quizStarted, setQuizStarted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Persistence: load from localStorage
    useEffect(() => {
        const savedState = localStorage.getItem(`quiz_state_${contestId || 'default'}`);
        if (savedState) {
            const state = JSON.parse(savedState);
            setQuestions(state.questions);
            setCurrentIndex(state.currentIndex);
            setAnswers(state.answers);
            setTimeLeft(state.timeLeft);
            setQuizStarted(true);
            setLoading(false);
        } else {
            fetchQuestions();
        }
    }, [contestId]);

    // Save to localStorage
    useEffect(() => {
        if (quizStarted && !isSubmitting) {
            localStorage.setItem(`quiz_state_${contestId || 'default'}`, JSON.stringify({
                questions, currentIndex, answers, timeLeft
            }));
        }
    }, [currentIndex, answers, timeLeft, quizStarted, isSubmitting, contestId]);

    useEffect(() => {
        if (!quizStarted || isSubmitting) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    submitQuiz();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [quizStarted, isSubmitting]);

    // Handle tab close/refresh
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (quizStarted && !isSubmitting) {
                // Relying on persistence
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [quizStarted, isSubmitting]);

    const fetchQuestions = async () => {
        try {
            const { data } = await axios.get(`/questions/random?category=${category}&difficulty=${difficulty}&limit=${limit}`);
            if (data.length === 0) {
                toast.error("No questions found for this category/difficulty.");
                navigate('/dashboard');
                return;
            }
            setQuestions(data);
            setTimeLeft(duration ? duration * 60 : 1800);
            setQuizStarted(true);
            setLoading(false);
        } catch (error) {
            toast.error("Failed to load questions");
            navigate('/dashboard');
        }
    };

    const handleAnswer = (selectedOption) => {
        if (answers[currentIndex]) return; // Already answered

        const newAnswers = [...answers];
        newAnswers[currentIndex] = {
            questionId: questions[currentIndex]._id,
            selectedAnswer: selectedOption
        };
        setAnswers(newAnswers);
    };


    const handleNext = useCallback(() => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            submitQuiz();
        }
    }, [currentIndex, questions, answers]);

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const submitQuiz = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            // Fill unanswered questions
            const finalAnswers = questions.map((q, idx) => answers[idx] || {
                questionId: q._id,
                selectedAnswer: null
            });

            const { data } = await axios.post('/quiz/submit', {
                answers: finalAnswers,
                timeTaken: (duration ? duration * 60 : 1800) - timeLeft,
                category,
                difficulty,
                contestId,
                quizTitle: location.state?.quizTitle || 'Practice Session'
            });


            localStorage.removeItem(`quiz_state_${contestId || 'default'}`);
            toast.success("Quiz submitted successfully!");
            navigate('/result', { state: { result: data } });
        } catch (error) {
            toast.error("Failed to submit quiz");
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 font-medium text-slate-500">Preparing your questions...</p>
        </div>
    );

    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10 pt-4">
            {/* Progress & Header */}
            <div className="mb-8 space-y-4">
                <div className="flex items-center justify-between font-bold text-sm text-slate-500 uppercase tracking-widest">
                    <span>Question {currentIndex + 1} of {questions.length}</span>
                    <span className="text-primary-600">{category} • {difficulty}</span>
                </div>
                <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-gradient-to-r from-primary-500 to-indigo-600"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
                {/* Main Quiz Area */}
                <div className="md:col-span-3">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="glass p-8 md:p-12 rounded-3xl shadow-2xl border-white/40 min-h-[400px] flex flex-col"
                        >
                            <h2 className="text-2xl md:text-3xl font-bold mb-10 leading-tight">
                                {currentQuestion.questionText}
                            </h2>

                            <div className="grid grid-cols-1 gap-4 mt-auto">
                                {currentQuestion.options.map((option, idx) => {
                                    const isSelected = answers[currentIndex]?.selectedAnswer === option;
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleAnswer(option)}
                                            disabled={!!answers[currentIndex]}
                                            className={`group relative flex items-center p-5 rounded-2xl border-2 transition-all text-left font-medium ${isSelected
                                                ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                                                : 'border-slate-100 dark:border-slate-800 hover:border-primary-300 bg-slate-50 dark:bg-slate-900'
                                                } ${!!answers[currentIndex] && !isSelected ? 'opacity-60' : ''}`}
                                        >
                                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center mr-4 transition-colors ${isSelected ? 'bg-primary-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                                                }`}>
                                                {String.fromCharCode(65 + idx)}
                                            </span>
                                            {option}
                                            {isSelected && <CheckCircle2 className="absolute right-5 text-primary-600" size={24} />}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className={`glass p-6 rounded-3xl shadow-xl text-center border-2 transition-colors ${timeLeft <= 60 ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-transparent'}`}>
                        <Timer className={`mx-auto mb-2 ${timeLeft <= 60 ? 'text-red-500 animate-pulse' : 'text-primary-600'}`} size={32} />
                        <span className={`text-4xl font-black ${timeLeft <= 60 ? 'text-red-500' : ''}`}>
                            {formatTime(timeLeft)}
                        </span>
                        <p className="text-xs uppercase font-bold text-slate-400 mt-2">Remaining Time</p>
                    </div>

                    <div className="glass p-6 rounded-3xl shadow-xl space-y-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase">
                            <AlertCircle size={16} /> Status
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Completed</span>
                                <span className="font-bold">{answers.filter(Boolean).length}/{questions.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Remaining</span>
                                <span className="font-bold">{questions.length - answers.filter(Boolean).length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleNext}
                            className="w-full btn btn-primary py-4 flex items-center justify-center gap-2 shadow-primary-500/40"
                        >
                            {currentIndex === questions.length - 1
                                ? 'Finish Quiz'
                                : (answers[currentIndex] ? 'Next Question' : 'Skip / Next')}
                            <ArrowRight size={20} />
                        </button>


                        {currentIndex > 0 && allowBacktracking && (
                            <button
                                onClick={handlePrevious}
                                className="w-full py-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-500"
                            >
                                Previous Question
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Quiz;
