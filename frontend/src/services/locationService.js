import { api } from "../api";

export async function searchPlaces(query) {
  const { data } = await api.get("/geocode", { params: { q: query } });
  return data.places;
}