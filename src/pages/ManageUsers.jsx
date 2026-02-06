import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Search, Trash2, UserCog, Shield, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        const results = users.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredUsers(results);
    }, [searchTerm, users]);

    const fetchUsers = async () => {
        try {
            const { data } = await axios.get('/users', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setUsers(data);
            setFilteredUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await axios.put(`/users/${userId}/role`, { role: newRole }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setUsers(users.map(user => user._id === userId ? { ...user, role: newRole } : user));
            toast.success(`Role updated to ${newRole}`);
        } catch (error) {
            console.error('Error updating role:', error);
            toast.error('Failed to update role');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        try {
            await axios.delete(`/users/${userId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setUsers(users.filter(user => user._id !== userId));
            toast.success('User deleted successfully');
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Failed to delete user');
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'judge': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
            default: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                        <UserCog className="text-primary-600" size={40} />
                        User Management
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage user roles and permissions</p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-none bg-white dark:bg-slate-900 shadow-lg focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                />
            </div>

            {/* Users Table */}
            <div className="glass rounded-[2rem] shadow-xl border-white/40 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800">
                                <th className="p-6 font-bold text-slate-500 dark:text-slate-400">User</th>
                                <th className="p-6 font-bold text-slate-500 dark:text-slate-400">Email</th>
                                <th className="p-6 font-bold text-slate-500 dark:text-slate-400">Role</th>
                                <th className="p-6 font-bold text-slate-500 dark:text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="p-10 text-center text-slate-500">Loading users...</td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-10 text-center text-slate-500">No users found</td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <motion.tr
                                        key={user._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <td className="p-6">
                                            <div className="font-bold text-lg">{user.name}</div>
                                            <div className="text-xs text-slate-400 font-mono">ID: {user._id}</div>
                                        </td>
                                        <td className="p-6 text-slate-600 dark:text-slate-300">{user.email}</td>
                                        <td className="p-6">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                className={`px-4 py-2 rounded-xl font-bold border-none outline-none cursor-pointer transition-all ${getRoleColor(user.role)}`}
                                            >
                                                <option value="user">User</option>
                                                <option value="judge">Judge</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td className="p-6 text-right">
                                            <button
                                                onClick={() => handleDeleteUser(user._id)}
                                                className="p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-all group"
                                                title="Delete User"
                                            >
                                                <Trash2 size={20} className="group-hover:scale-110 transition-transform" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageUsers;
