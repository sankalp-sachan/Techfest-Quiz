import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Play, BookOpen, Layers, BarChart } from 'lucide-react';

import Loader from '../components/Loader';

const Dashboard = () => {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [password, setPassword] = useState('');
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState('Active');

    useEffect(() => {
        fetchContests();
    }, []);

    const fetchContests = async () => {
        try {
            const { data } = await axios.get('/contests');
            setContests(data);
        } catch (error) {
            console.error('Error fetching contests:', error);
        } finally {
            setLoading(false);
        }
    };

    const [selectedContest, setSelectedContest] = useState(null);

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3; // metres
        const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // in metres
    };

    const handleJoinClick = async (contest) => {
        if (!contest) {
            setSelectedContest(null);
            setShowModal(true);
            return;
        }

        if (contest.isCompleted) {
            if (contest.attemptId) {
                const toastId = toast.loading("Fetching Result...");
                try {
                    const { data } = await axios.get(`/quiz/attempt/${contest.attemptId}`);
                    toast.dismiss(toastId);
                    navigate('/result', { state: { result: data } });
                } catch (error) {
                    toast.dismiss(toastId);
                    toast.error("Could not fetch result details.");
                    navigate('/history');
                }
            } else {
                navigate('/history');
            }
            return;
        }

        const now = new Date();
        const start = new Date(contest.startTime);
        const end = new Date(contest.endTime);

        if (now < start) {
            toast.error(`This contest starts at ${start.toLocaleTimeString()}`);
            return;
        }
        if (now > end) {
            toast.error(`This contest has ended.`);
            return;
        }

        const proceedToJoin = () => {
            if (contest.accessCode) {
                setSelectedContest(contest);
                setShowModal(true);
            } else {
                enterContest(contest);
            }
        };

        // Geolocation Check
        if (contest.location && contest.location.enabled) {
            if (!navigator.geolocation) {
                toast.error("Geolocation is not supported by your browser.");
                return;
            }

            const toastId = toast.loading("Verifying your location...");

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLat = position.coords.latitude;
                    const userLng = position.coords.longitude;
                    const distance = calculateDistance(
                        userLat,
                        userLng,
                        contest.location.latitude,
                        contest.location.longitude
                    );

                    toast.dismiss(toastId);

                    if (distance <= contest.location.radius) {
                        toast.success("Location Verified! You are at the venue.");
                        proceedToJoin();
                    } else {
                        toast.error(`You are ${Math.round(distance)}m away from the venue! (Max: ${contest.location.radius}m)`);
                    }
                },
                (error) => {
                    toast.dismiss(toastId);
                    toast.error("Unable to retrieve your location. Please enable permissions.");
                },
                { enableHighAccuracy: true }
            );
        } else {
            proceedToJoin();
        }
    };

    const enterContest = (contest) => {
        navigate('/quiz', {
            state: {
                category: contest.category,
                difficulty: contest.difficulty,
                limit: contest.questionLimit,
                contestId: contest._id,
                duration: contest.duration,
                allowBacktracking: contest.allowBacktracking
            }
        });
    }

    const startQuiz = (e) => {
        e.preventDefault();

        if (selectedContest) {
            if (password === selectedContest.accessCode) {
                setShowModal(false);
                toast.success('Access Granted! Good luck.');
                enterContest(selectedContest);
                setPassword('');
            } else {
                toast.error('Incorrect Contest Password');
            }
        } else {
            if (password === '22122704') {
                setShowModal(false);
                toast.success('Access Granted! Good luck.');
                navigate('/quiz', { state: { category: 'All', difficulty: 'All', limit: 10, allowBacktracking: true } });
                setPassword('');
            } else {
                toast.error('Incorrect Access Password');
            }
        }
    };


    // Filter contests based on selected tab
    const filteredContests = contests.filter(c => {
        const now = new Date();
        const start = new Date(c.startTime);
        const end = new Date(c.endTime);

        if (selectedTab === 'Active') return now >= start && now <= end;
        if (selectedTab === 'Upcoming') return now < start;
        if (selectedTab === 'Ended') return now > end;
        return true;
    });

    if (loading) return <Loader text="Loading Contests..." />;

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-10 relative">
            <div className="mb-12 flex items-end justify-between">
                <div>
                    <h1 className="text-4xl font-bold mb-3 tracking-tight">Tech Fest Dashboard</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Choose a contest to participate in.</p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-8">
                {['Active', 'Upcoming', 'Ended'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setSelectedTab(tab)}
                        className={`px-6 py-3 rounded-xl font-bold transition-all ${selectedTab === tab
                            ? 'bg-primary-600 text-white shadow-lg scale-105'
                            : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-center sm:text-left">
                <div className="lg:col-span-2 space-y-6">
                    {filteredContests.length > 0 ? (
                        filteredContests.map((contest) => {
                            const now = new Date();
                            const start = new Date(contest.startTime);
                            const end = new Date(contest.endTime);
                            const isActive = now >= start && now <= end;
                            const isUpcoming = now < start;

                            const isCompleted = contest.isCompleted;

                            return (
                                <div key={contest._id} className="glass p-8 rounded-[2rem] shadow-xl border-white/40 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
                                    <div className={`absolute top-0 left-0 w-2 h-full ${isCompleted ? 'bg-indigo-500' : isActive ? 'bg-green-500' : isUpcoming ? 'bg-amber-500' : 'bg-slate-400'}`} />

                                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 ${isCompleted ? 'bg-indigo-100 text-indigo-600' : isActive ? 'bg-green-100 text-green-600' : isUpcoming ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                                        <Play fill="currentColor" size={32} />
                                    </div>

                                    <div className="flex-1 text-center md:text-left">
                                        <div className="flex flex-wrap items-center gap-3 mb-2 justify-center md:justify-start">
                                            <h2 className="text-2xl font-bold">{contest.title}</h2>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${isCompleted ? 'bg-indigo-500 text-white' : isActive ? 'bg-green-500 text-white animate-pulse' : isUpcoming ? 'bg-amber-500 text-white' : 'bg-slate-500 text-white'}`}>
                                                {isCompleted ? 'Completed' : isActive ? 'Live Now' : isUpcoming ? 'Upcoming' : 'Ended'}
                                            </span>
                                        </div>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2">{contest.description}</p>
                                        <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                            <span>{contest.category}</span>
                                            <span>•</span>
                                            <span>{contest.duration} Mins</span>
                                            <span>•</span>
                                            <span>{contest.questionLimit} Questions</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleJoinClick(contest)}
                                        disabled={!isActive && !isCompleted}
                                        className={`btn px-8 py-4 rounded-xl shadow-lg transition-all ${(!isActive && !isCompleted) ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed' : 'btn-primary hover:scale-105'}`}
                                    >
                                        {isCompleted ? 'See Result' : isActive ? 'Join Now' : isUpcoming ? 'Starts Soon' : 'Closed'}
                                    </button>
                                </div>
                            );
                        })
                    ) : (
                        <div className="glass p-16 rounded-[2.5rem] shadow-2xl border-white/40 flex flex-col items-center justify-center space-y-8 bg-gradient-to-br from-white/50 to-primary-50/30 dark:from-slate-900/50 dark:to-primary-900/10 h-full">
                            <div className="w-24 h-24 rounded-3xl bg-primary-600 flex items-center justify-center shadow-2xl shadow-primary-500/40 animate-bounce">
                                <Play fill="white" size={40} className="ml-1" />
                            </div>
                            <div className="text-center space-y-4">
                                <h2 className="text-3xl md:text-4xl font-black tracking-tight self-center">
                                    {selectedTab === 'Active' ? 'Practice Session' : `No ${selectedTab} Contests`}
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                                    {selectedTab === 'Active'
                                        ? 'No live contests currently. Enter the access code to start a general practice quiz.'
                                        : `There are currently no ${selectedTab.toLowerCase()} contests available.`}
                                </p>
                            </div>
                            {selectedTab === 'Active' && (
                                <button
                                    onClick={() => handleJoinClick(null)}
                                    className="btn btn-primary px-16 py-5 flex items-center gap-3 text-xl rounded-2xl shadow-2xl shadow-primary-500/50 hover:scale-105 transition-transform"
                                >
                                    <Play fill="white" size={24} /> Enter Access Code
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="space-y-8">
                    <div className="bg-gradient-to-br from-primary-600 to-indigo-700 p-8 rounded-3xl text-white shadow-xl">
                        <h3 className="text-xl font-bold mb-4">Quiz Stats 📊</h3>
                        <p className="opacity-90 leading-relaxed">
                            Complete quizzes to earn points and climb the global leaderboard. The faster you answer, the better!
                        </p>
                    </div>

                    <div className="glass p-8 rounded-3xl shadow-xl border-white/20">
                        <h3 className="text-xl font-bold mb-6">Quiz Rules</h3>
                        <ul className="space-y-4 text-slate-500 dark:text-slate-400">
                            <li className="flex gap-3">
                                <span className="text-primary-600 font-bold">•</span>
                                <span>Backtracking between questions is enabled.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-primary-600 font-bold">•</span>
                                <span>Auto-submits on tab close.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-primary-600 font-bold">•</span>
                                <span>30 minutes total time for the quiz.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Password Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-sm">
                    <div className="glass w-full max-w-sm p-8 rounded-[2rem] shadow-2xl border-white/40 animate-in fade-in zoom-in duration-300">
                        <h3 className="text-2xl font-bold mb-2 text-center">Entry Access</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm text-center mb-8">Please enter the access code to join the quiz.</p>

                        <form onSubmit={startQuiz} className="space-y-4">
                            <input
                                type="password"
                                autoFocus
                                placeholder="Enter access code..."
                                className="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all text-center font-bold tracking-widest"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    className="flex-1 btn btn-primary py-4 font-bold"
                                >
                                    Enter Quiz
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
