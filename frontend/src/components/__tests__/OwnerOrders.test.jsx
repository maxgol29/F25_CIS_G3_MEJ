
// ==== WILL BE EXECUTED WHEN MVP WILL BE READY ==== \\

// import React from 'react';
// import { render, screen, waitFor } from '@testing-library/react';
// import OwnerOrders from '../OwnerOrders';

// describe('OwnerOrders', () => {
//   const originalFetch = global.fetch;

//   afterEach(() => {
//     global.fetch = originalFetch;
//     jest.clearAllMocks();
//   });

//   it('fetches and displays orders for user', async () => {
//     const mockOrders = { orders: [ { id: 101, status: 'pending', total_amount: 25.5, items: [{ dish_name: 'Pizza', quantity: 1 }] } ] };

//     global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => mockOrders });

//     render(<OwnerOrders user={{ id: 2 }} onNavigate={jest.fn()} />);

//     expect(await screen.findByText(/Owner Orders/i)).toBeInTheDocument();
//     expect(await screen.findByText(/Order #101/i)).toBeInTheDocument();
//     expect(await screen.findByText(/Pizza/)).toBeInTheDocument();
//   });
// });
