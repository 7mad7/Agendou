"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  LayoutGrid,
  Scissors,
  Sparkles,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryOption {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const categoryOptions: CategoryOption[] = [
  { value: "", label: "Todas", icon: LayoutGrid },
  { value: "barbearia", label: "Barbearia", icon: Scissors },
  { value: "estetica", label: "Estética", icon: Sparkles },
  { value: "lanches", label: "Lanches", icon: UtensilsCrossed },
  { value: "manutencao", label: "Manutenção", icon: Wrench },
];

interface CategoryFilterProps {
  selectedCategory: string;
}

export function CategoryFilter({ selectedCategory }: CategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const normalizedSelected = selectedCategory.toLowerCase();

  function handleSelectCategory(categoryValue: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!categoryValue || categoryValue === normalizedSelected) {
      params.delete("category");
    } else {
      params.set("category", categoryValue);
    }
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  }

  return (
    <nav
      aria-label="Filtrar por categoria de serviço"
      className="-mx-4 overflow-x-auto px-4 pb-1"
    >
      <div className="flex items-center gap-2">
        {categoryOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = normalizedSelected === option.value;

          return (
            <button
              key={option.value || "all"}
              type="button"
              onClick={() => handleSelectCategory(option.value)}
              aria-pressed={isSelected}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground shadow-2xs"
                  : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-accent/50"
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

