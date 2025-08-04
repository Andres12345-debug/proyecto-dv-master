import { Routes } from "@angular/router"

export const authRoutes: Routes = [
  {
    path: "home",
    loadComponent: () => import("./home/home.component").then((m) => m.HomeComponent),
  },
  {
    path: "login",
    loadComponent: () => import("./login/login.component").then((m) => m.LoginComponent),
  },
  {
    path: "register",
    loadComponent: () => import("./register/register.component").then((m) => m.RegisterComponent),
  },
  {
    path: "",
    redirectTo: "home",
    pathMatch: "full",
  },
]
