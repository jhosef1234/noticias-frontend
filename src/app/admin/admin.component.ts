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
          <div class="grid md:grid-cols-4 gap-6 mb-8">
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
                  <p class="text-sm text-gray-600">Rechazados</p>
                  <p class="text-3xl font-bold text-red-600">{{ rejectedCount }}</p>
                </div>
                <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </div>
              </div>
            </div>
            <div class="bg-white rounded-lg shadow-md p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600">Revocados</p>
                  <p class="text-3xl font-bold text-orange-600">{{ revokedCount }}</p>
                </div>
                <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
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
              <!-- Sección: Pendientes -->
              <div *ngIf="getRequestsByStatus('pending').length > 0" class="p-6 bg-yellow-50 border-l-4 border-yellow-400">
                <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Pendientes ({{ getRequestsByStatus('pending').length }})
                </h3>
                <div class="space-y-4">
                  <div *ngFor="let request of getRequestsByStatus('pending')" class="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2">
                          <h4 class="text-lg font-semibold text-gray-900">{{ request.user_name }}</h4>
                          <span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                            Pendiente
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
                          (click)="approvePayment(request)"
                          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          Aprobar
                        </button>
                        <button
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

              <!-- Sección: Aprobados -->
              <div *ngIf="getRequestsByStatus('approved').length > 0" class="p-6 bg-green-50 border-l-4 border-green-400">
                <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Aprobados ({{ getRequestsByStatus('approved').length }})
                </h3>
                <div class="space-y-4">
                  <div *ngFor="let request of getRequestsByStatus('approved')" class="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2">
                          <h4 class="text-lg font-semibold text-gray-900">{{ request.user_name }}</h4>
                          <span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            Aprobado
                          </span>
                        </div>
                        <div class="space-y-1 text-sm text-gray-600">
                          <p><strong>Email:</strong> {{ request.user_email }}</p>
                          <p><strong>Teléfono:</strong> {{ request.user_phone }}</p>
                          <p><strong>Plan:</strong> {{ request.plan | uppercase }}</p>
                          <p><strong>Fecha del pago:</strong> {{ formatPaymentDateTime(request.payment_date, request.payment_time) }}</p>
                          <p><strong>Fecha de solicitud:</strong> {{ formatDate(request.created_at) }}</p>
                          <p *ngIf="request.approved_at" class="text-green-600"><strong>Fecha de aprobación:</strong> {{ formatDate(request.approved_at) }}</p>
                        </div>
                      </div>
                      <div class="flex gap-2 ml-4">
                        <button
                          (click)="revokePaymentRequest(request)"
                          class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                        >
                          Revocar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Sección: Rechazados -->
              <div *ngIf="getRequestsByStatus('rejected').length > 0" class="p-6 bg-red-50 border-l-4 border-red-400">
                <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                  Rechazados ({{ getRequestsByStatus('rejected').length }})
                </h3>
                <div class="space-y-4">
                  <div *ngFor="let request of getRequestsByStatus('rejected')" class="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2">
                          <h4 class="text-lg font-semibold text-gray-900">{{ request.user_name }}</h4>
                          <span class="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                            Rechazado
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
                    </div>
                  </div>
                </div>
              </div>

              <!-- Sección: Revocados -->
              <div *ngIf="getRequestsByStatus('revoked').length > 0" class="p-6 bg-orange-50 border-l-4 border-orange-400">
                <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                  </svg>
                  Revocados ({{ getRequestsByStatus('revoked').length }})
                </h3>
                <div class="space-y-4">
                  <div *ngFor="let request of getRequestsByStatus('revoked')" class="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2">
                          <h4 class="text-lg font-semibold text-gray-900">{{ request.user_name }}</h4>
                          <span class="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                            Revocado
                          </span>
                        </div>
                        <div class="space-y-1 text-sm text-gray-600">
                          <p><strong>Email:</strong> {{ request.user_email }}</p>
                          <p><strong>Teléfono:</strong> {{ request.user_phone }}</p>
                          <p><strong>Plan:</strong> {{ request.plan | uppercase }}</p>
                          <p><strong>Fecha del pago:</strong> {{ formatPaymentDateTime(request.payment_date, request.payment_time) }}</p>
                          <p><strong>Fecha de solicitud:</strong> {{ formatDate(request.created_at) }}</p>
                          <p *ngIf="request.approved_at" class="text-green-600"><strong>Fecha de aprobación:</strong> {{ formatDate(request.approved_at) }}</p>
                          <p *ngIf="request.revoked_at" class="text-orange-600"><strong>Fecha de revocación:</strong> {{ formatDate(request.revoked_at) }}</p>
                        </div>
                      </div>
                    </div>
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
  rejectedCount = 0;
  revokedCount = 0;

  constructor(
    private readonly paymentService: PaymentService,
    private readonly planService: PlanService
  ) {}

  async ngOnInit() {
    // Verificar y revocar planes expirados al cargar
    await this.paymentService.checkAndRevokeExpiredPayments();
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
    this.rejectedCount = this.paymentRequests.filter(r => r.status === 'rejected').length;
    this.revokedCount = this.paymentRequests.filter(r => r.status === 'revoked').length;
  }

  getRequestsByStatus(status: 'pending' | 'approved' | 'rejected' | 'revoked'): PaymentRequest[] {
    return this.paymentRequests.filter(r => r.status === status);
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
      
      // Actualizar el estado de las solicitudes de pago aprobadas a "revoked"
      const requests = await this.paymentService.getAllPaymentRequests();
      const userRequests = requests.filter(r => r.user_email === userEmail && r.status === 'approved');
      
      // Marcar todas las solicitudes aprobadas de este usuario como revocadas
      for (const request of userRequests) {
        if (request.id) {
          await this.paymentService.updatePaymentRequestStatus(request.id, 'revoked');
        }
      }
      
      await this.loadPaymentRequests();
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

  async revokePaymentRequest(request: PaymentRequest) {
    const result = await Swal.fire({
      title: '¿Revocar esta solicitud?',
      html: `
        <p class="mb-4">Se revocará el acceso al Plan Pro para este usuario y la solicitud cambiará a estado "Revocado".</p>
        <div class="text-left text-sm text-gray-600">
          <p><strong>Usuario:</strong> ${request.user_name}</p>
          <p><strong>Email:</strong> ${request.user_email}</p>
        </div>
        <p class="mt-4 text-xs text-red-600">⚠️ El usuario perderá acceso a favoritos, historial y filtros avanzados.</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, revocar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#f97316',
      cancelButtonColor: '#6b7280'
    });

    if (result.isConfirmed) {
      if (request.id) {
        // Cambiar estado de la solicitud a "revoked"
        const success = await this.paymentService.updatePaymentRequestStatus(request.id, 'revoked');
        
        if (success) {
          // Revocar plan Pro del usuario
          this.planService.revokeProPlan(request.user_email);
          
          await this.loadPaymentRequests();
          this.loadProUsers();
          
          await Swal.fire({
            title: 'Solicitud revocada',
            text: 'El acceso al Plan Pro ha sido revocado para este usuario.',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#f97316'
          });
        } else {
          await Swal.fire({
            title: 'Error',
            text: 'No se pudo revocar la solicitud. Inténtalo nuevamente.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#dc2626'
          });
        }
      }
    }
  }
}

