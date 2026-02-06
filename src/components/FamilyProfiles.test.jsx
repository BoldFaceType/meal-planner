import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import FamilyProfiles from './FamilyProfiles';

describe('FamilyProfiles Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders correctly', () => {
    render(<FamilyProfiles />);
    expect(screen.getByText(/Family Members/i)).toBeInTheDocument();
  });

  it('can add a new profile', () => {
    render(<FamilyProfiles />);
    
    // Open modal
    fireEvent.click(screen.getByText(/Add/i));
    
    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Current Weight (kg)'), { target: { value: '80' } });
    
    // Save
    fireEvent.click(screen.getByText('Save'));
    
    // Check if added
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
