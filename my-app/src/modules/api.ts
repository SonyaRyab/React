import { REAGENTS_MOCK } from './mock';
import type { Reagent } from './types';

const API_URL = '/api';

export async function getReagents(search = ''): Promise<Reagent[]> {
  try {
    const response = await fetch(`${API_URL}/reagents?search=${encodeURIComponent(search)}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Ошибка получения списка реагентов');
    }

    return await response.json();
  } catch {
    return REAGENTS_MOCK.filter((r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.formula.toLowerCase().includes(search.toLowerCase())
    );
  }
}

export async function getReagentById(id: string | number): Promise<Reagent | undefined> {
  try {
    const response = await fetch(`${API_URL}/reagents/${id}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Ошибка получения реагента');
    }

    return await response.json();
  } catch {
    return REAGENTS_MOCK.find((r) => r.id === Number(id));
  }
}

export async function getCartIcon(): Promise<{ count: number }> {
  try {
    const response = await fetch(`${API_URL}/cart/icon`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Ошибка корзины');
    }

    return await response.json();
  } catch {
    return { count: 0 };
  }
}