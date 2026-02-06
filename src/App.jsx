import { useState } from 'react'
import './App.css'
import { Utensils, ShoppingCart, User, ChefHat } from 'lucide-react'
import People from './components/FamilyProfiles'

function App() {
  const [activeTab, setActiveTab] = useState('plan')

  return (
    <div className="app-container">
      {/* Dynamic Content Area */}
      <main className="content-scroll">
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0 }}>
            Manifest<span style={{ color: 'var(--accent-primary)' }}>Meal</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Vibe coded planner</p>
        </header>

        {activeTab === 'plan' && (
          <div className="glass-panel" style={{ padding: '2rem', height: '300px' }}>
            <h2>Weekly Plan</h2>
            <p>Drag & Drop UI coming soon...</p>
          </div>
        )}

        {activeTab === 'profile' && <People />}

        {activeTab === 'shop' && (
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2>Grocery List</h2>
            <p>Smart aggregation pending...</p>
          </div>
        )}
      </main>

      {/* Bottom Navigation (Glassmorphism) */}
      <nav className="glass-panel" style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        right: '20px',
        height: 'var(--nav-height)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 100,
        borderRadius: '24px' // Pill shape
      }}>
        <NavIcon icon={<Utensils />} label="Plan" isActive={activeTab === 'plan'} onClick={() => setActiveTab('plan')} />
        <NavIcon icon={<ChefHat />} label="Recipes" isActive={activeTab === 'recipes'} onClick={() => setActiveTab('recipes')} />
        <NavIcon icon={<ShoppingCart />} label="Shop" isActive={activeTab === 'shop'} onClick={() => setActiveTab('shop')} />
        <NavIcon icon={<User />} label="Profile" isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
      </nav>
    </div>
  )
}

function NavIcon({ icon, label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        fontSize: '0.75rem',
        padding: '0 8px'
      }}
    >
      {icon}
      {/* <span>{label}</span> */}
    </button>
  )
}

export default App
