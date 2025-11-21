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
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/30 dark:from-slate-800 dark:via-purple-900/40 dark:to-indigo-900/40 transition-colors duration-300 relative overflow-hidden">
      <!-- Efectos de fondo decorativos -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div class="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-400/15 rounded-full blur-3xl animate-float"></div>
        <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-400/15 rounded-full blur-3xl animate-float" style="animation-delay: 2s;"></div>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 dark:bg-blue-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div class="absolute top-1/3 right-1/3 w-72 h-72 bg-pink-500/5 dark:bg-pink-400/10 rounded-full blur-3xl animate-float" style="animation-delay: 4s;"></div>
        <!-- Líneas decorativas -->
        <div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"></div>
        <div class="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>
      </div>
      <!-- Header -->
      <header class="bg-gradient-to-r from-slate-700 via-purple-600 to-indigo-600 dark:from-gray-600 dark:via-purple-700 dark:to-indigo-700 shadow-2xl border-b-4 border-purple-500/50 dark:border-purple-600/50 relative overflow-hidden">
        <!-- Efecto de brillo animado -->
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer"></div>
        <div class="w-full px-4 sm:px-6 lg:px-8 py-6 relative z-10">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <button
                routerLink="/planes"
                class="p-3 bg-white/95 dark:bg-gray-700/95 backdrop-blur-sm rounded-xl hover:bg-white dark:hover:bg-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
                title="Volver a planes"
              >
                <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
              </button>
              <div>
                <h1 class="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-lg">
                  💳 Pago - Plan Pro
                </h1>
                <p class="text-purple-100 dark:text-purple-200 text-sm md:text-base mt-1 font-medium drop-shadow-md">
                  Completa el formulario para procesar tu pago
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div class="w-full px-4 sm:px-6 lg:px-8 py-4 pb-6 relative z-10">
        <div class="max-w-6xl mx-auto">
          <div class="grid md:grid-cols-2 gap-6">
            <!-- Formulario de Pago -->
            <div class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl dark:shadow-gray-900/50 p-6 border-2 border-white/50 dark:border-gray-700/50 ring-1 ring-gray-200/50 dark:ring-gray-700/50">
              <div class="flex items-center gap-3 mb-5">
                <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Información de Pago</h2>
              </div>
              
              <form (ngSubmit)="onSubmit()" class="space-y-4">
                <!-- Nombre -->
                <div>
                  <label for="name" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <svg class="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    Nombre Completo *
                  </label>
                  <input
                    id="name"
                    type="text"
                    [(ngModel)]="formData.name"
                    name="name"
                    required
                    placeholder="Juan Pérez"
                    class="block w-full px-4 py-3 pl-11 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-purple-300/50 dark:focus:ring-purple-500/50 focus:border-purple-500 dark:focus:border-purple-500 transition-all text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-400 hover:border-purple-400 dark:hover:border-purple-500 shadow-md"
                  />
                </div>

                <!-- Teléfono -->
                <div>
                  <label for="phone" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <svg class="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
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
                    class="block w-full px-4 py-3 pl-11 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-purple-300/50 dark:focus:ring-purple-500/50 focus:border-purple-500 dark:focus:border-purple-500 transition-all text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-400 hover:border-purple-400 dark:hover:border-purple-500 shadow-md"
                  />
                  <p class="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                    </svg>
                    Ingresa tu número de celular (9 dígitos)
                  </p>
                </div>

                <!-- Email -->
                <div>
                  <label for="email" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <svg class="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    Correo Electrónico *
                  </label>
                  <input
                    id="email"
                    type="email"
                    [(ngModel)]="formData.email"
                    name="email"
                    required
                    placeholder="tu@email.com"
                    class="block w-full px-4 py-3 pl-11 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-purple-300/50 dark:focus:ring-purple-500/50 focus:border-purple-500 dark:focus:border-purple-500 transition-all text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-400 hover:border-purple-400 dark:hover:border-purple-500 shadow-md"
                  />
                </div>

                <!-- Fecha del Pago -->
                <div>
                  <label for="paymentDate" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <svg class="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    Fecha del Pago *
                  </label>
                  <input
                    id="paymentDate"
                    type="date"
                    [(ngModel)]="formData.paymentDate"
                    name="paymentDate"
                    required
                    [max]="todayDate"
                    class="block w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-purple-300/50 dark:focus:ring-purple-500/50 focus:border-purple-500 dark:focus:border-purple-500 transition-all text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 hover:border-purple-400 dark:hover:border-purple-500 shadow-md"
                  />
                  <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">Selecciona la fecha en que realizaste el pago</p>
                </div>

                <!-- Hora del Pago -->
                <div>
                  <label for="paymentTime" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <svg class="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Hora del Pago *
                  </label>
                  <input
                    id="paymentTime"
                    type="time"
                    [(ngModel)]="formData.paymentTime"
                    name="paymentTime"
                    required
                    class="block w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-purple-300/50 dark:focus:ring-purple-500/50 focus:border-purple-500 dark:focus:border-purple-500 transition-all text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 hover:border-purple-400 dark:hover:border-purple-500 shadow-md"
                  />
                  <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">Indica la hora aproximada en que realizaste el pago</p>
                </div>

                <!-- Plan Info -->
                <div class="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 border-2 border-purple-200 dark:border-purple-700 rounded-xl p-5 shadow-lg">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                        </svg>
                      </div>
                      <span class="text-sm font-bold text-gray-700 dark:text-gray-300">Plan Pro</span>
                    </div>
                    <span class="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">$9.99/mes</span>
                  </div>
                </div>

                <!-- Botón Enviar -->
                <button
                  type="submit"
                  [disabled]="loading"
                  class="w-full py-4 px-6 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 text-white rounded-xl font-bold text-base hover:from-purple-700 hover:via-purple-800 hover:to-indigo-700 transition-all transform hover:scale-[1.02] hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-xl flex items-center justify-center gap-3"
                >
                  <svg *ngIf="loading" class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span *ngIf="!loading" class="flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                    </svg>
                    {{ loading ? 'Enviando...' : 'Enviar Notificación de Pago' }}
                  </span>
                  <span *ngIf="loading">Enviando...</span>
                </button>
              </form>
            </div>

            <!-- QR Code y Instrucciones -->
            <div class="space-y-4">
              <!-- QR Code -->
              <div class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl dark:shadow-gray-900/50 p-5 text-center border-2 border-white/50 dark:border-gray-700/50 ring-1 ring-gray-200/50 dark:ring-gray-700/50">
                <div class="flex items-center justify-center gap-3 mb-3">
                  <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">Pago con Yape</h3>
                </div>
                <div class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-3 rounded-2xl border-2 border-green-200 dark:border-green-700 inline-block mb-3 shadow-lg">
                  <div class="w-56 h-56 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-2xl">
                    <div class="w-full h-full bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 rounded-lg flex items-center justify-center relative overflow-hidden">
                      <div class="absolute inset-0 bg-grid-pattern opacity-10"></div>
                      <div class="text-center text-white relative z-10">
                        <div class="w-44 h-44 mx-auto bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border-2 border-white/20">
                          <svg class="w-36 h-36 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm13-2h-2v2h-2v2h2v2h2v-2h2v-2h-2v-2zm-5 4h2v2h-2v-2zm-8-4h2v2H5v-2z"/>
                          </svg>
                        </div>
                        <p class="text-xs font-bold tracking-wider mt-2">QR CODE</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="space-y-3">
                  <p class="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2">
                    <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                    </svg>
                    Escanea este código QR con Yape
                  </p>
                  <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                    <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">O transfiere a:</p>
                    <p class="text-base font-bold text-gray-900 dark:text-gray-100">987654321</p>
                  </div>
                  <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl p-4 border-2 border-green-200 dark:border-green-700 shadow-lg">
                    <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">Monto a pagar:</p>
                    <p class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">$9.99</p>
                  </div>
                </div>
              </div>

              <!-- Instrucciones -->
              <div class="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30 border-2 border-blue-200 dark:border-blue-700 rounded-2xl p-5 shadow-xl">
                <h4 class="text-base font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                  <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  Instrucciones
                </h4>
                <ol class="text-sm text-blue-900 dark:text-blue-100 space-y-2.5">
                  <li class="flex items-start gap-3 p-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg border border-blue-200 dark:border-blue-700 shadow-sm">
                    <span class="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xs">1</span>
                    <span class="flex-1 pt-0.5">Realiza el pago de <strong class="text-green-600 dark:text-green-400">$9.99</strong> usando Yape</span>
                  </li>
                  <li class="flex items-start gap-3 p-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg border border-blue-200 dark:border-blue-700 shadow-sm">
                    <span class="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xs">2</span>
                    <span class="flex-1 pt-0.5">Completa el formulario con tus datos</span>
                  </li>
                  <li class="flex items-start gap-3 p-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg border border-blue-200 dark:border-blue-700 shadow-sm">
                    <span class="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xs">3</span>
                    <span class="flex-1 pt-0.5">Haz clic en <strong>"Enviar Notificación de Pago"</strong></span>
                  </li>
                  <li class="flex items-start gap-3 p-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg border border-blue-200 dark:border-blue-700 shadow-sm">
                    <span class="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xs">4</span>
                    <span class="flex-1 pt-0.5">Espera la confirmación del administrador</span>
                  </li>
                  <li class="flex items-start gap-3 p-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg border border-blue-200 dark:border-blue-700 shadow-sm">
                    <span class="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xs">5</span>
                    <span class="flex-1 pt-0.5">Recibirás un email cuando tu pago sea aprobado</span>
                  </li>
                </ol>
              </div>

              <!-- Estado del Pago -->
              <div *ngIf="paymentStatus" class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl dark:shadow-gray-900/50 p-5 border-2 border-white/50 dark:border-gray-700/50 ring-1 ring-gray-200/50 dark:ring-gray-700/50">
                <h4 class="text-base font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  Estado de tu Solicitud
                </h4>
                <div [class.bg-gradient-to-br]="paymentStatus === 'pending'"
                     [class.from-yellow-50]="paymentStatus === 'pending'"
                     [class.to-amber-50]="paymentStatus === 'pending'"
                     [class.dark:from-yellow-900/30]="paymentStatus === 'pending'"
                     [class.dark:to-amber-900/30]="paymentStatus === 'pending'"
                     [class.bg-gradient-to-br]="paymentStatus === 'approved'"
                     [class.from-green-50]="paymentStatus === 'approved'"
                     [class.to-emerald-50]="paymentStatus === 'approved'"
                     [class.dark:from-green-900/30]="paymentStatus === 'approved'"
                     [class.dark:to-emerald-900/30]="paymentStatus === 'approved'"
                     [class.bg-gradient-to-br]="paymentStatus === 'rejected'"
                     [class.from-red-50]="paymentStatus === 'rejected'"
                     [class.to-rose-50]="paymentStatus === 'rejected'"
                     [class.dark:from-red-900/30]="paymentStatus === 'rejected'"
                     [class.dark:to-rose-900/30]="paymentStatus === 'rejected'"
                     [class.bg-gradient-to-br]="paymentStatus === 'revoked'"
                     [class.from-orange-50]="paymentStatus === 'revoked'"
                     [class.to-amber-50]="paymentStatus === 'revoked'"
                     [class.dark:from-orange-900/30]="paymentStatus === 'revoked'"
                     [class.dark:to-amber-900/30]="paymentStatus === 'revoked'"
                     class="p-5 rounded-xl border-2 shadow-lg"
                     [class.border-yellow-300]="paymentStatus === 'pending'"
                     [class.dark:border-yellow-700]="paymentStatus === 'pending'"
                     [class.border-green-300]="paymentStatus === 'approved'"
                     [class.dark:border-green-700]="paymentStatus === 'approved'"
                     [class.border-red-300]="paymentStatus === 'rejected'"
                     [class.dark:border-red-700]="paymentStatus === 'rejected'"
                     [class.border-orange-300]="paymentStatus === 'revoked'"
                     [class.dark:border-orange-700]="paymentStatus === 'revoked'">
                  <div class="flex items-center gap-3">
                    <div *ngIf="paymentStatus === 'pending'" class="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <div *ngIf="paymentStatus === 'approved'" class="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <div *ngIf="paymentStatus === 'rejected'" class="w-12 h-12 bg-gradient-to-br from-red-400 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </div>
                    <div *ngIf="paymentStatus === 'revoked'" class="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                      </svg>
                    </div>
                    <div class="flex-1">
                      <span [class.text-yellow-800]="paymentStatus === 'pending'"
                            [class.dark:text-yellow-200]="paymentStatus === 'pending'"
                            [class.text-green-800]="paymentStatus === 'approved'"
                            [class.dark:text-green-200]="paymentStatus === 'approved'"
                            [class.text-red-800]="paymentStatus === 'rejected'"
                            [class.dark:text-red-200]="paymentStatus === 'rejected'"
                            [class.text-orange-800]="paymentStatus === 'revoked'"
                            [class.dark:text-orange-200]="paymentStatus === 'revoked'"
                            class="text-base font-bold block">
                        {{ paymentStatus === 'pending' ? '⏳ Pendiente de confirmación' : 
                           paymentStatus === 'approved' ? '✅ Pago aprobado' : 
                           paymentStatus === 'rejected' ? '❌ Pago rechazado' :
                           '🔄 Pago revocado' }}
                      </span>
                      <p *ngIf="paymentStatus === 'revoked'" class="text-xs text-orange-700 dark:text-orange-300 mt-2 bg-white/60 dark:bg-gray-800/60 p-2 rounded-lg">
                        Tu Plan Pro ha expirado (se agotó el mes de suscripción). Puedes renovar tu suscripción realizando un nuevo pago.
                      </p>
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
  styles: [`
    @keyframes shimmer {
      0% {
        transform: translateX(-100%) translateY(0) rotate(-12deg);
      }
      100% {
        transform: translateX(200%) translateY(0) rotate(-12deg);
      }
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0px) translateX(0px);
      }
      33% {
        transform: translateY(-20px) translateX(10px);
      }
      66% {
        transform: translateY(20px) translateX(-10px);
      }
    }

    @keyframes pulse-slow {
      0%, 100% {
        opacity: 0.3;
        transform: scale(1);
      }
      50% {
        opacity: 0.6;
        transform: scale(1.1);
      }
    }

    .animate-shimmer {
      animation: shimmer 3s infinite;
    }

    .animate-float {
      animation: float 8s ease-in-out infinite;
    }

    .animate-pulse-slow {
      animation: pulse-slow 4s ease-in-out infinite;
    }

    /* Patrón de fondo sutil */
    :host::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: 
        radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.03) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.03) 0%, transparent 50%),
        radial-gradient(circle at 40% 20%, rgba(168, 85, 247, 0.02) 0%, transparent 50%);
      pointer-events: none;
      z-index: 0;
    }

    /* Efecto de grid sutil en modo oscuro */
    .dark :host::after {
      content: '';
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(rgba(139, 92, 246, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(139, 92, 246, 0.03) 1px, transparent 1px);
      background-size: 50px 50px;
      pointer-events: none;
      z-index: 0;
    }

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

    if (result.success && result.data) {
      this.paymentStatus = 'pending';
      console.log('✅ Solicitud de pago creada exitosamente:', result.data);
      
      // Verificar el estado después de crear la solicitud
      await this.checkPaymentStatus();
      
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

