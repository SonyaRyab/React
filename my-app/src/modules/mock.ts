import img1 from '../assets/1.jpg';
import img2 from '../assets/2.jpg';
import img3 from '../assets/3.jpg';
import img4 from '../assets/4.jpg';
import img5 from '../assets/5.jpg';
import img6 from '../assets/6.jpg';
import img7 from '../assets/7.jpg';
import img8 from '../assets/8.jpg';
import defaultImg from '../assets/default.jpg'; 

export interface IFurniture {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    embedding?: number[]; // Эмбеддинг
}

export const FURNITURE_MOCK: IFurniture[] = [
    {
        id: 1,
        name: "Диван 'Облако'",
        description: "Soft white three-seater sofa with high-quality upholstery.",
        price: 45990,
        image: img1
    },
    {
        id: 2,
        name: "Кресло 'Ретро'",
        description: "Comfortable armchair with wooden legs and red upholstery.",
        price: 12500,
        image: img2
    },
    {
        id: 3,
        name: "Стол обеденный",
        description: "Solid natural oak table. Seats up to 6 people.",
        price: 28000,
        image: img3
    },
    {
        id: 4,
        name: "Стул пластиковый",
        description: "Gray plastic chair with plastic legs.",
        price: 3500,
        image: img4
    },
    {
        id: 5,
        name: "Торшер напольный",
        description: "Gray metal loft-style floor lamp.",
        price: 5900,
        image: img5
    },
    {
        id: 6,
        name: "Комод белый",
        description: "White dresser with three handle-less drawers.",
        price: 15990,
        image: img6
    },
    {
        id: 7,
        name: "Кровать двуспальная",
        description: "White double bed with a padded headboard.",
        price: 32000,
        image: img7
    },
    {
        id: 8,
        name: "Полка настенная",
        description: "Wooden shelf with an unusual S-shaped design.",
        price: 1900,
        image: img8
    },
    // Карточки без картинок. Это показательный пример того, что поиск идет именно по описанию.
    {
        id: 9,
        name: "Шкаф-купе",
        description: "Large oak sliding-door wardrobe with a full-length mirror.",
        price: 45000,
        image: defaultImg
    },
    {
        id: 10,
        name: "Тумба прикроватная",
        description: "Small oak bedside table for the bedroom.",
        price: 4500,
        image: defaultImg
    },
    {
        id: 11,
        name: "Зеркало настенное",
        description: "Round mirror in a gold frame.",
        price: 3200,
        image: defaultImg
    }
];