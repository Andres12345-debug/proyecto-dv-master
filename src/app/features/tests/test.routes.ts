import type { Routes } from "@angular/router"

export const testRoutes: Routes = [
  {
    path: "",
    loadComponent: () => import("./test-start/test-start.component").then((m) => m.TestStartComponent),
  },
  {
    path: "questions",
    loadComponent: () => import("./test-questions/test-questions.component").then((m) => m.TestQuestionsComponent),
  },
  {
    path: "results/:testId", // Cambia aquí
    loadComponent: () => import("./test-results/test-results.component").then((m) => m.TestResultsComponent),
  },
]
