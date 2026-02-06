import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Plus, Search, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Recipes() {
  const [recipes, setRecipes] = useLocalStorage('recipes', []);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSave = (recipe) => {
    if (recipe.id) {
        setRecipes(recipes.map(r => r.id === recipe.id ? recipe : r));
    } else {
        setRecipes([...recipes, { ...recipe, id: Date.now().toString() }]);
    }
    setIsEditing(false);
    setCurrentRecipe(null);
  };

  const handleDelete = (id) => {
    setRecipes(recipes.filter(r => r.id !== id));
  };

  const filteredRecipes = recipes.filter(r => 
    r.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '80px' }}>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div className="glass-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 12px' }}>
            <Search size={18} color="var(--text-secondary)" />
            <input 
                style={{ 
                    background: 'transparent', border: 'none', color: 'white', 
                    padding: '12px', width: '100%', outline: 'none' 
                }}
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>
        <button className="btn-primary" onClick={() => { setCurrentRecipe({}); setIsEditing(true); }}>
          <Plus size={24} />
        </button>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        <AnimatePresence>
          {filteredRecipes.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} onEdit={() => { setCurrentRecipe(recipe); setIsEditing(true); }} />
          ))}
        </AnimatePresence>
        {filteredRecipes.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                No recipes found. Create one!
            </div>
        )}
      </div>

      {isEditing && (
        <EditRecipeModal 
            recipe={currentRecipe} 
            onSave={handleSave} 
            onClose={() => setIsEditing(false)} 
            onDelete={handleDelete}
        />
      )}
    </div>
  );
}

