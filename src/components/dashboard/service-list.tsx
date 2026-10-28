"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Loader2,
  Pencil,
  Plus,
  Scissors,
  Trash2,
} from "lucide-react";
import { deleteServiceAction, type ServiceDTO } from "@/actions/services";
import { ServiceDialog } from "@/components/dashboard/service-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatCurrencyBRL,
  formatDurationMinutes,
} from "@/lib/formatters";

interface ServiceListProps {
  initialServices: ServiceDTO[];
}

export function ServiceList({ initialServices }: ServiceListProps) {
  const router = useRouter();
  const [services, setServices] =
    React.useState<ServiceDTO[]>(initialServices);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingService, setEditingService] =
    React.useState<ServiceDTO | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  function handleOpenCreate() {
    setEditingService(null);
    setDialogOpen(true);
  }

  function handleOpenEdit(service: ServiceDTO) {
    setEditingService(service);
    setDialogOpen(true);
  }

  function handleDialogSuccess(savedService: ServiceDTO, isEdit: boolean) {
    if (isEdit) {
      setServices((prev) =>
        prev.map((item) => (item.id === savedService.id ? savedService : item))
      );
      setFeedback({
        type: "success",
        text: `Serviço "${savedService.title}" atualizado com sucesso.`,
      });
    } else {
      setServices((prev) => [savedService, ...prev]);
      setFeedback({
        type: "success",
        text: `Serviço "${savedService.title}" adicionado ao catálogo.`,
      });
    }
    router.refresh();
  }

  async function handleDelete(service: ServiceDTO) {
    setDeletingId(service.id);
    setFeedback(null);

    const result = await deleteServiceAction(service.id);
    setDeletingId(null);

    if (!result.success) {
      setFeedback({
        type: "error",
        text: result.message ?? "Não foi possível remover o serviço.",
      });
      return;
    }

    setServices((prev) => prev.filter((item) => item.id !== service.id));
    setFeedback({
      type: "success",
      text: `Serviço "${service.title}" removido do catálogo ativo.`,
    });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-foreground">
            Serviços Cadastrados ({services.length})
          </h2>
          <p className="text-xs text-muted-foreground">
            Estes itens ficam visíveis para agendamento pelos clientes.
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={handleOpenCreate}
          className="shrink-0 font-semibold"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Novo Serviço</span>
        </Button>
      </div>

      {feedback && (
        <div
          role="status"
          className={
            feedback.type === "success"
              ? "rounded-xl border border-primary/30 bg-accent px-3.5 py-2.5 text-xs font-medium text-accent-foreground"
              : "rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-xs font-medium text-destructive"
          }
        >
          {feedback.text}
        </div>
      )}

      {services.length === 0 ? (
        <Card className="border-dashed border-border bg-card/60">
          <CardHeader className="items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              <Scissors className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <CardTitle className="mt-2 text-base">
              Nenhum serviço cadastrado ainda
            </CardTitle>
            <CardDescription className="max-w-xs text-xs">
              Adicione seus procedimentos informando preço em Reais (R$) e
              duração em minutos para liberar os agendamentos.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button type="button" onClick={handleOpenCreate}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Cadastrar primeiro serviço</span>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {services.map((service) => {
            const isDeleting = deletingId === service.id;

            return (
              <Card
                key={service.id}
                className="border-border bg-card transition-colors hover:border-primary/30"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-foreground">
                          {service.title}
                        </h3>
                        <Badge variant="accent" className="font-bold">
                          {formatCurrencyBRL(service.price)}
                        </Badge>
                      </div>

                      {service.description && (
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {service.description}
                        </p>
                      )}

                      <div className="flex items-center gap-1.5 pt-1 text-xs font-medium text-muted-foreground">
                        <Clock
                          className="h-3.5 w-3.5 text-primary"
                          aria-hidden="true"
                        />
                        <span>
                          Duração:{" "}
                          <strong className="text-foreground">
                            {formatDurationMinutes(service.durationMinutes)}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleOpenEdit(service)}
                        aria-label={`Editar ${service.title}`}
                        className="h-9 w-9 rounded-xl"
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={isDeleting}
                        onClick={() => handleDelete(service)}
                        aria-label={`Excluir ${service.title}`}
                        className="h-9 w-9 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        {isDeleting ? (
                          <Loader2
                            className="h-4 w-4 animate-spin"
                            aria-hidden="true"
                          />
                        ) : (
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ServiceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        serviceToEdit={editingService}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
}
