import Link from "next/link";
import { ArrowLeft, MapPin, Phone, Store } from "lucide-react";
import {
  getAvailableSlotsForBookingAction,
  getMerchantPublicDetailsAction,
} from "@/actions/booking";
import { MerchantBookingFlow } from "@/components/booking/merchant-booking-flow";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSession } from "@/lib/session";
import { cn } from "@/lib/utils";

interface MerchantPublicPageProps {
  params: Promise<{
    slug: string;
  }>;
}

function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default async function MerchantPublicPage({
  params,
}: MerchantPublicPageProps) {
  const { slug } = await params;
  const [merchant, session] = await Promise.all([
    getMerchantPublicDetailsAction(slug),
    getSession(),
  ]);

  if (!merchant) {
    return (
      <div className="flex flex-col gap-4 py-4">
        <Card className="border-dashed border-border bg-card">
          <CardHeader className="items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              <Store className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <CardTitle className="mt-2 text-base">
              Estabelecimento não encontrado
            </CardTitle>
            <CardDescription className="text-xs">
              O comércio procurado não existe ou não está mais disponível.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link
              href="/explorar"
              className={cn(
                buttonVariants({ variant: "default" }),
                "gap-1.5 font-semibold"
              )}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Voltar para Explorar</span>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const initialDate = getTodayIsoDate();
  const firstService = merchant.services[0];

  const initialSlotsResult = firstService
    ? await getAvailableSlotsForBookingAction({
        merchantId: merchant.id,
        date: initialDate,
        durationMinutes: firstService.durationMinutes,
      })
    : { data: [] };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link
          href="/explorar"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Voltar para a busca</span>
        </Link>
      </div>

      {/* Cabeçalho com dados do estabelecimento */}
      <Card className="border-border bg-card shadow-2xs">
        <CardHeader className="space-y-2 pb-3">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="accent">{merchant.categoryLabel}</Badge>
          </div>
          <CardTitle className="text-xl font-bold text-foreground">
            {merchant.tradeName}
          </CardTitle>
          {merchant.description && (
            <CardDescription className="text-xs leading-relaxed">
              {merchant.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin
              className="h-3.5 w-3.5 shrink-0 text-primary"
              aria-hidden="true"
            />
            <span>{merchant.address}</span>
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

      {/* Fluxo Interativo de Agendamento: Serviço -> Data (14 dias) -> Horário -> Confirmação */}
      <MerchantBookingFlow
        merchant={merchant}
        initialSlots={initialSlotsResult.data ?? []}
        initialDate={initialDate}
        isAuthenticated={Boolean(session)}
      />
    </div>
  );
}

