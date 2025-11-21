import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { PaymentService } from '../services/payment.service';

@Component({
  selector: 'app-payment-confirmed',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div class="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div *ngIf="processing" class="mb-6">
          <div class="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-12 h-12 text-yellow-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Procesando...</h1>
          <p class="text-gray-600 mb-6">Por favor espera mientras procesamos tu solicitud.</p>
        </div>

        <div *ngIf="status === 'approved' && !processing" class="mb-6">
          <div class="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">¡Pago Aprobado!</h1>
          <p class="text-gray-600 mb-6">La solicitud de pago ha sido aprobada exitosamente.</p>
        </div>

        <div *ngIf="status === 'rejected' && !processing" class="mb-6">
          <div class="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Pago Rechazado</h1>
          <p class="text-gray-600 mb-6">La solicitud de pago ha sido rechazada.</p>
        </div>

        <div *ngIf="error" class="mb-6">
          <div class="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p class="text-gray-600 mb-6">{{ error }}</p>
        </div>

        <button
          (click)="goToAdmin()"
          class="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-indigo-800 transition-all transform hover:scale-105 shadow-lg"
        >
          Ir al Panel de Administración
        </button>
      </div>
    </div>
  `
})
export class PaymentConfirmedComponent implements OnInit {
  status: 'approved' | 'rejected' | null = null;
  processing: boolean = false;
  error: string | null = null;
  requestId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService
  ) {}

  async ngOnInit() {
    this.route.queryParams.subscribe(async params => {
      this.requestId = params['id'] || null;
      const statusParam = params['status'] || null;
      
      // Si viene con id y status, procesar la confirmación
      if (this.requestId && statusParam && (statusParam === 'approved' || statusParam === 'rejected')) {
        this.processing = true;
        await this.confirmPayment(this.requestId, statusParam);
      } else {
        // Si solo viene el status (redirección desde Edge Function)
        this.status = statusParam as 'approved' | 'rejected' | null;
      }
    });
  }

  async confirmPayment(id: string, status: 'approved' | 'rejected') {
    try {
      console.log('📧 Confirmando pago - ID:', id, 'Status:', status);
      
      // Usar PaymentService directamente para actualizar el estado en Supabase
      // Esto evita el problema de autenticación con Edge Functions
      const success = await this.paymentService.updatePaymentRequestStatus(
        parseInt(id),
        status as 'approved' | 'rejected'
      );

      if (success) {
        console.log('✅ Confirmación exitosa');
        this.status = status;
        this.processing = false;
      } else {
        console.error('❌ Error al actualizar el estado');
        this.error = 'Error al procesar la solicitud. Por favor, intenta nuevamente.';
        this.processing = false;
      }
    } catch (error: any) {
      console.error('❌ Error confirmando pago:', error);
      this.error = error.message || 'Error al conectar con el servidor. Por favor, intenta nuevamente.';
      this.processing = false;
    }
  }

  goToAdmin() {
    this.router.navigate(['/admin']);
  }
}

