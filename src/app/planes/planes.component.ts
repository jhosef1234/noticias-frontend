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
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <!-- Header -->
      <header class="bg-gradient-to-r from-blue-600 to-blue-800 shadow-2xl border-b border-blue-900">
        <div class="w-full px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <button
                routerLink="/noticias"
                class="p-2 bg-white rounded-lg hover:bg-blue-50 transition-colors"
                title="Volver a noticias"
              >
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
              </button>
              <div>
                <h1 class="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  Planes y Suscripciones
                </h1>
                <p class="text-blue-100 text-sm md:text-base mt-1">
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
            <div class="inline-flex items-center px-4 py-2 rounded-full bg-white shadow-lg">
              <span class="text-sm font-medium text-gray-600 mr-2">Plan actual:</span>
              <span 
                class="text-sm font-bold px-3 py-1 rounded-full"
                [class.bg-blue-100]="planActual === 'free'"
                [class.text-blue-800]="planActual === 'free'"
                [class.bg-purple-100]="planActual === 'pro'"
                [class.text-purple-800]="planActual === 'pro'"
              >
                {{ planActual === 'free' ? 'FREE' : 'PRO' }}
              </span>
            </div>
          </div>

          <!-- Planes Grid -->
          <div class="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <!-- Plan Free -->
            <div 
              class="bg-white rounded-2xl shadow-xl border-2 transition-all duration-300"
              [class.border-blue-500]="planActual === 'free'"
              [class.border-gray-200]="planActual !== 'free'"
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
                  <h3 class="text-2xl font-bold text-gray-900 mb-2">Plan Free</h3>
                  <div class="text-4xl font-extrabold text-gray-900 mb-1">
                    $0
                    <span class="text-lg font-normal text-gray-500">/mes</span>
                  </div>
                  <p class="text-gray-600 text-sm">Perfecto para empezar</p>
                </div>

                <!-- Features -->
                <ul class="space-y-4 mb-8">
                  <li class="flex items-start">
                    <svg class="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span class="text-gray-700">Búsqueda de noticias</span>
                  </li>
                  <li class="flex items-start">
                    <svg class="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span class="text-gray-700">Lectura ilimitada de noticias</span>
                  </li>
                  <li class="flex items-start">
                    <svg class="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    <span class="text-gray-500 line-through">Guardar en favoritos</span>
                  </li>
                  <li class="flex items-start">
                    <svg class="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    <span class="text-gray-500 line-through">Historial de lectura</span>
                  </li>
                  <li class="flex items-start">
                    <svg class="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    <span class="text-gray-500 line-through">Filtros avanzados</span>
                  </li>
                </ul>

                <!-- Button -->
                <button
                  *ngIf="planActual === 'free'"
                  disabled
                  class="w-full py-3 px-4 bg-gray-300 text-gray-500 rounded-lg font-semibold cursor-not-allowed"
                >
                  Plan Actual
                </button>
                <button
                  *ngIf="planActual !== 'free'"
                  (click)="cambiarPlan('free')"
                  class="w-full py-3 px-4 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  Cambiar a Free
                </button>
              </div>
            </div>

            <!-- Plan Pro -->
            <div 
              class="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl shadow-2xl border-2 border-purple-500 transition-all duration-300 transform relative overflow-hidden"
              [class.scale-105]="planActual === 'pro'"
            >
              <!-- Badge -->
              <div class="absolute top-0 right-0 bg-yellow-400 text-yellow-900 px-4 py-1 text-xs font-bold rounded-bl-lg">
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
                  <p class="text-purple-100 text-sm">Acceso completo a todas las funciones</p>
                </div>

                <!-- Features -->
                <ul class="space-y-4 mb-8">
                  <li class="flex items-start">
                    <svg class="w-5 h-5 text-yellow-300 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span>Búsqueda de noticias</span>
                  </li>
                  <li class="flex items-start">
                    <svg class="w-5 h-5 text-yellow-300 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span>Lectura ilimitada de noticias</span>
                  </li>
                  <li class="flex items-start">
                    <svg class="w-5 h-5 text-yellow-300 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span>Guardar en favoritos</span>
                  </li>
                  <li class="flex items-start">
                    <svg class="w-5 h-5 text-yellow-300 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span>Historial de lectura</span>
                  </li>
                  <li class="flex items-start">
                    <svg class="w-5 h-5 text-yellow-300 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span>Filtros avanzados</span>
                  </li>
                  <li class="flex items-start">
                    <svg class="w-5 h-5 text-yellow-300 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span>Soporte prioritario</span>
                  </li>
                </ul>

                <!-- Button -->
                <button
                  *ngIf="planActual === 'pro'"
                  disabled
                  class="w-full py-3 px-4 bg-white bg-opacity-20 text-white rounded-lg font-semibold cursor-not-allowed border-2 border-white border-opacity-30"
                >
                  Plan Actual
                </button>
                <button
                  *ngIf="planActual !== 'pro'"
                  (click)="cambiarPlan('pro')"
                  class="w-full py-3 px-4 bg-yellow-400 text-yellow-900 rounded-lg font-semibold hover:bg-yellow-300 transition-colors shadow-lg"
                >
                  Actualizar a Pro
                </button>
              </div>
            </div>
          </div>

          <!-- Info adicional -->
          <div class="mt-12 text-center">
            <p class="text-gray-600 text-sm">
              Todos los planes incluyen acceso completo a las noticias. 
              <a routerLink="/noticias" class="text-blue-600 hover:text-blue-800 font-medium">
                Volver a noticias
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
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
        title: '¿Actualizar a Plan Pro?',
        html: `
          <p class="mb-4">Al actualizar a Plan Pro obtendrás:</p>
          <ul class="text-left list-disc list-inside mb-4 space-y-2">
            <li>Guardar noticias en favoritos</li>
            <li>Historial de lectura</li>
            <li>Filtros avanzados</li>
            <li>Soporte prioritario</li>
          </ul>
          <p class="text-sm text-gray-600 mb-4">Precio: $9.99/mes</p>
          <p class="text-xs text-gray-500">Serás redirigido al formulario de pago.</p>
        `,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Continuar al pago',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#9333ea',
        cancelButtonColor: '#6b7280'
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

