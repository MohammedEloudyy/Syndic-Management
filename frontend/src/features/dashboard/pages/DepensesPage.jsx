import { useMemo, useState, memo } from "react";
import { Pencil, Trash2, Receipt, Loader2, Search } from "lucide-react";
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
import { toast } from "sonner";
import { useResource } from "@/features/dashboard/hooks/useResource";
import { useDebounce } from "@/hooks/useDebounce";
import {
  createDepense,
  deleteDepense,
  getDepenses,
  getImmeubles,
  updateDepense,
} from "@/features/dashboard/api/dashboardApi";
import Pagination from "@/components/common/Pagination";
import { queryClient } from "@/lib/queryClient";

const schema = z.object({
  title: z.string().min(2, "Titre requis"),
  buildingId: z.string().min(1, "Immeuble requis"),
  category: z.string().min(2, "Catégorie requise"),
  amount: z.coerce.number().min(0, "Montant requis"),
  date: z.string().min(3, "Date requise"),
  description: z.string().optional(),
});

function getCategoryStyles(category) {
  const v = (category || "").toLowerCase();
  if (v.includes("maintenance")) return { color: "text-indigo-700 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-500/10", border: "border-indigo-100 dark:border-indigo-500/20", dot: "bg-indigo-500" };
  if (v.includes("nettoyage")) return { color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-100 dark:border-blue-500/20", dot: "bg-blue-500" };
  if (v.includes("élec") || v.includes("elec")) return { color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-100 dark:border-amber-500/20", dot: "bg-amber-500" };
  if (v.includes("eau")) return { color: "text-cyan-700 dark:text-cyan-400", bg: "bg-cyan-50 dark:bg-cyan-500/10", border: "border-cyan-100 dark:border-cyan-500/20", dot: "bg-cyan-500" };
  if (v.includes("ascenseur")) return { color: "text-purple-700 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-500/10", border: "border-purple-100 dark:border-purple-500/20", dot: "bg-purple-500" };
  if (v.includes("sécurité") || v.includes("securite")) return { color: "text-rose-700 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-500/10", border: "border-rose-100 dark:border-rose-500/20", dot: "bg-rose-500" };
  if (v.includes("jardin")) return { color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-100 dark:border-emerald-500/20", dot: "bg-emerald-500" };
  if (v.includes("autres") || v.includes("autre")) return { color: "text-sky-700 dark:text-sky-400", bg: "bg-sky-50 dark:bg-sky-500/10", border: "border-sky-100 dark:border-sky-500/20", dot: "bg-sky-500" };
  return { color: "text-slate-700 dark:text-slate-400", bg: "bg-slate-50 dark:bg-slate-500/10", border: "border-slate-100 dark:border-slate-500/20", dot: "bg-slate-500" };
}

function errorMessage(err) {
  return (
    err?.response?.data?.message ??
    err?.message ??
    "Une erreur est survenue. Réessayez."
  );
}

const DepenseRow = memo(function DepenseRow({ d, building, onEdit, onDelete }) {
  const styles = getCategoryStyles(d.category);
  return (
    <TableRow className="hover:bg-muted/50 transition-colors border-border">
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
        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${styles.bg} ${styles.color} ${styles.border}`}>
          <span className={`h-1 w-1 rounded-full ${styles.dot}`} />
          {d.category}
        </div>
      </TableCell>
      <TableCell className="text-right">{d.amount} MAD</TableCell>
      <TableCell>{d.date}</TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            onClick={() => onEdit(d)}
            aria-label={`Modifier ${d.title}`}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            onClick={() => onDelete(d.id)}
            aria-label={`Supprimer ${d.title}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </TableCell>
    </TableRow>
  );
});

export default function DepensesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [buildingFilter, setBuildingFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const depensesQ = useResource(getDepenses, {
    immeuble_id: buildingFilter === "all" ? undefined : buildingFilter,
    categorie: categoryFilter === "all" ? undefined : categoryFilter,
    search: debouncedSearch || undefined,
    page
  });
  const immeublesQ = useResource(getImmeubles, { per_page: 1000 });

  const immeubles = immeublesQ.data ?? [];
  const firstBuildingId = immeubles[0]?.id ?? "";
  const categories = ["Maintenance", "Nettoyage", "Électricité", "Eau", "Ascenseur", "Sécurité", "Jardinage", "Autres"];

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



  const rawItems = depensesQ.data ?? [];
  const total = depensesQ.meta?.stats?.total ?? 0;

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
    try {
      await deleteDepense(id);
      toast.success("Dépense supprimée avec succès");
      queryClient.invalidateQueries();
      await depensesQ.refetch();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const onSubmit = async (values) => {
    try {
      if (editingId) {
        await updateDepense(editingId, values);
        toast.success("Dépense modifiée avec succès");
      } else {
        await createDepense(values);
        toast.success("Dépense ajoutée avec succès");
      }
      setEditingId(null);
      setShowForm(false);
      resetForm(null);
      queryClient.invalidateQueries();
      await depensesQ.refetch();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const loading = depensesQ.loading || immeublesQ.loading;
  const fetchError = depensesQ.error || immeublesQ.error;

  const items = useMemo(() => {
    return rawItems;
  }, [rawItems]);

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
    <div className="pb-2 animate-fade-in">
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
          variant="emerald"
        >
          + Ajouter une dépense
        </Button>
      </div>

      <Card className="card-modern mb-5">
        <CardContent className="p-6">
          <div className="text-sm font-semibold text-muted-foreground">Total des dépenses</div>
          <div className="mt-2 text-3xl font-semibold">{total.toLocaleString()} MAD</div>
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
                  <label className="text-sm font-medium text-foreground">Montant (MAD)</label>
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
                    type="date"
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
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  variant="modern"
                  className="h-8 px-6"
                >
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {editingId ? "Enregistrer les modifications" : "Confirmer l'ajout"}
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
        <>
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-[300px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher une dépense..."
                className="pl-9 h-9 modern-input"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                className="modern-input h-9 w-full md:w-[200px] bg-background px-3 text-sm outline-none"
                value={buildingFilter}
                onChange={(e) => {
                  setBuildingFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">Tous les immeubles</option>
                {immeubles.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>

              <select
                className="modern-input h-9 w-full md:w-[150px] bg-background px-3 text-sm outline-none"
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">Toutes les catégories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Card className="modern-table-container border-none shadow-sm">
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
                  {items.map((d) => (
                    <DepenseRow
                      key={d.id}
                      d={d}
                      building={d.immeuble}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        Aucune dépense trouvée.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Pagination
            currentPage={depensesQ.meta?.current_page || 1}
            lastPage={depensesQ.meta?.last_page || 1}
            onPageChange={setPage}
            className="mt-2"
          />
        </>
      )}
    </div>
  );
}
