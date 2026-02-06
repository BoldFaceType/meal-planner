import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Plus, X, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DIET_OPTIONS = ['None', 'Keto', 'Vegan', 'Vegetarian', 'Paleo', 'Gluten-Free'];

export default function FamilyProfiles() {
    const [profiles, setProfiles] = useLocalStorage('family-profiles', []);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProfile, setCurrentProfile] = useState(null);

    const handleSave = (profile) => {
        if (profile.id) {
            setProfiles(profiles.map(p => p.id === profile.id ? profile : p));
        } else {
            setProfiles([...profiles, { ...profile, id: Date.now().toString() }]);
        }
        setIsEditing(false);
        setCurrentProfile(null);
    };

    const handleDelete = (id) => {
        setProfiles(profiles.filter(p => p.id !== id));
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '80px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Family Members</h2>
                <button className="btn-primary" onClick={() => { setCurrentProfile({}); setIsEditing(true); }}>
                    <Plus size={20} /> Add
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                <AnimatePresence>
                    {profiles.map(profile => (
                        <ProfileCard key={profile.id} profile={profile} onEdit={() => { setCurrentProfile(profile); setIsEditing(true); }} />
                    ))}
                </AnimatePresence>
            </div>

            {isEditing && (
                <EditProfileModal
                    profile={currentProfile}
                    onSave={handleSave}
                    onClose={() => setIsEditing(false)}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
}

function ProfileCard({ profile, onEdit }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            layout
            className="glass-panel"
            onClick={onEdit}
            style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', position: 'relative' }}
        >
            <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #cbd5e1, #94a3b8)',
                marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a'
            }}>
                {profile.name?.[0]?.toUpperCase() || '?'}
            </div>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>{profile.name}</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', background: 'rgba(139, 92, 246, 0.1)', padding: '2px 8px', borderRadius: '12px' }}>
                {profile.diet || 'No Diet'}
            </span>
        </motion.div>
    );
}

function EditProfileModal({ profile, onSave, onClose, onDelete }) {
    const [formData, setFormData] = useState(profile || {});

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="glass-panel"
                style={{ width: '90%', maxWidth: '400px', padding: '2rem', background: '#1e293b' }}
            >
                <h3>{profile.id ? 'Edit Member' : 'New Member'}</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        className="glass-panel"
                        style={{ padding: '12px', color: 'white', background: 'rgba(0,0,0,0.2)' }}
                        placeholder="Name"
                        value={formData.name || ''}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />

                    <select
                        className="glass-panel"
                        style={{ padding: '12px', color: 'white', background: 'rgba(0,0,0,0.2)' }}
                        value={formData.diet || ''}
                        onChange={e => setFormData({ ...formData, diet: e.target.value })}
                    >
                        <option value="">Select Diet...</option>
                        {DIET_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <input
                            type="number"
                            className="glass-panel"
                            style={{ padding: '12px', color: 'white', background: 'rgba(0,0,0,0.2)' }}
                            placeholder="Current Weight (kg)"
                            value={formData.currentWeight || ''}
                            onChange={e => setFormData({ ...formData, currentWeight: e.target.value })}
                        />
                        <input
                            type="number"
                            className="glass-panel"
                            style={{ padding: '12px', color: 'white', background: 'rgba(0,0,0,0.2)' }}
                            placeholder="Target Weight"
                            value={formData.targetWeight || ''}
                            onChange={e => setFormData({ ...formData, targetWeight: e.target.value })}
                        />
                    </div>
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                    <button className="btn-primary" style={{ flex: 1 }} onClick={() => onSave(formData)}>Save</button>
                    {profile.id && (
                        <button
                            className="btn-primary"
                            style={{ background: 'var(--glass-bg)', border: '1px solid firebrick', color: 'firebrick' }}
                            onClick={() => { if (confirm('Delete?')) { onDelete(profile.id); onClose(); } }}
                        >
                            Delete
                        </button>
                    )}
                    <button className="btn-primary" style={{ background: 'transparent' }} onClick={onClose}>Cancel</button>
                </div>
            </motion.div>
        </div>
    );
}
