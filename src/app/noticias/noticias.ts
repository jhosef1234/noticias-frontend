import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AuthService } from '../auth/auth.service';
import { StorageService } from '../services/storage.service';
import { PlanService } from '../services/plan.service';
import { ThemeService } from '../services/theme.service';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

export interface Noticia {
  id: number;
  fuente: string;
  link: string;
  titulo: string;
  fecha: string;
  contenido: string;
  imagen_url?: string;
  imagen_path?: string;
  categoria?: string;
  autor?: string;
  ciudad?: string;
  departamento?: string;
  pais?: string;
}

@Component({
  selector: 'app-portal-noticias',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50/30 to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300 overflow-x-hidden w-full max-w-full">
      <!-- Header -->
      <header class="bg-gradient-to-r from-slate-700 via-blue-700 to-teal-600 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 shadow-2xl border-b-4 border-slate-500/50 dark:border-gray-700 relative z-50">
        <!-- Efecto de brillo animado en el header -->
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer overflow-hidden"></div>
        <div class="w-full px-4 sm:px-6 lg:px-8 py-4 md:py-5 relative">
          <!-- Desktop Layout -->
          <div class="hidden md:flex md:items-center md:justify-between md:gap-4">
            <!-- Logo and Title Section - Left -->
            <div class="flex items-center space-x-3 relative z-10 flex-shrink-0">
              <div class="w-14 h-14 bg-gradient-to-br from-white to-blue-50 rounded-xl flex items-center justify-center shadow-2xl transform hover:scale-110 hover:rotate-3 transition-all duration-300 flex-shrink-0 border-2 border-white/50">
                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                </svg>
              </div>
              <div>
                <h1 class="text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow-lg bg-gradient-to-r from-white via-slate-100 to-blue-100 bg-clip-text text-transparent">
                  Noticias al Día
                </h1>
                <p class="text-blue-100 text-xs md:text-sm mt-0.5 font-semibold drop-shadow-md">
                  Tu fuente de información confiable 📰
                </p>
              </div>
            </div>

            <!-- Search Bar - Center -->
            <div class="flex-1 flex justify-center px-2 relative z-10 min-w-0 max-w-2xl mx-auto">
              <div class="relative w-full min-w-0">
                <input
                  type="text"
                  [(ngModel)]="terminoBusqueda"
                  (ngModelChange)="buscarNoticias()"
                  (click)="verificarBusqueda($event)"
                  [readonly]="!estaAutenticado"
                  [placeholder]="estaAutenticado ? 'Buscar noticias, autor, contenido...' : 'Inicia sesión para buscar'"
                  [class.opacity-50]="!estaAutenticado"
                  [class.cursor-pointer]="!estaAutenticado"
                  class="w-full px-5 py-3 pl-12 pr-12 text-sm bg-white/95 dark:bg-gray-700/95 backdrop-blur-sm border-2 border-white/80 dark:border-gray-600 rounded-full focus:outline-none focus:ring-4 focus:ring-blue-300/50 dark:focus:ring-blue-500/50 focus:border-blue-400 dark:focus:border-blue-500 shadow-2xl hover:shadow-blue-200/50 dark:hover:shadow-blue-900/50 transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 hover:scale-[1.02] focus:scale-[1.02]"
                />
                <svg class="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <button
                  *ngIf="terminoBusqueda && estaAutenticado"
                  (click)="limpiarBusqueda()"
                  class="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Limpiar búsqueda"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>
            
            <!-- Botones de Favoritos, Historial, Planes y Login/Logout - Right -->
            <div class="flex items-center gap-1 sm:gap-1.5 justify-end flex-nowrap">
              <!-- Botón Favoritos -->
              <button
                (click)="irAFavoritos()"
                class="px-2 py-1.5 bg-white/95 dark:bg-gray-700/95 backdrop-blur-sm text-yellow-600 dark:text-yellow-400 text-xs font-bold rounded-full hover:bg-gradient-to-r hover:from-yellow-50 hover:to-yellow-100 dark:hover:bg-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border-2 border-yellow-200/50 dark:border-yellow-700/50 flex items-center gap-1 whitespace-nowrap flex-shrink-0 relative z-10"
                title="Mis favoritos"
              >
                <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
                </svg>
                <span class="hidden lg:inline">Favoritos</span>
              </button>
              
              <!-- Botón Historial -->
              <button
                (click)="irAHistorial()"
                class="px-2 py-1.5 bg-white/95 dark:bg-gray-700/95 backdrop-blur-sm text-teal-600 dark:text-teal-400 text-xs font-bold rounded-full hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 dark:hover:bg-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border-2 border-teal-200/50 dark:border-teal-700/50 flex items-center gap-1 whitespace-nowrap flex-shrink-0 relative z-10"
                title="Historial"
              >
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span class="hidden lg:inline">Historial</span>
              </button>
              
              <!-- Botón Planes -->
              <button
                routerLink="/planes"
                class="px-2 py-1.5 bg-white/95 dark:bg-gray-700/95 backdrop-blur-sm text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full hover:bg-gradient-to-r hover:from-indigo-50 hover:to-indigo-100 dark:hover:bg-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border-2 border-indigo-200/50 dark:border-indigo-700/50 flex items-center gap-1 whitespace-nowrap flex-shrink-0 relative z-10"
                title="Ver planes"
              >
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                </svg>
                <span class="hidden lg:inline">Planes</span>
              </button>
              
              <!-- Botón Toggle Tema - Siempre disponible -->
              <button
                (click)="themeService.toggleTheme()"
                class="px-2 py-1.5 bg-white/95 dark:bg-gray-700/95 backdrop-blur-sm text-gray-700 dark:text-yellow-400 text-xs font-bold rounded-full hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:bg-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border-2 border-gray-200/50 dark:border-yellow-700/50 flex items-center justify-center gap-1 whitespace-nowrap min-w-[32px] h-[32px] relative z-10"
                [title]="themeService.darkMode() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
              >
                <svg *ngIf="themeService.darkMode()" class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/>
                </svg>
                <svg *ngIf="!themeService.darkMode()" class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"/>
                </svg>
                <span class="hidden lg:inline">{{ themeService.darkMode() ? 'Claro' : 'Oscuro' }}</span>
              </button>
              
              <!-- Botón de Login -->
              <button
                *ngIf="!estaAutenticado"
                (click)="irALogin()"
                class="px-2 py-1.5 bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors shadow-lg flex items-center gap-1 whitespace-nowrap flex-shrink-0"
              >
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                </svg>
                <span class="hidden lg:inline">Iniciar Sesión</span>
                <span class="lg:hidden">Login</span>
              </button>
              
              <!-- Perfil y Logout cuando está autenticado -->
              <div *ngIf="estaAutenticado" class="flex items-center gap-1 relative ml-1 perfil-dropdown-container" style="z-index: 10000;">
                <!-- Avatar del usuario -->
                <button
                  (click)="mostrandoPerfil = !mostrandoPerfil; $event.stopPropagation()"
                  class="relative w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-lg hover:shadow-xl transition-all transform hover:scale-105 border-2 border-white flex-shrink-0 z-[10001]"
                  [title]="obtenerNombreUsuario()"
                >
                  {{ obtenerInicialUsuario() }}
                </button>
                
                <!-- Dropdown de Perfil - Simple -->
                <div
                  *ngIf="mostrandoPerfil"
                  (click)="$event.stopPropagation()"
                  class="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden perfil-dropdown"
                  style="z-index: 10002;"
                >
                  <!-- Header del perfil -->
                  <div class="p-4 border-b border-gray-200 dark:border-gray-700">
                          <div class="flex items-center justify-between mb-2">
                            <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ obtenerEmailUsuario() }}</p>
                      <button
                        (click)="mostrandoPerfil = false"
                        class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        title="Cerrar"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                    <div class="flex items-center gap-3">
                      <div class="w-12 h-12 rounded-full bg-gradient-to-br from-slate-600 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                        {{ obtenerInicialUsuario() }}
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="font-semibold text-base text-gray-900 dark:text-gray-100 truncate">{{ obtenerNombreUsuario() }}</p>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Información del Plan -->
                  <div class="p-4">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Plan:</span>
                      <span
                        class="px-3 py-1 rounded-full text-xs font-bold"
                        [class.bg-slate-100]="planService.isPro()"
                        [class.text-slate-800]="planService.isPro()"
                        [class.bg-blue-100]="!planService.isPro()"
                        [class.text-blue-800]="!planService.isPro()"
                      >
                        {{ planService.isPro() ? 'PRO' : 'FREE' }}
                      </span>
                    </div>
                  </div>
                  
                  <!-- Cerrar Sesión -->
                  <div class="p-2 border-t border-gray-200 dark:border-gray-700">
                    <button
                      (click)="cerrarSesion(); mostrandoPerfil = false"
                      class="w-full px-4 py-2 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                      </svg>
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Mobile Layout -->
          <div class="md:hidden">
            <div class="flex flex-col items-center gap-3">
              <!-- Logo and Title Section -->
              <div class="flex items-center space-x-4">
                <div class="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                  <svg class="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                  </svg>
                </div>
                <div>
                  <h1 class="text-3xl font-extrabold text-white tracking-tight">
                    Noticias al Día
                  </h1>
                  <p class="text-blue-100 text-sm mt-1">
                    Tu fuente de información confiable 📰
                  </p>
                </div>
              </div>

              <!-- Search Bar and Auth Button - Mobile -->
              <div class="mt-4 w-full space-y-3">
                <div class="relative">
                  <input
                    type="text"
                    [(ngModel)]="terminoBusqueda"
                    (ngModelChange)="buscarNoticias()"
                    (click)="verificarBusqueda($event)"
                    [readonly]="!estaAutenticado"
                    [placeholder]="estaAutenticado ? 'Buscar noticias, autor, contenido...' : 'Inicia sesión para buscar'"
                    [class.opacity-50]="!estaAutenticado"
                    [class.cursor-pointer]="!estaAutenticado"
                    class="w-full px-5 py-3 pl-12 pr-12 text-sm bg-white dark:bg-gray-700 border-2 border-white dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 focus:border-blue-300 dark:focus:border-blue-500 shadow-lg transition-all placeholder-gray-400 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100"
                  />
                  <svg class="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                  <button
                    *ngIf="terminoBusqueda && estaAutenticado"
                    (click)="limpiarBusqueda()"
                    class="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Limpiar búsqueda"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
                
                <!-- Botones de Favoritos, Historial, Planes y Login/Logout - Mobile -->
                <div class="flex flex-wrap justify-end gap-1.5 sm:gap-1.5">
                  <!-- Botón Favoritos -->
                  <button
                    (click)="irAFavoritos()"
                    class="px-2 sm:px-2.5 py-1.5 bg-white dark:bg-gray-700 text-yellow-600 dark:text-yellow-400 text-xs sm:text-sm font-semibold rounded-full hover:bg-yellow-50 dark:hover:bg-gray-600 transition-colors shadow-lg flex items-center gap-1 flex-shrink-0"
                    title="Mis favoritos"
                  >
                    <svg class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
                    </svg>
                    <span class="hidden sm:inline">Favoritos</span>
                  </button>
                  
                  <!-- Botón Historial -->
                  <button
                    (click)="irAHistorial()"
                    class="px-2 sm:px-2.5 py-1.5 bg-white dark:bg-gray-700 text-teal-600 dark:text-teal-400 text-xs sm:text-sm font-semibold rounded-full hover:bg-teal-50 dark:hover:bg-gray-600 transition-colors shadow-lg flex items-center gap-1 flex-shrink-0"
                    title="Historial"
                  >
                    <svg class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span class="hidden sm:inline">Historial</span>
                  </button>
                  
                  <!-- Botón Planes -->
                  <button
                    routerLink="/planes"
                    class="px-2 sm:px-2.5 py-1.5 bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm font-semibold rounded-full hover:bg-indigo-50 dark:hover:bg-gray-600 transition-colors shadow-lg flex items-center gap-1 flex-shrink-0"
                    title="Ver planes"
                  >
                    <svg class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                    </svg>
                    <span class="hidden sm:inline">Planes</span>
                  </button>
                  
                  <!-- Botón Toggle Tema - Siempre disponible -->
                  <button
                    (click)="themeService.toggleTheme()"
                    class="px-2.5 sm:px-2.5 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-yellow-400 text-xs sm:text-sm font-semibold rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors shadow-lg flex items-center justify-center gap-1 min-w-[36px] h-[36px]"
                    [title]="themeService.darkMode() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
                  >
                    <svg *ngIf="themeService.darkMode()" class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/>
                    </svg>
                    <svg *ngIf="!themeService.darkMode()" class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"/>
                    </svg>
                    <span class="hidden sm:inline">{{ themeService.darkMode() ? 'Claro' : 'Oscuro' }}</span>
                  </button>
                  
                  <!-- Botón de Login -->
                  <button
                    *ngIf="!estaAutenticado"
                    (click)="irALogin()"
                    class="px-2.5 sm:px-3 py-1.5 bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-semibold rounded-full hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors shadow-lg flex items-center gap-1 flex-shrink-0"
                  >
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                    </svg>
                    <span class="hidden sm:inline">Iniciar Sesión</span>
                    <span class="sm:hidden">Login</span>
                  </button>
                  
                  <!-- Perfil y Logout cuando está autenticado - Mobile -->
                  <div *ngIf="estaAutenticado" class="flex items-center gap-2 relative perfil-dropdown-container">
                    <!-- Avatar del usuario -->
                    <button
                      (click)="mostrandoPerfil = !mostrandoPerfil; $event.stopPropagation()"
                      class="relative w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all transform hover:scale-105 border-2 border-white flex-shrink-0 z-10"
                      [title]="obtenerNombreUsuario()"
                    >
                      {{ obtenerInicialUsuario() }}
                    </button>
                    
                    <!-- Dropdown de Perfil - Mobile - Simple -->
                    <div
                      *ngIf="mostrandoPerfil"
                      class="fixed inset-0 z-[9998] flex items-start justify-end pt-16 px-4 sm:absolute sm:inset-auto sm:top-10 sm:right-0 sm:pt-0 sm:px-0"
                      (click)="mostrandoPerfil = false"
                    >
                      <div 
                        class="w-full max-w-xs bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-[9999] perfil-dropdown"
                        (click)="$event.stopPropagation()"
                      >
                        <!-- Header del perfil -->
                        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
                          <div class="flex items-center justify-between mb-2">
                            <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ obtenerEmailUsuario() }}</p>
                            <button
                              (click)="mostrandoPerfil = false"
                              class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                              title="Cerrar"
                            >
                              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                              </svg>
                            </button>
                          </div>
                          <div class="flex items-center gap-3">
                            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-slate-600 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                              {{ obtenerInicialUsuario() }}
                            </div>
                            <div class="flex-1 min-w-0">
                              <p class="font-semibold text-base text-gray-900 dark:text-gray-100 truncate">{{ obtenerNombreUsuario() }}</p>
                            </div>
                          </div>
                        </div>
                        
                        <!-- Información del Plan -->
                        <div class="p-4">
                          <div class="flex items-center justify-between mb-1">
                            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Plan:</span>
                            <span
                              class="px-3 py-1 rounded-full text-xs font-bold"
                              [class.bg-purple-100]="planService.isPro()"
                              [class.text-purple-800]="planService.isPro()"
                              [class.bg-blue-100]="!planService.isPro()"
                              [class.text-blue-800]="!planService.isPro()"
                            >
                              {{ planService.isPro() ? 'PRO' : 'FREE' }}
                            </span>
                          </div>
                        </div>
                        
                        <!-- Cerrar Sesión -->
                        <div class="p-2 border-t border-gray-200 dark:border-gray-700">
                          <button
                            (click)="cerrarSesion(); mostrandoPerfil = false"
                            class="w-full px-4 py-2 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                            </svg>
                            Cerrar Sesión
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div class="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col lg:flex-row gap-6">
          <!-- Sidebar Filters -->
          <aside class="w-full lg:w-64 flex-shrink-0">
            <div class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl dark:shadow-gray-900/50 p-6 sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto sidebar-scroll border-2 border-white/50 dark:border-gray-700/50 ring-1 ring-gray-200/50 dark:ring-gray-700/50">
              <!-- Mensaje para usuarios Free -->
              <div *ngIf="!planService.isPro()" class="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                <p class="text-xs text-yellow-800 dark:text-yellow-200 mb-2">
                  <strong>Plan Free:</strong> Algunos filtros están disponibles en el Plan Pro.
                </p>
                <button
                  routerLink="/planes"
                  class="text-xs text-yellow-700 hover:text-yellow-900 font-semibold underline"
                >
                  Actualizar a Pro →
                </button>
              </div>
              <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
                </svg>
                Filtros
              </h2>

              <!-- Ordenar por -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ordenar por
                </label>
                <select
                  [(ngModel)]="ordenSeleccionado"
                  (ngModelChange)="aplicarFiltros()"
                  class="block w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl shadow-md focus:outline-none focus:ring-4 focus:ring-blue-300/50 dark:focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg"
                >
                  <option value="recientes">Más Recientes</option>
                  <option value="hoy">Hoy</option>
                  <option value="ayer">Ayer</option>
                  <option value="semana">Esta Semana</option>
                  <option value="mes">Este Mes</option>
                  <option value="antiguos">Más Antiguos</option>
                </select>
              </div>

              <!-- Filtro por Categoría -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoría
                </label>
                <select
                  [(ngModel)]="categoriaSeleccionada"
                  (ngModelChange)="verificarYFiltrarCategoria($event)"
                  class="block w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl shadow-md focus:outline-none focus:ring-4 focus:ring-blue-300/50 dark:focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg"
                >
                  <option value="">Todas las categorías</option>
                  <option *ngFor="let categoria of categorias" [value]="categoria">
                    {{ categoria | titlecase }}
                  </option>
                </select>
              </div>

              <!-- Filtro por Fuente -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fuente
                </label>
                <select
                  [(ngModel)]="fuenteSeleccionada"
                  (ngModelChange)="verificarYFiltrarFuente($event)"
                  class="block w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl shadow-md focus:outline-none focus:ring-4 focus:ring-blue-300/50 dark:focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg"
                >
                  <option value="">Todas las fuentes</option>
                  <option *ngFor="let fuente of fuentes" [value]="fuente">
                    {{ fuente }}
                  </option>
                </select>
              </div>

              <!-- Filtro por País -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  País
                </label>
                <select
                  [(ngModel)]="paisSeleccionado"
                  (ngModelChange)="aplicarFiltros()"
                  class="block w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl shadow-md focus:outline-none focus:ring-4 focus:ring-blue-300/50 dark:focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg"
                >
                  <option value="">Todos los países</option>
                  <option value="Perú">Perú</option>
                  <option value="Argentina">Argentina</option>
                  <option value="Chile">Chile</option>
                  <option value="Colombia">Colombia</option>
                  <option value="México">México</option>
                  <option value="España">España</option>
                  <option value="Estados Unidos">Estados Unidos</option>
                  <option value="Brasil">Brasil</option>
                  <option value="Ecuador">Ecuador</option>
                  <option value="Venezuela">Venezuela</option>
                  <option value="Uruguay">Uruguay</option>
                  <option value="Bolivia">Bolivia</option>
                </select>
              </div>

              <!-- Botón Limpiar Filtros -->
              <div class="mb-6">
                <button
                  (click)="limpiarFiltros()"
                  class="w-full px-4 py-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-800 dark:text-gray-100 text-sm font-bold rounded-xl hover:from-gray-300 hover:to-gray-400 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transform"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                  Limpiar Filtros
                </button>
              </div>


              <!-- Resultados Counter -->
              <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Mostrando <span class="font-semibold text-gray-900">{{ noticiasFiltradas.length }}</span> 
                  de <span class="font-semibold text-gray-900">{{ noticias.length }}</span> noticias
                </p>
              </div>

              <!-- Lo Más Popular -->
              <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 class="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                  🔥 Lo Más Popular
                </h3>
                <div class="space-y-3">
                  <a 
                    *ngFor="let noticia of noticiasPopulares"
                    (click)="verificarYAccederPopular(noticia.link, $event)"
                    [class.cursor-pointer]="planService.isPro()"
                    [class.cursor-not-allowed]="!planService.isPro()"
                    [class.opacity-50]="!planService.isPro()"
                    class="block text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2 transition-colors"
                  >
                    {{ noticia.titulo }}
                  </a>
                </div>
              </div>

              <!-- Autores Destacados -->
              <div class="mt-6 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
                <h3 class="text-base font-black text-gray-900 dark:text-gray-100 mb-4 flex items-center bg-gradient-to-r from-slate-600 to-teal-600 bg-clip-text text-transparent">
                  <span class="text-2xl mr-2">👤</span>
                  Autores Destacados
                </h3>
                <div class="space-y-2">
                  <button
                    *ngFor="let autor of autoresDestacados"
                    (click)="verificarYFiltrarPorAutor(autor)"
                    [class.bg-blue-50]="autorSeleccionado === autor"
                    [class.dark:bg-blue-900/30]="autorSeleccionado === autor && themeService.darkMode()"
                    [class.text-blue-600]="autorSeleccionado === autor"
                    [class.dark:text-blue-400]="autorSeleccionado === autor && themeService.darkMode()"
                    class="w-full text-left px-3 py-2 rounded-md text-xs text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-between group"
                  >
                    <span class="font-medium">{{ autor }}</span>
                    <span class="text-xs text-gray-400 group-hover:text-blue-500">
                      {{ contarNoticiasPorAutor(autor) }}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </aside>

          <!-- Main Content -->
          <main class="flex-1 min-w-0">
            <!-- Loading State -->
            <div *ngIf="cargando && noticias.length === 0" class="text-center py-12">
              <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p class="mt-4 text-gray-600">Cargando noticias...</p>
            </div>

            <!-- Error State -->
            <div *ngIf="error" class="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <div class="flex items-center">
                <svg class="w-6 h-6 text-red-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>
                <div>
                  <h3 class="text-red-800 font-medium">Error al cargar las noticias</h3>
                  <p class="text-red-700 text-sm mt-1">{{ error }}</p>
                </div>
              </div>
            </div>

              <!-- Empty State -->
            <div *ngIf="!cargando && noticiasFiltradas.length === 0 && !error" class="text-center py-16 bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl dark:shadow-gray-900/50 border-2 border-blue-200/50 dark:border-gray-700/50 ring-1 ring-gray-200/30 dark:ring-gray-700/30">
              <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No hay noticias</h3>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {{ fuenteSeleccionada || categoriaSeleccionada ? 'No se encontraron noticias con los filtros seleccionados.' : 'No se encontraron noticias.' }}
              </p>
            </div>

            <!-- Featured News (Solo si hay noticias) -->
            <div *ngIf="!cargando && noticiaDestacada && noticiasPaginadas.length > 0" class="mb-8">
              <div class="bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl dark:shadow-gray-900/50 overflow-hidden border-2 border-blue-400/50 dark:border-blue-600/50 ring-4 ring-blue-200/30 dark:ring-blue-900/30 hover:shadow-blue-300/50 dark:hover:shadow-blue-800/50 transition-all duration-300 hover:scale-[1.01]">
                <div class="md:flex">
                  <!-- Image -->
                  <div class="md:w-1/2 relative overflow-hidden">
                    <img 
                      *ngIf="noticiaDestacada.imagen_url"
                      [src]="noticiaDestacada.imagen_url" 
                      [alt]="noticiaDestacada.titulo"
                      class="w-full h-64 md:h-full object-cover hover:scale-110 transition-transform duration-700"
                      (error)="onImageError($event)"
                    />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                    <img 
                      *ngIf="!noticiaDestacada.imagen_url"
                      [src]="obtenerImagenPorDefecto(noticiaDestacada.id)"
                      [alt]="noticiaDestacada.titulo"
                      class="w-full h-64 md:h-full object-cover hover:scale-110 transition-transform duration-700"
                      (error)="onImageErrorDefault($event, noticiaDestacada.id)"
                    />
                  </div>
                  
                  <!-- Content -->
                  <div class="md:w-1/2 p-8">
                    <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
                      <div class="flex items-center gap-2 flex-wrap">
                        <span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-slate-700 to-blue-700 text-white shadow-lg animate-pulse">
                          DESTACADA
                        </span>
                        <span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 text-blue-800 dark:text-blue-100 shadow-md">
                          {{ noticiaDestacada.fuente }}
                        </span>
                        <span 
                          *ngIf="obtenerUbicacion(noticiaDestacada)" 
                          class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-800 text-green-800 dark:text-green-100 shadow-md"
                          [title]="obtenerUbicacionCompleta(noticiaDestacada)"
                        >
                          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                          </svg>
                          {{ obtenerUbicacion(noticiaDestacada) }}
                        </span>
                      </div>
                    </div>
                    
                    <h2 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">
                      {{ noticiaDestacada.titulo }}
                    </h2>
                    
                    <p class="text-gray-600 dark:text-gray-300 mb-6 line-clamp-4">
                      {{ noticiaDestacada.contenido }}
                    </p>
                    
                    <div class="flex items-center justify-between">
                      <time class="text-sm text-gray-500 dark:text-gray-400" [dateTime]="noticiaDestacada.fecha">
                        {{ formatearFecha(noticiaDestacada.fecha) }}
                      </time>
                      
                      <div class="flex items-center gap-2">
                        <button
                          (click)="toggleFavorito(noticiaDestacada); $event.stopPropagation()"
                          [disabled]="!planService.isPro()"
                          class="p-3 rounded-xl transition-all duration-300 shadow-xl bg-white/95 dark:bg-gray-700/95 no-shimmer-button"
                          [class.bg-gradient-to-br]="esFavorito(noticiaDestacada.id) && planService.isPro()"
                          [class.from-yellow-400]="esFavorito(noticiaDestacada.id) && planService.isPro()"
                          [class.to-yellow-600]="esFavorito(noticiaDestacada.id) && planService.isPro()"
                          [class.text-white]="esFavorito(noticiaDestacada.id) && planService.isPro()"
                          [class.bg-gray-100/90]="!esFavorito(noticiaDestacada.id) || !planService.isPro()"
                          [class.dark:bg-gray-700/90]="!esFavorito(noticiaDestacada.id) || !planService.isPro()"
                          [class.text-gray-400]="!planService.isPro()"
                          [class.text-gray-600]="planService.isPro() && !esFavorito(noticiaDestacada.id)"
                          [class.dark:text-gray-300]="planService.isPro() && !esFavorito(noticiaDestacada.id)"
                          [class.hover:scale-110]="planService.isPro()"
                          [class.hover:rotate-12]="esFavorito(noticiaDestacada.id) && planService.isPro()"
                          [class.hover:bg-gray-200]="planService.isPro() && !esFavorito(noticiaDestacada.id)"
                          [class.cursor-not-allowed]="!planService.isPro()"
                          [title]="!planService.isPro() ? 'Actualiza a Pro para guardar favoritos' : (esFavorito(noticiaDestacada.id) ? 'Quitar de favoritos' : 'Agregar a favoritos')"
                        >
                          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path *ngIf="esFavorito(noticiaDestacada.id) && planService.isPro()" fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
                            <path *ngIf="!esFavorito(noticiaDestacada.id) || !planService.isPro()" fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" fill-opacity="0.3"/>
                          </svg>
                        </button>
                        <a 
                          [href]="noticiaDestacada.link" 
                          target="_blank"
                          rel="noopener noreferrer"
                          (click)="agregarAlHistorial(noticiaDestacada)"
                          class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-slate-700 via-blue-600 to-teal-600 text-white text-sm font-bold rounded-xl hover:from-slate-800 hover:via-blue-700 hover:to-teal-700 transition-all duration-300 cursor-pointer shadow-xl hover:shadow-2xl hover:scale-105 transform hover:-translate-y-1"
                        >
                          Leer más
                          <svg class="ml-2 w-4 h-4 animate-bounce-x" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- News Grid -->
            <div *ngIf="!cargando && noticiasPaginadas.length > 0">
              <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <article 
                  *ngFor="let noticia of noticiasPaginadas" 
                  class="bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl dark:shadow-gray-900/50 hover:shadow-2xl dark:hover:shadow-gray-800/50 transition-all duration-300 overflow-hidden border-2 border-gray-200/50 dark:border-gray-700/50 ring-1 ring-gray-200/30 dark:ring-gray-700/30 transform hover:-translate-y-2 hover:scale-[1.02] group"
                >
                  <!-- Image -->
                  <div class="relative overflow-hidden">
                    <div *ngIf="noticia.imagen_url" class="bg-gradient-to-br from-gray-200 to-gray-300">
                      <img 
                        [src]="noticia.imagen_url" 
                        [alt]="noticia.titulo"
                        class="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                        (error)="onImageError($event)"
                      />
                      <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <img 
                      *ngIf="!noticia.imagen_url"
                      [src]="obtenerImagenPorDefecto(noticia.id)"
                      [alt]="noticia.titulo"
                      class="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                      (error)="onImageErrorDefault($event, noticia.id)"
                    />
                    <!-- Botón Favorito -->
                    <button
                      (click)="toggleFavorito(noticia); $event.stopPropagation()"
                      class="absolute top-3 right-3 p-2.5 rounded-full transition-all duration-300 shadow-2xl bg-white/95 dark:bg-gray-700/95 z-10 no-shimmer-button"
                      [class.bg-gradient-to-br]="esFavorito(noticia.id)"
                      [class.from-yellow-400]="esFavorito(noticia.id)"
                      [class.to-yellow-600]="esFavorito(noticia.id)"
                      [class.text-white]="esFavorito(noticia.id)"
                      [class.bg-white/95]="!esFavorito(noticia.id)"
                      [class.text-gray-600]="!esFavorito(noticia.id)"
                      [class.dark:text-gray-300]="!esFavorito(noticia.id)"
                      [class.hover:scale-110]="true"
                      [class.hover:rotate-12]="esFavorito(noticia.id)"
                      [class.hover:bg-gray-100]="!esFavorito(noticia.id) && !planService.isPro()"
                      [title]="esFavorito(noticia.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'"
                    >
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
                      </svg>
                    </button>
                  </div>
                  
                  <!-- Content -->
                  <div class="p-5">
                    <!-- Source, Location and Date -->
                    <div class="flex flex-col gap-2 mb-3">
                      <div class="flex items-center justify-between flex-wrap gap-2">
                        <div class="flex items-center gap-2 flex-wrap">
                          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {{ noticia.fuente }}
                          </span>
                          <span 
                            *ngIf="obtenerUbicacion(noticia)" 
                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                            [title]="obtenerUbicacionCompleta(noticia)"
                          >
                            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                            {{ obtenerUbicacion(noticia) }}
                          </span>
                        </div>
                        <time class="text-xs text-gray-500 dark:text-gray-400" [dateTime]="noticia.fecha">
                          {{ formatearFecha(noticia.fecha) }}
                        </time>
                      </div>
                    </div>
                    
                    <!-- Title -->
                    <h2 class="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 min-h-[3rem]">
                      {{ noticia.titulo }}
                    </h2>
                    
                    <!-- Content Preview -->
                    <p class="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                      {{ noticia.contenido }}
                    </p>
                    
                    <!-- Read More Button -->
                    <div class="flex justify-end">
                      <a 
                        [href]="noticia.link" 
                        target="_blank"
                        rel="noopener noreferrer"
                        (click)="agregarAlHistorial(noticia)"
                        class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-slate-600 to-teal-600 text-white text-sm font-bold rounded-lg hover:from-slate-700 hover:to-teal-700 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl hover:scale-105 transform group-hover:translate-x-1"
                      >
                        Leer más
                        <svg class="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                </article>
              </div>

              <!-- Pagination -->
              <div class="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 p-6 border border-gray-200 dark:border-gray-700">
                <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <!-- Page Info -->
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    Mostrando 
                    {{ paginaActual === 1 ? 1 : ((paginaActual - 1) * noticiasPorPagina) }} - 
                    {{ Math.min(paginaActual === 1 ? noticiasPorPagina : ((paginaActual - 1) * noticiasPorPagina + noticiasPaginadas.length), noticiasFiltradas.length) }} 
                    de {{ noticiasFiltradas.length }} noticias
                  </div>

                  <!-- Page Size Selector -->
                  <div class="flex items-center gap-2">
                    <label class="text-sm text-gray-600 dark:text-gray-400">Noticias por página:</label>
                    <select
                      [(ngModel)]="noticiasPorPagina"
                      (ngModelChange)="cambiarNoticiasPorPagina()"
                      class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option [value]="12">12</option>
                      <option [value]="24">24</option>
                      <option [value]="48">48</option>
                      <option [value]="96">96</option>
                    </select>
                  </div>

                  <!-- Pagination Controls -->
                  <div class="flex items-center gap-2">
                    <button
                      (click)="irAPrimeraPagina()"
                      [disabled]="paginaActual === 1"
                      class="px-3 py-1.5 text-sm font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 dark:hover:from-gray-600 dark:hover:to-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                      title="Primera página"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
                      </svg>
                    </button>

                    <button
                      (click)="irAPaginaAnterior()"
                      [disabled]="paginaActual === 1"
                      class="px-4 py-1.5 text-sm font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-600 dark:hover:to-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                    >
                      Anterior
                    </button>

                    <!-- Page Numbers -->
                    <div class="flex gap-1">
                      <button
                        *ngFor="let pagina of obtenerPaginasVisibles()"
                        (click)="irAPagina(pagina)"
                        [class.bg-gradient-to-r]="pagina === paginaActual"
                        [class.from-slate-600]="pagina === paginaActual"
                        [class.to-teal-600]="pagina === paginaActual"
                        [class.dark:from-slate-700]="pagina === paginaActual && themeService.darkMode()"
                        [class.dark:to-teal-700]="pagina === paginaActual && themeService.darkMode()"
                        [class.text-white]="pagina === paginaActual"
                        [class.bg-white]="pagina !== paginaActual"
                        [class.dark:bg-gray-700]="pagina !== paginaActual && themeService.darkMode()"
                        [class.text-gray-700]="pagina !== paginaActual"
                        [class.dark:text-gray-300]="pagina !== paginaActual && themeService.darkMode()"
                        class="px-4 py-1.5 text-sm font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gradient-to-r hover:from-slate-600 hover:to-teal-600 dark:hover:from-slate-700 dark:hover:to-teal-700 hover:text-white hover:border-transparent transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110"
                      >
                        {{ pagina }}
                      </button>
                    </div>

                    <button
                      (click)="irAPaginaSiguiente()"
                      [disabled]="paginaActual === totalPaginas"
                      class="px-4 py-1.5 text-sm font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-600 dark:hover:to-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                    >
                      Siguiente
                    </button>

                    <button
                      (click)="irAUltimaPagina()"
                      [disabled]="paginaActual === totalPaginas"
                      class="px-3 py-1.5 text-sm font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 dark:hover:from-gray-600 dark:hover:to-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                      title="Última página"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .line-clamp-4 {
      display: -webkit-box;
      -webkit-line-clamp: 4;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
    
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }

    /* Estilos para la barra de desplazamiento del sidebar */
    .sidebar-scroll::-webkit-scrollbar {
      width: 8px;
    }

    .sidebar-scroll::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }

    .sidebar-scroll::-webkit-scrollbar-thumb {
      background: #cbd5e0;
      border-radius: 10px;
    }

    .sidebar-scroll::-webkit-scrollbar-thumb:hover {
      background: #a0aec0;
    }

    /* Para Firefox */
    .sidebar-scroll {
      scrollbar-width: thin;
      scrollbar-color: #cbd5e0 #f1f1f1;
    }

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

    /* Animaciones personalizadas */
    @keyframes shimmer {
      0% {
        transform: translateX(-100%) translateY(0) rotate(-12deg);
      }
      100% {
        transform: translateX(200%) translateY(0) rotate(-12deg);
      }
    }

    @keyframes bounce-x {
      0%, 100% {
        transform: translateX(0);
      }
      50% {
        transform: translateX(4px);
      }
    }

    .animate-shimmer {
      animation: shimmer 3s infinite;
    }

    .animate-bounce-x {
      animation: bounce-x 1s infinite;
    }

    /* Efectos de hover mejorados */
    .group:hover .group-hover\:translate-x-1 {
      transform: translateX(0.25rem);
    }

    /* Mejoras en las imágenes */
    article img {
      transition: transform 0.3s ease, filter 0.3s ease;
    }

    article:hover img {
      transform: scale(1.05);
      filter: brightness(1.1);
    }

    /* Efectos de brillo en botones (excluir botones de favoritos) */
    button:hover:not(.no-shimmer-button) {
      position: relative;
      overflow: hidden;
    }

    button:hover:not(.no-shimmer-button)::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      animation: shimmer 1.5s infinite;
    }

    /* Excluir animación de shimmer en botones de favoritos */
    .no-shimmer-button:hover {
      overflow: visible;
    }

    .no-shimmer-button:hover::before {
      display: none;
    }
  `]
})
export class PortalNoticiasComponent implements OnInit, OnDestroy {
  private supabase: SupabaseClient;
  private authSubscription?: Subscription;
  private planSubscription?: Subscription;

  // Datos
  noticias: Noticia[] = [];
  noticiasFiltradas: Noticia[] = [];
  noticiasPaginadas: Noticia[] = [];
  noticiaDestacada: Noticia | null = null;
  noticiasPopulares: Noticia[] = [];
  noticiasAutores: Noticia[] = [];
  autoresDestacados: string[] = [];

  // Filtros
  fuentes: string[] = [];
  categorias: string[] = [];

  // Selecciones de filtros
  fuenteSeleccionada: string = '';
  categoriaSeleccionada: string = '';
  paisSeleccionado: string = '';
  ordenSeleccionado: string = 'recientes';
  terminoBusqueda: string = '';
  autorSeleccionado: string = '';

  // Paginación
  paginaActual: number = 1;
  noticiasPorPagina: number = 12;
  totalPaginas: number = 0;

  // Estados
  cargando: boolean = false;
  error: string = '';
  estaAutenticado: boolean = false;
  mostrandoDialogoBusqueda: boolean = false;
  mostrandoPerfil: boolean = false;
  usuarioActual: any = null;

  // Para usar Math en el template
  Math = Math;

  // Array de imágenes por defecto
  private imagenesPorDefecto: string[] = [
    'portadas-periodicos.jpg',
    'images.jpeg',
    'images (1).jpeg',
    'images (2).jpeg',
    'images (3).jpeg',
    'images (4).jpeg',
    'images (5).jpeg',
    'images (6).jpeg',
    'images (7).jpeg',
    'depositphotos_6898984-stock-photo-worldwide-news-background.jpg',
    '25361590-ilustración-de-un-periódico-con-noticias-relacionadas-texto-texto-lorem-ipsum.jpg',
    '18003446-illustrated-of-a-newspaper-with-news-related-text.jpg',
    'hq720.jpg',
    '1600w-Vh4S5Wt7FD4.webp',
    'istockphoto-1044823920-612x612.jpg',
    'randomly-scattered-scraps-old-newspapers-600nw-2489094873.webp',
    'pngtree-newspapers-press-writing-news-photo-picture-image_5208303.jpg',
    '1600w-pLEn7AqlMis.webp'
  ];

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly storageService: StorageService,
    public readonly planService: PlanService,
    public readonly themeService: ThemeService
  ) {
    this.supabase = createClient(
      'https://aplusyghdeuyewrstikg.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwbHVzeWdoZGV1eWV3cnN0aWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MzU5MTksImV4cCI6MjA3MzIxMTkxOX0.n1m0CnGGWYVex9AGB9XEsUNDs-VLorFK2tjyKLfQIps'
    );
  }

  ngOnInit() {
    // Verificar estado de autenticación
    this.estaAutenticado = this.authService.isAuthenticated();

    // Guardar email del usuario actual si está autenticado
    const currentUser = this.authService.currentUserValue;
    if (currentUser?.email) {
      localStorage.setItem('current_user_email', currentUser.email);
    }

    // Verificar plan inicial y planes expirados
    this.planService.checkProStatusAsync().then(() => {
      // La UI se actualizará automáticamente
    });

    // Suscribirse a cambios en el plan (opcional, para actualización en tiempo real)
    this.planSubscription = this.planService.plan$.subscribe(() => {
      // La UI se actualizará automáticamente cuando cambie el plan
      // No necesitamos forzar detectChanges aquí ya que Angular lo hace automáticamente
    });

    // Suscribirse a cambios en la autenticación
    this.authSubscription = this.authService.currentUser.subscribe(user => {
      this.estaAutenticado = user !== null;
      this.usuarioActual = user;

      // Actualizar email cuando cambia el usuario
      if (user?.email) {
        localStorage.setItem('current_user_email', user.email);
        // Verificar plan después de actualizar email (incluyendo expiración)
        this.planService.checkProStatusAsync();
      } else {
        localStorage.removeItem('current_user_email');
        // Si no hay usuario, forzar Free
        this.planService.setPlan('free');
        this.usuarioActual = null;
      }

      // El cambio se detectará automáticamente
    });

    // Inicializar usuario actual
    this.usuarioActual = this.authService.currentUserValue;

    this.cargarNoticias();
  }

  @HostListener('document:click', ['$event'])
  cerrarPerfilSiClickFuera(event: MouseEvent) {
    if (!this.mostrandoPerfil) {
      return;
    }

    const target = event.target as HTMLElement;
    
    // Verificar si el click fue dentro del contenedor del perfil o el dropdown
    const perfilContainer = target.closest('.perfil-dropdown-container');
    const perfilDropdown = target.closest('.perfil-dropdown');
    
    // Si el click no fue en el contenedor ni en el dropdown, cerrar
    if (!perfilContainer && !perfilDropdown) {
      this.mostrandoPerfil = false;
    }
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.planSubscription) {
      this.planSubscription.unsubscribe();
    }
  }

  async cargarNoticias() {
    this.cargando = true;
    this.error = '';

    try {
      let todasLasNoticias: Noticia[] = [];
      let desde = 0;
      const limite = 1000; // Cargar en lotes de 1000
      let hayMasRegistros = true;

      console.log('🔄 Iniciando carga de noticias desde Supabase...');

      // Cargar todas las noticias en lotes
      while (hayMasRegistros) {
        const { data, error } = await this.supabase
          .from('noticias')
          .select('*')
          .order('fecha', { ascending: false })
          .range(desde, desde + limite - 1);

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          todasLasNoticias = [...todasLasNoticias, ...data];
          console.log(`📦 Cargado lote: ${data.length} noticias(Total: ${todasLasNoticias.length})`);
          desde += limite;

          // Si obtuvimos menos registros que el límite, ya no hay más
          if (data.length < limite) {
            hayMasRegistros = false;
          }
        } else {
          hayMasRegistros = false;
        }
      }

      this.noticias = todasLasNoticias;
      this.extraerDatosUnicos();
      this.aplicarFiltros();

      console.log(`✅ ¡Carga completa! Total de noticias: ${this.noticias.length}`);

    } catch (error: any) {
      this.error = error.message || 'Error desconocido al cargar las noticias';
      console.error('❌ Error cargando noticias:', error);
    } finally {
      this.cargando = false;
    }
  }

  private extraerDatosUnicos() {
    // Extraer fuentes únicas
    const fuentesUnicas = new Set(this.noticias.map(noticia => noticia.fuente));
    this.fuentes = Array.from(fuentesUnicas).sort((a, b) => a.localeCompare(b));

    // Extraer categorías únicas (asumiendo que existe el campo categoria)
    const categoriasUnicas = new Set(
      this.noticias
        .map(noticia => noticia.categoria)
        .filter((cat): cat is string => cat !== undefined && cat !== null && cat.trim() !== '')
    );
    this.categorias = Array.from(categoriasUnicas).sort((a, b) => a.localeCompare(b));

    // Si no hay categorías en la BD, usar categorías por defecto basadas en palabras clave
    if (this.categorias.length === 0) {
      this.categorias = [
        'ciencia', 'cultura', 'delincuencia', 'deportes', 'economía',
        'educación', 'electrodomésticos', 'entretenimiento', 'incidentes',
        'medio ambiente', 'negocios', 'política', 'salud', 'tecnología', 'turismo'
      ];
    }

    // Extraer autores únicos
    const autoresUnicos = new Set(
      this.noticias
        .map(noticia => noticia.autor || noticia.fuente) // Si no hay autor, usar la fuente
        .filter((autor): autor is string => autor !== undefined && autor !== null && autor.trim() !== '')
    );
    this.autoresDestacados = Array.from(autoresUnicos).sort((a, b) => a.localeCompare(b)).slice(0, 8); // Mostrar solo los primeros 8 autores

    // Obtener noticias populares basadas en favoritos y lecturas (GLOBALES - todos los usuarios)
    this.calcularNoticiasPopulares().catch(err => {
      console.error('Error calculando noticias populares:', err);
      // Si falla, usar las primeras 5 más recientes como fallback
      this.noticiasPopulares = this.noticias.slice(0, 5);
    });

    // Obtener noticias de autores destacados (noticias 5-10 como ejemplo)
    this.noticiasAutores = this.noticias.slice(5, 10);
  }

  seleccionarCategoria(categoria: string) {
    this.categoriaSeleccionada = categoria;
    this.paginaActual = 1; // Resetear a primera página
    this.aplicarFiltros();
  }

  // Métodos para verificar plan antes de aplicar filtros

  verificarYFiltrarCategoria(valor: string) {
    if (!this.planService.isPro() && valor !== '') {
      this.mostrarMensajePlanPro('filtrar por categoría');
      this.categoriaSeleccionada = '';
      return;
    }
    this.categoriaSeleccionada = valor;
    this.aplicarFiltros();
  }

  verificarYFiltrarFuente(valor: string) {
    if (!this.planService.isPro() && valor !== '') {
      this.mostrarMensajePlanPro('filtrar por fuente');
      this.fuenteSeleccionada = '';
      return;
    }
    this.fuenteSeleccionada = valor;
    this.aplicarFiltros();
  }



  verificarYFiltrarPorAutor(autor: string) {
    if (!this.planService.isPro()) {
      this.mostrarMensajePlanPro('filtrar por autor');
      this.autorSeleccionado = '';
      return;
    }
    this.filtrarPorAutor(autor);
  }

  mostrarMensajePlanPro(accion: string) {
    Swal.fire({
      title: '<div style="font-size: 28px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">✨ Plan Pro Requerido</div>',
      html: `