function RecipeCard({ recipe, onEdit }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div 
        layout
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-panel" 
        style={{ overflow: 'hidden' }}
    >
        <div 
            onClick={() => setExpanded(!expanded)}
            style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
        >
            <div style={{ 
                width: '50px', height: '50px', borderRadius: '12px', 
                background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
            }}>
                Let
            </div>
            <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{recipe.title || 'Untitled Recipe'}</h3>
                <div style={{ display: 'flex', gap: '8px', fontSize: '0.8.5rem', color: 'var(--text-secondary)' }}>
                    <span>{recipe.calories || 0} kcal</span>
                    <span>•</span>
                    <span>{recipe.ingredients?.length || 0} ingredients</span>
                </div>
            </div>
            <button className="btn-primary" style={{ padding: '8px', background: 'transparent' }} onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                <Edit2Icon size={16} />
            </button>
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
        
        <AnimatePresence>
            {expanded && (
                <motion.div 
                    initial={{ height: 0 }} 
                    animate={{ height: 'auto' }} 
                    exit={{ height: 0 }} 
                    style={{ overflow: 'hidden', background: 'rgba(0,0,0,0.2)' }}
                >
                    <div style={{ padding: '1rem' }}>
                        <h4 style={{ marginTop: 0 }}>Ingredients</h4>
                        <ul style={{ paddingLeft: '1.2rem', marginBottom: '1rem' }}>
                            {recipe.ingredients?.map((ing, i) => (
                                <li key={i}>{ing.amount} {ing.unit} {ing.name}</li>
                            ))}
                        </ul>
                        <h4 style={{ margin: 0 }}>Instructions</h4>
                        <p style={{ whiteSpace: 'pre-wrap', color: '#cbd5e1' }}>{recipe.instructions}</p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </motion.div>
  );
}

function EditRecipeModal({ recipe, onSave, onClose, onDelete }) {
    const [formData, setFormData] = useState({
        ...recipe,
        ingredients: recipe.ingredients || []
    });

    const addIngredient = () => {
        setFormData({
            ...formData, 
            ingredients: [...formData.ingredients, { name: '', amount: '', unit: '' }] 
        });
    };

    const updateIngredient = (index, field, value) => {
        const newIngs = [...formData.ingredients];
        newIngs[index] = { ...newIngs[index], [field]: value };
        setFormData({ ...formData, ingredients: newIngs });
    };

    const removeIngredient = (index) => {
        setFormData({
            ...formData, 
            ingredients: formData.ingredients.filter((_, i) => i !== index)
        });
    };

    const [bulkInput, setBulkInput] = useState('');
    const [showBulk, setShowBulk] = useState(false);

    const parseBulkIngredients = () => {
        const lines = bulkInput.split('\n').filter(l => l.trim());
        const parsed = lines.map(line => {
            // Basic regex: (number/fraction) (unit)? (name)
            // Matches "1 1/2 cups of flour" or "2 chicken breasts"
            const match = line.match(/^([\d\/\s\.]+)?\s*([a-zA-Z.]+)?\s*(.*)$/);
            if (match) {
                return {
                    amount: match[1]?.trim() || '',
                    unit: match[2]?.trim() || '',
                    name: match[3]?.trim() || line.trim()
                };
            }
            return { name: line.trim(), amount: '', unit: '' };
        });
        setFormData({ ...formData, ingredients: [...formData.ingredients, ...parsed] });
        setBulkInput('');
        setShowBulk(false);
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="glass-panel"
                style={{ width: '90%', maxWidth: '500px', height: '80vh', display: 'flex', flexDirection: 'column', background: '#1e293b' }}
            >
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                    <h3 style={{ margin: 0 }}>{recipe.id ? 'Edit Recipe' : 'New Recipe'}</h3>
                </div>

                <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input 
                        className="glass-panel" 
                        style={{ padding: '12px', color: 'white', background: 'rgba(0,0,0,0.2)', width: '100%', boxSizing: 'border-box' }}
                        placeholder="Recipe Title"
                        value={formData.title || ''}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                         <input 
                            type="number"
                            className="glass-panel" 
                            style={{ padding: '12px', color: 'white', background: 'rgba(0,0,0,0.2)', width: '100%', boxSizing: 'border-box' }}
                            placeholder="Calories"
                            value={formData.calories || ''}
                            onChange={e => setFormData({...formData, calories: e.target.value})}
                        />
                         <input 
                            className="glass-panel" 
                            style={{ padding: '12px', color: 'white', background: 'rgba(0,0,0,0.2)', width: '100%', boxSizing: 'border-box' }}
                            placeholder="Prep Time"
                            value={formData.time || ''}
                            onChange={e => setFormData({...formData, time: e.target.value})}
                        />
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                            <h4 style={{ margin: 0 }}>Ingredients</h4>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => setShowBulk(!showBulk)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem' }}>
                                    {showBulk ? 'Hide Bulk' : 'Bulk Add'}
                                </button>
                                <button onClick={addIngredient} style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer' }}>+ Add</button>
                            </div>
                        </div>

                        {showBulk && (
                            <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <textarea 
                                    className="glass-panel"
                                    style={{ width: '100%', padding: '12px', color: 'white', background: 'rgba(0,0,0,0.3)', minHeight: '100px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                    placeholder="Paste ingredients list...&#10;2 cups rice&#10;1 lb chicken"
                                    value={bulkInput}
                                    onChange={e => setBulkInput(e.target.value)}
                                />
                                <button className="btn-primary" style={{ padding: '8px', fontSize: '0.8rem' }} onClick={parseBulkIngredients}>Parse & Add</button>
                            </div>
                        )}

                        {formData.ingredients.map((ing, i) => (
                            <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                <input style={{ width: '60px', padding: '8px', background: 'rgba(0,0,0,0.2)', border: 'none', color: 'white', borderRadius: '6px' }} placeholder="Qty" value={ing.amount} onChange={e => updateIngredient(i, 'amount', e.target.value)} />
                                <input style={{ width: '60px', padding: '8px', background: 'rgba(0,0,0,0.2)', border: 'none', color: 'white', borderRadius: '6px' }} placeholder="Unit" value={ing.unit} onChange={e => updateIngredient(i, 'unit', e.target.value)} />
                                <input style={{ flex: 1, padding: '8px', background: 'rgba(0,0,0,0.2)', border: 'none', color: 'white', borderRadius: '6px' }} placeholder="Name" value={ing.name} onChange={e => updateIngredient(i, 'name', e.target.value)} />
                                <button onClick={() => removeIngredient(i)} style={{ background: 'transparent', border: 'none', color: '#ef4444', padding: '0 4px', cursor: 'pointer' }}><Trash2 size={16} /></button>
                            </div>
                        ))}
                    </div>

                    <div>
                        <h4>Instructions</h4>
                        <textarea 
                            className="glass-panel" 
                            style={{ width: '100%', padding: '12px', color: 'white', background: 'rgba(0,0,0,0.2)', minHeight: '100px', resize: 'vertical', boxSizing: 'border-box' }}
                            placeholder="Step 1..."
                            value={formData.instructions || ''}
                            onChange={e => setFormData({...formData, instructions: e.target.value})}
                        />
                    </div>
                </div>

                <div style={{ padding: '1.5rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '1rem' }}>
                    <button className="btn-primary" style={{ flex: 1 }} onClick={() => onSave(formData)}>Save Recipe</button>
                    {recipe.id && (
                        <button 
                            className="btn-primary" 
                            style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                            onClick={() => { if(confirm('Delete recipe?')) { onDelete(recipe.id); onClose(); } }}
                        >
                            Delete
                        </button>
                    )}
                    <button className="btn-primary" style={{ background: 'transparent' }} onClick={onClose}>Close</button>
                </div>
            </motion.div>
        </div>
    );
}

// Icon helper
function Edit2Icon({ size }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
    )
}
