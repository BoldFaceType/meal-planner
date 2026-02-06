import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import GroceryList from './GroceryList';

describe('GroceryList Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders correctly', () => {
    render(<GroceryList />);
    expect(screen.getByPlaceholderText(/Add item/i)).toBeInTheDocument();
  });

  it('allows manual item addition', () => {
    render(<GroceryList />);
    
    const input = screen.getByPlaceholderText(/Add item/i);
    fireEvent.change(input, { target: { value: 'Milk' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    expect(screen.getByText('Milk')).toBeInTheDocument();
  });

  it('toggles check state', () => {
    render(<GroceryList />);
    
    // Add item
    const input = screen.getByPlaceholderText(/Add item/i);
    fireEvent.change(input, { target: { value: 'Bread' } });
    fireEvent.click(screen.getAllByRole('button')[0]); // Plus button
    
    const item = screen.getByText('Bread');
    // Click to check
    fireEvent.click(item);
    
    // Since we use inline style for line-through, we can check that or the icon.
    // Simpler: check if "Clear Checked" button appears
    expect(screen.getByText('Clear Checked')).toBeInTheDocument();
  });
});