<div style="text-align: center; padding: 20px 0;">
  <div style="background: linear-gradient(135deg, #475569 0%, #1e40af 100%); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px rgba(71, 85, 105, 0.3);">
    <svg style="width: 45px; height: 45px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
    </svg>
  </div>
  <p style="font-size: 18px; color: #475569; margin-bottom: 24px; font-weight: 500;">
    Para <span style="color: #1e40af; font-weight: 600;">${accion}</span> necesitas el Plan Pro
  </p>
  <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 16px; padding: 24px; margin: 20px 0; border: 2px solid #e2e8f0;">
    <p style="font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 16px; text-align: left;">
      🎯 El Plan Pro incluye:
    </p>
    <div style="text-align: left;">
      <div style="display: flex; align-items: center; margin-bottom: 12px; padding: 10px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #475569 0%, #334155 100%); width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;">
          <svg style="width: 18px; height: 18px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
          </svg>
        </div>
        <span style="font-size: 15px; color: #334155; font-weight: 500;">Filtros avanzados (categoría, fuente, autores)</span>
      </div>
      <div style="display: flex; align-items: center; margin-bottom: 12px; padding: 10px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;">
          <svg style="width: 18px; height: 18px; color: white;" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
          </svg>
        </div>
        <span style="font-size: 15px; color: #334155; font-weight: 500;">Guardar en favoritos</span>
      </div>
      <div style="display: flex; align-items: center; margin-bottom: 12px; padding: 10px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;">
          <svg style="width: 18px; height: 18px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <span style="font-size: 15px; color: #334155; font-weight: 500;">Historial de lectura</span>
      </div>
      <div style="display: flex; align-items: center; margin-bottom: 12px; padding: 10px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;">
          <svg style="width: 18px; height: 18px; color: white;" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
        </div>
        <span style="font-size: 15px; color: #334155; font-weight: 500;">Lo más popular</span>
      </div>
      <div style="display: flex; align-items: center; padding: 10px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;">
          <svg style="width: 18px; height: 18px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
        </div>
        <span style="font-size: 15px; color: #334155; font-weight: 500;">Autores destacados</span>
      </div>
    </div>
  </div>
  <p style="font-size: 14px; color: #64748b; margin-top: 20px; font-style: italic;">
    💡 Desbloquea todas las funciones premium
  </p>
