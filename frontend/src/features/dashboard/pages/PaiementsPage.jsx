import { useMemo, useState } from "react";
import { Search, Loader2, Pencil, Trash2 } from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatsCard from "@/features/dashboard/components/StatsCard";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useResource } from "@/features/dashboard/hooks/useResource";
import {
  createPaiement,
  getAppartements,
  getPaiements,
  getResidents,
  updatePaiement,
} from "@/features/dashboard/api/dashboardApi";

const schema = z.object({
  residentId: z.string().min(1, "Résident requis"),
  type: z.string().min(2, "Type requis"),
  amount: z.coerce.number().min(0),
  limitDate: z.string().min(3, "Date requise"),
  status: z.enum(["en_attente", "payé", "en_retard"]),
});

function errorMessage(err) {
  return (
    err?.response?.data?.message ??
    err?.message ??
    "Une erreur est survenue. Réessayez."
  );
}

export default function PaiementsPage() {
  const paiementsQ = useResource(() => getPaiements());
  const residentsQ = useResource(() => getResidents());
  const appartementsQ = useResource(() => getAppartements());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [residentFilter, setResidentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const residents = residentsQ.data ?? [];
  const appartements = appartementsQ.data ?? [];
  const items = paiementsQ.data ?? [];
  const firstResidentId = residents[0]?.id ?? "";

  const residentsById = useMemo(() => new Map(residents.map((r) => [r.id, r])), [residents]);
  const apartmentsById = useMemo(
    () => new Map(appartements.map((a) => [a.id, a])),
    [appartements],
  );

  const totalAmount = useMemo(() => items.reduce((sum, p) => sum + p.amount, 0), [items]);
  const amountPaid = useMemo(
    () => items.filter((p) => p.status === "payé").reduce((sum, p) => sum + p.amount, 0),
    [items],
  );
  const amountPending = useMemo(
    () => items.filter((p) => p.status === "en_attente" || p.status === "en attente").reduce((sum, p) => sum + p.amount, 0),
    [items],
  );

  const filtered = useMemo(() => {
    return items.filter((p) => {
      const matchStatus = statusFilter === "all" ? true : p.status === statusFilter;
      const matchResident = residentFilter === "all" ? true : p.residentId === residentFilter;
      return matchStatus && matchResident;
    });
  }, [items, residentFilter, statusFilter]);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      residentId: firstResidentId,
      type: "Charges mensuelles",
      amount: 0,
      limitDate: "",
      status: "en_attente",
    },
  });

  const resetForm = (item) => {
    form.reset({
      residentId: item?.residentId ?? firstResidentId,
      type: item?.type ?? "Charges mensuelles",
      amount: item?.amount ?? 0,
      limitDate: item?.limitDate ?? "",
      status: item?.status ?? "en_attente",
    });
  };

  const onEdit = (item) => {
    setEditingId(item.id);
    setShowForm(true);
    resetForm(item);
  };

  const onDelete = async (id) => {
    const ok = window.confirm("Supprimer ce paiement ?");
    if (!ok) return;
    try {
      await deletePaiement(id);
      toast.success("Paiement supprimé avec succès");
      await paiementsQ.refetch();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const onSubmit = async (values) => {
    try {
      if (editingId) {
        await updatePaiement(editingId, values);
        toast.success("Paiement modifié avec succès");
      } else {
        await createPaiement(values);
        toast.success("Paiement ajouté avec succès");
      }
      setShowForm(false);
      setEditingId(null);
      resetForm(null);
      await paiementsQ.refetch();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const onPay = async (id) => {
    try {
      await updatePaiement(id, { status: "payé" });
      toast.success("Paiement marqué comme payé");
      await paiementsQ.refetch();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const loading = paiementsQ.loading || residentsQ.loading || appartementsQ.loading;
  const fetchError = paiementsQ.error || residentsQ.error || appartementsQ.error;
  const isSubmitting = form.formState.isSubmitting;

  const typeOptions = ["Charges mensuelles", "Charges ponctuelles"];
  const statusOptions = ["en_attente", "payé", "en_retard"];

  if (loading && !paiementsQ.data) {
    return (
      <div className="flex min-h-[240px] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Chargement des paiements…</span>
      </div>
    );
  }

  if (fetchError && !paiementsQ.data) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        {errorMessage(fetchError)}
      </div>
    );
  }

  return (
    <div className="pb-2">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">Gestion des paiements</h1>
          <p className="text-sm text-muted-foreground">Suivez tous les paiements</p>
        </div>

        <Button
          type="button"
          onClick={() => {
            setEditingId(null);
            setShowForm((v) => !v);
            resetForm(null);
          }}
          variant="emerald"
        >
          + Ajouter un paiement
        </Button>
      </div>



      {showForm ? (
        <Card className="mb-5">
          <CardContent className="p-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="text-sm font-semibold text-muted-foreground">
                {editingId ? "Modifier le paiement" : "Nouveau paiement"}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Résident</label>
                  <select
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
                    {...form.register("residentId")}
                  >
                    {residents.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Type de paiement</label>
                  <select
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
                    {...form.register("type")}
                  >
                    {typeOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Montant (MAD)</label>
                  <Input type="number" placeholder="450" {...form.register("amount")} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Date limite</label>
                  <Input type="date" {...form.register("limitDate")} />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Statut</label>
                  <select
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
                    {...form.register("status")}
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s === "en_attente" ? "En attente" : s === "en_retard" ? "En retard" : s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  variant="modern"
                >
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {editingId ? "Modifier le paiement" : "Confirmer l'ajout"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-5 grid gap-4 md:grid-cols-3">
            <StatsCard value={`${totalAmount}`} label="Total des paiements" />
            <StatsCard value={`${amountPaid}`} label="Montant payé" />
            <StatsCard value={`${amountPending}`} label="En attente" />
          </div>

          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="w-full md:max-w-[250px]">
              <select
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                value={residentFilter}
                onChange={(e) => setResidentFilter(e.target.value)}
              >
                <option value="all">Tous les résidents</option>
                {residents.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.fullName}
                  </option>
                ))}
              </select>
            </div>

            <select
              className="h-9 w-full md:w-[200px] rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="payé">payé</option>
              <option value="en_attente">en attente</option>
              <option value="en_retard">en retard</option>
            </select>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>RÉSIDENT</TableHead>
                    <TableHead>APPARTEMENT</TableHead>
                    <TableHead>TYPE</TableHead>
                    <TableHead className="text-right">MONTANT</TableHead>
                    <TableHead>DATE LIMITE</TableHead>
                    <TableHead>STATUT</TableHead>
                    <TableHead className="w-[120px] text-right">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => {
                    const resident = residentsById.get(p.residentId);
                    const apt = apartmentsById.get(p.apartmentId);

                    return (
                      <TableRow key={p.id}>
                        <TableCell>{resident?.fullName ?? "—"}</TableCell>
                        <TableCell>{apt?.number ?? "—"}</TableCell>
                        <TableCell>{p.type}</TableCell>
                        <TableCell className="text-right">{p.amount} MAD</TableCell>
                        <TableCell>{p.limitDate}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={p.status} />
                            {p.status === "en_attente" || p.status === "en attente" ? (
                              <Button 
                                size="xs" 
                                type="button" 
                                onClick={() => onPay(p.id)}
                                variant="outline"
                                className="h-6 rounded-md border-blue-200 bg-blue-50/50 text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300"
                              >
                                payer
                              </Button>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              type="button"
                              className="text-blue-700 hover:text-blue-800"
                              onClick={() => onEdit(p)}
                              aria-label={`Modifier le paiement`}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => onDelete(p.id)}
                              aria-label={`Supprimer le paiement`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
