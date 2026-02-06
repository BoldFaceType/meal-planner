import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Integration', () => {
  it('renders the main header', () => {
    render(<App />);
    expect(screen.getByText(/Manifest/i)).toBeInTheDocument();
    expect(screen.getByText(/Vibe coded planner/i)).toBeInTheDocument();
  });

  it('navigates between tabs', async () => {
    render(<App />);
    
    // Default should be Meal Planner
    expect(screen.getAllByText('Breakfast')[0]).toBeInTheDocument();

    // Click Profile
    const profileBtn = screen.getByLabelText('Profile');
    fireEvent.click(profileBtn);
    expect(await screen.findByText(/Family Members/i)).toBeInTheDocument();

    // Click Recipes
    const recipesBtn = screen.getByLabelText('Recipes');
    fireEvent.click(recipesBtn);
    expect(await screen.findByPlaceholderText(/Search recipes/i)).toBeInTheDocument();

    // Click Shop
    const shopBtn = screen.getByLabelText('Shop');
    fireEvent.click(shopBtn);
    expect(await screen.findByPlaceholderText(/Add item/i)).toBeInTheDocument();
  });
});