</div>
      `,
      icon: undefined,
      showCancelButton: true,
      confirmButtonText: '<div style="display: flex; align-items: center; gap: 8px;"><svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg> Ver Planes</div>',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#1e40af',
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
        this.router.navigate(['/planes']);
      }
    });
  }

  private obtenerRangoFechas(orden: string): { desde: Date | null, hasta: Date | null } {
    const ahora = new Date();
    const desde = new Date();
    desde.setHours(0, 0, 0, 0);
    const hasta = new Date();
    hasta.setHours(23, 59, 59, 999);

    switch (orden) {
      case 'hoy':
        return { desde, hasta };
      
      case 'ayer':
        const ayer = new Date(desde);
        ayer.setDate(ayer.getDate() - 1);
        const finAyer = new Date(ayer);
        finAyer.setHours(23, 59, 59, 999);
        return { desde: ayer, hasta: finAyer };
      
      case 'semana':
        const inicioSemana = new Date(desde);
        inicioSemana.setDate(desde.getDate() - desde.getDay());
        return { desde: inicioSemana, hasta };
      
      case 'mes':
        const inicioMes = new Date(desde.getFullYear(), desde.getMonth(), 1);
        return { desde: inicioMes, hasta };
      
      default:
        return { desde: null, hasta: null };
    }
  }

  private filtrarPorFecha(noticias: Noticia[], orden: string): Noticia[] {
    const rangos = this.obtenerRangoFechas(orden);
    
    // Si no hay rango específico, devolver todas las noticias
    if (!rangos.desde || !rangos.hasta) {
      return noticias;
    }

    return noticias.filter(noticia => {
      try {
        // Parsear la fecha de la noticia
        const fechaNoticia = new Date(noticia.fecha);
        
        // Verificar que la fecha sea válida
        if (isNaN(fechaNoticia.getTime())) {
          return false;
        }

        // Comparar solo la fecha (sin hora) para algunos casos
        if (orden === 'hoy' || orden === 'ayer') {
          const fechaNoticiaSolo = new Date(fechaNoticia.getFullYear(), fechaNoticia.getMonth(), fechaNoticia.getDate());
          const desdeSolo = new Date(rangos.desde!.getFullYear(), rangos.desde!.getMonth(), rangos.desde!.getDate());
          const hastaSolo = new Date(rangos.hasta!.getFullYear(), rangos.hasta!.getMonth(), rangos.hasta!.getDate());
          return fechaNoticiaSolo >= desdeSolo && fechaNoticiaSolo <= hastaSolo;
        }

        // Para otros casos, comparar con hora incluida
        return fechaNoticia >= rangos.desde! && fechaNoticia <= rangos.hasta!;
      } catch (error) {
        console.error('Error al parsear fecha de noticia:', noticia.fecha, error);
        return false;
      }
    });
  }

  aplicarFiltros() {
    let noticiasFiltradas = [...this.noticias];

    // Si es plan Free, solo permitir ordenar y filtrar por país
    if (!this.planService.isPro()) {
      // Filtrar por país (disponible en Free)
      if (this.paisSeleccionado && this.paisSeleccionado !== '') {
        noticiasFiltradas = noticiasFiltradas.filter(noticia => {
          const textoCompleto = `${noticia.titulo} ${noticia.contenido}`.toLowerCase();
          return textoCompleto.includes(this.paisSeleccionado.toLowerCase());
        });
      }

      // Filtrar por fecha si es una opción de tiempo específica (ANTES de otros filtros)
      if (['hoy', 'ayer', 'semana', 'mes'].includes(this.ordenSeleccionado)) {
        const antesFiltro = noticiasFiltradas.length;
        noticiasFiltradas = this.filtrarPorFecha(noticiasFiltradas, this.ordenSeleccionado);
        console.log(`📅 Filtro ${this.ordenSeleccionado}: ${antesFiltro} → ${noticiasFiltradas.length} noticias`);
      }

      // Ordenar (disponible en Free - más recientes y más antiguos)
      if (this.ordenSeleccionado === 'recientes' || ['hoy', 'ayer', 'semana', 'mes'].includes(this.ordenSeleccionado)) {
        noticiasFiltradas.sort((a, b) =>
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        );
      } else if (this.ordenSeleccionado === 'antiguos') {
        noticiasFiltradas.sort((a, b) =>
          new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
        );
      }

      this.noticiasFiltradas = noticiasFiltradas;
      this.noticiaDestacada = this.noticiasFiltradas.length > 0 ? this.noticiasFiltradas[0] : null;
      this.calcularPaginacion();
      return;
    }

    // Para usuarios Pro, aplicar todos los filtros
    noticiasFiltradas = [...this.noticias];

    // Filtrar por búsqueda
    if (this.terminoBusqueda && this.terminoBusqueda.trim() !== '') {
      const termino = this.terminoBusqueda.toLowerCase().trim();
      noticiasFiltradas = noticiasFiltradas.filter(noticia => {
        const titulo = noticia.titulo.toLowerCase();
        const contenido = noticia.contenido.toLowerCase();
        const autor = (noticia.autor || noticia.fuente).toLowerCase();
        const fuente = noticia.fuente.toLowerCase();

        return titulo.includes(termino) ||
          contenido.includes(termino) ||
          autor.includes(termino) ||
          fuente.includes(termino);
      });
    }

    // Filtrar por autor
    if (this.autorSeleccionado) {
      noticiasFiltradas = noticiasFiltradas.filter(noticia => {
        const autor = noticia.autor || noticia.fuente;
        return autor === this.autorSeleccionado;
      });
    }

    // Filtrar por categoría
    if (this.categoriaSeleccionada) {
      noticiasFiltradas = noticiasFiltradas.filter(noticia => {
        // Si existe el campo categoria en la BD
        if (noticia.categoria) {
          return noticia.categoria.toLowerCase() === this.categoriaSeleccionada.toLowerCase();
        }
        // Si no existe, buscar en título o contenido
        const textoCompleto = `${noticia.titulo} ${noticia.contenido}`.toLowerCase();
        return textoCompleto.includes(this.categoriaSeleccionada.toLowerCase());
      });
    }

    // Filtrar por fuente
    if (this.fuenteSeleccionada) {
      noticiasFiltradas = noticiasFiltradas.filter(
        noticia => noticia.fuente === this.fuenteSeleccionada
      );
    }

    // Filtrar por país
    if (this.paisSeleccionado && this.paisSeleccionado !== 'Todos los países') {
      noticiasFiltradas = noticiasFiltradas.filter(noticia => {
        const textoCompleto = `${noticia.titulo} ${noticia.contenido}`.toLowerCase();
        return textoCompleto.includes(this.paisSeleccionado.toLowerCase());
      });
    }


    // Filtrar por fecha si es una opción de tiempo específica (ANTES de otros filtros)
    if (['hoy', 'ayer', 'semana', 'mes'].includes(this.ordenSeleccionado)) {
      const antesFiltro = noticiasFiltradas.length;
      noticiasFiltradas = this.filtrarPorFecha(noticiasFiltradas, this.ordenSeleccionado);
      console.log(`📅 Filtro ${this.ordenSeleccionado}: ${antesFiltro} → ${noticiasFiltradas.length} noticias`);
    }

    // Ordenar
    if (this.ordenSeleccionado === 'recientes' || ['hoy', 'ayer', 'semana', 'mes'].includes(this.ordenSeleccionado)) {
      noticiasFiltradas.sort((a, b) =>
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );
    } else if (this.ordenSeleccionado === 'antiguos') {
      noticiasFiltradas.sort((a, b) =>
        new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
      );
    }

    this.noticiasFiltradas = noticiasFiltradas;

    // Seleccionar noticia destacada (la primera después de filtrar)
    this.noticiaDestacada = this.noticiasFiltradas.length > 0 ? this.noticiasFiltradas[0] : null;

    // Calcular paginación
    this.calcularPaginacion();
  }

  private calcularPaginacion() {
    // Calcular total de páginas basado en TODAS las noticias filtradas
    this.totalPaginas = Math.ceil(this.noticiasFiltradas.length / this.noticiasPorPagina);

    // Asegurar que la página actual no exceda el total
    if (this.paginaActual > this.totalPaginas) {
      this.paginaActual = Math.max(1, this.totalPaginas);
    }

    // Obtener noticias de la página actual
    // INCLUIR la noticia destacada en la paginación
    const inicio = (this.paginaActual - 1) * this.noticiasPorPagina;
    const fin = inicio + this.noticiasPorPagina;

    // En la primera página, excluimos la primera noticia porque se muestra como destacada
    if (this.paginaActual === 1) {
      this.noticiasPaginadas = this.noticiasFiltradas.slice(1, fin);
    } else {
      // En las demás páginas, ajustamos el índice considerando que saltamos una en la primera página
      const inicioAjustado = inicio - 1;
      const finAjustado = fin - 1;
      this.noticiasPaginadas = this.noticiasFiltradas.slice(inicioAjustado, finAjustado);
    }
  }

  hayFiltrosActivos(): boolean {
    return this.fuenteSeleccionada !== '' ||
      this.categoriaSeleccionada !== '' ||
      this.paisSeleccionado !== '' ||
      this.ordenSeleccionado !== 'recientes' ||
      this.terminoBusqueda !== '' ||
      this.autorSeleccionado !== '';
  }

  limpiarFiltros() {
    this.fuenteSeleccionada = '';
    this.categoriaSeleccionada = '';
    this.paisSeleccionado = '';
    this.ordenSeleccionado = 'recientes';
    this.terminoBusqueda = '';
    this.autorSeleccionado = '';
    this.paginaActual = 1;
    this.aplicarFiltros();
  }

  // Métodos de paginación
  irAPagina(pagina: number) {
    this.paginaActual = pagina;
    this.calcularPaginacion();
    this.scrollToTop();
  }

  irAPaginaAnterior() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.calcularPaginacion();
      this.scrollToTop();
    }
  }

  irAPaginaSiguiente() {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.calcularPaginacion();
      this.scrollToTop();
    }
  }

  irAPrimeraPagina() {
    this.paginaActual = 1;
    this.calcularPaginacion();
    this.scrollToTop();
  }

  irAUltimaPagina() {
    this.paginaActual = this.totalPaginas;
    this.calcularPaginacion();
    this.scrollToTop();
  }

  cambiarNoticiasPorPagina() {
    this.paginaActual = 1;
    this.calcularPaginacion();
  }

  obtenerPaginasVisibles(): number[] {
    const paginas: number[] = [];
    const maxPaginasVisibles = 5;

    let inicio = Math.max(1, this.paginaActual - Math.floor(maxPaginasVisibles / 2));
    let fin = Math.min(this.totalPaginas, inicio + maxPaginasVisibles - 1);

    // Ajustar inicio si estamos cerca del final
    if (fin - inicio < maxPaginasVisibles - 1) {
      inicio = Math.max(1, fin - maxPaginasVisibles + 1);
    }

    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }

    return paginas;
  }

  private scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Obtener imagen aleatoria por defecto basada en el ID de la noticia
  // Esto asegura que la misma noticia siempre tenga la misma imagen
  obtenerImagenPorDefecto(noticiaId: number): string {
    if (this.imagenesPorDefecto.length === 0) {
      return '/assets/images/portadas-periodicos.jpg'; // Fallback
    }
    // Usar el ID de la noticia como semilla para seleccionar una imagen
    const indice = noticiaId % this.imagenesPorDefecto.length;
    const nombreArchivo = this.imagenesPorDefecto[indice];
    // Usar ruta absoluta y codificar solo los espacios y caracteres especiales problemáticos
    return `/assets/images/${nombreArchivo}`;
  }

  // Manejar error de carga de imagen por defecto e intentar con otra
  onImageErrorDefault(event: any, noticiaId: number) {
    const img = event.target;
    const currentSrc = img.src;
    
    // Extraer el nombre del archivo actual
    let currentFileName = currentSrc.split('/').pop() || '';
    // Intentar decodificar si está codificado
    try {
      currentFileName = decodeURIComponent(currentFileName);
    } catch (e) {
      // Si falla la decodificación, usar el nombre tal cual
    }
    
    const currentIndex = this.imagenesPorDefecto.indexOf(currentFileName);
    
    // Intentar con la siguiente imagen del array
    let nextIndex = 0;
    if (currentIndex >= 0 && currentIndex < this.imagenesPorDefecto.length - 1) {
      nextIndex = (currentIndex + 1) % this.imagenesPorDefecto.length;
    }
    
    const nombreArchivo = this.imagenesPorDefecto[nextIndex];
    img.src = `/assets/images/${nombreArchivo}`;
  }

  // Utilidades
  formatearFecha(fecha: string): string {
    try {
      const fechaObj = new Date(fecha);
      return fechaObj.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return fecha;
    }
  }

  onImageError(event: any) {
    event.target.style.display = 'none';
  }

  // Métodos de búsqueda
  buscarNoticias() {
    // Verificar si está autenticado antes de buscar
    if (!this.estaAutenticado) {
      this.irALogin();
      return;
    }
    this.paginaActual = 1;
    this.aplicarFiltros();
  }

  verificarBusqueda(event: Event) {
    // Si no está autenticado y hace click o focus en el buscador, redirigir al login
    if (!this.estaAutenticado && !this.mostrandoDialogoBusqueda) {
      event.preventDefault();
      event.stopPropagation();

      // Prevenir que se muestre múltiples veces
      this.mostrandoDialogoBusqueda = true;

      // Mostrar mensaje informativo
      Swal.fire({
        title: 'Inicio de sesión requerido',
        text: 'Debes iniciar sesión para usar el buscador.',
        icon: 'info',
        confirmButtonText: 'Ir a iniciar sesión',
        confirmButtonColor: '#2563eb',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        cancelButtonColor: '#6b7280',
        allowOutsideClick: false,
        allowEscapeKey: true
      }).then((result) => {
        // Resetear el flag cuando se cierre el diálogo
        this.mostrandoDialogoBusqueda = false;

        if (result.isConfirmed) {
          this.irALogin();
        }
      });
    }
  }

  limpiarBusqueda() {
    this.terminoBusqueda = '';
    this.buscarNoticias();
  }

  // Métodos de autor
  filtrarPorAutor(autor: string) {
    if (this.autorSeleccionado === autor) {
      // Si ya está seleccionado, lo deseleccionamos
      this.autorSeleccionado = '';
    } else {
      this.autorSeleccionado = autor;
    }
    this.paginaActual = 1;
    this.aplicarFiltros();
    this.scrollToTop();
  }

  contarNoticiasPorAutor(autor: string): number {
    return this.noticias.filter(noticia => {
      const autorNoticia = noticia.autor || noticia.fuente;
      return autorNoticia === autor;
    }).length;
  }

  // Métodos de autenticación
  irALogin() {
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: '/noticias' }
    });
  }

  async cerrarSesion() {
    // Mostrar diálogo de confirmación
    const result = await Swal.fire({
      title: '<div style="font-size: 28px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">¿Está seguro?</div>',
      html: `
