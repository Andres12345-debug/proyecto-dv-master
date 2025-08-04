import { Routes } from "@angular/router"

export const universitiesRoutes: Routes = [
  {
    path: "",
    loadComponent: () => import("./university-list/university-list.component").then((m) => m.UniversityListComponent),
  },
  {
    path: ":id",
    loadComponent: () =>
      import("./university-detail/university-detail.component").then((m) => m.UniversityDetailComponent),
  },
]
