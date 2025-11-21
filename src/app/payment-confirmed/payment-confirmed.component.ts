import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-payment-confirmed',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div class="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div *ngIf="status === 'approved'" class="mb-6">
          <div class="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">¡Pago Aprobado!</h1>
          <p class="text-gray-600 mb-6">La solicitud de pago ha sido aprobada exitosamente.</p>
        </div>

        <div *ngIf="status === 'rejected'" class="mb-6">
          <div class="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Pago Rechazado</h1>
          <p class="text-gray-600 mb-6">La solicitud de pago ha sido rechazada.</p>
        </div>

        <div *ngIf="!status" class="mb-6">
          <div class="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-12 h-12 text-yellow-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Procesando...</h1>
          <p class="text-gray-600 mb-6">Por favor espera mientras procesamos tu solicitud.</p>
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

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.status = params['status'] || null;
    });
  }

  goToAdmin() {
    this.router.navigate(['/admin']);
  }
}