<div style="text-align: center; padding: 20px 0;">
  <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px rgba(245, 158, 11, 0.3);">
    <svg style="width: 45px; height: 45px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  </div>
  <p style="font-size: 18px; color: #475569; margin-bottom: 8px; font-weight: 600;">
    ¿Desea cerrar su sesión?
  </p>
  <p style="font-size: 14px; color: #64748b; margin-top: 8px;">
    Esta acción cerrará tu sesión actual y tendrás que iniciar sesión nuevamente para acceder a tus funciones.
  </p>
</div>
      `,
      icon: undefined,
      showCancelButton: true,
      confirmButtonText: '<div style="display: flex; align-items: center; gap: 8px;"><svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg> Sí, cerrar sesión</div>',
      cancelButtonText: '<div style="display: flex; align-items: center; gap: 8px;">Cancelar</div>',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      width: '500px',
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
      allowEscapeKey: true,
      reverseButtons: true
    });

    // Si el usuario confirma (Sí)
    if (result.isConfirmed) {
      const signOutResult = await this.authService.signOut();
      if (signOutResult.success) {
        // Mostrar mensaje de confirmación de éxito
        await Swal.fire({
          title: '<div style="font-size: 28px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">¡Sesión cerrada!</div>',
          html: `
<div style="text-align: center; padding: 20px 0;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);">
    <svg style="width: 45px; height: 45px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
    </svg>
  </div>
  <p style="font-size: 18px; color: #475569; margin-bottom: 8px; font-weight: 500;">
    Has cerrado sesión exitosamente.
  </p>
  <p style="font-size: 14px; color: #64748b; margin-top: 8px;">
    Gracias por usar Noticias al Día.
  </p>
