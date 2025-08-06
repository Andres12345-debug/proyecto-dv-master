import { Routes } from "@angular/router"

export const careersRoutes: Routes = [
  {
    path: "",
    loadComponent: () => import("./career-list/career-list.component").then((m) => m.CareerListComponent),
  },
  {
    path: ":id",
    loadComponent: () =>
      import("./career-detail/career-detail.component").then((m) => m.CareerDetailComponent),
  },
]