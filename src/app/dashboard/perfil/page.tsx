import * as React from "react";
import { redirect } from "next/navigation";
import { getAuthenticatedMerchantProfile } from "@/actions/merchant";
import { ProfileForm } from "@/components/dashboard/profile-form";

async function MerchantProfileContent() {
  const result = await getAuthenticatedMerchantProfile();

  if (result.unauthorized || !result.data) {
    redirect("/login?callbackUrl=/dashboard/perfil");
  }

  return <ProfileForm initialProfile={result.data} />;
}

export default function MerchantProfilePage() {
  return (
    <section aria-labelledby="merchant-profile-heading" className="space-y-4">
      <div>
        <h2
          id="merchant-profile-heading"
          className="text-base font-bold text-foreground"
        >
          Perfil do Estabelecimento
        </h2>
        <p className="text-xs text-muted-foreground">
          Mantenha os dados de contato, descrição e coordenadas geográficas
          atualizados.
        </p>
      </div>

      <React.Suspense
        fallback={
          <div className="h-96 w-full animate-pulse rounded-2xl bg-muted" />
        }
      >
        <MerchantProfileContent />
      </React.Suspense>
    </section>
  );
}
