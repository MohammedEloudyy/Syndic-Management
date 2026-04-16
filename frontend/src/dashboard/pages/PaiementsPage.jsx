import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockAppartements, mockPaiements, mockResidents } from "@/dashboard/mockData";
import { StatsCard } from "@/dashboard/components/StatsCard";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  residentId: z.string().min(1, "Résident requis"),
  type: z.string().min(2, "Type requis"),
  amount: z.coerce.number().min(0),
  limitDate: z.string().min(3, "Date requise"),
  status: z.enum(["en attente", "payé", "en retard"]),
});

let idSeq = 1;

export function PaiementsPage() {
  const [items, setItems] = useState(mockPaiements);
  const [showForm, setShowForm] = useState(false);

  const residentsById = useMemo(() => new Map(mockResidents.map((r) => [r.id, r])), []);
  const apartmentsById = useMemo(() => new Map(mockAppartements.map((a) => [a.id, a])), []);

  const totalAmount = useMemo(() => items.reduce((sum, p) => sum + p.amount, 0), [items]);
  const amountPaid = useMemo(
    () => items.filter((p) => p.status === "payé").reduce((sum, p) => sum + p.amount, 0),
    [items],
  );
  const amountPending = useMemo(
    () =>
      items.filter((p) => p.status === "en attente").reduce((sum, p) => sum + p.amount, 0),
    [items],
  );

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
      residentId: mockResidents[0]?.id ?? "",
      type: "Charges mensuelles",
      amount: 0,
      limitDate: "",
      status: "en attente",
    },
  });

  const onSubmit = (values) => {
    const newItem = {
      id: `pay_${idSeq++}`,
      residentId: values.residentId,
      apartmentId: apartmentsById.get(values.residentId)?.id ?? mockResidents[0]?.apartmentId ?? mockAppartements[0]?.id,
      type: values.type,
      amount: values.amount,
      limitDate: values.limitDate,
      status: values.status,
    };
    // The mock structure stores apartmentId on the resident, so we derive it here.
    const resident = residentsById.get(values.residentId);
    const apartmentId = resident?.apartmentId ?? mockAppartements[0]?.id;

    const finalItem = { ...newItem, apartmentId };
    setItems((prev) => [finalItem, ...prev]);
    setShowForm(false);
    form.reset();
  };

  const { formState } = form;
  const isSubmitting = formState.isSubmitting;

  const typeOptions = ["Charges mensuelles", "Charges ponctuelles"];
  const statusOptions = ["en attente", "payé", "en retard"];

  const onPay = (id) => {
    setItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "payé" } : p)),
    );
  };

  const resetForm = () => {
    form.reset({
      residentId: mockResidents[0]?.id ?? "",
      type: "Charges mensuelles",
      amount: 0,
      limitDate: "",
      status: "en attente",
    });
  };

  const onCancel = () => {
    setShowForm(false);
    resetForm();
  };

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

      {showForm ? (
        <Card className="mb-5">
          <CardContent className="p-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="text-sm font-semibold text-muted-foreground">
                Nouveau paiement
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Résident
                  </label>
                  <select
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
                    {...form.register("residentId")}
                  >
                    {mockResidents.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Type de paiement
                  </label>
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
                  <label className="text-sm font-medium text-foreground">
                    Montant (€)
                  </label>
                  <Input
                    type="number"
                    placeholder="450"
                    {...form.register("amount")}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Date limite
                  </label>
                  <Input
                    placeholder="mm/dd/yyyy"
                    {...form.register("limitDate")}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground">
                    Statut
                  </label>
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
                <Button type="button" variant="secondary" onClick={onCancel}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
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
                        <TableCell>{resident?.fullName ?? "-"}</TableCell>
                        <TableCell>{apt?.number ?? "-"}</TableCell>
                        <TableCell>{p.type}</TableCell>
                        <TableCell className="text-right">{p.amount} €</TableCell>
                        <TableCell>{p.limitDate}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={p.status} />
                            {p.status === "en attente" ? (
                              <Button
                                size="xs"
                                type="button"
                                onClick={() => onPay(p.id)}
                              >
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

