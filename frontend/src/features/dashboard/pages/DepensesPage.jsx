import { useMemo, useState } from "react";
import { Pencil, Trash2, Receipt, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useResource } from "@/features/dashboard/hooks/useResource";
import {
  createDepense,
  deleteDepense,
  getDepenses,
  getImmeubles,
  updateDepense,
} from "@/features/dashboard/api/dashboardApi";

const schema = z.object({
  title: z.string().min(2, "Titre requis"),
  buildingId: z.string().min(1, "Immeuble requis"),
  category: z.string().min(2, "Catégorie requise"),
  amount: z.coerce.number().min(0, "Montant requis"),
  date: z.string().min(3, "Date requise"),
  description: z.string().optional(),
});

function categoryVariant(category) {
  const v = category.toLowerCase();
  if (v.includes("maintenance")) return "success";
  if (v.includes("entretien") || v.includes("util")) return "info";
  if (v.includes("jardin")) return "warning";
  return "muted";
}

function errorMessage(err) {
  return (
    err?.response?.data?.message ??
    err?.message ??
    "Une erreur est survenue. Réessayez."
  );
}

export default function DepensesPage() {
  const depensesQ = useResource(() => getDepenses());
  const immeublesQ = useResource(() => getImmeubles());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [actionError, setActionError] = useState("");

  const immeubles = immeublesQ.data ?? [];
  const firstBuildingId = immeubles[0]?.id ?? "";
  const categories = ["Maintenance", "Entretien", "Utilités", "Jardinage", "Autres"];

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      buildingId: firstBuildingId,
      category: categories[0] ?? "Maintenance",
      amount: 0,
      date: "",
      description: "",
    },
  });

  const immeublesById = useMemo(() => new Map(immeubles.map((i) => [i.id, i])), [immeubles]);

  const items = depensesQ.data ?? [];
  const total = useMemo(() => items.reduce((sum, d) => sum + d.amount, 0), [items]);

  const resetForm = (item) => {
    form.reset({
      title: item?.title ?? "",
      buildingId: item?.buildingId ?? firstBuildingId,
      category: item?.category ?? categories[0] ?? "Maintenance",
      amount: item?.amount ?? 0,
      date: item?.date ?? "",
      description: item?.description ?? "",
    });
  };

  const onEdit = (item) => {
    setEditingId(item.id);
    setShowForm(true);
    resetForm(item);
  };

  const onDelete = async (id) => {
    const ok = window.confirm("Supprimer cette dépense ?");
    if (!ok) return;
    setActionError("");
    try {
      await deleteDepense(id);
      await depensesQ.refetch();
    } catch (e) {
      setActionError(errorMessage(e));
    }
  };

  const onSubmit = async (values) => {
    setActionError("");
    try {
      if (editingId) {
        await updateDepense(editingId, values);
      } else {
        await createDepense(values);
      }
      setEditingId(null);
      setShowForm(false);
      resetForm(null);
      await depensesQ.refetch();
    } catch (e) {
      setActionError(errorMessage(e));
    }
  };

  const loading = depensesQ.loading || immeublesQ.loading;
  const fetchError = depensesQ.error || immeublesQ.error;
  const isSubmitting = form.formState.isSubmitting;

  if (loading && !depensesQ.data) {
    return (
      <div className="flex min-h-[240px] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Chargement des dépenses…</span>
      </div>
    );
  }

  if (fetchError && !depensesQ.data) {
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
          <h1 className="text-xl font-semibold">Gestion des dépenses</h1>
          <p className="text-sm text-muted-foreground">Suivez toutes vos dépenses</p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setEditingId(null);
            setShowForm((v) => !v);
            resetForm(null);
          }}
        >
          + Ajouter
        </Button>
      </div>

      {actionError ? (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {actionError}
        </div>
      ) : null}

      <Card className="mb-5">
        <CardContent className="p-6">
          <div className="text-sm font-semibold text-muted-foreground">Total des dépenses</div>
          <div className="mt-2 text-3xl font-semibold">{total} €</div>
          <div className="mt-1 text-sm text-muted-foreground">Toutes périodes confondues</div>
        </CardContent>
      </Card>

      {showForm ? (
        <Card className="mb-5">
          <CardContent className="p-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="text-sm font-semibold text-muted-foreground">
                {editingId ? "Modifier la dépense" : "Nouvelle dépense"}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Titre</label>
                  <Input
                    placeholder="Réparation..."
                    {...form.register("title")}
                    aria-invalid={!!form.formState.errors.title}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Immeuble</label>
                  <select
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    {...form.register("buildingId")}
                  >
                    {immeubles.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Catégorie</label>
                  <select
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    {...form.register("category")}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Montant (€)</label>
                  <Input
                    type="number"
                    placeholder="500"
                    {...form.register("amount")}
                    aria-invalid={!!form.formState.errors.amount}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Date</label>
                  <Input
                    placeholder="jj/mm/aaaa"
                    {...form.register("date")}
                    aria-invalid={!!form.formState.errors.date}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <Textarea
                    placeholder="Détails de la dépense..."
                    className="min-h-28"
                    {...form.register("description")}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Enregistrer
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isSubmitting}
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    resetForm(null);
                  }}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>TITRE</TableHead>
                  <TableHead>IMMEUBLE</TableHead>
                  <TableHead>CATÉGORIE</TableHead>
                  <TableHead className="text-right">MONTANT</TableHead>
                  <TableHead>DATE</TableHead>
                  <TableHead className="w-[120px] text-right">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((d) => {
                  const building = immeublesById.get(d.buildingId);
                  return (
                    <TableRow key={d.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Receipt className="h-4 w-4 text-blue-700" />
                          <div className="leading-tight">
                            <div className="font-medium">{d.title}</div>
                            <div className="text-xs text-muted-foreground">{d.description}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{building?.name ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={categoryVariant(d.category)} className="rounded-md">
                          {d.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{d.amount} €</TableCell>
                      <TableCell>{d.date}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            className="text-blue-700 hover:text-blue-800"
                            onClick={() => onEdit(d)}
                            aria-label={`Modifier ${d.title}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => onDelete(d.id)}
                            aria-label={`Supprimer ${d.title}`}
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
      )}
    </div>
  );
}
