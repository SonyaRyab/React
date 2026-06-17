export interface Reagent {
  id: number;
  name: string;
  formula: string;
  description: string;
  molar_mass: number;
  img?: string;
  video?: string;
  price?: number;
  embedding?: number[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}