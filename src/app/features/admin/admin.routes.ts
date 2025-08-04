import { Routes } from "@angular/router"

export const adminRoutes: Routes = [
  {
    path: "",
    loadComponent: () => import("./admin-dashboard/admin-dashboard.component").then((m) => m.AdminDashboardComponent),
  },
  {
    path: "users",
    loadComponent: () => import("./user-management/user-management.component").then((m) => m.UserManagementComponent),
  },
  {
    path: "universities",
    loadComponent: () =>
      import("./university-management/university-management.component").then((m) => m.UniversityManagementComponent),
  },
  {
    path: "questions",
    loadComponent: () =>
      import("./question-management/question-management.component").then((m) => m.QuestionManagementComponent),
  },
]
