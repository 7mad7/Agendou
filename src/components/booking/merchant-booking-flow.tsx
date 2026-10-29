"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck2 } from "lucide-react";
import {
  createAtomicBookingAction,
  getAvailableSlotsForBookingAction,
  type ConfirmedBookingSummary,
  type PublicMerchantDetailsDTO,
  type PublicServiceDTO,
} from "@/actions/booking";
import { BookingConfirmationModal } from "@/components/booking/booking-confirmation-modal";
import {
  CalendarStrip,
  generateNext14Days,
} from "@/components/booking/calendar-strip";
import { ServicePicker } from "@/components/booking/service-picker";
import { SlotGrid } from "@/components/booking/slot-grid";
import { Button } from "@/components/ui/button";
import { formatCurrencyBRL } from "@/lib/formatters";

interface MerchantBookingFlowProps {
  merchant: PublicMerchantDetailsDTO;
  initialSlots: string[];
  initialDate: string;
  isAuthenticated: boolean;
}

export function MerchantBookingFlow({
  merchant,
  initialSlots,
  initialDate,
  isAuthenticated,
}: MerchantBookingFlowProps) {
  const router = useRouter();
  const days = React.useMemo(
    () => generateNext14Days(initialDate),
    [initialDate]
  );

  const [selectedService, setSelectedService] =
    React.useState<PublicServiceDTO | null>(merchant.services[0] ?? null);
  const [selectedDate, setSelectedDate] = React.useState<string>(initialDate);
  const [slots, setSlots] = React.useState<string[]>(initialSlots);
  const [selectedSlot, setSelectedSlot] = React.useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = React.useState<boolean>(false);

  const [modalOpen, setModalOpen] = React.useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [bookingError, setBookingError] = React.useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] =
    React.useState<ConfirmedBookingSummary | null>(null);

  async function refreshAvailableSlots(
    dateToLoad: string,
    durationMinutes: number
  ) {
    setLoadingSlots(true);
    setSelectedSlot(null);

    const response = await getAvailableSlotsForBookingAction({
      merchantId: merchant.id,
      date: dateToLoad,
      durationMinutes,
    });

    setSlots(response.data ?? []);
    setLoadingSlots(false);
  }

  function handleSelectService(service: PublicServiceDTO) {
    setSelectedService(service);
    setBookingError(null);
    setConfirmedBooking(null);
    void refreshAvailableSlots(selectedDate, service.durationMinutes);
  }

  function handleSelectDate(isoDate: string) {
    setSelectedDate(isoDate);
    setBookingError(null);
    setConfirmedBooking(null);
    if (selectedService) {
      void refreshAvailableSlots(isoDate, selectedService.durationMinutes);
    }
  }

  function handleSelectSlot(slot: string) {
    setSelectedSlot(slot);
    setBookingError(null);
    setConfirmedBooking(null);
    setModalOpen(true);
  }

  async function handleConfirmBooking() {
    if (!selectedService || !selectedSlot) {
      return;
    }

    setIsSubmitting(true);
    setBookingError(null);

    const result = await createAtomicBookingAction({
      merchantId: merchant.id,
      serviceId: selectedService.id,
      date: selectedDate,
      timeSlot: selectedSlot,
    });

    setIsSubmitting(false);

    if (result.requiresAuth && result.loginRedirectUrl) {
      router.push(result.loginRedirectUrl);
      return;
    }

    if (!result.success || !result.data) {
      setBookingError(
        result.message ??
          "Não foi possível confirmar o agendamento. Tente outro horário."
      );
      if (result.conflict) {
        // Recarrega os slots livres ocultando o horário recém-ocupado
        void refreshAvailableSlots(
          selectedDate,
          selectedService.durationMinutes
        );
      }
      return;
    }

    setConfirmedBooking(result.data);
    // Remove imediatamente o horário reservado da grade visível
    setSlots((prev) => prev.filter((item) => item !== selectedSlot));
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <ServicePicker
        services={merchant.services}
        selectedServiceId={selectedService?.id ?? null}
        onSelectService={handleSelectService}
      />

      {selectedService && (
        <>
          <CalendarStrip
            days={days}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
          />

          <SlotGrid
            slots={slots}
            selectedSlot={selectedSlot}
            loading={loadingSlots}
            onSelectSlot={handleSelectSlot}
          />

          {selectedSlot && (
            <div className="rounded-2xl border border-primary/30 bg-accent/60 p-4 shadow-xs">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 text-xs">
                  <p className="truncate font-bold text-foreground">
                    {selectedService.title}
                  </p>
                  <p className="text-muted-foreground">
                    Horário selecionado:{" "}
                    <strong className="text-primary">{selectedSlot}</strong> •{" "}
                    {formatCurrencyBRL(selectedService.price)}
                  </p>
                </div>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => setModalOpen(true)}
                  className="shrink-0 font-semibold"
                >
                  <CalendarCheck2 className="h-4 w-4" aria-hidden="true" />
                  <span>Continuar</span>
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <BookingConfirmationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        merchantSlug={merchant.slug}
        merchantName={merchant.tradeName}
        service={selectedService}
        selectedDate={selectedDate}
        selectedSlot={selectedSlot}
        isAuthenticated={isAuthenticated}
        isSubmitting={isSubmitting}
        errorMessage={bookingError}
        confirmedBooking={confirmedBooking}
        onConfirmBooking={handleConfirmBooking}
      />
    </div>
  );
}

