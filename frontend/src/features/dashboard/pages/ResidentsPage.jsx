import { useMemo, useState } from "react";
import { Mail, Phone, Pencil, Trash2, UserRound, Loader2, Search } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useResource } from "@/features/dashboard/hooks/useResource";
import { useDebounce } from "@/hooks/useDebounce";
import {
  createResident,
  deleteResident,
  getAppartements,
  getImmeubles,
  getResidents,
  updateResident,
} from "@/features/dashboard/api/dashboardApi";
import Pagination from "@/components/common/Pagination";

const schema = z.object({
  fullName: z.string().min(2, "Nom requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(5, "Téléphone requis"),
  apartmentId: z.string().min(1, "Appartement requis"),
  entryDate: z.string().min(6, "Date requise"),
});

function errorMessage(err) {
  return (
    err?.response?.data?.message ??
    err?.message ??
    "Une erreur est survenue. Réessayez."
  );
}

export default function ResidentsPage() {
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [buildingFilter, setBuildingFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const residentsQ = useResource(getResidents, {
    immeuble_id: buildingFilter === "all" ? undefined : buildingFilter,
    search: debouncedSearch || undefined,
    page
  });
  const appartementsQ = useResource(getAppartements);
  const immeublesQ = useResource(getImmeubles);

  const appartements = appartementsQ.data ?? [];
  const firstAptId = appartements[0]?.id ?? "";

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      apartmentId: firstAptId,
      entryDate: "",
    },
  });

  const appartementsById = useMemo(
    () => new Map(appartements.map((a) => [a.id, a])),
    [appartements],
  );

  const immeublesById = useMemo(
    () => new Map((immeublesQ.data ?? []).map((i) => [i.id, i])),
    [immeublesQ.data],
  );

  const resetForm = (item) => {
    form.reset({
      fullName: item?.fullName ?? "",
      email: item?.email ?? "",
      phone: item?.phone ?? "",
      apartmentId: item?.apartmentId ?? firstAptId,
      entryDate: item?.entryDate ?? "",
    });
  };

  const onEdit = (item) => {
    setEditingId(item.id);
    setShowForm(true);
    resetForm(item);
  };

  const onDelete = async (id) => {
    const ok = window.confirm("Supprimer ce résident ?");
    if (!ok) return;
    try {
      await deleteResident(id);
      toast.success("Résident supprimé avec succès");
      await residentsQ.refetch();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const onSubmit = async (values) => {
    try {
      if (editingId) {
        await updateResident(editingId, values);
        toast.success("Résident modifié avec succès");
      } else {
        await createResident(values);
        toast.success("Résident ajouté avec succès");
      }
      setEditingId(null);
      setShowForm(false);
      resetForm(null);
      await residentsQ.refetch();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const loading = residentsQ.loading || appartementsQ.loading || immeublesQ.loading;
  const fetchError = residentsQ.error || appartementsQ.error || immeublesQ.error;
  const rawItems = residentsQ.data ?? [];
  const items = useMemo(() => {
    return rawItems.filter(r => {
      if (buildingFilter === "all") return true;
      const apt = appartementsById.get(r.apartmentId);
      return apt?.buildingId === buildingFilter;
    });
  }, [rawItems, buildingFilter, appartementsById]);
  const isSubmitting = form.formState.isSubmitting;

  if (loading && !residentsQ.data) {
    return (
      <div className="flex min-h-[240px] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Chargement des résidents…</span>
      </div>
    );
  }

  if (fetchError && !residentsQ.data) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        {errorMessage(fetchError)}
      </div>
    );
  }

  return (
    <div className="pb-2 animate-fade-in">
      <PageHeader
        title="Gestion des résidents"
        description="Gérez tous vos résidents"
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
                {editingId ? "Modifier le résident" : "Nouveau résident"}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Nom complet</label>
                  <Input
                    placeholder="Jean Dupont"
                    {...form.register("fullName")}
                    aria-invalid={!!form.formState.errors.fullName}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input
                    placeholder="jean@email.com"
                    {...form.register("email")}
                    aria-invalid={!!form.formState.errors.email}
                  />
                </div>

                <div className="space-y-2 md:col-span-1">
                  <label className="text-sm font-medium text-foreground">Téléphone</label>
                  <Input
                    placeholder="06 12 34 56 78"
                    {...form.register("phone")}
                    aria-invalid={!!form.formState.errors.phone}
                  />
                </div>

                <div className="space-y-2 md:col-span-1">
                  <label className="text-sm font-medium text-foreground">Associer à un appartement</label>
                  <select
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
                    {...form.register("apartmentId")}
                  >
                    {appartements.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.number} — étage {a.floor}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Date d&apos;entrée</label>
                  <Input
                    type="date"
                    {...form.register("entryDate")}
                    aria-invalid={!!form.formState.errors.entryDate}
                  />
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

          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-[300px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un résident..."
                className="pl-9 h-9 modern-input"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <select
              className="modern-input h-9 w-full md:w-[200px] bg-background px-3 text-sm outline-none"
              value={buildingFilter}
              onChange={(e) => {
                setBuildingFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">Tous les immeubles</option>
              {(immeublesQ.data ?? []).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>RÉSIDENT</TableHead>
                <TableHead>CONTACT</TableHead>
                <TableHead>APPARTEMENT</TableHead>
                <TableHead>IMMEUBLE</TableHead>
                <TableHead>DATE D&apos;ENTRÉE</TableHead>
                <TableHead className="w-[120px] text-right">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((r) => {
                const apt = appartementsById.get(r.apartmentId);
                const immeuble = apt ? immeublesById.get(apt.buildingId) : null;
                return (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <UserRound className="h-4 w-4 text-blue-700" />
                        <span className="font-medium">{r.fullName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          {r.email}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          {r.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{apt?.number ?? "—"}</TableCell>
                    <TableCell>{immeuble?.name ?? "—"}</TableCell>
                    <TableCell>{r.entryDate}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          className="text-blue-700 hover:text-blue-800"
                          onClick={() => onEdit(r)}
                          aria-label={`Modifier ${r.fullName}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => onDelete(r.id)}
                          aria-label={`Supprimer ${r.fullName}`}
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
        currentPage={residentsQ.meta?.current_page || 1}
        lastPage={residentsQ.meta?.last_page || 1}
        onPageChange={setPage}
        className="mt-2"
      />
    </div>
  );
}
