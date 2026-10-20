"use client";

import React from "react";
import { CartProvider } from "@/lib/cart-context";
import { CartDrawer } from "@/components/shop/cart-drawer";
import { CartTrigger } from "@/components/shop/cart-trigger";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
      <CartTrigger />
    </CartProvider>
  );
}
