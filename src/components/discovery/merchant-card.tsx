import Link from "next/link";
import { ArrowRight, MapPin, Navigation, Scissors, Star } from "lucide-react";
import type { DiscoveryMerchantItem } from "@/actions/discovery";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrencyBRL } from "@/lib/formatters";

interface MerchantCardProps {
  merchant: DiscoveryMerchantItem;
}

export function MerchantCard({ merchant }: MerchantCardProps) {
  const distanceLabel =
    merchant.distanceKm !== null
      ? `${merchant.distanceKm.toFixed(1).replace(".", ",")} km`
      : "No seu bairro";

  return (
    <Card className="group border-border bg-card transition-all hover:border-primary/40 hover:shadow-sm">
      <CardContent className="p-4">
        <Link
          href={`/c/${merchant.slug}`}
          className="flex flex-col gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="accent" className="text-[11px]">
                  {merchant.categoryLabel}
                </Badge>
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                  <Navigation
                    className="h-3 w-3 text-primary"
                    aria-hidden="true"
                  />
                  <span>{distanceLabel}</span>
                </span>
              </div>

              <h3 className="mt-1.5 truncate text-base font-bold text-foreground group-hover:text-primary">
                {merchant.tradeName}
              </h3>
            </div>

            <div className="flex shrink-0 items-center gap-1 rounded-xl border border-border bg-background px-2.5 py-1 text-xs font-bold text-foreground">
              <Star
                className="h-3.5 w-3.5 fill-primary text-primary"
                aria-hidden="true"
              />
              <span>{merchant.rating.toFixed(1)}</span>
              <span className="text-[10px] font-normal text-muted-foreground">
                ({merchant.reviewCount})
              </span>
            </div>
          </div>

          {merchant.description && (
            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {merchant.description}
            </p>
          )}

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin
              className="h-3.5 w-3.5 shrink-0 text-primary"
              aria-hidden="true"
            />
            <span className="truncate">{merchant.address}</span>
          </div>

          <div className="flex items-center justify-between border-t border-border/70 pt-3 text-xs">
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Scissors
                className="h-3.5 w-3.5 text-primary"
                aria-hidden="true"
              />
              {merchant.startingPrice !== null ? (
                <span>
                  A partir de{" "}
                  <strong className="text-foreground">
                    {formatCurrencyBRL(merchant.startingPrice)}
                  </strong>
                </span>
              ) : (
                <span>Ver catálogo de serviços</span>
              )}
            </span>

            <span className="inline-flex items-center gap-1 font-semibold text-primary group-hover:underline">
              <span>Agendar horário</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}

