import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { PlanService } from '../../services/plan.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-container min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <!-- Fondo animado con gradientes -->
      <div class="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 40px 40px;"></div>
      </div>
      
      <!-- Círculos decorativos animados -->
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div class="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div class="absolute bottom-1/4 left-1/3 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div class="max-w-md w-full space-y-8 relative z-10">
        <!-- Logo y Título mejorado -->
        <div class="text-center transform transition-all duration-500 hover:scale-105">
          <div class="mx-auto w-24 h-24 bg-gradient-to-br from-white to-blue-50 rounded-3xl flex items-center justify-center shadow-2xl mb-6 transform hover:scale-110 transition-all duration-300 relative overflow-hidden group">
            <div class="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <svg class="w-14 h-14 text-blue-600 relative z-10 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
            </svg>
          </div>
          <h2 class="text-5xl font-black text-white mb-3 drop-shadow-lg bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent animate-fade-in">
            Portal de Noticias
          </h2>
          <p class="text-blue-100 text-xl font-medium tracking-wide">
            Inicia sesión para continuar
          </p>
        </div>

        <!-- Formulario de Login con glassmorphism -->
        <div class="login-card bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 space-y-6 border border-white/20 transform transition-all duration-300 hover:shadow-3xl">
          <!-- Mensaje de Error mejorado -->
          <div *ngIf="errorMessage" class="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 p-4 rounded-xl shadow-lg animate-slide-in">
            <div class="flex items-center">
              <div class="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </div>
              <p class="text-sm font-medium text-red-800">{{ errorMessage }}</p>
            </div>
          </div>

          <!-- Mensaje de Éxito mejorado -->
          <div *ngIf="successMessage" class="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-4 rounded-xl shadow-lg animate-slide-in">
            <div class="flex items-center">
              <div class="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <p class="text-sm font-medium text-green-800">{{ successMessage }}</p>
            </div>
          </div>

          <form (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Email mejorado -->
            <div class="form-group">
              <label for="email" class="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                Correo Electrónico
              </label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  [(ngModel)]="email"
                  name="email"
                  required
                  placeholder="tu@email.com"
                  class="input-field pl-12 block w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white hover:border-gray-300"
                />
              </div>
            </div>

            <!-- Password mejorado -->
            <div class="form-group">
              <label for="password" class="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                Contraseña
              </label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <input
                  id="password"
                  [type]="showPassword ? 'text' : 'password'"
                  [(ngModel)]="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  class="input-field pl-12 pr-12 block w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white hover:border-gray-300"
                />
                <button
                  type="button"
                  (click)="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-4 flex items-center hover:scale-110 transition-transform"
                >
                  <svg *ngIf="!showPassword" class="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  <svg *ngIf="showPassword" class="h-5 w-5 text-blue-600 hover:text-blue-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Recordar y Olvidé contraseña mejorado -->
            <div class="flex items-center justify-between pt-2">
              <div class="flex items-center group cursor-pointer">
                <div class="relative">
                  <input
                    id="remember"
                    type="checkbox"
                    [(ngModel)]="rememberMe"
                    name="remember"
                    class="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer transition-all"
                  />
                </div>
                <label for="remember" class="ml-3 block text-sm font-medium text-gray-700 cursor-pointer group-hover:text-gray-900 transition-colors">
                  Recordarme
                </label>
              </div>

              <a routerLink="/forgot-password" class="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-all hover:underline flex items-center gap-1">
                ¿Olvidaste tu contraseña?
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </a>
            </div>

            <!-- Botón de Login mejorado -->
            <button
              type="submit"
              [disabled]="loading"
              class="login-button w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] relative overflow-hidden group"
            >
              <span class="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
              <svg *ngIf="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white relative z-10" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span class="relative z-10">{{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}</span>
            </button>
          </form>

          <!-- Divider mejorado -->
          <div class="relative pt-4">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t-2 border-gray-200"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-4 bg-white/95 text-gray-500 font-medium">¿No tienes cuenta?</span>
            </div>
          </div>

          <!-- Registro mejorado -->
          <div class="text-center pt-2">
            <a 
              routerLink="/register" 
              class="inline-flex items-center font-bold text-blue-600 hover:text-blue-700 transition-all hover:gap-2 gap-1 text-base group"
            >
              Crear una cuenta nueva
              <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </a>
          </div>
        </div>

        <!-- Footer mejorado -->
        <p class="text-center text-sm text-white/80 font-medium drop-shadow-lg">
          © 2025 Portal de Noticias. Todos los derechos reservados.
        </p>
      </div>
    </div>
  `,
  styles: [`
    @keyframes blob {
      0%, 100% {
        transform: translate(0, 0) scale(1);
      }
      33% {
        transform: translate(30px, -50px) scale(1.1);
      }
      66% {
        transform: translate(-20px, 20px) scale(0.9);
      }
    }

    @keyframes fade-in {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slide-in {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .animate-blob {
      animation: blob 7s infinite;
    }

    .animation-delay-2000 {
      animation-delay: 2s;
    }

    .animation-delay-4000 {
      animation-delay: 4s;
    }

    .animate-fade-in {
      animation: fade-in 0.8s ease-out;
    }

    .animate-slide-in {
      animation: slide-in 0.4s ease-out;
    }

    .login-container {
      position: relative;
    }

    .login-card {
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }

    .input-field:focus {
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .login-button {
      background-size: 200% 200%;
      animation: gradient-shift 3s ease infinite;
    }

    @keyframes gradient-shift {
      0%, 100% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
    }

    .form-group {
      transition: all 0.3s ease;
    }

    .form-group:focus-within {
      transform: translateY(-2px);
    }
  `]
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  showPassword: boolean = false;
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly planService: PlanService
  ) {}

  async onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, completa todos los campos';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const result = await this.authService.signIn(this.email, this.password);

    this.loading = false;

    if (result.success) {
      // Asegurar que el usuario tenga un plan asignado (Free por defecto si no tiene)
      if (!this.planService.getPlan()) {
        this.planService.setPlan('free');
      }
      this.successMessage = '¡Inicio de sesión exitoso! Redirigiendo...';
      setTimeout(() => {
        this.router.navigate(['/noticias']);
      }, 1000);
    } else {
      this.errorMessage = result.error || 'Error al iniciar sesión. Verifica tus credenciales.';
    }
  }
}