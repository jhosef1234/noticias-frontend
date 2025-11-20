import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PaymentService } from '../services/payment.service';
import { PlanService } from '../services/plan.service';
import { AuthService } from '../auth/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <!-- Header -->
      <header class="bg-gradient-to-r from-purple-600 to-purple-800 shadow-2xl border-b border-purple-900">
        <div class="w-full px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <button
                routerLink="/planes"
                class="p-2 bg-white rounded-lg hover:bg-purple-50 transition-colors"
                title="Volver a planes"
              >
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
              </button>
              <div>
                <h1 class="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  Pago - Plan Pro
                </h1>
                <p class="text-purple-100 text-sm md:text-base mt-1">
                  Completa el formulario para procesar tu pago
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div class="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div class="max-w-4xl mx-auto">
          <div class="grid md:grid-cols-2 gap-8">
            <!-- Formulario de Pago -->
            <div class="bg-white rounded-2xl shadow-xl p-8">
              <h2 class="text-2xl font-bold text-gray-900 mb-6">Información de Pago</h2>
              
              <form (ngSubmit)="onSubmit()" class="space-y-6">
                <!-- Nombre -->
                <div>
                  <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    id="name"
                    type="text"
                    [(ngModel)]="formData.name"
                    name="name"
                    required
                    placeholder="Juan Pérez"
                    class="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>

                <!-- Teléfono -->
                <div>
                  <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
                    Número de Celular *
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    [(ngModel)]="formData.phone"
                    name="phone"
                    required
                    placeholder="987654321"
                    pattern="[0-9]{9}"
                    class="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  <p class="mt-1 text-xs text-gray-500">Ingresa tu número de celular (9 dígitos)</p>
                </div>

                <!-- Email -->
                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico *
                  </label>
                  <input
                    id="email"
                    type="email"
                    [(ngModel)]="formData.email"
                    name="email"
                    required
                    placeholder="tu@email.com"
                    class="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>

                <!-- Fecha del Pago -->
                <div>
                  <label for="paymentDate" class="block text-sm font-medium text-gray-700 mb-2">
                    Fecha del Pago *
                  </label>
                  <input
                    id="paymentDate"
                    type="date"
                    [(ngModel)]="formData.paymentDate"
                    name="paymentDate"
                    required
                    [max]="todayDate"
                    class="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  <p class="mt-1 text-xs text-gray-500">Selecciona la fecha en que realizaste el pago</p>
                </div>

                <!-- Hora del Pago -->
                <div>
                  <label for="paymentTime" class="block text-sm font-medium text-gray-700 mb-2">
                    Hora del Pago *
                  </label>
                  <input
                    id="paymentTime"
                    type="time"
                    [(ngModel)]="formData.paymentTime"
                    name="paymentTime"
                    required
                    class="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  <p class="mt-1 text-xs text-gray-500">Indica la hora aproximada en que realizaste el pago</p>
                </div>

                <!-- Plan Info -->
                <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-gray-700">Plan Pro</span>
                    <span class="text-lg font-bold text-purple-600">$9.99/mes</span>
                  </div>
                </div>

                <!-- Botón Enviar -->
                <button
                  type="submit"
                  [disabled]="loading"
                  class="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  <svg *ngIf="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ loading ? 'Enviando...' : 'Enviar Notificación de Pago' }}
                </button>
              </form>
            </div>

            <!-- QR Code y Instrucciones -->
            <div class="space-y-6">
              <!-- QR Code -->
              <div class="bg-white rounded-2xl shadow-xl p-8 text-center">
                <h3 class="text-xl font-bold text-gray-900 mb-4">Pago con Yape</h3>
                <div class="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block mb-4">
                  <div class="w-48 h-48 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                    <div class="text-center text-white">
                      <svg class="w-32 h-32 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      <p class="text-xs font-semibold">QR CODE</p>
                    </div>
                  </div>
                </div>
                <p class="text-sm text-gray-600 mb-2">
                  Escanea este código QR con Yape
                </p>
                <p class="text-xs text-gray-500">
                  O transfiere a: <strong>987654321</strong>
                </p>
                <p class="text-lg font-bold text-green-600 mt-4">
                  $9.99
                </p>
              </div>

              <!-- Instrucciones -->
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 class="text-sm font-bold text-blue-900 mb-3 flex items-center">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Instrucciones
                </h4>
                <ol class="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                  <li>Realiza el pago de $9.99 usando Yape</li>
                  <li>Completa el formulario con tus datos</li>
                  <li>Haz clic en "Enviar Notificación de Pago"</li>
                  <li>Espera la confirmación del administrador</li>
                  <li>Recibirás un email cuando tu pago sea aprobado</li>
                </ol>
              </div>

              <!-- Estado del Pago -->
              <div *ngIf="paymentStatus" class="bg-white rounded-lg shadow-md p-6">
                <h4 class="text-sm font-bold text-gray-900 mb-3">Estado de tu Solicitud</h4>
                <div [class.bg-yellow-50]="paymentStatus === 'pending'" 
                     [class.bg-green-50]="paymentStatus === 'approved'"
                     [class.bg-red-50]="paymentStatus === 'rejected'"
                     [class.bg-orange-50]="paymentStatus === 'revoked'"
                     class="p-4 rounded-lg border-2"
                     [class.border-yellow-300]="paymentStatus === 'pending'"
                     [class.border-green-300]="paymentStatus === 'approved'"
                     [class.border-red-300]="paymentStatus === 'rejected'"
                     [class.border-orange-300]="paymentStatus === 'revoked'">
                  <div class="flex items-center">
                    <svg *ngIf="paymentStatus === 'pending'" class="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <svg *ngIf="paymentStatus === 'approved'" class="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <svg *ngIf="paymentStatus === 'rejected'" class="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    <svg *ngIf="paymentStatus === 'revoked'" class="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                    </svg>
                    <span [class.text-yellow-800]="paymentStatus === 'pending'"
                          [class.text-green-800]="paymentStatus === 'approved'"
                          [class.text-red-800]="paymentStatus === 'rejected'"
                          [class.text-orange-800]="paymentStatus === 'revoked'"
                          class="text-sm font-medium">
                      {{ paymentStatus === 'pending' ? 'Pendiente de confirmación' : 
                         paymentStatus === 'approved' ? 'Pago aprobado' : 
                         paymentStatus === 'rejected' ? 'Pago rechazado' :
                         'Pago revocado' }}
                    </span>
                  </div>
                  <p *ngIf="paymentStatus === 'revoked'" class="text-xs text-orange-700 mt-2">
                    Tu Plan Pro ha expirado (se agotó el mes de suscripción). Puedes renovar tu suscripción realizando un nuevo pago.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Estilos personalizados para SweetAlert2 - Mensaje de éxito */
    :host ::ng-deep .swal2-popup-success-custom {
      border-radius: 24px !important;
      box-shadow: 0 25px 70px rgba(16, 185, 129, 0.25) !important;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%) !important;
      backdrop-filter: blur(20px) !important;
      border: 1px solid rgba(16, 185, 129, 0.1) !important;
    }

    :host ::ng-deep .swal2-title-custom {
      padding: 0 !important;
      margin: 0 !important;
    }

    :host ::ng-deep .swal2-html-container-custom {
      margin: 0 !important;
      padding: 0 !important;
    }

    :host ::ng-deep .swal2-confirm-success-custom {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
      border: none !important;
      border-radius: 14px !important;
      padding: 16px 40px !important;
      font-size: 17px !important;
      font-weight: 600 !important;
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4) !important;
      transition: all 0.3s ease !important;
      text-transform: none !important;
    }

    :host ::ng-deep .swal2-confirm-success-custom:hover {
      transform: translateY(-3px) !important;
      box-shadow: 0 8px 25px rgba(16, 185, 129, 0.5) !important;
      background: linear-gradient(135deg, #059669 0%, #047857 100%) !important;
    }

    :host ::ng-deep .swal2-confirm-success-custom:active {
      transform: translateY(-1px) !important;
    }
  `]
})
export class PaymentComponent implements OnInit {
  formData = {
    name: '',
    phone: '',
    email: '',
    paymentDate: '',
    paymentTime: ''
  };
  loading = false;
  paymentStatus: 'pending' | 'approved' | 'rejected' | 'revoked' | null = null;
  todayDate: string = '';

  constructor(
    private readonly paymentService: PaymentService,
    private readonly planService: PlanService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  async ngOnInit() {
    // Verificar si el usuario está autenticado
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    // Obtener email del usuario actual
    const currentUser = this.authService.currentUserValue;
    if (currentUser?.email) {
      this.formData.email = currentUser.email;
    }

    // Establecer fecha de hoy como máximo
    const today = new Date();
    this.todayDate = today.toISOString().split('T')[0];
    
    // Establecer fecha de hoy por defecto
    if (!this.formData.paymentDate) {
      this.formData.paymentDate = this.todayDate;
    }

    // Verificar si hay una solicitud de pago pendiente
    await this.checkPaymentStatus();
  }

  async checkPaymentStatus() {
    if (this.formData.email) {
      // Verificar y revocar planes expirados primero
      await this.paymentService.checkAndRevokeExpiredPayments();
      
      // Obtener todas las solicitudes del usuario
      const allRequests = await this.paymentService.getAllPaymentRequests();
      const userRequests = allRequests.filter(r => r.user_email === this.formData.email);
      
      if (userRequests.length > 0) {
        // Ordenar por fecha de creación (más reciente primero)
        userRequests.sort((a, b) => 
          new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
        );
        
        // Obtener el estado de la solicitud más reciente
        const latestRequest = userRequests[0];
        this.paymentStatus = latestRequest.status as 'pending' | 'approved' | 'rejected' | 'revoked';
        
        // Si está aprobado, verificar si ha expirado
        if (this.paymentStatus === 'approved' && latestRequest.approved_at) {
          const isExpired = this.paymentService.isPaymentExpired(latestRequest.approved_at);
          if (isExpired) {
            // Si expiró, actualizar el estado a revocado
            if (latestRequest.id) {
              await this.paymentService.updatePaymentRequestStatus(latestRequest.id, 'revoked');
              this.paymentStatus = 'revoked';
              this.planService.revokeProPlan(this.formData.email);
            }
          } else {
            // Verificar si el usuario tiene plan Pro asignado
            if (this.planService.hasProPlan(this.formData.email)) {
              this.planService.upgradeToPro();
              // Redirigir después de un momento
              setTimeout(() => {
                Swal.fire({
                  title: '¡Pago confirmado!',
                  text: 'Tu plan ha sido actualizado a Pro. Disfruta de todas las funciones.',
                  icon: 'success',
                  confirmButtonText: 'Ir a noticias',
                  confirmButtonColor: '#9333ea'
                }).then(() => {
                  this.router.navigate(['/noticias']);
                });
              }, 1000);
            }
          }
        } else if (this.paymentStatus === 'revoked') {
          // Si fue revocado, asegurarse de que el plan esté en Free
          this.planService.revokeProPlan(this.formData.email);
        }
      }
    }
  }

  async onSubmit() {
    if (!this.formData.name || !this.formData.phone || !this.formData.email || !this.formData.paymentDate || !this.formData.paymentTime) {
      Swal.fire({
        title: 'Campos incompletos',
        text: 'Por favor, completa todos los campos, incluyendo fecha y hora del pago.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#9333ea'
      });
      return;
    }

    // Validar formato de teléfono
    if (!/^[0-9]{9}$/.test(this.formData.phone)) {
      Swal.fire({
        title: 'Teléfono inválido',
        text: 'Por favor, ingresa un número de celular válido (9 dígitos).',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#9333ea'
      });
      return;
    }

    // Validar que la fecha no sea futura
    const paymentDate = new Date(this.formData.paymentDate + 'T' + this.formData.paymentTime);
    const now = new Date();
    if (paymentDate > now) {
      Swal.fire({
        title: 'Fecha inválida',
        text: 'La fecha y hora del pago no puede ser futura.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#9333ea'
      });
      return;
    }

    this.loading = true;

    const result = await this.paymentService.createPaymentRequest({
      user_email: this.formData.email,
      user_name: this.formData.name,
      user_phone: this.formData.phone,
      payment_date: this.formData.paymentDate,
      payment_time: this.formData.paymentTime,
      plan: 'pro'
    });

    this.loading = false;

    if (result.success) {
      this.paymentStatus = 'pending';
      await Swal.fire({
        title: '<div style="font-size: 28px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">🎉 ¡Solicitud Enviada!</div>',
        html: `
          <div style="text-align: center; padding: 20px 0;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); width: 100px; height: 100px; border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; box-shadow: 0 15px 35px rgba(16, 185, 129, 0.4); position: relative; animation: pulse 2s infinite;">
              <div style="background: rgba(255, 255, 255, 0.2); width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                <svg style="width: 50px; height: 50px; color: white; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
            </div>
            <p style="font-size: 20px; color: #1e293b; margin-bottom: 20px; font-weight: 600;">
              Tu solicitud de pago ha sido enviada correctamente
            </p>
            <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%); border-radius: 16px; padding: 24px; margin: 24px 0; border: 2px solid rgba(16, 185, 129, 0.2); backdrop-filter: blur(10px);">
              <div style="display: flex; align-items: flex-start; margin-bottom: 16px; padding: 12px; background: rgba(255, 255, 255, 0.6); border-radius: 12px; backdrop-filter: blur(5px);">
                <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);">
                  <svg style="width: 20px; height: 20px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <div style="flex: 1; text-align: left;">
                  <p style="font-size: 15px; color: #334155; font-weight: 500; margin: 0; line-height: 1.5;">
                    Se ha enviado una notificación al administrador para que confirme tu pago.
                  </p>
                </div>
              </div>
              <div style="display: flex; align-items: flex-start; padding: 12px; background: rgba(255, 255, 255, 0.6); border-radius: 12px; backdrop-filter: blur(5px);">
                <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0; box-shadow: 0 4px 10px rgba(139, 92, 246, 0.3);">
                  <svg style="width: 20px; height: 20px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div style="flex: 1; text-align: left;">
                  <p style="font-size: 15px; color: #334155; font-weight: 500; margin: 0; line-height: 1.5;">
                    Recibirás un email cuando tu pago sea confirmado y tu plan sea actualizado a <span style="color: #9333ea; font-weight: 600;">Pro</span>.
                  </p>
                </div>
              </div>
            </div>
            <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%); border-radius: 12px; padding: 16px; margin-top: 20px; border: 1px dashed rgba(16, 185, 129, 0.3);">
              <p style="font-size: 13px; color: #64748b; margin: 0; display: flex; align-items: center; justify-content: center; gap: 8px;">
                <svg style="width: 18px; height: 18px; color: #10b981;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>Tu solicitud está siendo procesada</span>
              </p>
            </div>
          </div>
          <style>
            @keyframes pulse {
              0%, 100% {
                transform: scale(1);
                box-shadow: 0 15px 35px rgba(16, 185, 129, 0.4);
              }
              50% {
                transform: scale(1.05);
                box-shadow: 0 20px 45px rgba(16, 185, 129, 0.5);
              }
            }
          </style>
        `,
        icon: undefined,
        confirmButtonText: '<div style="display: flex; align-items: center; gap: 8px;"><svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Entendido</div>',
        confirmButtonColor: '#10b981',
        width: '650px',
        padding: '2.5rem',
        customClass: {
          popup: 'swal2-popup-success-custom',
          title: 'swal2-title-custom',
          htmlContainer: 'swal2-html-container-custom',
          confirmButton: 'swal2-confirm-success-custom'
        },
        buttonsStyling: true,
        backdrop: true,
        allowOutsideClick: true,
        allowEscapeKey: true
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/noticias']);
        }
      });

      // Iniciar verificación periódica del estado
      this.startStatusCheck();
    } else {
      Swal.fire({
        title: 'Error',
        text: result.error || 'No se pudo enviar la solicitud. Por favor, inténtalo nuevamente.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#dc2626'
      });
    }
  }

  private startStatusCheck() {
    // Verificar el estado cada 10 segundos
    const interval = setInterval(async () => {
      await this.checkPaymentStatus();
      
      if (this.paymentStatus === 'approved') {
        clearInterval(interval);
      }
    }, 10000); // Verificar cada 10 segundos

    // Limpiar después de 5 minutos
    setTimeout(() => {
      clearInterval(interval);
    }, 300000);
  }
}