</div>
          `,
          icon: undefined,
          confirmButtonText: '<div style="display: flex; align-items: center; gap: 8px;"><svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Aceptar</div>',
          confirmButtonColor: '#10b981',
          width: '450px',
          padding: '2rem',
          customClass: {
            popup: 'swal2-popup-custom',
            title: 'swal2-title-custom',
            htmlContainer: 'swal2-html-container-custom',
            confirmButton: 'swal2-confirm-custom'
          },
          buttonsStyling: true,
          backdrop: true,
          allowOutsideClick: true,
          allowEscapeKey: true
        });
        // Después de cerrar sesión, quedarse en la página de noticias
        this.router.navigate(['/noticias']);
      } else {
        // Si hubo un error al cerrar sesión
        await Swal.fire({
          title: '<div style="font-size: 28px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">Error</div>',
          html: `
<div style="text-align: center; padding: 20px 0;">
  <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);">
    <svg style="width: 45px; height: 45px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
    </svg>
  </div>
  <p style="font-size: 18px; color: #475569; margin-bottom: 8px; font-weight: 500;">
    No se pudo cerrar la sesión
  </p>
  <p style="font-size: 14px; color: #64748b; margin-top: 8px;">
    Por favor, intente nuevamente.
  </p>
</div>
          `,
          icon: undefined,
          confirmButtonText: '<div style="display: flex; align-items: center; gap: 8px;"><svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg> Aceptar</div>',
          confirmButtonColor: '#dc2626',
          width: '450px',
          padding: '2rem',
          customClass: {
            popup: 'swal2-popup-custom',
            title: 'swal2-title-custom',
            htmlContainer: 'swal2-html-container-custom',
            confirmButton: 'swal2-confirm-custom'
          },
          buttonsStyling: true,
          backdrop: true,
          allowOutsideClick: true,
          allowEscapeKey: true
        });
      }
    }
    // Si el usuario cancela (No), no hacer nada y mantener la sesión iniciada
  }

  verificarYAcceder(link: string, event: Event) {
    if (!this.estaAutenticado) {
      event.preventDefault();
      // Guardar el link al que quería acceder para después del login
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/noticias', articleUrl: link }
      });
    }
    // Si está autenticado, el enlace funcionará normalmente
  }

  // Métodos para obtener ubicación
  obtenerUbicacion(noticia: Noticia): string {
    // Solo mostrar el país
    if (noticia.pais) {
      return noticia.pais;
    }

    // Si no hay país, retornar vacío
    return '';
  }

  obtenerUbicacionCompleta(noticia: Noticia): string {
    const partes: string[] = [];

    if (noticia.ciudad) {
      partes.push(`Ciudad: ${noticia.ciudad}`);
    }
    if (noticia.departamento) {
      partes.push(`Departamento: ${noticia.departamento}`);
    }
    if (noticia.pais) {
      partes.push(`País: ${noticia.pais}`);
    }

    if (partes.length === 0) {
      return 'Ubicación no disponible';
    }

    return partes.join(' | ');
  }

  // Métodos para Favoritos
  esFavorito(noticiaId: number): boolean {
    return this.storageService.esFavorito(noticiaId);
  }

  async toggleFavorito(noticia: Noticia) {
    // Verificar si tiene plan Pro
    if (!this.planService.isPro()) {
      Swal.fire({
        title: '<div style="font-size: 28px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">✨ Plan Pro Requerido</div>',
        html: `
