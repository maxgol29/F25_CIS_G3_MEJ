import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import PromoManager from '../PromoManager';

describe('PromoManager', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('loads promos and can create a new promo', async () => {
    const mockPromos = { promo_codes: [{ name: 'HALFOFF', description: '50% off' }] };

    const mockFetch = jest.fn()
      // GET promo_codes
      .mockResolvedValueOnce({ ok: true, json: async () => mockPromos })
      // POST create promo
      .mockResolvedValueOnce({ ok: true, json: async () => ({ message: 'created' }) })
      // GET promo_codes (refresh)
      .mockResolvedValueOnce({ ok: true, json: async () => mockPromos });

    global.fetch = mockFetch;

    render(<PromoManager user={{ id: 3 }} onNavigate={jest.fn()} />);

    expect(await screen.findByText(/Existing Promo Codes/i)).toBeInTheDocument();
    expect(await screen.findByText(/HALFOFF/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'NEWPROMO' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Test promo' } });
    fireEvent.click(screen.getByRole('button', { name: /Create/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(await screen.findByText(/Promo created/i)).toBeInTheDocument();
  });
});
