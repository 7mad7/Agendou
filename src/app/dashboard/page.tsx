import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  MapPin,
  Phone,
  Scissors,
  Store,
} from "lucide-react";
import { getAuthenticatedMerchantProfile } from "@/actions/merchant";
import { getMerchantServicesAction } from "@/actions/services";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrencyBRL, formatDurationMinutes } from "@/lib/formatters";
import { cn } from "@/lib/utils";

function DashboardOverviewSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="h-24 animate-pulse rounded-2xl bg-muted" />
        <div className="h-24 animate-pulse rounded-2xl bg-muted" />
      </div>
      <div className="h-32 w-full animate-pulse rounded-2xl bg-muted" />
      <div className="h-40 w-full animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}

async function DashboardOverviewContent() {
  const [profileResult, servicesResult] = await Promise.all([
    getAuthenticatedMerchantProfile(),
    getMerchantServicesAction(),
  ]);

  const merchant = profileResult.data;
  const services = servicesResult.data ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-border">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs">
              Serviços Ativos
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-primary">
              {services.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Link
              href="/dashboard/servicos"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              <span>Gerenciar catálogo</span>
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs">
              Agenda Semanal
            </CardDescription>
            <CardTitle className="text-sm font-bold text-foreground">
              Horários & Pausas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Link
              href="/dashboard/agenda/configuracao"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Configurar grade</span>
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {merchant && (
        <Card className="border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Resumo do Espaço</CardTitle>
              <Link
                href="/dashboard/perfil"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "h-8 text-xs"
                )}
              >
                <Store className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Editar Perfil</span>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            {merchant.description && (
              <p className="text-foreground">{merchant.description}</p>
            )}
            <div className="flex items-center gap-2">
              <MapPin
                className="h-3.5 w-3.5 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span className="truncate">{merchant.address}</span>
            </div>
            {merchant.phone && (
              <div className="flex items-center gap-2">
                <Phone
                  className="h-3.5 w-3.5 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <span>{merchant.phone}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Catálogo de Serviços</CardTitle>
              <CardDescription className="text-xs">
                Procedimentos disponíveis para reserva
              </CardDescription>
            </div>
            <Link
              href="/dashboard/servicos"
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "h-8 text-xs font-semibold"
              )}
            >
              <Scissors className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Ver Todos</span>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Você ainda não cadastrou serviços. Acesse a aba{" "}
              <Link
                href="/dashboard/servicos"
                className="font-semibold text-primary underline"
              >
                Serviços
              </Link>{" "}
              para criar seu catálogo.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {services.slice(0, 3).map((service) => (
                <li
                  key={service.id}
                  className="flex items-center justify-between py-2.5 text-xs first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="font-semibold text-foreground">
                      {service.title}
                    </p>
                    <p className="text-muted-foreground">
                      {formatDurationMinutes(service.durationMinutes)}
                    </p>
                  </div>
                  <span className="font-bold text-primary">
                    {formatCurrencyBRL(service.price)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardOverviewPage() {
  return (
    <React.Suspense fallback={<DashboardOverviewSkeleton />}>
      <DashboardOverviewContent />
    </React.Suspense>
  );
}
