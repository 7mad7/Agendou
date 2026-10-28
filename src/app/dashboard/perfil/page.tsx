import { redirect } from "next/navigation";
import { getAuthenticatedMerchantProfile } from "@/actions/merchant";
import { ProfileForm } from "@/components/dashboard/profile-form";

export default async function MerchantProfilePage() {
  const result = await getAuthenticatedMerchantProfile();

  if (result.unauthorized || !result.data) {
    redirect("/login?callbackUrl=/dashboard/perfil");
  }

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

      <ProfileForm initialProfile={result.data} />
    </section>
  );
}

