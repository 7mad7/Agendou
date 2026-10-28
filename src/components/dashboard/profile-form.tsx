"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  CheckCircle2,
  Compass,
  Loader2,
  MapPin,
  Navigation,
  Save,
} from "lucide-react";
import {
  geocodeAddressAction,
  updateMerchantProfileAction,
  type MerchantProfileDTO,
} from "@/actions/merchant";
import { formatPhoneBR } from "@/lib/formatters";
import { formatCnpj } from "@/lib/validations/auth";
import {
  merchantProfileSchema,
  type MerchantProfileFormValues,
} from "@/lib/validations/merchant";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const serviceCategories = [
  { value: "barbearia", label: "Barbearia" },
  { value: "estetica", label: "Estética & Beleza" },
  { value: "lanches", label: "Lanches & Alimentação" },
  { value: "manutencao", label: "Manutenção/Serviços" },
];

interface ProfileFormProps {
  initialProfile: MerchantProfileDTO;
}

export function ProfileForm({ initialProfile }: ProfileFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = React.useState<string | null>(null);
  const [geoLoading, setGeoLoading] = React.useState<
    "gps" | "address" | null
  >(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<MerchantProfileFormValues>({
    resolver: zodResolver(merchantProfileSchema),
    mode: "onTouched",
    defaultValues: {
      tradeName: initialProfile.tradeName,
      phone: initialProfile.phone,
      category: initialProfile.category,
      description: initialProfile.description,
      address: initialProfile.address,
      latitude: initialProfile.latitude,
      longitude: initialProfile.longitude,
    },
  });

  const phoneRegistration = register("phone");
  const currentAddress = useWatch({ control, name: "address" });
  const currentLat = useWatch({ control, name: "latitude" });
  const currentLng = useWatch({ control, name: "longitude" });

  function handleCaptureBrowserGps() {
    setServerError(null);
    setServerSuccess(null);

    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setServerError(
        "Seu navegador não suporta geolocalização direta. Use o botão 'Obter do Endereço'."
      );
      return;
    }

    setGeoLoading("gps");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        setValue("latitude", lat, { shouldDirty: true, shouldValidate: true });
        setValue("longitude", lng, { shouldDirty: true, shouldValidate: true });
        setGeoLoading(null);
        setServerSuccess(
          "Coordenadas capturadas do GPS do seu dispositivo com sucesso!"
        );
      },
      () => {
        setGeoLoading(null);
        setServerError(
          "Permissão de localização negada ou indisponível. Você pode capturar pelo endereço digitado."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function handleGeocodeFromAddress() {
    setServerError(null);
    setServerSuccess(null);
    setGeoLoading("address");

    const result = await geocodeAddressAction(currentAddress);
    setGeoLoading(null);

    if (!result.success || !result.data) {
      setServerError(
        result.message ??
          "Não foi possível calcular as coordenadas do endereço."
      );
      return;
    }

    setValue("latitude", result.data.latitude, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("longitude", result.data.longitude, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setServerSuccess(
      result.message ?? "Coordenadas atualizadas a partir do endereço!"
    );
  }

  async function onSubmit(values: MerchantProfileFormValues) {
    setServerError(null);
    setServerSuccess(null);

    const result = await updateMerchantProfileAction(values);

    if (!result.success) {
      if (result.fieldErrors) {
        const keys = Object.keys(
          result.fieldErrors
        ) as (keyof MerchantProfileFormValues)[];
        for (const field of keys) {
          const message = result.fieldErrors[field]?.[0];
          if (message) {
            setError(field, { type: "server", message });
          }
        }
      }
      setServerError(
        result.message ?? "Não foi possível salvar os dados do perfil."
      );
      return;
    }

    setServerSuccess(
      result.message ?? "Perfil comercial atualizado com sucesso!"
    );
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{serverError}</span>
        </div>
      )}

      {serverSuccess && (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-xl border border-primary/30 bg-accent p-3 text-xs font-medium text-accent-foreground"
        >
          <CheckCircle2
            className="mt-0.5 h-4 w-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          <span>{serverSuccess}</span>
        </div>
      )}

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Dados do Estabelecimento</CardTitle>
          <CardDescription className="text-xs">
            Informações públicas exibidas para os clientes na busca e na página
            de agendamento.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 rounded-xl bg-secondary/50 p-3 text-xs">
            <div>
              <span className="block font-medium text-muted-foreground">
                CNPJ Registrado
              </span>
              <strong className="font-mono text-foreground">
                {formatCnpj(initialProfile.cnpj)}
              </strong>
            </div>
            <div className="truncate">
              <span className="block font-medium text-muted-foreground">
                E-mail da Conta
              </span>
              <strong className="truncate text-foreground">
                {initialProfile.email}
              </strong>
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="profile-tradeName"
              className="block text-xs font-semibold text-foreground"
            >
              Nome Fantasia
            </label>
            <Input
              id="profile-tradeName"
              type="text"
              placeholder="Ex: Barbearia Estilo do Bairro"
              aria-invalid={Boolean(errors.tradeName)}
              {...register("tradeName")}
            />
            {errors.tradeName && (
              <p className="text-xs font-medium text-destructive">
                {errors.tradeName.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="profile-phone"
                className="block text-xs font-semibold text-foreground"
              >
                Telefone Comercial / WhatsApp
              </label>
              <Input
                id="profile-phone"
                type="tel"
                inputMode="tel"
                placeholder="(11) 99999-9999"
                aria-invalid={Boolean(errors.phone)}
                {...phoneRegistration}
                onChange={(event) => {
                  const formatted = formatPhoneBR(event.target.value);
                  setValue("phone", formatted, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
              />
              {errors.phone && (
                <p className="text-xs font-medium text-destructive">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="profile-category"
                className="block text-xs font-semibold text-foreground"
              >
                Categoria Principal
              </label>
              <select
                id="profile-category"
                aria-invalid={Boolean(errors.category)}
                className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                {...register("category")}
              >
                <option value="">Selecione...</option>
                {serviceCategories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-xs font-medium text-destructive">
                  {errors.category.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="profile-description"
              className="block text-xs font-semibold text-foreground"
            >
              Descrição do Espaço
            </label>
            <textarea
              id="profile-description"
              rows={3}
              placeholder="Conte sobre seu espaço, especialidades, comodidades (Wi-Fi, ar-condicionado)..."
              aria-invalid={Boolean(errors.description)}
              className="flex w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs font-medium text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Endereço e Localização Geográfica
          </CardTitle>
          <CardDescription className="text-xs">
            Utilizado para exibir seu comércio nas buscas por proximidade no
            bairro.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="profile-address"
              className="block text-xs font-semibold text-foreground"
            >
              Endereço Completo
            </label>
            <Input
              id="profile-address"
              type="text"
              placeholder="Rua das Palmeiras, 450 - Vila Mariana, São Paulo - SP"
              aria-invalid={Boolean(errors.address)}
              {...register("address")}
            />
            {errors.address && (
              <p className="text-xs font-medium text-destructive">
                {errors.address.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={geoLoading !== null}
              onClick={handleGeocodeFromAddress}
              className="w-full justify-center font-medium"
            >
              {geoLoading === "address" ? (
                <Loader2
                  className="h-3.5 w-3.5 animate-spin text-primary"
                  aria-hidden="true"
                />
              ) : (
                <MapPin
                  className="h-3.5 w-3.5 text-primary"
                  aria-hidden="true"
                />
              )}
              <span>Obter do Endereço</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={geoLoading !== null}
              onClick={handleCaptureBrowserGps}
              className="w-full justify-center font-medium"
            >
              {geoLoading === "gps" ? (
                <Loader2
                  className="h-3.5 w-3.5 animate-spin text-primary"
                  aria-hidden="true"
                />
              ) : (
                <Navigation
                  className="h-3.5 w-3.5 text-primary"
                  aria-hidden="true"
                />
              )}
              <span>Usar GPS do Navegador</span>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                htmlFor="profile-lat"
                className="block text-xs font-semibold text-foreground"
              >
                Latitude
              </label>
              <Input
                id="profile-lat"
                type="number"
                step="0.000001"
                placeholder="-23.550520"
                {...register("latitude", {
                  setValueAs: (val: string | number | null) =>
                    val === "" || val === null ? null : Number(val),
                })}
              />
              {errors.latitude && (
                <p className="text-xs font-medium text-destructive">
                  {errors.latitude.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="profile-lng"
                className="block text-xs font-semibold text-foreground"
              >
                Longitude
              </label>
              <Input
                id="profile-lng"
                type="number"
                step="0.000001"
                placeholder="-46.633308"
                {...register("longitude", {
                  setValueAs: (val: string | number | null) =>
                    val === "" || val === null ? null : Number(val),
                })}
              />
              {errors.longitude && (
                <p className="text-xs font-medium text-destructive">
                  {errors.longitude.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-accent/60 px-3 py-2 text-xs text-accent-foreground">
            <Compass
              className="h-4 w-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <span>
              {currentLat !== null &&
              currentLng !== null &&
              !Number.isNaN(currentLat) &&
              !Number.isNaN(currentLng)
                ? `Localização ativa no mapa: (${currentLat}, ${currentLng})`
                : "Nenhuma coordenada definida ainda. Use um dos botões acima."}
            </span>
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="w-full font-semibold"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            <span>Salvando perfil...</span>
          </>
        ) : (
          <>
            <Save className="h-4 w-4" aria-hidden="true" />
            <span>Salvar Dados do Estabelecimento</span>
          </>
        )}
      </Button>
    </form>
  );
}
