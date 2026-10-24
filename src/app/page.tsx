import Link from "next/link";
import { ArrowRight, Compass, Store, Users } from "lucide-react";
import { HeroSection } from "@/components/landing/hero-section";
import { CategoryPills } from "@/components/landing/category-pills";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-6">
      <HeroSection />

      <CategoryPills />

      {/* Bifurcação de Público (CTAs: Cliente vs Comerciante) */}
      <section aria-labelledby="cta-section-heading" className="space-y-3">
        <h2
          id="cta-section-heading"
          className="text-base font-semibold tracking-tight text-foreground"
        >
          Como você quer usar o Agendou?
        </h2>

        <div className="flex flex-col gap-3">
          {/* Card Principal: Fluxo do Cliente */}
          <Card className="border-primary/25 bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Users className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <CardTitle className="text-base">Para Clientes</CardTitle>
                  <CardDescription className="text-xs">
                    Encontre estabelecimentos perto de você e reserve sem ligar
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link
                href="/explorar"
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }),
                  "w-full justify-between rounded-xl font-semibold"
                )}
              >
                <span className="inline-flex items-center gap-2">
                  <Compass className="h-4 w-4" aria-hidden="true" />
                  <span>Buscar comércios próximos</span>
                </span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </CardContent>
          </Card>

          {/* Card Secundário/Destaque: Fluxo do Comerciante */}
          <Card className="border-border bg-secondary/40">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <Store className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <CardTitle className="text-base">
                    Tem um comércio?
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Cadastre seu espaço e organize sua agenda digitalmente
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link
                href="/register?role=MERCHANT"
                className={cn(
                  buttonVariants({ variant: "outline", size: "default" }),
                  "h-auto w-full justify-between whitespace-normal rounded-xl py-3 text-left font-semibold"
                )}
              >
                <span>
                  Tem um comércio? Cadastre seu espaço e organize sua agenda
                </span>
                <ArrowRight
                  className="ml-2 h-4 w-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
