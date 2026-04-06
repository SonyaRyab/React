import type { Reagent } from "./types";

export const REAGENTS_MOCK: Reagent[] = [
  {
    id: 1,
    name: "Водород",
    formula: "H₂",
    description: "Восстановитель в реакции Сабатье",
    molar_mass: 2.016,
    img: "/default-reagent.jpg",
    video: "",
  },
  {
    id: 2,
    name: "Углерод",
    formula: "CO₂",
    description: "Исходное вещество",
    molar_mass: 44.01,
    img: "",
  },
  {
    id: 3,
    name: "Никель",
    formula: "Ni",
    description: "Катализатор реакции",
    molar_mass: 58.69,
    img: "",
  },
  {
    id: 4,
    name: "Энергия",
    formula: "E",
    description: "Энергия в реакции",
    molar_mass: 0,
    img: "",
  },
];