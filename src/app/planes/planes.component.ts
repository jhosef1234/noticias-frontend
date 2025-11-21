import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PlanService, PlanType } from '../services/plan.service';
import { AuthService } from '../auth/auth.service';
import { PaymentService } from '../services/payment.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-planes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50/30 to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <!-- Header -->
      <header class="bg-gradient-to-r from-slate-700 via-blue-700 to-teal-600 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 shadow-2xl border-b-4 border-slate-500/50 dark:border-gray-700 relative z-50">
        <!-- Efecto de brillo animado en el header -->
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer overflow-hidden"></div>
        <div class="w-full px-4 sm:px-6 lg:px-8 py-4 md:py-5 relative">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <button
                routerLink="/noticias"
                class="p-2 bg-white/95 dark:bg-gray-700/95 backdrop-blur-sm rounded-xl hover:bg-white dark:hover:bg-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                title="Volver a noticias"
              >
                <svg class="w-6 h-6 text-slate-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
              </button>
              <div>
                <h1 class="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-lg bg-gradient-to-r from-white via-slate-100 to-blue-100 bg-clip-text text-transparent">
                  Planes y Suscripciones
                </h1>
                <p class="text-blue-100 dark:text-blue-200 text-sm md:text-base mt-1 font-semibold drop-shadow-md">
                  Elige el plan que mejor se adapte a tus necesidades
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div class="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div class="max-w-6xl mx-auto">
          <!-- Plan Actual -->
          <div class="mb-8 text-center">
            <div class="inline-flex items-center px-4 py-2 rounded-full bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
              <span class="text-sm font-medium text-gray-600 dark:text-gray-300 mr-2">Plan actual:</span>
              <span 
                class="text-sm font-bold px-3 py-1 rounded-full"
                [class.bg-blue-100]="planActual === 'free'"
                [class.dark:bg-blue-900/30]="planActual === 'free'"
                [class.text-blue-800]="planActual === 'free'"
                [class.dark:text-blue-200]="planActual === 'free'"
                [class.bg-slate-100]="planActual === 'pro'"
                [class.dark:bg-slate-800/50]="planActual === 'pro'"
                [class.text-slate-800]="planActual === 'pro'"
                [class.dark:text-slate-200]="planActual === 'pro'"
              >
                {{ planActual === 'free' ? 'FREE' : 'PRO' }}
              </span>
            </div>
          </div>

          <!-- Planes Grid -->
          <div class="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <!-- Plan Free -->
            <div 
              class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-gray-900/50 border-2 transition-all duration-300"
              [class.border-slate-500]="planActual === 'free'"
              [class.border-gray-200]="planActual !== 'free'"
              [class.dark:border-gray-700]="planActual !== 'free'"
              [class.transform]="planActual === 'free'"
              [class.scale-105]="planActual === 'free'"
            >
              <div class="p-8">
                <!-- Header -->
                <div class="text-center mb-8">
                  <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                    </svg>
                  </div>
                  <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Plan Free</h3>
                  <div class="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-1">
                    $0
                    <span class="text-lg font-normal text-gray-500 dark:text-gray-400">/mes</span>
                  </div>
                  <p class="text-gray-600 dark:text-gray-400 text-sm">Perfecto para empezar</p>
                </div>

                <!-- Features -->
                <ul class="space-y-4 mb-8">
                  <li class="flex items-start">
                    <svg class="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span class="text-gray-700 dark:text-gray-300">Búsqueda de noticias</span>
                  </li>
                  <li class="flex items-start">
                    <svg class="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span class="text-gray-700 dark:text-gray-300">Lectura ilimitada de noticias</span>
                  </li>
                  <li class="flex items-start">
                    <svg class="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    <span class="text-gray-500 dark:text-gray-500 line-through">Guardar en favoritos</span>
                  </li>
                  <li class="flex items-start">
                    <svg class="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    <span class="text-gray-500 dark:text-gray-500 line-through">Historial de lectura</span>
                  </li>
                  <li class="flex items-start">
                    <svg class="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    <span class="text-gray-500 dark:text-gray-500 line-through">Filtros avanzados</span>
                  </li>
                </ul>

                <!-- Button -->
                <button
                  *ngIf="planActual === 'free'"
                  disabled
                  class="w-full py-3 px-4 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-xl font-bold cursor-not-allowed shadow-lg"
                >
                  Plan Actual
                </button>
                <button
                  *ngIf="planActual !== 'free'"
                  (click)="cambiarPlan('free')"
                  class="w-full py-3 px-4 bg-gradient-to-r from-gray-600 to-gray-700 dark:from-gray-700 dark:to-gray-800 text-white rounded-xl font-bold hover:from-gray-700 hover:to-gray-800 dark:hover:from-gray-600 dark:hover:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
                >
                  Cambiar a Free
                </button>
              </div>
            </div>

            <!-- Plan Pro -->
            <div 
              class="bg-gradient-to-br from-slate-600 via-blue-600 to-teal-600 rounded-2xl shadow-2xl border-2 border-slate-500 dark:border-slate-400 transition-all duration-300 transform relative overflow-hidden"
              [class.scale-105]="planActual === 'pro'"
            >
              <!-- Badge -->
              <div class="absolute top-0 right-0 bg-yellow-400 text-yellow-900 px-4 py-1 text-xs font-bold rounded-bl-lg shadow-lg">
                RECOMENDADO
              </div>
              
              <div class="p-8 text-white">
                <!-- Header -->
                <div class="text-center mb-8">
                  <div class="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-4">
                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                    </svg>
                  </div>
                  <h3 class="text-2xl font-bold mb-2">Plan Pro</h3>
                  <div class="text-4xl font-extrabold mb-1">
                    $9.99
                    <span class="text-lg font-normal opacity-80">/mes</span>
                  </div>
                  <p class="text-white/90 text-sm">Acceso completo a todas las funciones</p>
                </div>

                <!-- Features -->
                <ul class="space-y-4 mb-8">
                  <li class="flex items-start">
                    <svg class="w-5 h-5 text-yellow-300 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span class="text-white">Búsqueda de noticias</span>
                  </li>
                  <li class="flex items-start">
                    <svg class="w-5 h-5 text-yellow-300 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span class="text-white">Lectura ilimitada de noticias</span>
                  </li>
                  <li class="flex items-start">
                    <svg class="w-5 h-5 text-yellow-300 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span class="text-white">Guardar en favoritos</span>
                  </li>
                  <li class="flex items-start">
                    <svg class="w-5 h-5 text-yellow-300 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span class="text-white">Historial de lectura</span>
                  </li>
                  <li class="flex items-start">
                    <svg class="w-5 h-5 text-yellow-300 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span class="text-white">Filtros avanzados</span>
                  </li>
                  <li class="flex items-start">
                    <svg class="w-5 h-5 text-yellow-300 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span class="text-white">Soporte prioritario</span>
                  </li>
                </ul>

                <!-- Button -->
                <button
                  *ngIf="planActual === 'pro'"
                  disabled
                  class="w-full py-3 px-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-bold cursor-not-allowed border-2 border-white/30 shadow-lg"
                >
                  Plan Actual
                </button>
                <button
                  *ngIf="planActual !== 'pro'"
                  (click)="cambiarPlan('pro')"
                  class="w-full py-3 px-4 bg-yellow-400 text-yellow-900 rounded-xl font-bold hover:bg-yellow-300 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform"
                >
                  Actualizar a Pro
                </button>
              </div>
            </div>
          </div>

          <!-- Info adicional -->
          <div class="mt-12 text-center">
            <p class="text-gray-600 dark:text-gray-400 text-sm">
              Todos los planes incluyen acceso completo a las noticias. 
              <a routerLink="/noticias" class="text-slate-600 dark:text-teal-400 hover:text-slate-800 dark:hover:text-teal-300 font-medium transition-colors">
                Volver a noticias
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Estilos personalizados para SweetAlert2 */
    :host ::ng-deep .swal2-popup-custom {
      border-radius: 20px !important;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15) !important;
    }

    :host ::ng-deep .swal2-title-custom {
      padding: 0 !important;
      margin: 0 !important;
    }

    :host ::ng-deep .swal2-html-container-custom {
      margin: 0 !important;
      padding: 0 !important;
    }

    @keyframes shimmer {
      0% {
        transform: translateX(-100%) translateY(0) rotate(-12deg);
      }
      100% {
        transform: translateX(200%) translateY(0) rotate(-12deg);
      }
    }

    .animate-shimmer {
      animation: shimmer 3s infinite;
    }

    :host ::ng-deep .swal2-confirm-custom {
      background: linear-gradient(135deg, #475569 0%, #1e40af 100%) !important;
      border: none !important;
      border-radius: 12px !important;
      padding: 14px 32px !important;
      font-size: 16px !important;
      font-weight: 600 !important;
      box-shadow: 0 4px 15px rgba(71, 85, 105, 0.4) !important;
      transition: all 0.3s ease !important;
    }

    :host ::ng-deep .swal2-confirm-custom:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 6px 20px rgba(30, 64, 175, 0.5) !important;
    }

    :host ::ng-deep .swal2-cancel-custom {
      background: #f1f5f9 !important;
      color: #64748b !important;
      border: 2px solid #e2e8f0 !important;
      border-radius: 12px !important;
      padding: 14px 32px !important;
      font-size: 16px !important;
      font-weight: 600 !important;
      transition: all 0.3s ease !important;
    }

    :host ::ng-deep .swal2-cancel-custom:hover {
      background: #e2e8f0 !important;
      border-color: #cbd5e0 !important;
      transform: translateY(-2px) !important;
    }
  `]
})
export class PlanesComponent implements OnInit {
  planActual: PlanType = 'free';
  estaAutenticado: boolean = false;

  constructor(
    private planService: PlanService,
    private authService: AuthService,
    private router: Router,
    private paymentService: PaymentService
  ) {}

  ngOnInit() {
    this.planActual = this.planService.getPlan();
    this.estaAutenticado = this.authService.isAuthenticated();
    
    // Si no está autenticado, redirigir al login
    if (!this.estaAutenticado) {
      this.router.navigate(['/login']);
    }
  }

  async cambiarPlan(plan: PlanType) {
    if (plan === 'pro') {
      // Verificar si ya tiene una solicitud pendiente
      const currentUser = this.authService.currentUserValue;
      if (currentUser?.email) {
        const status = await this.paymentService.checkPaymentStatus(currentUser.email);
        if (status === 'pending') {
          await Swal.fire({
            title: 'Solicitud pendiente',
            html: `
              <p class="mb-4">Ya tienes una solicitud de pago pendiente de confirmación.</p>
              <p class="text-sm text-gray-600">El administrador revisará tu solicitud y te notificará cuando sea aprobada.</p>
            `,
            icon: 'info',
            confirmButtonText: 'Ver estado',
            confirmButtonColor: '#9333ea',
            showCancelButton: true,
            cancelButtonText: 'Cancelar'
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigate(['/payment']);
            }
          });
          return;
        }
      }

      Swal.fire({
        title: '<div style="font-size: 28px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">✨ ¿Actualizar a Plan Pro?</div>',
        html: `
          <div style="text-align: center; padding: 20px 0;">
            <div style="background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px rgba(147, 51, 234, 0.3);">
              <svg style="width: 45px; height: 45px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
              </svg>
            </div>
            <p style="font-size: 18px; color: #475569; margin-bottom: 24px; font-weight: 500;">
              Al actualizar a <span style="color: #9333ea; font-weight: 600;">Plan Pro</span> obtendrás:
            </p>
            <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 16px; padding: 24px; margin: 20px 0; border: 2px solid #e2e8f0;">
              <div style="text-align: left; space-y: 12px;">
                <div style="display: flex; align-items: center; margin-bottom: 12px; padding: 10px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                  <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;">
                    <svg style="width: 18px; height: 18px; color: white;" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                  <span style="font-size: 15px; color: #334155; font-weight: 500;">Guardar noticias en favoritos</span>
                </div>
                <div style="display: flex; align-items: center; margin-bottom: 12px; padding: 10px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                  <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;">
                    <svg style="width: 18px; height: 18px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <span style="font-size: 15px; color: #334155; font-weight: 500;">Historial de lectura</span>
                </div>
                <div style="display: flex; align-items: center; margin-bottom: 12px; padding: 10px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                  <div style="background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%); width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;">
                    <svg style="width: 18px; height: 18px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
                    </svg>
                  </div>
                  <span style="font-size: 15px; color: #334155; font-weight: 500;">Filtros avanzados</span>
                </div>
                <div style="display: flex; align-items: center; padding: 10px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;">
                    <svg style="width: 18px; height: 18px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/>
                    </svg>
                  </div>
                  <span style="font-size: 15px; color: #334155; font-weight: 500;">Soporte prioritario</span>
                </div>
              </div>
            </div>
            <div style="background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%); border-radius: 12px; padding: 16px; margin: 20px 0; box-shadow: 0 4px 15px rgba(147, 51, 234, 0.2);">
              <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                <span style="font-size: 32px; font-weight: 700; color: white;">$9.99</span>
                <span style="font-size: 16px; color: rgba(255,255,255,0.9);">/mes</span>
              </div>
            </div>
            <p style="font-size: 13px; color: #64748b; margin-top: 16px; font-style: italic; display: flex; align-items: center; justify-content: center; gap: 6px;">
              <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Serás redirigido al formulario de pago
            </p>
          </div>
        `,
        icon: undefined,
        showCancelButton: true,
        confirmButtonText: '<div style="display: flex; align-items: center; gap: 8px;"><svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg> Continuar al pago</div>',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#9333ea',
        cancelButtonColor: '#64748b',
        width: '600px',
        padding: '2rem',
        customClass: {
          popup: 'swal2-popup-custom',
          title: 'swal2-title-custom',
          htmlContainer: 'swal2-html-container-custom',
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom'
        },
        buttonsStyling: true,
        backdrop: true,
        allowOutsideClick: true,
        allowEscapeKey: true
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/payment']);
        }
      });
    } else {
      Swal.fire({
        title: '¿Cambiar a Plan Free?',
        text: 'Perderás acceso a favoritos, historial y filtros avanzados.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cambiar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280'
      }).then((result) => {
        if (result.isConfirmed) {
          this.planService.downgradeToFree();
          this.planActual = 'free';
          Swal.fire({
            title: 'Plan cambiado',
            text: 'Has cambiado al Plan Free.',
            icon: 'info',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#2563eb'
          });
        }
      });
    }
  }
}

