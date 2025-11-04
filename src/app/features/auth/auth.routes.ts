// auth routes
import { Routes } from "@angular/router";

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

  // 🔽 NUEVOS
  {
    path: "forgot",
    loadComponent: () => import("./forgot/forgot-password.component").then(m => m.ForgotPasswordComponent),
  },
  {
    path: "verify-otp",
    loadComponent: () => import("./verify-otp/verify-otp.component").then(m => m.VerifyOtpComponent),
  },
  {
    path: "reset-password",
    loadComponent: () => import("./reset-password/reset-password.component").then(m => m.ResetPasswordComponent),
  },

  {
    path: "",
    redirectTo: "home",
    pathMatch: "full",
  },
];
