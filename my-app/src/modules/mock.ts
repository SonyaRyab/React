import type { Reagent } from "./types";
import hydrogenImg from "../assets/hydrogen.png";
import co2Img from "../assets/CO2.png";
import nickelImg from "../assets/nickel.png";
import energyImg from "../assets/energy.jpg";
import video from "../assets/sabatier_reaction.mp4";

export const REAGENTS_MOCK: Reagent[] = [
  {
    id: 1,
    name: "Водород",
    formula: "H2",
    description: "Восстановитель в реакции Сабатье",
    molar_mass: 2.016,
    img: hydrogenImg,
    video: video,
  },
  {
    id: 2,
    name: "Углерод",
    formula: "CO2",
    description: "Исходное вещество",
    molar_mass: 44.01,
    img: co2Img,
    video: video,
  },
  {
    id: 3,
    name: "Никель",
    formula: "Ni",
    description: "Катализатор реакции",
    molar_mass: 58.69,
    img: nickelImg,
    video: video,
  },
  {
    id: 4,
    name: "Энергия",
    formula: "E",
    description: "Энергия в реакции",
    molar_mass: 0,
    img: energyImg,
    video: video,
  },
];