import * as React from "react";
import Link from "next/link";
import { Info, Store } from "lucide-react";
import { searchMerchantsAction } from "@/actions/discovery";
import { CategoryFilter } from "@/components/discovery/category-filter";
import { MapPlaceholder } from "@/components/discovery/map-placeholder";
import { MerchantCard } from "@/components/discovery/merchant-card";
import { SearchBar } from "@/components/discovery/search-bar";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ExplorarSearchParams = Promise<{
  q?: string;
  category?: string;
  order?: string;
  lat?: string;
  lng?: string;
}>;

interface ExplorarPageProps {
  searchParams: ExplorarSearchParams;
}

function ExplorarSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-24 w-full animate-pulse rounded-2xl bg-muted" />
      <div className="h-10 w-full animate-pulse rounded-full bg-muted" />
      <div className="h-44 w-full animate-pulse rounded-3xl bg-muted" />
      <div className="h-36 w-full animate-pulse rounded-2xl bg-muted" />
      <div className="h-36 w-full animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}

async function ExplorarDynamicContent({
  searchParams,
}: {
  searchParams: ExplorarSearchParams;
}) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q ?? "";
  const category = resolvedParams.category ?? "";
  const order = resolvedParams.order ?? "rating";

  const parsedLat =
    resolvedParams.lat !== undefined ? Number(resolvedParams.lat) : null;
  const parsedLng =
    resolvedParams.lng !== undefined ? Number(resolvedParams.lng) : null;

  const discoveryResult = await searchMerchantsAction({
    q: query,
    category,
    order,
    lat: parsedLat !== null && Number.isFinite(parsedLat) ? parsedLat : null,
    lng: parsedLng !== null && Number.isFinite(parsedLng) ? parsedLng : null,
  });

  const { merchants, usedFallbackOrder, hasClientCoordinates, appliedOrder } =
    discoveryResult;

  return (
    <>
      <SearchBar
        initialQuery={query}
        currentOrder={order}
        hasClientCoordinates={hasClientCoordinates}
      />

      <CategoryFilter selectedCategory={category} />

      <MapPlaceholder
        merchants={merchants}
        hasClientCoordinates={hasClientCoordinates}
      />

      {usedFallbackOrder && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-2xl border border-border bg-accent/50 p-3 text-xs text-accent-foreground"
        >
          <Info
            className="mt-0.5 h-4 w-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          <span>
            Localização GPS ainda não autorizada. Exibindo os comércios{" "}
            <strong>melhores avaliados</strong> por padrão. Toque em{" "}
            <strong>Mais Próximos</strong> acima para permitir o GPS.
          </span>
        </div>
      )}

      <section aria-labelledby="results-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2
            id="results-heading"
            className="text-sm font-bold text-foreground"
          >
            {merchants.length}{" "}
            {merchants.length === 1
              ? "estabelecimento disponível"
              : "estabelecimentos disponíveis"}
          </h2>
          <span className="text-xs text-muted-foreground">
            Ordenado por:{" "}
            <strong className="text-foreground">
              {appliedOrder === "proximity"
                ? "Mais próximos"
                : "Melhores avaliados"}
            </strong>
          </span>
        </div>

        {merchants.length === 0 ? (
          <Card className="border-dashed border-border bg-card/60">
            <CardHeader className="items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <Store className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <CardTitle className="mt-2 text-base">
                Nenhum comércio encontrado
              </CardTitle>
              <CardDescription className="max-w-xs text-xs">
                Não encontramos estabelecimentos para os filtros selecionados.
                Tente buscar outro termo ou limpar as categorias.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Link
                href="/explorar"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "font-semibold"
                )}
              >
                Limpar todos os filtros
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {merchants.map((merchant) => (
              <MerchantCard key={merchant.id} merchant={merchant} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default function ExplorarPage({ searchParams }: ExplorarPageProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Explorar Comércios Locais
        </h1>
        <p className="text-xs text-muted-foreground">
          Encontre estabelecimentos próximos, filtre por categoria e agende seu
          horário sem fila.
        </p>
      </div>

      <React.Suspense fallback={<ExplorarSkeleton />}>
        <ExplorarDynamicContent searchParams={searchParams} />
      </React.Suspense>
    </div>
  );
}
