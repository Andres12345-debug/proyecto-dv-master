import { Routes } from "@angular/router";

export const userManualRoutes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./userManual.component").then(m => m.UserManualComponent),
  },
];
