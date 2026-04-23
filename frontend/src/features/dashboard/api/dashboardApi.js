import { axiosClient } from "@/api/axios";

const mapImmeubleFromApi = (item) => ({
  ...item,
  apartmentCount: item.apartment_count ?? 0,
});

const mapAppartementFromApi = (item) => ({
  ...item,
  buildingId: item.immeuble_id,
});

const mapResidentFromApi = (item) => ({
  ...item,
  apartmentId: item.appartement_id,
  fullName: item.full_name,
  entryDate: item.entry_date,
  monthlyCharge: item.monthly_charge,
});

const mapPaiementFromApi = (item) => ({
  ...item,
  residentId: item.resident_id,
  apartmentId: item.resident?.appartement_id ?? null,
  amount: Number(item.montant ?? 0),
  limitDate: item.date_paiement,
  status: item.statut,
  type: "Charges mensuelles",
});

const mapDepenseFromApi = (item) => ({
  ...item,
  buildingId: item.immeuble_id,
  title: item.titre,
  amount: Number(item.montant ?? 0),
  date: item.date_depense,
  category: item.categorie ?? "Autres",
  description: "",
});

const toAppartementPayload = (payload) => ({
  immeuble_id: payload.buildingId ?? payload.immeuble_id,
  number: payload.number,
  floor: payload.floor,
  surface: payload.surface,
  rooms: payload.rooms,
  status: payload.status,
});

const toResidentPayload = (payload) => ({
  appartement_id: payload.apartmentId ?? payload.appartement_id,
  full_name: payload.fullName ?? payload.full_name,
  email: payload.email,
  phone: payload.phone,
  entry_date: payload.entryDate ?? payload.entry_date,
});

const toPaiementPayload = (payload) => ({
  resident_id: payload.residentId ?? payload.resident_id,
  montant: payload.amount ?? payload.montant,
  date_paiement: payload.limitDate ?? payload.date_paiement,
  statut: payload.status ?? payload.statut,
});

const toDepensePayload = (payload) => ({
  immeuble_id: payload.buildingId ?? payload.immeuble_id,
  titre: payload.title ?? payload.titre,
  montant: payload.amount ?? payload.montant,
  date_depense: payload.date ?? payload.date_depense,
  categorie: payload.category ?? payload.categorie,
});

// ── Stats ──────────────────────────────────────────────────
export const getDashboardStats = () =>
  axiosClient.get("/dashboard/stats").then((r) => r.data.data);

export const getPublicStats = () =>
  axiosClient.get("/public/stats").then((r) => r.data.data);

// ── Immeubles ──────────────────────────────────────────────
export const getImmeubles = (params = {}) =>
  axiosClient.get("/immeubles", { params }).then((r) => ({
    ...r.data,
    data: (r.data.data ?? []).map(mapImmeubleFromApi),
  }));

export const getImmeuble = (id) =>
  axiosClient.get(`/immeubles/${id}`).then((r) => mapImmeubleFromApi(r.data.data));

export const createImmeuble = (payload) =>
  axiosClient.post("/immeubles", payload).then((r) => r.data.data);

export const updateImmeuble = (id, payload) =>
  axiosClient.put(`/immeubles/${id}`, payload).then((r) => r.data.data);

export const deleteImmeuble = (id) =>
  axiosClient.delete(`/immeubles/${id}`);

// ── Appartements ───────────────────────────────────────────
export const getAppartements = (params = {}) =>
  axiosClient.get("/appartements", { params }).then((r) => ({
    ...r.data,
    data: (r.data.data ?? []).map(mapAppartementFromApi),
  }));

export const getAppartement = (id) =>
  axiosClient.get(`/appartements/${id}`).then((r) => mapAppartementFromApi(r.data.data));

export const createAppartement = (payload) =>
  axiosClient.post("/appartements", toAppartementPayload(payload)).then((r) => mapAppartementFromApi(r.data.data));

export const updateAppartement = (id, payload) =>
  axiosClient.put(`/appartements/${id}`, toAppartementPayload(payload)).then((r) => mapAppartementFromApi(r.data.data));

export const deleteAppartement = (id) =>
  axiosClient.delete(`/appartements/${id}`);

// ── Résidents ──────────────────────────────────────────────
export const getResidents = (params = {}) =>
  axiosClient.get("/residents", { params }).then((r) => ({
    ...r.data,
    data: (r.data.data ?? []).map(mapResidentFromApi),
  }));

export const getResident = (id) =>
  axiosClient.get(`/residents/${id}`).then((r) => mapResidentFromApi(r.data.data));

export const createResident = (payload) =>
  axiosClient.post("/residents", toResidentPayload(payload)).then((r) => mapResidentFromApi(r.data.data));

export const updateResident = (id, payload) =>
  axiosClient.put(`/residents/${id}`, toResidentPayload(payload)).then((r) => mapResidentFromApi(r.data.data));

export const deleteResident = (id) =>
  axiosClient.delete(`/residents/${id}`);

// ── Paiements ──────────────────────────────────────────────
export const getPaiements = (params = {}) =>
  axiosClient.get("/paiements", { params }).then((r) => ({
    ...r.data,
    data: (r.data.data ?? []).map(mapPaiementFromApi),
  }));

export const createPaiement = (payload) =>
  axiosClient.post("/paiements", toPaiementPayload(payload)).then((r) => mapPaiementFromApi(r.data.data));

export const updatePaiement = (id, payload) =>
  axiosClient.put(`/paiements/${id}`, toPaiementPayload(payload)).then((r) => mapPaiementFromApi(r.data.data));

export const deletePaiement = (id) =>
  axiosClient.delete(`/paiements/${id}`);

// ── Dépenses ───────────────────────────────────────────────
export const getDepenses = (params = {}) =>
  axiosClient.get("/depenses", { params }).then((r) => ({
    ...r.data,
    data: (r.data.data ?? []).map(mapDepenseFromApi),
  }));

export const createDepense = (payload) =>
  axiosClient.post("/depenses", toDepensePayload(payload)).then((r) => mapDepenseFromApi(r.data.data));

export const updateDepense = (id, payload) =>
  axiosClient.put(`/depenses/${id}`, toDepensePayload(payload)).then((r) => mapDepenseFromApi(r.data.data));

export const deleteDepense = (id) =>
  axiosClient.delete(`/depenses/${id}`);
