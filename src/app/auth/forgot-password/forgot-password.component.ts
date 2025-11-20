import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <!-- Logo y Título -->
        <div class="text-center">
          <div class="mx-auto w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl mb-6 transform hover:scale-105 transition-transform">
            <svg class="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
            </svg>
          </div>
          <h2 class="text-4xl font-extrabold text-white mb-2">
            Recuperar Contraseña
          </h2>
          <p class="text-blue-100 text-lg">
            Ingresa tu correo electrónico para recuperar tu contraseña
          </p>
        </div>

        <!-- Formulario -->
        <div class="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          <!-- Mensaje de Error -->
          <div *ngIf="errorMessage" class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="text-sm text-red-700">{{ errorMessage }}</p>
            </div>
          </div>

          <!-- Mensaje de Éxito -->
          <div *ngIf="successMessage" class="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <p class="text-sm text-green-700">{{ successMessage }}</p>
            </div>
          </div>

          <form (ngSubmit)="onSubmit()" class="space-y-5">
            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  [(ngModel)]="email"
                  name="email"
                  required
                  placeholder="tu@email.com"
                  class="pl-10 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  [disabled]="loading"
                />
              </div>
              <p class="mt-2 text-sm text-gray-500">
                Te enviaremos un enlace para restablecer tu contraseña a este correo electrónico.
              </p>
            </div>

            <!-- Botón de Enviar -->
            <button
              type="submit"
              [disabled]="loading || !email"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
            >
              <svg *ngIf="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? 'Enviando...' : 'Enviar enlace de recuperación' }}
            </button>
          </form>

          <!-- Divider -->
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">¿Recordaste tu contraseña?</span>
            </div>
          </div>

          <!-- Volver al Login -->
          <div class="text-center">
            <a 
              routerLink="/login" 
              class="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Volver al inicio de sesión
            </a>
          </div>
        </div>

        <!-- Footer -->
        <p class="text-center text-sm text-blue-100">
          © 2025 Portal de Noticias. Todos los derechos reservados.
        </p>
      </div>
    </div>
  `,
  styles: []
})
export class ForgotPasswordComponent {
  email: string = '';
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onSubmit() {
    if (!this.email || !this.email.trim()) {
      this.errorMessage = 'Por favor, ingresa tu correo electrónico';
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Por favor, ingresa un correo electrónico válido';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const result = await this.authService.resetPassword(this.email.trim());

    this.loading = false;

    if (result.success) {
      const emailEnviado = this.email.trim();
      this.successMessage = '¡Enlace enviado! Revisa tu correo electrónico para restablecer tu contraseña.';
      
      // Mostrar mensaje de confirmación con SweetAlert
      await Swal.fire({
        title: '¡Enlace enviado!',
        html: `
          <p class="mb-4">Hemos enviado un enlace de recuperación a:</p>
          <p class="font-semibold text-blue-600">${emailEnviado}</p>
          <p class="mt-4 text-sm text-gray-600">Por favor, revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.</p>
          <p class="mt-2 text-xs text-gray-500">Si no encuentras el correo, revisa tu carpeta de spam.</p>
        `,
        icon: 'success',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#2563eb',
        width: '500px'
      });

      // Limpiar el email después de mostrar el mensaje
      this.email = '';
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 3000);
    } else {
      this.errorMessage = result.error || 'Error al enviar el enlace de recuperación. Por favor, inténtalo nuevamente.';
    }
  }
}