<div style="text-align: center; padding: 20px 0;">
  <div style="background: linear-gradient(135deg, #475569 0%, #1e40af 100%); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px rgba(71, 85, 105, 0.3);">
    <svg style="width: 45px; height: 45px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
    </svg>
  </div>
  <p style="font-size: 18px; color: #475569; margin-bottom: 24px; font-weight: 500;">
    Para <span style="color: #1e40af; font-weight: 600;">guardar noticias en favoritos</span> necesitas el Plan Pro
  </p>
  <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 16px; padding: 24px; margin: 20px 0; border: 2px solid #e2e8f0;">
    <p style="font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 16px; text-align: left;">
      🎯 El Plan Pro incluye:
    </p>
    <div style="text-align: left;">
      <div style="display: flex; align-items: center; margin-bottom: 12px; padding: 10px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #475569 0%, #334155 100%); width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;">
          <svg style="width: 18px; height: 18px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
          </svg>
        </div>
        <span style="font-size: 15px; color: #334155; font-weight: 500;">Filtros avanzados (categoría, fuente, autores)</span>
      </div>
      <div style="display: flex; align-items: center; margin-bottom: 12px; padding: 10px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;">
          <svg style="width: 18px; height: 18px; color: white;" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
          </svg>
        </div>
        <span style="font-size: 15px; color: #334155; font-weight: 500;">Guardar en favoritos</span>
      </div>
      <div style="display: flex; align-items: center; margin-bottom: 12px; padding: 10px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;">
          <svg style="width: 18px; height: 18px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <span style="font-size: 15px; color: #334155; font-weight: 500;">Historial de lectura</span>
      </div>
      <div style="display: flex; align-items: center; margin-bottom: 12px; padding: 10px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;">
          <svg style="width: 18px; height: 18px; color: white;" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
        </div>
        <span style="font-size: 15px; color: #334155; font-weight: 500;">Lo más popular</span>
      </div>
      <div style="display: flex; align-items: center; padding: 10px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;">
          <svg style="width: 18px; height: 18px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
        </div>
        <span style="font-size: 15px; color: #334155; font-weight: 500;">Autores destacados</span>
      </div>
    </div>
  </div>
  <p style="font-size: 14px; color: #64748b; margin-top: 20px; font-style: italic;">
    💡 Desbloquea todas las funciones premium
  </p>
