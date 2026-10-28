import { redirect } from "next/navigation";
import { getMerchantServicesAction } from "@/actions/services";
import { ServiceList } from "@/components/dashboard/service-list";

export default async function MerchantServicesPage() {
  const result = await getMerchantServicesAction();

  if (result.unauthorized) {
    redirect("/login?callbackUrl=/dashboard/servicos");
  }

  return (
    <section aria-labelledby="merchant-services-heading" className="space-y-4">
      <ServiceList initialServices={result.data ?? []} />
    </section>
  );
}

