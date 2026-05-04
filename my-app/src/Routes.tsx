export const ROUTES = {
  HOME: "/",
  REAGENTS: "/reagents",
  REAGENT: "/reagents/:id",
  METHANE_APPLICATION: '/methane-application',  
  LOGIN: "/login",
} as const;

export type RouteKeyType = keyof typeof ROUTES;

export const ROUTE_LABELS = {
  HOME: "Главная",
  REAGENTS: "Каталог реагентов",
  METHANE_APPLICATION: "Заявка",
  LOGIN: "Авторизация",
} as const;