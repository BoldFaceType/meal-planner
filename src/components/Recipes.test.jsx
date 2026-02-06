import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import Recipes from './Recipes';

describe('Recipes Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders correctly', () => {
    render(<Recipes />);
    expect(screen.getByPlaceholderText(/Search recipes/i)).toBeInTheDocument();
  });

  it('can add a new recipe', () => {
    render(<Recipes />);
    
    // Open modal (Plus button)
    const addBtns = screen.getAllByRole('button');
    // The first one is likely the search bar's sibling? No, search has no button in my code, 
    // but the main "Add" button is next to search.
    // Let's use the svg logic or just find by class/structure if needed, 
    // but simplified: the button with Plus icon.
    // Just finding the button that opens the modal.
    fireEvent.click(addBtns[0]); 
    
    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Recipe Title'), { target: { value: 'Pancakes' } });
    fireEvent.change(screen.getByPlaceholderText('Calories'), { target: { value: '300' } });
    
    // Save
    fireEvent.click(screen.getByText('Save Recipe'));
    
    // Verify
    expect(screen.getByText('Pancakes')).toBeInTheDocument();
    expect(screen.getByText('300 kcal')).toBeInTheDocument();
  });

  it('supports bulk ingredient parsing', () => {
    render(<Recipes />);
    fireEvent.click(screen.getAllByRole('button')[0]); // Open modal

    // Toggle Bulk
    fireEvent.click(screen.getByText('Bulk Add'));
    
    // Paste data
    const bulkText = `2 cups flour
1 large egg`;
    fireEvent.change(screen.getByPlaceholderText(/Paste ingredients list/i), { target: { value: bulkText } });
    
    // Parse
    fireEvent.click(screen.getByText('Parse & Add'));
    
    // Verify inputs populated (naive check)
    // We expect 2 rows of ingredients now.
    const inputs = screen.getAllByPlaceholderText('Name');
    expect(inputs.length).toBeGreaterThanOrEqual(2);
    expect(inputs[0].value).toBe('flour');
    expect(inputs[1].value).toBe('egg');
  });
});
