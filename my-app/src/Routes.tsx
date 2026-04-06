export const ROUTES = {
  HOME: "/",
  REAGENTS: "/reagents",
  REAGENT: "/reagents/:id",
  METHANE: "/methane",
} as const;

export type RouteKeyType = keyof typeof ROUTES;

export const ROUTE_LABELS = {
  HOME: "Главная",
  REAGENTS: "Каталог реагентов",
  METHANE: "Заявка",
} as const;