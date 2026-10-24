import Link from "next/link";
import { Clock, MapPin, Navigation, Search, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-xs"
    >
      <div className="flex flex-col gap-3.5">
        <div className="flex items-center gap-2">
          <Badge variant="accent" className="gap-1.5 px-3 py-1">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Agendamento local sem fila</span>
          </Badge>
        </div>

        <h1
          id="hero-heading"
          className="text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-[26px]"
        >
          Tudo o que você precisa no seu bairro,{" "}
          <span className="text-primary">com horário marcado</span>.
        </h1>

        <p className="text-sm leading-relaxed text-muted-foreground">
          Descubra comércios e profissionais perto de você, confira os serviços
          e reserve seu atendimento em segundos.
        </p>

        {/* Barra de Pesquisa Rápida (Mock) com redirecionamento para /explorar */}
        <div className="mt-1 flex flex-col gap-2.5">
          <Link
            href="/explorar"
            aria-label="Buscar serviços ou comércios locais"
            className="group flex h-12 w-full items-center justify-between rounded-2xl border border-input bg-background px-3.5 text-sm text-muted-foreground shadow-2xs transition-colors hover:border-primary/50 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex items-center gap-2.5 truncate">
              <Search
                className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:scale-110"
                aria-hidden="true"
              />
              <span className="truncate">
                Buscar barbearia, manicure, lanches...
              </span>
            </span>
            <span className="ml-2 shrink-0 rounded-lg bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
              Buscar
            </span>
          </Link>

          <div className="flex items-center justify-between gap-2">
            <Link
              href="/explorar?order=proximity"
              className={cn(
                buttonVariants({ variant: "secondary", size: "sm" }),
                "w-full justify-center gap-1.5 rounded-xl font-medium"
              )}
            >
              <Navigation
                className="h-3.5 w-3.5 text-primary"
                aria-hidden="true"
              />
              <span>Filtrar por proximidade</span>
            </Link>
          </div>
        </div>

        <div className="mt-1 flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            Comércios vizinhos
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            Reserva imediata 24h
          </span>
        </div>
      </div>
    </section>
  );
}

