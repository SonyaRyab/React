import h2 from '../assets/hydrogen.png';
import co2 from '../assets/CO2.png';
import energy from '../assets/energy.jpg';
import ni from '../assets/nickel.png';
import video from '../assets/sabatier_reaction.mp4';
import defaultImg from '../assets/default_image.jpg'; 

import type { Reagent } from './types';

export const REAGENTS_MOCK: Reagent[] = [
  {
    id: 1,
    name: 'Водород',
    formula: 'H2',
    description: 'Бесцветный газ, основной реагент реакции Сабатье, используется для восстановления диоксида углерода до метана.',
    molar_mass: 2.016,
    img: h2,
    video: video,
    price: 1200,
  },
  {
    id: 2,
    name: 'Диоксид углерода',
    formula: 'CO2',
    description: 'Исходный реагент реакции Сабатье, взаимодействует с водородом с образованием метана и воды.',
    molar_mass: 44.01,
    img: co2,
    video: video,
    price: 900,
  },
  {
    id: 3,
    name: 'Энергия',
    formula: 'E',
    description: 'Энергия для активации реакции Сабатье. Необходима для нагрева реактора до рабочей температуры 300-400°C. Может подаваться в виде электричества, пара или горячего теплоносителя.',
    molar_mass: 0,
    img: energy,
    video: video,
    price: 1500,
  },
  {
    id: 4,
    name: 'Никелевый катализатор',
    formula: 'Ni',
    description: 'Катализатор реакции Сабатье, ускоряет превращение углекислого газа и водорода в метан.',
    molar_mass: 58.69,
    img: ni,
    video: video,
    price: 2500,
  }
];