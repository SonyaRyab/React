import { REAGENTS_MOCK } from "./mock";
import type Reagent from "./types";
import { API_BASE } from "../api/config";

const API_ORIGIN = API_BASE;

export async function getReagents(search = ""): Promise<Reagent[]> {
  try {
    const response = await fetch(
      `${API_ORIGIN}/api/reagents?search=${encodeURIComponent(search)}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const result = await response.json();
    return Array.isArray(result) ? result : result.data ?? [];
  } catch {
    return REAGENTS_MOCK.filter(
      (r) =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.formula.toLowerCase().includes(search.toLowerCase())
    );
  }
}

export async function getReagentById(id: string): Promise<Reagent | null> {
  try {
    const response = await fetch(`${API_ORIGIN}/api/reagents/${id}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const result = await response.json();
    return result.data ?? result ?? null;
  } catch {
    return REAGENTS_MOCK.find((r) => r.id === Number(id)) ?? null;
  }
}

export async function getCartIcon(): Promise<{ count: number }> {
  try {
    const token =
      sessionStorage.getItem("token") || localStorage.getItem("token");

    const response = await fetch(`${API_ORIGIN}/api/methanes/draft`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const result = await response.json();
    const count = Array.isArray(result?.reagents)
      ? result.reagents.reduce(
          (sum: number, item: any) => sum + Number(item.quantity ?? 0),
          0
        )
      : 0;

    return { count };
  } catch {
    return { count: 0 };
  }
}