import { Compass, MapPin, Navigation } from "lucide-react";
import type { DiscoveryMerchantItem } from "@/actions/discovery";
import { Badge } from "@/components/ui/badge";

interface MapPlaceholderProps {
  merchants: DiscoveryMerchantItem[];
  hasClientCoordinates: boolean;
}

const pinPositions = [
  { top: "24%", left: "26%" },
  { top: "52%", left: "64%" },
  { top: "32%", left: "72%" },
  { top: "66%", left: "34%" },
];

export function MapPlaceholder({
  merchants,
  hasClientCoordinates,
}: MapPlaceholderProps) {
  const visibleMarkers = merchants.slice(0, 4);

  return (
    <section
      aria-label="Mapa de comércios da região"
      className="relative h-44 w-full overflow-hidden rounded-3xl border border-border bg-secondary/70 p-4 shadow-2xs"
    >
      {/* Grade decorativa simulando quarteirões urbanos */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-45"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      {/* Avenidas estilizadas */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 -left-4 h-3 w-[115%] -rotate-6 bg-background/80"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-4 left-1/3 h-[120%] w-2.5 rotate-12 bg-background/80"
      />

      {/* Pins visuais dos estabelecimentos encontrados */}
      {visibleMarkers.map((merchant, idx) => {
        const pos = pinPositions[idx % pinPositions.length];
        return (
          <div
            key={merchant.id}
            style={{ top: pos.top, left: pos.left }}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="flex items-center gap-1 rounded-full border border-primary/30 bg-background/95 px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-sm">
              <MapPin
                className="h-3 w-3 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span className="max-w-[100px] truncate">
                {merchant.tradeName}
              </span>
            </div>
          </div>
        );
      })}

      {/* Cabeçalho e rodapé informativos sobrepostos ao mapa */}
      <div className="relative z-20 flex h-full flex-col justify-between">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="accent" className="gap-1.5 shadow-2xs">
            <Compass className="h-3 w-3 text-primary" aria-hidden="true" />
            <span>Mapa do Bairro</span>
          </Badge>

          <Badge variant="outline" className="bg-background/90 text-[11px]">
            {merchants.length}{" "}
            {merchants.length === 1 ? "local encontrado" : "locais encontrados"}
          </Badge>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-background/90 px-3 py-2 text-xs backdrop-blur-xs">
          <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
            <Navigation
              className="h-3.5 w-3.5 text-primary"
              aria-hidden="true"
            />
            <span>
              {hasClientCoordinates
                ? "GPS ativo: distâncias reais calculadas"
                : "Ative 'Mais Próximos' para calcular a distância em km"}
            </span>
          </span>
        </div>
      </div>
    </section>
  );
}

