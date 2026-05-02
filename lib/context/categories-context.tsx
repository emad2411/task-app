"use client";

import { createContext, useContext, ReactNode } from "react";
import type { Category } from "@/lib/db/schema";

interface CategoriesContextValue {
  categories: Category[];
}

const CategoriesContext = createContext<CategoriesContextValue | undefined>(
  undefined
);

export function CategoriesProvider({
  categories,
  children,
}: {
  categories: Category[];
  children: ReactNode;
}) {
  return (
    <CategoriesContext.Provider value={{ categories }}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error("useCategories must be used within a CategoriesProvider");
  }
  return context.categories;
}
