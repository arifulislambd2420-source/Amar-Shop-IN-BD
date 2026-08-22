"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "./types";

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: number, variantLabel?: string) => void;
  setQuantity: (productId: number, quantity: number, variantLabel?: string) => void;
  clear: () => void;
  subtotal: () => number;
  count: () => number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId && i.variantLabel === item.variantLabel
          );
          if (existing) {
            const nextQty = Math.min(existing.quantity + item.quantity, existing.stock);
            return {
              items: state.items.map((i) =>
                i.productId === item.productId && i.variantLabel === item.variantLabel
                  ? { ...i, quantity: nextQty }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (productId, variantLabel) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.variantLabel === variantLabel)
          ),
        })),
      setQuantity: (productId, quantity, variantLabel) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter(
                (i) => !(i.productId === productId && i.variantLabel === variantLabel)
              ),
            };
          }
          return {
            items: state.items.map((i) =>
              i.productId === productId && i.variantLabel === variantLabel
                ? { ...i, quantity: Math.min(quantity, i.stock) }
                : i
            ),
          };
        }),
      clear: () => set({ items: [] }),
      subtotal: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
      count: () => get().items.reduce((s, i) => s + i.quantity, 0),
    }),
    { name: "custom-shop-cart", partialize: (state) => ({ items: state.items }) }
  )
);
