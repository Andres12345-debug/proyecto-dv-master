import type { Routes } from "@angular/router"
import { AuthGuard } from "./core/guards/auth.guard"
import { AdminGuard } from "./core/guards/admin.guard"

export const routes: Routes = [
  {
    path: "",
    redirectTo: "/dashboard",
    pathMatch: "full",
  },
  {
    path: "auth",
    loadChildren: () => import("./features/auth/auth.routes").then((m) => m.authRoutes),
  },
  {
    path: "dashboard",
    loadComponent: () => import("./features/dashboard/dashboard.component").then((m) => m.DashboardComponent),
    canActivate: [AuthGuard],
  },
  {
    path: "test",
    loadChildren: () => import("./features/tests/test.routes").then((m) => m.testRoutes),
    canActivate: [AuthGuard],
  },
  {
    path: "universities",
    loadChildren: () => import("./features/universities/universities.routes").then((m) => m.universitiesRoutes),
    canActivate: [AuthGuard],
  },
  {
    path: "profile",
    loadComponent: () => import("./features/profile/profile.component").then((m) => m.ProfileComponent),
    canActivate: [AuthGuard],
  },
  {
    path: "admin",
    loadChildren: () => import("./features/admin/admin.routes").then((m) => m.adminRoutes),
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: "careers",
    loadChildren: () => import("./features/careers/careers.routes").then((m) => m.careersRoutes),
    canActivate: [AuthGuard],
  },
  {
    path: "**",
    loadComponent: () => import("./shared/components/not-found/not-found.component").then((m) => m.NotFoundComponent),
  },
]
