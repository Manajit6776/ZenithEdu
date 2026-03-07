import React, { useState, useEffect } from 'react';
import { User, Mail, Building, Briefcase, Award, Save, Camera, Loader2, CheckCircle, Shield, Clock, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

function cn(...inputs: any[]) { return twMerge(clsx(inputs)); }

export const ProfileSettings: React.FC = () => {
    const { user, updateUser } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.id) return;
            try {
                const response = await fetch(`/api/profile/${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setProfile(data);
                }
            } catch (error) {
                console.error('Failed to fetch profile:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);

        try {
            const response = await fetch(`/api/profile/${user?.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile),
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                // Update global auth state
                updateUser(profile);
            } else {
                setMessage({ type: 'error', text: 'Failed to update profile.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setProfile((prev: any) => ({ ...prev, [field]: value }));
    };

    if (isLoading) {
        return (
            <div className="h-96 flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                <p className="text-slate-500 animate-pulse text-sm font-medium">Loading Profile</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="h-96 flex flex-col items-center justify-center gap-4">
                <div className="p-4 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl">
                    <p className="font-medium">Profile data not found.</p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="text-indigo-400 hover:text-white transition-colors text-sm font-medium"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
                <p className="text-slate-400">Manage your personal information and public profile.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                {/* Profile Section */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-8">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            {/* Avatar Section */}
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px]">
                                    <div className="w-full h-full rounded-2xl bg-slate-900 overflow-hidden relative">
                                        <img
                                            src={profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                        >
                                            <Camera className="w-6 h-6 text-white" />
                                        </button>
                                    </div>
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-indigo-500 p-1.5 rounded-lg shadow-lg">
                                    <Camera className="w-4 h-4 text-white" />
                                </div>
                            </div>

                            {/* Basic Info */}
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                        <User className="w-3.5 h-3.5" /> Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                        placeholder="Enter full name"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                        <Mail className="w-3.5 h-3.5" /> Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={profile.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                        placeholder="Enter email"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-xl space-y-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                            <Briefcase className="w-5 h-5 text-indigo-400" />
                            Professional Details
                        </h3>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                <Building className="w-3.5 h-3.5" /> Department
                            </label>
                            <input
                                type="text"
                                value={profile.department || ''}
                                onChange={(e) => handleInputChange('department', e.target.value)}
                                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                placeholder="Department name"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                <Shield className="w-3.5 h-3.5" /> Role
                            </label>
                            <input
                                type="text"
                                value={profile.role}
                                disabled
                                className="w-full bg-slate-800/30 border border-white/5 rounded-xl px-4 py-2.5 text-slate-500 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-xl space-y-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                            <Award className="w-5 h-5 text-purple-400" />
                            Expertise & Experience
                        </h3>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                <Award className="w-3.5 h-3.5" /> Specialization
                            </label>
                            <input
                                type="text"
                                value={profile.specialization || ''}
                                onChange={(e) => handleInputChange('specialization', e.target.value)}
                                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                placeholder="Core specialization"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5" /> Experience (Years)
                            </label>
                            <input
                                type="number"
                                value={profile.experience || 0}
                                onChange={(e) => handleInputChange('experience', parseInt(e.target.value) || 0)}
                                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                placeholder="Years of experience"
                            />
                        </div>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl shadow-xl">
                    <div className="flex items-center gap-4">
                        {message && (
                            <div className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-left-4 duration-300",
                                message.type === 'success' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            )}>
                                {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                {message.text}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            type="button"
                            className="px-6 py-2.5 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-all w-full md:w-auto text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-70 disabled:cursor-not-allowed w-full md:w-auto text-sm"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};
