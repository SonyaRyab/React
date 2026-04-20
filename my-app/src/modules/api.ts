import type { Reagent } from "./types";

const API_BASE = '/api';

export const getReagents = async (search = ""): Promise<Reagent[]> => {
  const response = await fetch(`${API_BASE}/reagents?search=${encodeURIComponent(search)}`);
  if (!response.ok) throw new Error("Network error");
  return response.json();
};

export const getReagentById = async (id: string): Promise<Reagent> => {
  const response = await fetch(`${API_BASE}/reagents/${id}`);
  if (!response.ok) throw new Error("Not found");
  return response.json();
};