import { REAGENTS_MOCK } from "./mock";
import type Reagent from "./types";
import { API_BASE } from "../api/config";

const API_ORIGIN = API_BASE.replace(/\/$/, "");
const getToken = () => sessionStorage.getItem('token') || localStorage.getItem('token');

type ReagentsApiResult = Reagent[] | { data?: Reagent[]; items?: Reagent[] };

type PaginatedApiResult =
  | PaginatedResponse<Reagent>
  | {
      data?: Reagent[];
      items?: Reagent[];
      total?: number;
      page?: number;
      limit?: number;
      totalPages?: number;
    };

    const normalizePaginated = (
  result: PaginatedApiResult,
  fallbackPage: number,
  fallbackLimit: number,
): PaginatedResponse<Reagent> => {
  if ('items' in result && Array.isArray(result.items) && typeof result.total === 'number') {
    return {
      items: result.items,
      total: result.total,
      page: result.page ?? fallbackPage,
      limit: result.limit ?? fallbackLimit,
      totalPages:
        result.totalPages ??
        Math.max(1, Math.ceil(result.total / Math.max(1, result.limit ?? fallbackLimit))),
    };
  }

  const items = Array.isArray((result as any).data)
    ? ((result as any).data as Reagent[])
    : Array.isArray((result as any).items)
      ? ((result as any).items as Reagent[])
      : [];

  const total = typeof (result as any).total === 'number' ? (result as any).total : items.length;
  const limit = typeof (result as any).limit === 'number' ? (result as any).limit : fallbackLimit;
  const page = typeof (result as any).page === 'number' ? (result as any).page : fallbackPage;

  return {
    items,
    total,
    page,
    limit,
    totalPages:
      typeof (result as any).totalPages === 'number'
        ? (result as any).totalPages
        : Math.max(1, Math.ceil(total / Math.max(1, limit))),
  };
};

export async function getReagents(search = ''): Promise<Reagent[]> {
  try {
    const response = await fetch(`${API_ORIGIN}/api/reagents?search=${encodeURIComponent(search)}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result: ReagentsApiResult = await response.json();
    if (Array.isArray(result)) return result;
    return result.data ?? result.items ?? [];
  } catch {
    return REAGENTS_MOCK.filter(
      (r) =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.formula.toLowerCase().includes(search.toLowerCase()),
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

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    return result.data ?? result ?? null;
  } catch {
    return REAGENTS_MOCK.find((r) => r.id === Number(id)) ?? null;
  }
}

export async function getReagentsPaginated(
  search = '',
  page = 1,
  limit = 24,
): Promise<PaginatedResponse<Reagent>> {
  try {
    const params = new URLSearchParams({
      search,
      page: String(page),
      limit: String(limit),
    });

    const response = await fetch(`${API_ORIGIN}/api/reagents?${params.toString()}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result: PaginatedApiResult = await response.json();
    return normalizePaginated(result, page, limit);
  } catch {
    const filtered = REAGENTS_MOCK.filter(
      (r) =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.formula.toLowerCase().includes(search.toLowerCase()),
    );
    const start = (page - 1) * limit;
    const items = filtered.slice(start, start + limit);

    return {
      items,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(filtered.length / Math.max(1, limit))),
    };
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

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    const count = Array.isArray(result?.reagents)
      ? result.reagents.reduce(
          (sum: number, item: any) => sum + Number(item.volume ?? 0),
          0
        )
      : 0;

    return { count };
  } catch {
    return { count: 0 };
  }
}

export async function getFeed(): Promise<number[]> {
  const token = getToken();

  const response = await fetch(`${API_ORIGIN}/api/feed`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const result = await response.json();

  if (Array.isArray(result?.ids)) return result.ids as number[];
  if (Array.isArray(result?.items)) {
    return result.items.map((item: any) => Number(item.id)).filter(Boolean);
  }
  if (Array.isArray(result)) {
    return result.map((item: any) => Number(item?.id ?? item)).filter(Boolean);
  }

  return [];
}