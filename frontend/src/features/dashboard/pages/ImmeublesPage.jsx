import { useState, useMemo, memo } from "react";
import { Building2, Pencil, Trash2, Loader2, Search } from "lucide-react";
import {
  getImmeubles,
  deleteImmeuble,
  createImmeuble,
  updateImmeuble,
} from "@/features/dashboard/api/dashboardApi";
import { useResource } from "@/features/dashboard/hooks/useResource";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Pagination from "@/components/common/Pagination";
import { queryClient } from "@/lib/queryClient";

const schema = z.object({
  name: z.string().min(2, "Nom requis"),
  address: z.string().min(5, "Adresse requise"),
  city: z.string().min(2, "Ville requise"),
  apartmentCount: z.coerce.number().min(0, "Nombre d'appartements requis"),
});

function errorMessage(err) {
  return (
    err?.response?.data?.message ??
    err?.message ??
    "Une erreur est survenue. Réessayez."
  );
}

const ImmeubleRow = memo(function ImmeubleRow({ immeuble, onEdit, onDelete }) {
  return (
    <TableRow className="hover:bg-muted/50 transition-colors">
      <TableCell>
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-blue-700" />
          <span className="font-medium">{immeuble.name}</span>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground text-xs">{immeuble.address ?? "-"}</TableCell>
      <TableCell className="text-muted-foreground text-xs">{immeuble.city ?? "-"}</TableCell>
      <TableCell>
        <StatusBadge status={Number(immeuble.apartmentCount) > 0 ? "occupé" : "vacant"} />
      </TableCell>
      <TableCell className="text-right">{immeuble.apartmentCount ?? "0"}</TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            onClick={() => onEdit(immeuble)}
            aria-label={`Modifier ${immeuble.name}`}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            onClick={() => onDelete(immeuble.id)}
            aria-label={`Supprimer ${immeuble.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </TableCell>
    </TableRow>
  );
});

export default function ImmeublesPage() {
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [cityFilter, setCityFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { data: rawItems, meta, loading, error, refetch } = useResource(getImmeubles, {
    city: cityFilter === "all" ? undefined : cityFilter,
    page
  });

  const cities = useMemo(() => {
    const set = new Set(rawItems.map(i => i.city).filter(Boolean));
    return Array.from(set).sort();
  }, [rawItems]);

  const immeubles = rawItems;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      apartmentCount: 0,
    },
  });

  const resetForm = (item) => {
    form.reset({
      name: item?.name ?? "",
      address: item?.address ?? "",
      city: item?.city ?? "",
      apartmentCount: item?.apartmentCount ?? 0,
    });
  };

  const onEdit = (item) => {
    setEditingId(item.id);
    setShowForm(true);
    resetForm(item);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet immeuble ?")) return;
    try {
      await deleteImmeuble(id);
      toast.success("Immeuble supprimé avec succès");
      queryClient.invalidateQueries();
      refetch();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      apartment_count: values.apartmentCount
    };

    try {
      if (editingId) {
        await updateImmeuble(editingId, payload);
        toast.success("Immeuble modifié avec succès");
      } else {
        await createImmeuble(payload);
        toast.success("Immeuble ajouté avec succès");
      }
      setEditingId(null);
      setShowForm(false);
      resetForm(null);
      queryClient.invalidateQueries();
      refetch();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  if (loading && !immeubles) return (
    <div className="flex min-h-[240px] items-center justify-center gap-2 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span>Chargement des immeubles…</span>
    </div>
  );

  if (error && !immeubles) return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
      {errorMessage(error)}
    </div>
  );

  return (
    <div className="pb-2 p-6 space-y-6">
      <PageHeader
        title="Immeubles"
        description="Gérez vos immeubles et bâtiments"
        onAdd={() => {
          setEditingId(null);
          setShowForm((v) => !v);
          resetForm(null);
        }}
      />

      {showForm ? (
        <Card className="mb-5">
          <CardContent className="p-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="text-sm font-semibold text-muted-foreground">
                {editingId ? "Modifier l'immeuble" : "Nouvel immeuble"}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Nom</label>
                  <Input
                    placeholder="Résidence Al Amal"
                    {...form.register("name")}
                    aria-invalid={!!form.formState.errors.name}
                  />
                  {form.formState.errors.name && (
                    <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Ville</label>
                  <Input
                    placeholder="Casablanca"
                    {...form.register("city")}
                    aria-invalid={!!form.formState.errors.city}
                  />
                  {form.formState.errors.city && (
                    <p className="text-xs text-red-500">{form.formState.errors.city.message}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Adresse</label>
                  <Input
                    placeholder="123 Rue de la Liberté"
                    {...form.register("address")}
                    aria-invalid={!!form.formState.errors.address}
                  />
                  {form.formState.errors.address && (
                    <p className="text-xs text-red-500">{form.formState.errors.address.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Nombre d'appartements</label>
                  <Input
                    type="number"
                    placeholder="10"
                    {...form.register("apartmentCount")}
                    aria-invalid={!!form.formState.errors.apartmentCount}
                  />
                  {form.formState.errors.apartmentCount && (
                    <p className="text-xs text-red-500">{form.formState.errors.apartmentCount.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button type="submit" variant="modern" className="px-6 h-8" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {editingId ? "Enregistrer les modifications" : "Confirmer l'ajout"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isSubmitting}
                  onClick={() => {
                    setEditingId(null);
                    setShowForm(false);
                    resetForm(null);
                  }}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <div className="mb-4">
        <select
          className="modern-input h-9 w-full md:w-[200px] bg-background px-3 text-sm outline-none"
          value={cityFilter}
          onChange={(e) => {
            setCityFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">Toutes les villes</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NOM</TableHead>
                <TableHead>ADRESSE</TableHead>
                <TableHead>VILLE</TableHead>
                <TableHead>STATUT</TableHead>
                <TableHead className="text-right">APPARTEMENTS</TableHead>
                <TableHead className="w-[120px] text-right">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {immeubles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="px-4 py-6 text-center text-muted-foreground/60">
                    Aucun immeuble trouvé.
                  </TableCell>
                </TableRow>
              )}

              {immeubles.map((immeuble) => (
                <ImmeubleRow
                  key={immeuble.id}
                  immeuble={immeuble}
                  onEdit={onEdit}
                  onDelete={handleDelete}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Pagination
        currentPage={meta?.current_page || 1}
        lastPage={meta?.last_page || 1}
        onPageChange={setPage}
        className="mt-2"
      />
    </div>
  );
}
