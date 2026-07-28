import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { clampQuantity } from '../lib/cart.js';

// Phase 6 swaps this storage layer for Firestore. All the arithmetic lives in
// src/lib/cart.js precisely so that swap touches this file and nothing else.
const STORAGE_KEY = 'ecommercestore-cart';

/**
 * A cart line is a *snapshot* taken at add-to-cart time, not a product record:
 * the price a customer added at is the price they should see, even if the
 * catalogue changes underneath them. Only the fields the cart renders are
 * kept — this is not a product cache, and nothing reads catalogue data from it.
 */
function toLine(product, quantity) {
  return {
    id: product.id,
    title: product.title,
    price: product.price,
    discountPercentage: product.discountPercentage ?? 0,
    thumbnail: product.thumbnail,
    stock: product.stock,
    quantity: clampQuantity(quantity, product.stock),
  };
}

export const useCartStore = create()(
  persist(
    (set) => ({
      items: [],

      addItem: (product, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((item) => item.id === product.id);

          if (!existing) {
            return { items: [...state.items, toLine(product, quantity)] };
          }

          // Adding an item already in the cart tops up its quantity rather
          // than creating a duplicate line.
          return {
            items: state.items.map((item) =>
              item.id === product.id
                ? { ...item, quantity: clampQuantity(item.quantity + quantity, item.stock) }
                : item
            ),
          };
        }),

      setQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity: clampQuantity(quantity, item.stock) } : item
          ),
        })),

      removeItem: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),

      clear: () => set({ items: [] }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      // Only the lines are persisted; the actions are recreated on load.
      partialize: (state) => ({ items: state.items }),
    }
  )
);
