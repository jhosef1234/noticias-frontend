import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PaymentService, PaymentRequest } from '../services/payment.service';
import { PlanService } from '../services/plan.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <!-- Header -->
      <header class="bg-gradient-to-r from-indigo-600 to-indigo-800 shadow-2xl border-b border-indigo-900">
        <div class="w-full px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <button
                routerLink="/noticias"
                class="p-2 bg-white rounded-lg hover:bg-indigo-50 transition-colors"
                title="Volver a noticias"
              >
                <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
              </button>
              <div>
                <h1 class="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  Panel de Administración
                </h1>
                <p class="text-indigo-100 text-sm md:text-base mt-1">
                  Gestiona las solicitudes de pago
                </p>
              </div>
            </div>
            <button
              (click)="loadPaymentRequests()"
              class="px-4 py-2 bg-white text-indigo-600 text-sm font-semibold rounded-full hover:bg-indigo-50 transition-colors shadow-lg flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Actualizar
            </button>
          </div>
        </div>
      </header>

      <div class="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div class="max-w-6xl mx-auto">
          <!-- Estadísticas -->
          <div class="grid md:grid-cols-3 gap-6 mb-8">
            <div class="bg-white rounded-lg shadow-md p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600">Pendientes</p>
                  <p class="text-3xl font-bold text-yellow-600">{{ pendingCount }}</p>
                </div>
                <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
            </div>
            <div class="bg-white rounded-lg shadow-md p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600">Aprobados</p>
                  <p class="text-3xl font-bold text-green-600">{{ approvedCount }}</p>
                </div>
                <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
              </div>
            </div>
            <div class="bg-white rounded-lg shadow-md p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600">Total</p>
                  <p class="text-3xl font-bold text-gray-600">{{ paymentRequests.length }}</p>
                </div>
                <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Usuarios con Plan Pro -->
          <div class="bg-white rounded-lg shadow-xl overflow-hidden mb-8">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-xl font-bold text-gray-900">Usuarios con Plan Pro</h2>
            </div>
            
            <div *ngIf="proUsers.length === 0" class="p-12 text-center">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">No hay usuarios Pro</h3>
              <p class="mt-1 text-sm text-gray-500">No hay usuarios con Plan Pro activo actualmente.</p>
            </div>

            <div *ngIf="proUsers.length > 0" class="divide-y divide-gray-200">
              <div *ngFor="let userEmail of proUsers" class="p-6 hover:bg-gray-50 transition-colors">
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <h3 class="text-lg font-semibold text-gray-900">{{ userEmail }}</h3>
                      <span class="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                        PLAN PRO
                      </span>
                    </div>
                    <p class="text-sm text-gray-600">
                      Usuario con acceso completo a todas las funciones Pro
                    </p>
                  </div>
                  <button
                    (click)="revokeProPlan(userEmail)"
                    class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium ml-4"
                  >
                    Revocar Plan Pro
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Lista de Solicitudes -->
          <div class="bg-white rounded-lg shadow-xl overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-xl font-bold text-gray-900">Solicitudes de Pago</h2>
            </div>
            
            <div *ngIf="loading" class="p-12 text-center">
              <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p class="mt-4 text-gray-600">Cargando solicitudes...</p>
            </div>

            <div *ngIf="!loading && paymentRequests.length === 0" class="p-12 text-center">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">No hay solicitudes</h3>
              <p class="mt-1 text-sm text-gray-500">No se han encontrado solicitudes de pago.</p>
            </div>

            <div *ngIf="!loading && paymentRequests.length > 0" class="divide-y divide-gray-200">
              <div *ngFor="let request of paymentRequests" class="p-6 hover:bg-gray-50 transition-colors">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <h3 class="text-lg font-semibold text-gray-900">{{ request.user_name }}</h3>
                      <span [class.bg-yellow-100]="request.status === 'pending'"
                            [class.text-yellow-800]="request.status === 'pending'"
                            [class.bg-green-100]="request.status === 'approved'"
                            [class.text-green-800]="request.status === 'approved'"
                            [class.bg-red-100]="request.status === 'rejected'"
                            [class.text-red-800]="request.status === 'rejected'"
                            class="px-2 py-1 rounded-full text-xs font-medium">
                        {{ request.status === 'pending' ? 'Pendiente' : 
                           request.status === 'approved' ? 'Aprobado' : 
                           'Rechazado' }}
                      </span>
                    </div>
                    <div class="space-y-1 text-sm text-gray-600">
                      <p><strong>Email:</strong> {{ request.user_email }}</p>
                      <p><strong>Teléfono:</strong> {{ request.user_phone }}</p>
                      <p><strong>Plan:</strong> {{ request.plan | uppercase }}</p>
                      <p><strong>Fecha del pago:</strong> {{ formatPaymentDateTime(request.payment_date, request.payment_time) }}</p>
                      <p><strong>Fecha de solicitud:</strong> {{ formatDate(request.created_at) }}</p>
                    </div>
                  </div>
                  <div class="flex gap-2 ml-4">
                    <button
                      *ngIf="request.status === 'pending'"
                      (click)="approvePayment(request)"
                      class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      Aprobar
                    </button>
                    <button
                      *ngIf="request.status === 'pending'"
                      (click)="rejectPayment(request)"
                      class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AdminComponent implements OnInit {
  paymentRequests: PaymentRequest[] = [];
  proUsers: string[] = [];
  loading = false;
  pendingCount = 0;
  approvedCount = 0;

  constructor(
    private readonly paymentService: PaymentService,
    private readonly planService: PlanService
  ) {}

  async ngOnInit() {
    await this.loadPaymentRequests();
    this.loadProUsers();
  }

  loadProUsers() {
    this.proUsers = this.planService.getProUsers();
  }

  async loadPaymentRequests() {
    this.loading = true;
    this.paymentRequests = await this.paymentService.getAllPaymentRequests();
    this.updateCounts();
    this.loading = false;
  }

  updateCounts() {
    this.pendingCount = this.paymentRequests.filter(r => r.status === 'pending').length;
    this.approvedCount = this.paymentRequests.filter(r => r.status === 'approved').length;
  }

  async approvePayment(request: PaymentRequest) {
    const result = await Swal.fire({
      title: '¿Aprobar este pago?',
      html: `
        <p class="mb-4">Se actualizará el plan del usuario a Pro.</p>
        <div class="text-left text-sm text-gray-600">
          <p><strong>Usuario:</strong> ${request.user_name}</p>
          <p><strong>Email:</strong> ${request.user_email}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, aprobar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280'
    });

    if (result.isConfirmed) {
      const success = await this.paymentService.updatePaymentRequestStatus(request.id!, 'approved');
      
      if (success) {
        // Asignar plan Pro al usuario
        this.planService.assignProPlan(request.user_email);
        
        await this.loadPaymentRequests();
        this.loadProUsers(); // Actualizar lista de usuarios Pro
        
        await Swal.fire({
          title: '¡Pago aprobado!',
          text: 'El usuario ahora tiene acceso al Plan Pro.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#10b981'
        });
      } else {
        await Swal.fire({
          title: 'Error',
          text: 'No se pudo aprobar el pago. Inténtalo nuevamente.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#dc2626'
        });
      }
    }
  }

  async rejectPayment(request: PaymentRequest) {
    const result = await Swal.fire({
      title: '¿Rechazar este pago?',
      text: 'El usuario permanecerá en el Plan Free.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, rechazar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280'
    });

    if (result.isConfirmed) {
      const success = await this.paymentService.updatePaymentRequestStatus(request.id!, 'rejected');
      
      if (success) {
        await this.loadPaymentRequests();
        
        await Swal.fire({
          title: 'Pago rechazado',
          text: 'La solicitud ha sido rechazada.',
          icon: 'info',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#6b7280'
        });
      } else {
        await Swal.fire({
          title: 'Error',
          text: 'No se pudo rechazar el pago. Inténtalo nuevamente.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#dc2626'
        });
      }
    }
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('es-ES');
  }

  formatPaymentDateTime(date?: string, time?: string): string {
    if (!date || !time) return 'N/A';
    const dateTime = new Date(`${date}T${time}`);
    return dateTime.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  async revokeProPlan(userEmail: string) {
    const result = await Swal.fire({
      title: '¿Revocar Plan Pro?',
      html: `
        <p class="mb-4">Se revocará el acceso al Plan Pro para este usuario.</p>
        <div class="text-left text-sm text-gray-600">
          <p><strong>Usuario:</strong> ${userEmail}</p>
        </div>
        <p class="mt-4 text-xs text-red-600">⚠️ El usuario perderá acceso a favoritos, historial y filtros avanzados.</p>
        <p class="mt-2 text-xs text-gray-500">El cambio se aplicará inmediatamente cuando el usuario recargue la página.</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, revocar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280'
    });

    if (result.isConfirmed) {
      // Revocar plan Pro
      this.planService.revokeProPlan(userEmail);
      
      // También actualizar el estado en las solicitudes de pago aprobadas
      const requests = await this.paymentService.getAllPaymentRequests();
      const userRequests = requests.filter(r => r.user_email === userEmail && r.status === 'approved');
      
      // Marcar las solicitudes como rechazadas (opcional, o mantenerlas como aprobadas pero sin efecto)
      // Por ahora solo revocamos el acceso
      
      this.loadProUsers();
      
      await Swal.fire({
        title: 'Plan Pro revocado',
        html: `
          <p class="mb-4">El acceso al Plan Pro ha sido revocado para:</p>
          <p class="font-semibold text-gray-900 mb-4">${userEmail}</p>
          <p class="text-sm text-gray-600">El usuario perderá acceso a las funciones Pro cuando recargue la página o navegue a otra sección.</p>
        `,
        icon: 'success',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#6b7280'
      });
    }
  }
}

