import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({
    businessId: null,
    businessName: '',
    items: [] 
  });

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to load cart:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);
  const addToCart = (item, businessId, businessName) => {
    if (cart.items.length > 0 && cart.businessId && cart.businessId !== businessId) {
      throw new Error(
        `You can only order from one business at a time. Current business: ${cart.businessName}`
      );
    }
    setCart(prevCart => {
      const existingItem = prevCart.items.find(i => i.itemId === item.id);
      if (existingItem) {
        return {
          ...prevCart,
          items: prevCart.items.map(i =>
            i.itemId === item.id
              ? { ...i, quantity: i.quantity + (item.quantity || 1) }
              : i
          )
        };
      }
      return {
        businessId,
        businessName,
        items: [
          ...prevCart.items,
          {
            itemId: item.id,
            dishName: item.dish_name,
            price: item.price,
            quantity: item.quantity || 1,
            discountPercentage: item.discount_percentage || 0,
            imageUrl: item.image_url
          }
        ]
      };
    });
  };
  const removeFromCart = (itemId) => {
    setCart(prevCart => {
      const updatedItems = prevCart.items.filter(i => i.itemId !== itemId);
      return {
        businessId: updatedItems.length > 0 ? prevCart.businessId : null,
        businessName: updatedItems.length > 0 ? prevCart.businessName : '',
        items: updatedItems
      };
    });
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart(prevCart => ({
      ...prevCart,
      items: prevCart.items.map(i =>
        i.itemId === itemId ? { ...i, quantity } : i
      )
    }));
  };

  const clearCart = () => {
    setCart({
      businessId: null,
      businessName: '',
      items: []
    });
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let totalDiscount = 0;

    cart.items.forEach(item => {
      const itemPrice = item.price * item.quantity;
      subtotal += itemPrice;
      
      if (item.discountPercentage > 0) {
        const discount = itemPrice * (item.discountPercentage / 100);
        totalDiscount += discount;
      }
    });

    const tax = (subtotal - totalDiscount) * 0.10; // 10% tax
    const total = subtotal - totalDiscount + tax;

    return {
      subtotal,
      totalDiscount,
      tax,
      total
    };
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        calculateTotals,
        itemCount: cart.items.length
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};