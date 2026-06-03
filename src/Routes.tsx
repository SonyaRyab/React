export const ROUTES = {
  HOME: '/',
  REAGENTS: '/reagents',
  REAGENT: '/reagents/:id',
  LOGIN: '/login',
  REGISTER: '/register',
  APPLICATIONS: '/applications',
  MODERATOR_APPLICATIONS: '/moderator/applications',
  METHANE_APPLICATION: '/methane-application',
  FEED: "/feed",
} as const;

export const buildReagentRoute = (id: string | number) => `/reagents/${id}`;
export const buildMethaneApplicationRoute = (id: string | number) =>
  `/methane-application/${id}`;

export type RouteKeyType = keyof typeof ROUTES;

export const ROUTE_LABELS = {
  HOME: "Главная",
  REAGENTS: "Каталог реагентов",
  METHANE_APPLICATION: "Заявка",
  LOGIN: "Авторизация",
  REGISTER: 'Регистрация',
  APPLICATIONS: 'Мои заявки',
  MODERATOR_APPLICATIONS: 'Заявки пользователей',
  FEED: "Лента Тик ток",
} as const;