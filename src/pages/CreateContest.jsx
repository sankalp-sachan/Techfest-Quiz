import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Trophy, Calendar, Clock, Lock, ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CreateContest = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [quizNames, setQuizNames] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'All',
        quizName: 'All',
        difficulty: 'All',
        questionLimit: 10,
        duration: 30,
        startTime: '',
        endTime: '',
        accessCode: '',
        allowBacktracking: false,

        // Extended for Location
        geoEnabled: false,
        latitude: '',
        longitude: '',
        radius: 100
    });

    useEffect(() => {
        fetchQuizNames();
    }, []);

    const fetchQuizNames = async () => {
        try {
            const { data } = await axios.get('/questions/names');
            setQuizNames(data);
        } catch (error) {
            console.error('Failed to fetch quiz names');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Transform flat state to nested model structure
        const payload = {
            ...formData,
            location: {
                enabled: formData.geoEnabled,
                latitude: Number(formData.latitude),
                longitude: Number(formData.longitude),
                radius: Number(formData.radius)
            }
        };

        try {
            await axios.post('/contests', payload);
            toast.success('Contest Created Successfully!');
            navigate('/admin');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to create contest');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10">
            <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-slate-500 mb-6 hover:text-primary-600 transition-colors">
                <ArrowLeft size={20} /> Back to Dashboard
            </button>

            <div className="glass p-8 rounded-[2.5rem] shadow-2xl border-white/40">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600">
                        <Trophy size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black">Create New Contest</h1>
                        <p className="text-slate-500">Set up a competitive quiz event</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 col-span-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Contest Title</label>
                            <input
                                type="text"
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Tech Fest 2026 - Round 1"
                                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-primary-500 outline-none font-bold"
                            />
                        </div>

                        <div className="space-y-2 col-span-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Rules and details about the contest..."
                                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-primary-500 outline-none font-medium h-32 resize-none"
                            />
                        </div>

                        <div className="space-y-2 col-span-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Select Specific Quiz Topic (Optional)</label>
                            <select
                                name="quizName"
                                value={formData.quizName}
                                onChange={handleChange}
                                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-primary-500 outline-none font-bold"
                            >
                                <option value="All">All Topics (Mix from Category)</option>
                                {quizNames.map((name, idx) => (
                                    <option key={idx} value={name}>{name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-primary-500 outline-none font-bold"
                            >
                                <option value="All">All Categories</option>
                                <option value="Web Dev">Web Development</option>
                                <option value="React">React</option>
                                <option value="Node.js">Node.js</option>
                                <option value="Databases">Databases</option>
                                <option value="DSA">DSA</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Difficulty</label>
                            <select
                                name="difficulty"
                                value={formData.difficulty}
                                onChange={handleChange}
                                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-primary-500 outline-none font-bold"
                            >
                                <option value="All">Mixed Difficulty</option>
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Question Limit</label>
                            <input
                                type="number"
                                name="questionLimit"
                                required
                                min="1"
                                max="50"
                                value={formData.questionLimit}
                                onChange={handleChange}
                                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-primary-500 outline-none font-bold"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                Duration (Minutes) <Clock size={14} />
                            </label>
                            <input
                                type="number"
                                name="duration"
                                required
                                min="1"
                                value={formData.duration}
                                onChange={handleChange}
                                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-primary-500 outline-none font-bold"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                Start Time <Calendar size={14} />
                            </label>
                            <input
                                type="datetime-local"
                                name="startTime"
                                required
                                value={formData.startTime}
                                onChange={handleChange}
                                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-primary-500 outline-none font-bold"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                End Time <Calendar size={14} />
                            </label>
                            <input
                                type="datetime-local"
                                name="endTime"
                                required
                                value={formData.endTime}
                                onChange={handleChange}
                                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-primary-500 outline-none font-bold"
                            />
                        </div>

                        <div className="space-y-2 col-span-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                Access Password (Optional) <Lock size={14} />
                            </label>
                            <input
                                type="text"
                                name="accessCode"
                                value={formData.accessCode}
                                onChange={handleChange}
                                placeholder="Leave empty for public access"
                                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-primary-500 outline-none font-bold"
                            />
                            <p className="text-xs text-slate-400">If set, users must enter this password to join the quiz.</p>
                        </div>

                        <div className="col-span-2 flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800">
                            <input
                                type="checkbox"
                                name="allowBacktracking"
                                id="backtracking"
                                checked={formData.allowBacktracking}
                                onChange={handleChange}
                                className="w-6 h-6 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <label htmlFor="backtracking" className="font-bold cursor-pointer select-none">
                                Allow Backtracking (Previous Question)
                                <span className="block text-xs font-normal text-slate-500">If unchecked, users cannot go back to change answers.</span>
                            </label>
                        </div>

                        {/* Geolocation Settings */}
                        <div className="col-span-2 space-y-4 border-t border-slate-200 dark:border-slate-800 pt-6 mt-2">
                            <h3 className="font-black text-lg flex items-center gap-2">
                                <span className="p-1 rounded bg-indigo-100 text-indigo-600">📍</span>
                                Location Restrictions
                            </h3>
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800">
                                <input
                                    type="checkbox"
                                    name="geoEnabled"
                                    id="geoEnabled"
                                    checked={formData.geoEnabled}
                                    onChange={handleChange}
                                    className="w-6 h-6 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                <label htmlFor="geoEnabled" className="font-bold cursor-pointer select-none">
                                    Enable Location Restriction
                                    <span className="block text-xs font-normal text-slate-500">Users must be physically present at the venue to join.</span>
                                </label>
                            </div>

                            {formData.geoEnabled && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Latitude</label>
                                        <input
                                            type="number"
                                            step="any"
                                            name="latitude"
                                            required={formData.geoEnabled}
                                            value={formData.latitude}
                                            onChange={handleChange}
                                            placeholder="e.g. 19.0760"
                                            className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-primary-500 outline-none font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Longitude</label>
                                        <input
                                            type="number"
                                            step="any"
                                            name="longitude"
                                            required={formData.geoEnabled}
                                            value={formData.longitude}
                                            onChange={handleChange}
                                            placeholder="e.g. 72.8777"
                                            className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-primary-500 outline-none font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Radius (Meters)</label>
                                        <input
                                            type="number"
                                            name="radius"
                                            required={formData.geoEnabled}
                                            value={formData.radius}
                                            onChange={handleChange}
                                            placeholder="e.g. 100"
                                            className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-primary-500 outline-none font-bold"
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (navigator.geolocation) {
                                                    navigator.geolocation.getCurrentPosition(
                                                        (pos) => {
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                latitude: pos.coords.latitude,
                                                                longitude: pos.coords.longitude
                                                            }));
                                                            toast.success('Location fetched!');
                                                        },
                                                        (err) => toast.error('Check permission')
                                                    );
                                                }
                                            }}
                                            className="btn text-sm px-4 py-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-xl font-bold"
                                        >
                                            📍 Use My Current Location
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn btn-primary py-4 text-lg shadow-xl shadow-primary-500/30 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Save size={20} /> Create Contest
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateContest;
