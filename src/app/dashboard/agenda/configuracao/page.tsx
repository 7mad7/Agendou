import * as React from "react";
import { redirect } from "next/navigation";
import { getMerchantAvailabilityAction } from "@/actions/availability";
import { AvailabilityForm } from "@/components/dashboard/availability-form";
import { getDefaultWeeklyAvailability } from "@/lib/validations/availability";

async function MerchantAvailabilityContent() {
  const result = await getMerchantAvailabilityAction();

  if (result.unauthorized) {
    redirect("/login?callbackUrl=/dashboard/agenda/configuracao");
  }

  const initialDays = result.data ?? getDefaultWeeklyAvailability();

  return <AvailabilityForm initialDays={initialDays} />;
}

export default function MerchantAvailabilityConfigPage() {
  return (
    <section
      aria-labelledby="availability-config-heading"
      className="space-y-4"
    >
      <div>
        <h2
          id="availability-config-heading"
          className="text-base font-bold text-foreground"
        >
          Horários de Funcionamento
        </h2>
        <p className="text-xs text-muted-foreground">
          Configure os dias ativos da semana, horário de abertura, fechamento e
          intervalo de almoço/pausa.
        </p>
      </div>

      <React.Suspense
        fallback={
          <div className="h-96 w-full animate-pulse rounded-2xl bg-muted" />
        }
      >
        <MerchantAvailabilityContent />
      </React.Suspense>
    </section>
  );
}
