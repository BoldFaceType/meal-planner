import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export default function MealPlanner() {
    const [mealPlan, setMealPlan] = useLocalStorage('meal-plan', {}); // { 'YYYY-MM-DD': { Breakfast: [recipeId], ... } }
    const [recipes] = useLocalStorage('recipes', []);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [targetSlot, setTargetSlot] = useState(null); // { dateStr, type }

    // Date Helpers
    const getDaysOfWeek = (date) => {
        const start = new Date(date);
        start.setDate(start.getDate() - start.getDay() + 1); // Start Monday
        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            days.push(d);
        }
        return days;
    };

    const days = getDaysOfWeek(currentDate);

    const formatDate = (date) => date.toISOString().split('T')[0];
    const formatDayName = (date) => date.toLocaleDateString('en-US', { weekday: 'short' });
    const formatDayNum = (date) => date.getDate();

    const handleAddMeal = (recipe) => {
        const { dateStr, type } = targetSlot;
        const dayPlan = mealPlan[dateStr] || {};
        const currentMeals = dayPlan[type] || [];

        setMealPlan({
            ...mealPlan,
            [dateStr]: {
                ...dayPlan,
                [type]: [...currentMeals, recipe.id]
            }
        });
        setIsPickerOpen(false);
    };

    const removeMeal = (dateStr, type, index) => {
        const dayPlan = mealPlan[dateStr];
        const newMeals = [...dayPlan[type]];
        newMeals.splice(index, 1);
        setMealPlan({
            ...mealPlan,
            [dateStr]: { ...dayPlan, [type]: newMeals }
        });
    };

    const navigateWeek = (direction) => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + (direction * 7));
        setCurrentDate(newDate);
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '80px' }}>
            {/* Week Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1rem' }}>
                <button onClick={() => navigateWeek(-1)} style={{ background: 'none', border: 'none', color: 'white' }}><ChevronLeft /></button>
                <h3 style={{ margin: 0 }}>
                    {days[0].toLocaleDateString('en-US', { month: 'long' })} {days[0].getFullYear()}
                </h3>
                <button onClick={() => navigateWeek(1)} style={{ background: 'none', border: 'none', color: 'white' }}><ChevronRight /></button>
            </div>

            {/* Horizontal Scroll Days */}
            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', padding: '0.5rem 1rem', scrollbarWidth: 'none' }}>
                {days.map(day => {
                    const isToday = formatDate(day) === formatDate(new Date());
                    return (
                        <div key={day.toISOString()} style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            minWidth: '50px', padding: '10px', borderRadius: '16px',
                            background: isToday ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                            border: isToday ? 'none' : '1px solid var(--glass-border)'
                        }}>
                            <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{formatDayName(day)}</span>
                            <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{formatDayNum(day)}</span>
                        </div>
                    )
                })}
            </div>

            {/* Daily View (Vertical List for Mobile) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '0 1rem' }}>
                {days.map(day => {
                    const dateStr = formatDate(day);
                    const dayPlan = mealPlan[dateStr] || {};
                    // For mobile, maybe just show Today? Or all days? 
                    // Let's show all for now but vertical stack
                    const isToday = dateStr === formatDate(new Date());

                    return (
                        <div key={dateStr} style={{ opacity: isToday ? 1 : 0.8 }}>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: isToday ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                                {formatDayName(day)} {formatDayNum(day)}
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {MEAL_TYPES.map(type => (
                                    <MealSlot
                                        key={type}
                                        type={type}
                                        meals={dayPlan[type] || []}
                                        recipeDb={recipes}
                                        onAdd={() => { setTargetSlot({ dateStr, type }); setIsPickerOpen(true); }}
                                        onRemove={(idx) => removeMeal(dateStr, type, idx)}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {isPickerOpen && (
                <RecipePickerModal
                    recipes={recipes}
                    onSelect={handleAddMeal}
                    onClose={() => setIsPickerOpen(false)}
                />
            )}
        </div>
    );
}

function MealSlot({ type, meals, recipeDb, onAdd, onRemove }) {
    return (
        <div className="glass-panel" style={{ padding: '0.8rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <span>{type}</span>
                <button onClick={onAdd} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}>
                    <Plus size={14} />
                </button>
            </div>
            {meals.map((mealId, idx) => {
                const recipe = recipeDb.find(r => r.id === mealId);
                return (
                    <motion.div
                        key={idx}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ padding: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                        <span>{recipe ? recipe.title : 'Unknown Recipe'}</span>
                        <button onClick={() => onRemove(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', padding: '0', cursor: 'pointer' }}>
                            <X size={14} />
                        </button>
                    </motion.div>
                )
            })}
        </div>
    )
}

function RecipePickerModal({ recipes, onSelect, onClose }) {
    const [search, setSearch] = useState('');
    const filtered = recipes.filter(r => r.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div className="glass-panel" style={{ width: '90%', maxWidth: '400px', height: '70vh', display: 'flex', flexDirection: 'column', background: '#1e293b' }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between' }}>
                    <h3>Add Meal</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white' }}><X /></button>
                </div>
                <div style={{ padding: '1rem' }}>
                    <input
                        className="glass-panel"
                        style={{ padding: '10px', width: '100%', boxSizing: 'border-box', color: 'white', background: 'rgba(0,0,0,0.2)' }}
                        placeholder="Search..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        autoFocus
                    />
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '0 1rem 1rem 1rem' }}>
                    {filtered.map(r => (
                        <div
                            key={r.id}
                            onClick={() => onSelect(r)}
                            style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
                        >
                            <span>{r.title}</span>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{r.calories} kcal</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
