import { api } from "../api";

export async function fetchEnvironment(latitude, longitude) {
  const { data } = await api.get("/environment", {
    params: { lat: latitude, lon: longitude },
  });
  return data;
}