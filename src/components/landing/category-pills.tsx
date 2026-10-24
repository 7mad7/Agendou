import Link from "next/link";
import {
  ChevronRight,
  Scissors,
  Sparkles,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const categories: CategoryItem[] = [
  {
    id: "barbearia",
    name: "Barbearia",
    description: "Corte, barba e visual",
    href: "/explorar?category=barbearia",
    icon: Scissors,
  },
  {
    id: "estetica",
    name: "Estética",
    description: "Unhas, pele e salão",
    href: "/explorar?category=estetica",
    icon: Sparkles,
  },
  {
    id: "lanches",
    name: "Lanches",
    description: "Retirada e encomendas",
    href: "/explorar?category=lanches",
    icon: UtensilsCrossed,
  },
  {
    id: "manutencao",
    name: "Manutenção/Serviços",
    description: "Reparos e assistência",
    href: "/explorar?category=manutencao",
    icon: Wrench,
  },
];

export function CategoryPills() {
  return (
    <section aria-labelledby="categories-heading" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2
          id="categories-heading"
          className="text-base font-semibold tracking-tight text-foreground"
        >
          Categorias em destaque
        </h2>
        <Link
          href="/explorar"
          className="inline-flex items-center gap-0.5 text-xs font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          <span>Ver todas</span>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {categories.map((category) => {
          const Icon = category.icon;

          return (
            <Link
              key={category.id}
              href={category.href}
              className="group flex items-start gap-3 rounded-2xl border border-border bg-card p-3.5 text-card-foreground shadow-2xs transition-colors hover:border-primary/40 hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {category.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {category.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

