import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Trophy, CheckCircle2, XCircle, Clock, BarChart3, RotateCcw, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const Result = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { result } = location.state || {};

    if (!result) return <div className="p-10 text-center">No result found. <Link to="/dashboard" className="text-primary-600">Go to Dashboard</Link></div>;

    const percentage = (result.score / result.totalQuestions) * 100;

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className=" glass overflow-hidden rounded-[2.5rem] shadow-2xl border-white/40 mb-10"
            >
                {result.isPublished ? (
                    <div className="bg-gradient-to-br from-primary-600 to-indigo-700 p-12 text-center text-white relative">
                        <Trophy className="mx-auto mb-6 text-yellow-300 drop-shadow-lg" size={80} />
                        <h1 className="text-5xl font-black mb-2">Quiz Completed!</h1>
                        <p className="opacity-80 text-xl">Excellent effort in {result.category} ({result.difficulty})</p>

                        <div className="mt-10 flex justify-center gap-12">
                            <div>
                                <div className="text-4xl font-bold">{result.score}</div>
                                <div className="text-sm opacity-70 uppercase font-bold tracking-widest">Score</div>
                            </div>
                            <div className="w-px bg-white/20"></div>
                            <div>
                                <div className="text-4xl font-bold">{result.totalQuestions}</div>
                                <div className="text-sm opacity-70 uppercase font-bold tracking-widest">Total</div>
                            </div>
                            <div className="w-px bg-white/20"></div>
                            <div>
                                <div className="text-4xl font-bold">{percentage.toFixed(0)}%</div>
                                <div className="text-sm opacity-70 uppercase font-bold tracking-widest">Accuracy</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gradient-to-br from-slate-700 to-slate-900 p-12 text-center text-white relative">
                        <CheckCircle2 className="mx-auto mb-6 text-green-400 drop-shadow-lg" size={80} />
                        <h1 className="text-5xl font-black mb-2">Submitted!</h1>
                        <p className="opacity-80 text-xl">Your response for {result.category} has been recorded.</p>
                        <div className="mt-8 p-4 bg-white/10 rounded-2xl inline-block backdrop-blur-sm border border-white/10">
                            <p className="text-sm font-medium">Final results and leaderboard will be announced shortly.</p>
                        </div>
                    </div>
                )}


                <div className="p-8 md:p-12">
                    {result.isPublished ? (
                        <>
                            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                                <BarChart3 className="text-primary-600" /> Answer Analysis
                            </h2>

                            {result.isAnalysisPublished ? (
                                <div className="space-y-6">
                                    {result.questions.map((q, idx) => (
                                        <div key={idx} className={`p-6 rounded-2xl border-2 transition-all ${q.isCorrect ? 'border-green-100 bg-green-50/30 dark:border-green-900/20 dark:bg-green-900/5' : 'border-red-100 bg-red-50/30 dark:border-red-900/20 dark:bg-red-900/5'}`}>
                                            <div className="flex items-start justify-between gap-4 mb-4">
                                                <h3 className="font-bold text-lg leading-snug">
                                                    <span className="text-slate-400 mr-2">Q{idx + 1}.</span>
                                                    {q.questionText}
                                                </h3>
                                                {q.isCorrect ? (
                                                    <CheckCircle2 className="text-green-500 shrink-0" size={24} />
                                                ) : (
                                                    <XCircle className="text-red-500 shrink-0" size={24} />
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-medium">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-slate-400 uppercase text-[10px] tracking-widest">Your Answer</span>
                                                    <span className={q.isCorrect ? 'text-green-600' : 'text-red-600'}>
                                                        {q.selectedAnswer || 'Timed Out / Skipped'}
                                                    </span>
                                                </div>
                                                {!q.isCorrect && (
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-slate-400 uppercase text-[10px] tracking-widest">Correct Answer</span>
                                                        <span className="text-green-600">{q.correctAnswer}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center rounded-3xl bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800">
                                    <Clock className="mx-auto mb-4 text-slate-400" size={48} />
                                    <h3 className="text-xl font-bold mb-2">Analysis Pending Publication</h3>
                                    <p className="text-slate-500 max-w-sm mx-auto">Detailed answer analysis will be visible once the judge publishes the results. Your score has been recorded.</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-slate-500 italic">Thank you for your participation! Results will be visible in your history once they are published.</p>
                        </div>
                    )}


                    <div className="mt-12 flex flex-col items-center gap-6">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full max-w-sm bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-primary-500/25 flex items-center justify-center gap-3 transform transition hover:scale-105 active:scale-95 group"
                        >
                            <Home size={24} className="group-hover:animate-bounce" />
                            <span className="text-lg">Back to Dashboard</span>
                        </button>

                        <button
                            onClick={() => navigate('/history')}
                            className="text-slate-500 dark:text-slate-400 font-bold hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-2"
                        >
                            View my past attempts
                        </button>
                    </div>

                </div>
            </motion.div>
        </div>
    );
};

export default Result;
