"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  Loader2,
  Navigation,
  Search,
  Star,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  initialQuery: string;
  currentOrder: string;
  hasClientCoordinates: boolean;
}

export function SearchBar({
  initialQuery,
  currentOrder,
  hasClientCoordinates,
}: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [queryText, setQueryText] = React.useState(initialQuery);
  const [locatingGps, setLocatingGps] = React.useState(false);
  const [gpsNotice, setGpsNotice] = React.useState<string | null>(null);

  function updateSearchParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateSearchParams({ q: queryText.trim() || null });
  }

  function handleClearQuery() {
    setQueryText("");
    updateSearchParams({ q: null });
  }

  function handleSelectTopRated() {
    setGpsNotice(null);
    updateSearchParams({ order: "rating" });
  }

  function handleSelectProximity() {
    setGpsNotice(null);

    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setGpsNotice(
        "GPS indisponível neste navegador. Exibindo os comércios melhores avaliados por padrão."
      );
      updateSearchParams({ order: "rating", lat: null, lng: null });
      return;
    }

    setLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocatingGps(false);
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        updateSearchParams({
          order: "proximity",
          lat,
          lng,
        });
      },
      () => {
        setLocatingGps(false);
        setGpsNotice(
          "Permissão de GPS negada. Exibindo resultados ordenados pelos melhores avaliados."
        );
        updateSearchParams({
          order: "rating",
          lat: null,
          lng: null,
        });
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  const isProximityActive =
    currentOrder === "proximity" && hasClientCoordinates;
  const isRatingActive = !isProximityActive;

  return (
    <div className="flex flex-col gap-3">
      <form
        onSubmit={handleSearchSubmit}
        role="search"
        aria-label="Buscar comércios por nome"
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            name="q"
            value={queryText}
            onChange={(event) => setQueryText(event.target.value)}
            placeholder="Buscar comércio pelo nome..."
            className="pl-10 pr-9"
          />
          {queryText.length > 0 && (
            <button
              type="button"
              onClick={handleClearQuery}
              aria-label="Limpar busca"
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        <Button type="submit" size="default" className="shrink-0 font-semibold">
          Buscar
        </Button>
      </form>

      {/* Botões de Alternância de Ordenação: Mais Próximos vs Melhores Avaliados */}
      <div
        role="group"
        aria-label="Ordenar comércios por"
        className="grid grid-cols-2 gap-2 rounded-2xl bg-secondary p-1.5"
      >
        <button
          type="button"
          onClick={handleSelectProximity}
          disabled={locatingGps}
          aria-pressed={isProximityActive}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isProximityActive
              ? "bg-background text-primary shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {locatingGps ? (
            <Loader2
              className="h-3.5 w-3.5 animate-spin text-primary"
              aria-hidden="true"
            />
          ) : (
            <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          <span>Mais Próximos</span>
        </button>

        <button
          type="button"
          onClick={handleSelectTopRated}
          aria-pressed={isRatingActive}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isRatingActive
              ? "bg-background text-primary shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Star className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Melhores Avaliados</span>
        </button>
      </div>

      {gpsNotice && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-xl border border-border bg-accent/60 px-3 py-2 text-xs text-accent-foreground"
        >
          <AlertCircle
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
            aria-hidden="true"
          />
          <span>{gpsNotice}</span>
        </div>
      )}
    </div>
  );
}

