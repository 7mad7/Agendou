import * as React from "react";
import { redirect } from "next/navigation";
import { getMerchantServicesAction } from "@/actions/services";
import { ServiceList } from "@/components/dashboard/service-list";

async function MerchantServicesContent() {
  const result = await getMerchantServicesAction();

  if (result.unauthorized) {
    redirect("/login?callbackUrl=/dashboard/servicos");
  }

  return <ServiceList initialServices={result.data ?? []} />;
}

export default function MerchantServicesPage() {
  return (
    <section aria-labelledby="merchant-services-heading" className="space-y-4">
      <React.Suspense
        fallback={
          <div className="h-64 w-full animate-pulse rounded-2xl bg-muted" />
        }
      >
        <MerchantServicesContent />
      </React.Suspense>
    </section>
  );
}
