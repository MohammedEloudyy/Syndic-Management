import { getImmeubles, deleteImmeuble } from "@/features/dashboard/api/dashboardApi";
import { useResource } from "@/features/dashboard/hooks/useResource";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";

export default function ImmeublesPage() {
  const { data: immeubles, loading, error, refetch } = useResource(getImmeubles);

  async function handleDelete(id) {
    if (!window.confirm("Supprimer cet immeuble ?")) return;
    try {
      await deleteImmeuble(id);
      refetch();
    } catch {
      window.alert("Erreur lors de la suppression.");
    }
  }

  if (loading) return <p className="p-6 text-sm text-gray-500">Chargement...</p>;
  if (error) return <p className="p-6 text-sm text-red-500">Erreur de chargement.</p>;

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Immeubles" />

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Nom</th>
              <th className="px-4 py-3 text-left">Adresse</th>
              <th className="px-4 py-3 text-left">Ville</th>
              <th className="px-4 py-3 text-left">Statut</th>
              <th className="px-4 py-3 text-left">Appartements</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {immeubles.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  Aucun immeuble trouve.
                </td>
              </tr>
            )}

            {immeubles.map((immeuble) => (
              <tr key={immeuble.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{immeuble.name}</td>
                <td className="px-4 py-3 text-gray-500">{immeuble.address ?? "-"}</td>
                <td className="px-4 py-3 text-gray-500">{immeuble.city ?? "-"}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={Number(immeuble.apartment_count) > 0 ? "occupé" : "vacant"} />
                </td>
                <td className="px-4 py-3">{immeuble.apartment_count ?? "-"}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(immeuble.id)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
