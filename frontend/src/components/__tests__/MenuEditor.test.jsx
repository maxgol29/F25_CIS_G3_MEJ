
// ==== WILL BE EXECUTED WHEN MVP WILL BE READY ==== \\

// import React from 'react';
// import { render, screen, waitFor, fireEvent } from '@testing-library/react';
// import MenuEditor from '../MenuEditor';

// describe('MenuEditor', () => {
//   const originalFetch = global.fetch;

//   afterEach(() => {
//     global.fetch = originalFetch;
//     jest.clearAllMocks();
//   });

//   it('fetches and displays items and allows adding an item', async () => {
//     const mockItems = { items: [{ dish_name: 'Taco', food_type: 'Mexican', portion_size: '2 pcs', image_url: '' }] };

//     const mockFetch = jest.fn()
//       .mockResolvedValueOnce({ ok: true, json: async () => mockItems })
//       .mockResolvedValueOnce({ ok: true, json: async () => ({ message: 'Item added' }) })
//       .mockResolvedValueOnce({ ok: true, json: async () => mockItems });

//     global.fetch = mockFetch;

//     render(<MenuEditor user={{ business_id: 1 }} onNavigate={jest.fn()} />);

//     expect(await screen.findByText(/Your Items/i)).toBeInTheDocument();
//     expect(await screen.findByText(/Taco/)).toBeInTheDocument();

//     const nameInput = screen.getByLabelText(/Dish name/i);
//     fireEvent.change(nameInput, { target: { value: 'Burrito' } });

//     const addButton = screen.getByRole('button', { name: /Add Item/i });
//     fireEvent.click(addButton);

//     await waitFor(() => expect(global.fetch).toHaveBeenCalled());
//     expect(await screen.findByText(/Item added/i)).toBeInTheDocument();
//   });
// });

