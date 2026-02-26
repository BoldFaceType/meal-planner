import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Plus, Trash2, CheckSquare, Square } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

export default function GroceryList() {
    const [mealPlan] = useLocalStorage('meal-plan', {});
    const [recipes] = useLocalStorage('recipes', []);
    const [extraItems, setExtraItems] = useLocalStorage('grocery-extra', []);
    const [checkedItems, setCheckedItems] = useLocalStorage('grocery-checked', {}); // { "name": boolean }
    const [newItem, setNewItem] = useState('');

    // 1. Aggregate from Meal Plan
    const aggregatedList = useMemo(() => {
        const list = {}; // { "item_name": { amount: number, unit: string } }

        Object.values(mealPlan).forEach(dayPlan => {
            Object.values(dayPlan).forEach(mealIds => {
                mealIds.forEach(id => {
                    const recipe = recipes.find(r => r.id === id);
                    if (recipe && recipe.ingredients) {
                        recipe.ingredients.forEach(ing => {
                            const name = ing.name.toLowerCase().trim();
                            if (!list[name]) {
                                list[name] = { amount: 0, unit: ing.unit, originalName: ing.name };
                            }
                            // Naive parsing/summing (would rely on AI for better unit conversions later)
                            const amount = parseFloat(ing.amount) || 0;
                            list[name].amount += amount;
                        });
                    }
                });
            });
        });

        // Convert to array
        return Object.keys(list).map(key => ({
            name: list[key].originalName,
            details: `${list[key].amount > 0 ? list[key].amount : ''} ${list[key].unit}`,
            source: 'plan'
        }));
    }, [mealPlan, recipes]);

    // 2. Merge with Extras
    const fullList = [...aggregatedList, ...extraItems];

    const handleAddExtra = () => {
        if (!newItem.trim()) return;
        setExtraItems([...extraItems, { name: newItem, source: 'manual' }]);
        setNewItem('');
    };

    const toggleCheck = (name) => {
        setCheckedItems({ ...checkedItems, [name]: !checkedItems[name] });
    };

    const clearChecked = () => {
        // Remove checked extras, keep unchecked extras
        // For plan items, we can't "delete" them without removing the meal, so we just uncheck them visually or hide them?
        // Let's just reset the check state for now
        // Or maybe strictly remove confirmation?
        if (confirm('Clear all checked items?')) {
            const newExtras = extraItems.filter(i => !checkedItems[i.name]);
            setExtraItems(newExtras);
            setCheckedItems({});
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '80px' }}>
            <div className="glass-panel" style={{ padding: '10px', display: 'flex', gap: '1rem' }}>
                <input
                    style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', outline: 'none' }}
                    placeholder="Add item..."
                    value={newItem}
                    onChange={e => setNewItem(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddExtra()}
                />
                <button onClick={handleAddExtra} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer' }}>
                    <Plus />
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {fullList.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                        List is empty. Plan some meals!
                    </div>
                )}

                <AnimatePresence>
                    {fullList.map((item, i) => {
                        const isChecked = checkedItems[item.name];
                        return (
                            <motion.div
                                key={i}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: isChecked ? 0.5 : 1, y: 0 }}
                                onClick={() => toggleCheck(item.name)}
                                className="glass-panel"
                                style={{
                                    padding: '12px', display: 'flex', alignItems: 'center', gap: '12px',
                                    cursor: 'pointer',
                                    textDecoration: isChecked ? 'line-through' : 'none'
                                }}
                            >
                                {isChecked ? <CheckSquare size={20} color="var(--accent-primary)" /> : <Square size={20} color="var(--text-secondary)" />}
                                <div style={{ flex: 1 }}>
                                    <span style={{ fontSize: '1rem' }}>{item.name}</span>
                                    {item.details && <span style={{ marginLeft: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.details}</span>}
                                </div>
                                {item.source === 'plan' && <span style={{ fontSize: '0.7rem', background: '#334155', padding: '2px 6px', borderRadius: '4px' }}>Plan</span>}
                                {item.source === 'manual' && (
                                    <button onClick={(e) => { e.stopPropagation(); setExtraItems(extraItems.filter((_, idx) => idx !== (i - aggregatedList.length))); }} style={{ background: 'none', border: 'none', color: '#ef4444' }}>
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>

            {Object.values(checkedItems).some(Boolean) && (
                <button className="btn-primary" onClick={clearChecked} style={{ marginTop: '1rem', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
                    Clear Checked
                </button>
            )}
        </div>
    );
}