</div>
        `,
        icon: undefined,
        showCancelButton: true,
        confirmButtonText: '<div style="display: flex; align-items: center; gap: 8px;"><svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg> Ver Planes</div>',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#1e40af',
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
          this.router.navigate(['/planes']);
        }
      });
      return;
    }

    if (this.esFavorito(noticia.id)) {
      await this.storageService.eliminarFavorito(noticia.id);
      Swal.fire({
        title: 'Eliminado de favoritos',
        text: 'La noticia ha sido eliminada de tus favoritos.',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#2563eb',
        timer: 2000
      });
    } else {
      await this.storageService.agregarFavorito(noticia);
      Swal.fire({
        title: 'Agregado a favoritos',
        text: 'La noticia ha sido agregada a tus favoritos.',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#2563eb',
        timer: 2000
      });
    }

    // Recalcular noticias populares después de cambiar favoritos (GLOBALES)
    this.calcularNoticiasPopulares().catch(err => {
      console.error('Error recalculando noticias populares:', err);
    });
  }

  // Métodos para Historial
  async agregarAlHistorial(noticia: Noticia) {
    // Solo agregar al historial si tiene plan Pro
    if (this.planService.isPro()) {
      await this.storageService.agregarAlHistorial(noticia);
      // Recalcular noticias populares después de agregar al historial (GLOBALES)
      this.calcularNoticiasPopulares().catch(err => {
        console.error('Error recalculando noticias populares:', err);
      });
    }
  }

  // Métodos para Perfil
  obtenerInicialUsuario(): string {
    try {
      // Verificar que existe el usuario y el email
      if (!this.usuarioActual || !this.usuarioActual.email) {
        return '?';
      }

      const email = this.usuarioActual.email;

      // Verificar si existen los metadatos y el nombre completo
      const userMetadata = this.usuarioActual.user_metadata;
      if (userMetadata && typeof userMetadata === 'object') {
        const nombre = userMetadata.full_name;

        // Si tiene nombre completo y es válido, usar las iniciales
        if (nombre && typeof nombre === 'string' && nombre.trim() !== '' && nombre.trim() !== 'undefined') {
          const partes = nombre.trim().split(' ').filter(p => p.length > 0 && p !== 'undefined');
          if (partes.length > 1) {
            // Primer nombre y apellido
            const primeraLetra = partes[0]?.[0];
            const ultimaLetra = partes[partes.length - 1]?.[0];
            if (primeraLetra && ultimaLetra) {
              return (primeraLetra + ultimaLetra).toUpperCase();
            }
          } else if (partes.length === 1 && partes[0]?.[0]) {
            // Solo un nombre, usar la primera letra
            return partes[0][0].toUpperCase();
          }
        }
      }

      // Si no tiene nombre válido o no hay metadatos, usar la primera letra del email
      if (email && email.length > 0) {
        return email[0].toUpperCase();
      }

      return '?';
    } catch (error) {
      console.error('Error obteniendo inicial del usuario:', error);
      // Fallback seguro
      if (this.usuarioActual?.email && this.usuarioActual.email.length > 0) {
        return this.usuarioActual.email[0].toUpperCase();
      }
      return '?';
    }
  }

  obtenerNombreUsuario(): string {
    try {
      // Verificar que existe el usuario
      if (!this.usuarioActual) {
        return 'Usuario';
      }

      // Verificar si existen los metadatos y el nombre completo
      const userMetadata = this.usuarioActual.user_metadata;
      if (userMetadata && typeof userMetadata === 'object' && userMetadata !== null) {
        const nombre = userMetadata.full_name;

        // Si tiene nombre completo y es válido (no undefined, no null, no vacío, no la cadena "undefined")
        if (nombre !== undefined && nombre !== null && typeof nombre === 'string') {
          const nombreLimpio = nombre.trim();
          if (nombreLimpio !== '' && nombreLimpio !== 'undefined' && nombreLimpio !== 'null') {
            return nombreLimpio;
          }
        }
      }

      // Si no tiene nombre válido o no hay metadatos, usar el email
      const email = this.usuarioActual.email;
      if (email && typeof email === 'string' && email.trim() !== '') {
        return email.trim();
      }

      return 'Usuario';
    } catch (error) {
      console.error('Error obteniendo nombre del usuario:', error);
      // Fallback seguro
      const email = this.usuarioActual?.email;
      if (email && typeof email === 'string' && email.trim() !== '') {
        return email.trim();
      }
      return 'Usuario';
    }
  }

  obtenerEmailUsuario(): string {
    try {
      if (!this.usuarioActual) {
        return 'Sin email';
      }

      const email = this.usuarioActual.email;
      if (email && typeof email === 'string' && email.trim() !== '') {
        return email.trim();
      }

      return 'Sin email';
    } catch (error) {
      console.error('Error obteniendo email del usuario:', error);
      return 'Sin email';
    }
  }

  irAPlanes() {
    this.router.navigate(['/planes']);
  }

  irAFavoritos() {
    if (!this.planService.isPro()) {
      this.mostrarMensajePlanPro('acceder a favoritos');
    } else {
      this.router.navigate(['/favoritos']);
    }
  }

  irAHistorial() {
    if (!this.planService.isPro()) {
      this.mostrarMensajePlanPro('acceder al historial');
    } else {
      this.router.navigate(['/historial']);
    }
  }

  verificarYAccederPopular(link: string, event: Event) {
    if (!this.planService.isPro()) {
      event.preventDefault();
      event.stopPropagation();
      this.mostrarMensajePlanPro('acceder a las noticias populares');
    } else {
      // Si es Pro, permitir el acceso normal
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  }

  /**
   * Calcula las noticias más populares basándose en:
   * - Número de veces que han sido guardadas en favoritos (GLOBAL - todos los usuarios)
   * - Número de veces que han sido leídas (historial GLOBAL - todos los usuarios)
   * Score = (favoritos * 2) + lecturas
   * 
   * IMPORTANTE: Las estadísticas son GLOBALES, sumando las acciones de TODOS los usuarios
   */
  private async calcularNoticiasPopulares(): Promise<void> {
    try {
      // Obtener estadísticas de popularidad GLOBALES desde Supabase
      const popularidadStats = await this.storageService.getAllPopularidadStats();

      // Crear un array con las noticias y sus scores
      const noticiasConScore = this.noticias.map(noticia => {
        const stats = popularidadStats[noticia.id] || { favoritos: 0, lecturas: 0, score: 0 };
        return {
          noticia,
          score: stats.score,
          favoritos: stats.favoritos,
          lecturas: stats.lecturas
        };
      });

      // Ordenar por score descendente (más populares primero)
      noticiasConScore.sort((a, b) => {
        // Si tienen el mismo score, priorizar las más recientes
        if (b.score === a.score) {
          return new Date(b.noticia.fecha).getTime() - new Date(a.noticia.fecha).getTime();
        }
        return b.score - a.score;
      });

      // Tomar las top 5
      this.noticiasPopulares = noticiasConScore
        .slice(0, 5)
        .map(item => item.noticia);

      // Si no hay suficientes noticias con score, completar con las más recientes
      if (this.noticiasPopulares.length < 5) {
        const noticiasRestantes = this.noticias
          .filter(n => !this.noticiasPopulares.some(p => p.id === n.id))
          .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
          .slice(0, 5 - this.noticiasPopulares.length);

        this.noticiasPopulares = [...this.noticiasPopulares, ...noticiasRestantes];
      }
    } catch (error) {
      console.error('Error calculando noticias populares:', error);
      // En caso de error, usar las más recientes como fallback
      this.noticiasPopulares = this.noticias
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        .slice(0, 5);
    }
  }
}