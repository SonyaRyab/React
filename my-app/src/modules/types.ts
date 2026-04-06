export interface Reagent {
  id: number;
  name: string;
  formula: string;
  temperature?: number;
  img?: string;
  video?: string;
  description?: string;
  molar_mass?: number;
}

export interface MethaneReagent {
  reagent_id: number;
  quantity: number;
  reagent: Reagent;
}

export interface Methane {
  id: number;
  name: string;
  status: "черновик" | "сформирована" | "завершена";
  date_create: string;
  reagents: MethaneReagent[];
}