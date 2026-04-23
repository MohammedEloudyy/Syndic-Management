import { useMemo, useState } from "react";
import { Home, Pencil, Trash2, Loader2, Search } from "lucide-react";
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
import { useResource } from "@/features/dashboard/hooks/useResource";
import {
  createAppartement,
  deleteAppartement,
  getAppartements,
  getImmeubles,
  updateAppartement,
} from "@/features/dashboard/api/dashboardApi";
import Pagination from "@/components/common/Pagination";

const schema = z.object({
  number: z.string().min(1, "Numéro requis"),
  buildingId: z.string().min(1, "Immeuble requis"),
  floor: z.coerce.number().min(0),
  surface: z.coerce.number().min(0),
  rooms: z.coerce.number().min(0),
  status: z.enum(["occupé", "vacant"]),
});

function errorMessage(err) {
  return (
    err?.response?.data?.message ??
    err?.message ??
    "Une erreur est survenue. Réessayez."
  );
}

export default function AppartementsPage() {
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [buildingFilter, setBuildingFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const immeublesQ = useResource(getImmeubles);
  const appartementsQ = useResource(getAppartements, {
    immeuble_id: buildingFilter === "all" ? undefined : buildingFilter,
    status: statusFilter === "all" ? undefined : statusFilter,
    page
  });

  const immeubles = immeublesQ.data ?? [];
  const firstBuildingId = immeubles[0]?.id ?? "";

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      number: "",
      buildingId: firstBuildingId,
      floor: 0,
      surface: 0,
      rooms: 0,
      status: "occupé",
    },
  });

  const buildingsById = useMemo(() => new Map(immeubles.map((b) => [b.id, b])), [immeubles]);

  const resetForm = (item) => {
    form.reset({
      number: item?.number ?? "",
      buildingId: item?.buildingId ?? firstBuildingId,
      floor: item?.floor ?? 0,
      surface: item?.surface ?? 0,
      rooms: item?.rooms ?? 0,
      status: item?.status ?? "occupé",
    });
  };

  const onEdit = (item) => {
    setEditingId(item.id);
    setShowForm(true);
    resetForm(item);
  };

  const onDelete = async (id) => {
    const ok = window.confirm("Supprimer cet appartement ?");
    if (!ok) return;
    try {
      await deleteAppartement(id);
      toast.success("Appartement supprimé avec succès");
      await appartementsQ.refetch();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const onSubmit = async (values) => {
    try {
      if (editingId) {
        await updateAppartement(editingId, values);
        toast.success("Appartement modifié avec succès");
      } else {
        await createAppartement(values);
        toast.success("Appartement ajouté avec succès");
      }
      setEditingId(null);
      setShowForm(false);
      resetForm(null);
      await appartementsQ.refetch();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const loading = immeublesQ.loading || appartementsQ.loading;
  const fetchError = immeublesQ.error || appartementsQ.error;
  const rawItems = appartementsQ.data ?? [];
  const items = useMemo(() => {
    return rawItems.filter(item => {
      const matchBuilding = buildingFilter === "all" || item.buildingId === buildingFilter;
      const matchStatus = statusFilter === "all" || item.status === statusFilter;
      return matchBuilding && matchStatus;
    });
  }, [rawItems, buildingFilter, statusFilter]);
  const isSubmitting = form.formState.isSubmitting;

  if (loading && !appartementsQ.data) {
    return (
      <div className="flex min-h-[240px] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Chargement des appartements…</span>
      </div>
    );
  }

  if (fetchError && !appartementsQ.data) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        {errorMessage(fetchError)}
      </div>
    );
  }

  return (
    <div className="pb-2 animate-fade-in">
      <PageHeader
        title="Gestion des appartements"
        description="Gérez tous vos appartements"
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
                {editingId ? "Modifier l'appartement" : "Nouvel appartement"}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Numéro</label>
                  <Input
                    placeholder="A101"
                    {...form.register("number")}
                    aria-invalid={!!form.formState.errors.number}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Immeuble</label>
                  <select
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
                    {...form.register("buildingId")}
                  >
                    {immeubles.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Étage</label>
                  <Input
                    type="number"
                    placeholder="1"
                    {...form.register("floor")}
                    aria-invalid={!!form.formState.errors.floor}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Surface (m²)</label>
                  <Input
                    type="number"
                    placeholder="65"
                    {...form.register("surface")}
                    aria-invalid={!!form.formState.errors.surface}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Pièces</label>
                  <Input
                    type="number"
                    placeholder="3"
                    {...form.register("rooms")}
                    aria-invalid={!!form.formState.errors.rooms}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Statut</label>
                  <select
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
                    {...form.register("status")}
                  >
                    <option value="occupé">occupé</option>
                    <option value="vacant">vacant</option>
                  </select>
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

      <div className="mb-4 flex flex-wrap gap-3">
        <select
          className="h-9 w-full md:w-[200px] rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          value={buildingFilter}
          onChange={(e) => {
            setBuildingFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">Tous les immeubles</option>
          {immeubles.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        <select
          className="h-9 w-full md:w-[150px] rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">Tous les statuts</option>
          <option value="occupé">Occupé</option>
          <option value="vacant">Vacant</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>APPARTEMENT</TableHead>
                <TableHead>IMMEUBLE</TableHead>
                <TableHead>ÉTAGE</TableHead>
                <TableHead className="text-right">SURFACE</TableHead>
                <TableHead className="text-right">PIÈCES</TableHead>
                <TableHead>STATUT</TableHead>
                <TableHead className="w-[120px] text-right">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const building = buildingsById.get(item.buildingId);
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-blue-700" />
                        <span className="font-medium">{item.number}</span>
                      </div>
                    </TableCell>
                    <TableCell>{building?.name ?? "—"}</TableCell>
                    <TableCell>{item.floor}</TableCell>
                    <TableCell className="text-right">{item.surface} m²</TableCell>
                    <TableCell className="text-right">{item.rooms}</TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          className="text-blue-700 hover:text-blue-800"
                          onClick={() => onEdit(item)}
                          aria-label={`Modifier ${item.number}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => onDelete(item.id)}
                          aria-label={`Supprimer ${item.number}`}
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

      <Pagination 
        currentPage={appartementsQ.meta?.current_page || 1}
        lastPage={appartementsQ.meta?.last_page || 1}
        onPageChange={setPage}
        className="mt-2"
      />
    </div>
  );
}
