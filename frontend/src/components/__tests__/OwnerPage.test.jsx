import React from 'react';
import { render, screen } from '@testing-library/react';
import OwnerPage from '../OwnerPage';

describe('OwnerPage', () => {
  it('renders owner info and logout button', () => {
    const user = { first_name: 'Sam', last_name: 'Owner', email: 'sam@example.com', phone: '555-1234' };
    const mockLogout = jest.fn();
    const mockNavigate = jest.fn();

    render(<OwnerPage user={user} onLogout={mockLogout} onNavigate={mockNavigate} />);

    expect(screen.getByText(/Business Owner Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Sam Owner/)).toBeInTheDocument();
    expect(screen.getByText(/sam@example.com/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Logout/i })).toBeInTheDocument();
  });
});
