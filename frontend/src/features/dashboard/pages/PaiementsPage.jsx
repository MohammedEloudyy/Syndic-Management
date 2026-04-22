import { useMemo, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatsCard from "@/features/dashboard/components/StatsCard";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
  status: z.enum(["en attente", "payé", "en retard"]),
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
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionError, setActionError] = useState("");

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
    () => items.filter((p) => p.status === "en attente").reduce((sum, p) => sum + p.amount, 0),
    [items],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((p) => {
      const statusOk = statusFilter === "all" ? true : p.status === statusFilter;
      const resident = residentsById.get(p.residentId);
      const apartment = apartmentsById.get(p.apartmentId);
      const aptText = apartment ? apartment.number : "";
      const nameText = resident ? resident.fullName : "";
      const queryOk = q
        ? nameText.toLowerCase().includes(q) || aptText.toLowerCase().includes(q)
        : true;
      return statusOk && queryOk;
    });
  }, [items, query, statusFilter, residentsById, apartmentsById]);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      residentId: firstResidentId,
      type: "Charges mensuelles",
      amount: 0,
      limitDate: "",
      status: "en attente",
    },
  });

  const resetForm = () => {
    form.reset({
      residentId: firstResidentId,
      type: "Charges mensuelles",
      amount: 0,
      limitDate: "",
      status: "en attente",
    });
  };

  const onSubmit = async (values) => {
    setActionError("");
    try {
      await createPaiement(values);
      setShowForm(false);
      resetForm();
      await paiementsQ.refetch();
    } catch (e) {
      setActionError(errorMessage(e));
    }
  };

  const onPay = async (id) => {
    setActionError("");
    try {
      await updatePaiement(id, { status: "payé" });
      await paiementsQ.refetch();
    } catch (e) {
      setActionError(errorMessage(e));
    }
  };

  const loading = paiementsQ.loading || residentsQ.loading || appartementsQ.loading;
  const fetchError = paiementsQ.error || residentsQ.error || appartementsQ.error;
  const isSubmitting = form.formState.isSubmitting;

  const typeOptions = ["Charges mensuelles", "Charges ponctuelles"];
  const statusOptions = ["en attente", "payé", "en retard"];

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

        <Button type="button" onClick={() => setShowForm((v) => !v)}>
          + Ajouter
        </Button>
      </div>

      {actionError ? (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {actionError}
        </div>
      ) : null}

      {showForm ? (
        <Card className="mb-5">
          <CardContent className="p-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="text-sm font-semibold text-muted-foreground">Nouveau paiement</div>

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
                  <label className="text-sm font-medium text-foreground">Montant (€)</label>
                  <Input type="number" placeholder="450" {...form.register("amount")} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Date limite</label>
                  <Input placeholder="jj/mm/aaaa" {...form.register("limitDate")} />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Statut</label>
                  <select
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
                    {...form.register("status")}
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s === "en attente" ? "En attente" : s}
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
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Ajouter le paiement
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
            <div className="relative w-full md:max-w-lg">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
                placeholder="Rechercher par résident ou appartement..."
              />
            </div>

            <select
              className="h-9 w-full md:w-[200px] rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="payé">payé</option>
              <option value="en attente">en attente</option>
              <option value="en retard">en retard</option>
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
                        <TableCell className="text-right">{p.amount} €</TableCell>
                        <TableCell>{p.limitDate}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={p.status} />
                            {p.status === "en attente" ? (
                              <Button size="xs" type="button" onClick={() => onPay(p.id)}>
                                payer
                              </Button>
                            ) : null}
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
