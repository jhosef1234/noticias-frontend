import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

interface Noticia {
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
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-gradient-to-r from-blue-600 to-blue-800 shadow-2xl border-b border-blue-900">
        <div class="w-full px-4 sm:px-6 lg:px-8 py-6">
          <!-- Desktop Layout -->
          <div class="hidden md:grid md:grid-cols-3 items-center gap-4">
            <!-- Logo and Title Section - Left -->
            <div class="flex items-center space-x-4">
              <div class="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                <svg class="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                </svg>
              </div>
              <div>
                <h1 class="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  Portal de Noticias
                </h1>
                <p class="text-blue-100 text-sm md:text-base mt-1">
                  Tu fuente de información confiable 📰
                </p>
              </div>
            </div>

            <!-- Search Bar - Center -->
            <div class="flex justify-center">
              <div class="relative w-full max-w-xl">
                <input
                  type="text"
                  [(ngModel)]="terminoBusqueda"
                  (ngModelChange)="buscarNoticias()"
                  (click)="verificarBusqueda($event)"
                  [readonly]="!estaAutenticado"
                  [placeholder]="estaAutenticado ? 'Buscar noticias, autor, contenido...' : 'Inicia sesión para buscar'"
                  [class.opacity-50]="!estaAutenticado"
                  [class.cursor-pointer]="!estaAutenticado"
                  class="w-full px-5 py-3 pl-12 pr-12 text-sm bg-white border-2 border-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 shadow-lg transition-all placeholder-gray-400"
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
            
            <!-- Botón de Login/Logout - Right -->
            <div class="flex justify-end">
              <button
                *ngIf="!estaAutenticado"
                (click)="irALogin()"
                class="px-4 py-2 bg-white text-blue-600 text-sm font-semibold rounded-full hover:bg-blue-50 transition-colors shadow-lg flex items-center gap-2 whitespace-nowrap"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                </svg>
                Iniciar Sesión
              </button>
              
              <button
                *ngIf="estaAutenticado"
                (click)="cerrarSesion()"
                class="px-4 py-2 bg-white text-red-600 text-sm font-semibold rounded-full hover:bg-red-50 transition-colors shadow-lg flex items-center gap-2 whitespace-nowrap"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
                Cerrar Sesión
              </button>
            </div>
          </div>

          <!-- Mobile Layout -->
          <div class="md:hidden">
            <div class="flex flex-col items-center gap-4">
              <!-- Logo and Title Section -->
              <div class="flex items-center space-x-4">
                <div class="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                  <svg class="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                  </svg>
                </div>
                <div>
                  <h1 class="text-3xl font-extrabold text-white tracking-tight">
                    Portal de Noticias
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
                    class="w-full px-5 py-3 pl-12 pr-12 text-sm bg-white border-2 border-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 shadow-lg transition-all placeholder-gray-400"
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
                
                <!-- Botón de Login/Logout - Mobile -->
                <div class="flex justify-end">
                  <button
                    *ngIf="!estaAutenticado"
                    (click)="irALogin()"
                    class="px-4 py-2 bg-white text-blue-600 text-sm font-semibold rounded-full hover:bg-blue-50 transition-colors shadow-lg flex items-center gap-2"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                    </svg>
                    Iniciar Sesión
                  </button>
                  
                  <button
                    *ngIf="estaAutenticado"
                    (click)="cerrarSesion()"
                    class="px-4 py-2 bg-white text-red-600 text-sm font-semibold rounded-full hover:bg-red-50 transition-colors shadow-lg flex items-center gap-2"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                    </svg>
                    Cerrar Sesión
                  </button>
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
            <div class="bg-white rounded-lg shadow-md p-6 sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto sidebar-scroll">
              <h2 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
                </svg>
                Filtros
              </h2>

              <!-- Ordenar por -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Ordenar por
                </label>
                <select
                  [(ngModel)]="ordenSeleccionado"
                  (ngModelChange)="aplicarFiltros()"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="recientes">Más Recientes</option>
                  <option value="antiguos">Más Antiguos</option>
                </select>
              </div>

              <!-- Filtro por Categoría -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <select
                  [(ngModel)]="categoriaSeleccionada"
                  (ngModelChange)="aplicarFiltros()"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">Todas las categorías</option>
                  <option *ngFor="let categoria of categorias" [value]="categoria">
                    {{ categoria | titlecase }}
                  </option>
                </select>
              </div>

              <!-- Filtro por Fuente -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Fuente
                </label>
                <select
                  [(ngModel)]="fuenteSeleccionada"
                  (ngModelChange)="aplicarFiltros()"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">Todas las fuentes</option>
                  <option *ngFor="let fuente of fuentes" [value]="fuente">
                    {{ fuente }}
                  </option>
                </select>
              </div>

              <!-- Filtro por País -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  País
                </label>
                <select
                  [(ngModel)]="paisSeleccionado"
                  (ngModelChange)="aplicarFiltros()"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
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

              <!-- Tipo de Contenido -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-3">
                  Tipo de Contenido
                </label>
                <div class="space-y-2">
                  <label class="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      [(ngModel)]="tipoContenido"
                      value="todos"
                      (ngModelChange)="aplicarFiltros()"
                      class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span class="ml-2 text-sm text-gray-700">Todos</span>
                  </label>
                  <label class="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      [(ngModel)]="tipoContenido"
                      value="articulo"
                      (ngModelChange)="aplicarFiltros()"
                      class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span class="ml-2 text-sm text-gray-700">Artículo</span>
                  </label>
                  <label class="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      [(ngModel)]="tipoContenido"
                      value="foto"
                      (ngModelChange)="aplicarFiltros()"
                      class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span class="ml-2 text-sm text-gray-700">Foto</span>
                  </label>
                  <label class="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      [(ngModel)]="tipoContenido"
                      value="video"
                      (ngModelChange)="aplicarFiltros()"
                      class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span class="ml-2 text-sm text-gray-700">Video</span>
                  </label>
                </div>
              </div>

              <!-- Resultados Counter -->
              <div class="pt-4 border-t border-gray-200">
                <p class="text-sm text-gray-600">
                  Mostrando <span class="font-semibold text-gray-900">{{ noticiasFiltradas.length }}</span> 
                  de <span class="font-semibold text-gray-900">{{ noticias.length }}</span> noticias
                </p>
              </div>

              <!-- Lo Más Popular -->
              <div class="mt-8 pt-6 border-t border-gray-200">
                <h3 class="text-sm font-bold text-gray-900 mb-3 flex items-center">
                  🔥 Lo Más Popular
                </h3>
                <div class="space-y-3">
                  <a 
                    *ngFor="let noticia of noticiasPopulares"
                    [href]="noticia.link"
                    target="_blank"
                    class="block text-xs text-gray-600 hover:text-blue-600 line-clamp-2 transition-colors"
                  >
                    {{ noticia.titulo }}
                  </a>
                </div>
              </div>

              <!-- Autores Destacados -->
              <div class="mt-6 pt-6 border-t border-gray-200">
                <h3 class="text-sm font-bold text-gray-900 mb-3 flex items-center">
                  👤 Autores Destacados
                </h3>
                <div class="space-y-2">
                  <button
                    *ngFor="let autor of autoresDestacados"
                    (click)="filtrarPorAutor(autor)"
                    [class.bg-blue-50]="autorSeleccionado === autor"
                    [class.text-blue-600]="autorSeleccionado === autor"
                    class="w-full text-left px-3 py-2 rounded-md text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center justify-between group"
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
            <div *ngIf="!cargando && noticiasFiltradas.length === 0 && !error" class="text-center py-12 bg-white rounded-lg shadow-md">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">No hay noticias</h3>
              <p class="mt-1 text-sm text-gray-500">
                {{ fuenteSeleccionada || categoriaSeleccionada ? 'No se encontraron noticias con los filtros seleccionados.' : 'No se encontraron noticias.' }}
              </p>
            </div>

            <!-- Featured News (Solo si hay noticias) -->
            <div *ngIf="!cargando && noticiaDestacada && noticiasPaginadas.length > 0" class="mb-8">
              <div class="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-blue-500">
                <div class="md:flex">
                  <!-- Image -->
                  <div class="md:w-1/2">
                    <img 
                      *ngIf="noticiaDestacada.imagen_url"
                      [src]="noticiaDestacada.imagen_url" 
                      [alt]="noticiaDestacada.titulo"
                      class="w-full h-64 md:h-full object-cover"
                      (error)="onImageError($event)"
                    />
                    <div *ngIf="!noticiaDestacada.imagen_url" class="w-full h-64 md:h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <svg class="w-24 h-24 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                      </svg>
                    </div>
                  </div>
                  
                  <!-- Content -->
                  <div class="md:w-1/2 p-8">
                    <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
                      <div class="flex items-center gap-2 flex-wrap">
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white">
                          DESTACADA
                        </span>
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {{ noticiaDestacada.fuente }}
                        </span>
                        <span 
                          *ngIf="obtenerUbicacion(noticiaDestacada)" 
                          class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
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
                    
                    <h2 class="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                      {{ noticiaDestacada.titulo }}
                    </h2>
                    
                    <p class="text-gray-600 mb-6 line-clamp-4">
                      {{ noticiaDestacada.contenido }}
                    </p>
                    
                    <div class="flex items-center justify-between">
                      <time class="text-sm text-gray-500" [dateTime]="noticiaDestacada.fecha">
                        {{ formatearFecha(noticiaDestacada.fecha) }}
                      </time>
                      
                      <a 
                        [href]="estaAutenticado ? noticiaDestacada.link : '#'" 
                        (click)="verificarYAcceder(noticiaDestacada.link, $event)"
                        [attr.target]="estaAutenticado ? '_blank' : null"
                        [attr.rel]="estaAutenticado ? 'noopener noreferrer' : null"
                        class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                      >
                        Leer más
                        <svg class="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                        </svg>
                      </a>
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
                  class="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 transform hover:-translate-y-1"
                >
                  <!-- Image -->
                  <div class="relative">
                    <div *ngIf="noticia.imagen_url" class="bg-gray-200">
                      <img 
                        [src]="noticia.imagen_url" 
                        [alt]="noticia.titulo"
                        class="w-full h-48 object-cover"
                        (error)="onImageError($event)"
                      />
                    </div>
                    <div *ngIf="!noticia.imagen_url" class="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                      </svg>
                    </div>
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
                        <time class="text-xs text-gray-500" [dateTime]="noticia.fecha">
                          {{ formatearFecha(noticia.fecha) }}
                        </time>
                      </div>
                    </div>
                    
                    <!-- Title -->
                    <h2 class="text-base font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
                      {{ noticia.titulo }}
                    </h2>
                    
                    <!-- Content Preview -->
                    <p class="text-gray-600 text-sm mb-4 line-clamp-3">
                      {{ noticia.contenido }}
                    </p>
                    
                    <!-- Read More Button -->
                    <div class="flex justify-end">
                      <a 
                        [href]="estaAutenticado ? noticia.link : '#'" 
                        (click)="verificarYAcceder(noticia.link, $event)"
                        [attr.target]="estaAutenticado ? '_blank' : null"
                        [attr.rel]="estaAutenticado ? 'noopener noreferrer' : null"
                        class="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200 cursor-pointer"
                      >
                        Leer más
                        <svg class="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                </article>
              </div>

              <!-- Pagination -->
              <div class="mt-8 bg-white rounded-lg shadow-md p-6">
                <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <!-- Page Info -->
                  <div class="text-sm text-gray-600">
                    Mostrando 
                    {{ paginaActual === 1 ? 1 : ((paginaActual - 1) * noticiasPorPagina) }} - 
                    {{ Math.min(paginaActual === 1 ? noticiasPorPagina : ((paginaActual - 1) * noticiasPorPagina + noticiasPaginadas.length), noticiasFiltradas.length) }} 
                    de {{ noticiasFiltradas.length }} noticias
                  </div>

                  <!-- Page Size Selector -->
                  <div class="flex items-center gap-2">
                    <label class="text-sm text-gray-600">Noticias por página:</label>
                    <select
                      [(ngModel)]="noticiasPorPagina"
                      (ngModelChange)="cambiarNoticiasPorPagina()"
                      class="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                      class="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Primera página"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
                      </svg>
                    </button>

                    <button
                      (click)="irAPaginaAnterior()"
                      [disabled]="paginaActual === 1"
                      class="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>

                    <!-- Page Numbers -->
                    <div class="flex gap-1">
                      <button
                        *ngFor="let pagina of obtenerPaginasVisibles()"
                        (click)="irAPagina(pagina)"
                        [class.bg-blue-600]="pagina === paginaActual"
                        [class.text-white]="pagina === paginaActual"
                        [class.bg-white]="pagina !== paginaActual"
                        [class.text-gray-700]="pagina !== paginaActual"
                        class="px-3 py-1 text-sm font-medium border border-gray-300 rounded-md hover:bg-blue-500 hover:text-white transition-colors"
                      >
                        {{ pagina }}
                      </button>
                    </div>

                    <button
                      (click)="irAPaginaSiguiente()"
                      [disabled]="paginaActual === totalPaginas"
                      class="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                    </button>

                    <button
                      (click)="irAUltimaPagina()"
                      [disabled]="paginaActual === totalPaginas"
                      class="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
  `]
})
export class PortalNoticiasComponent implements OnInit, OnDestroy {
  private supabase: SupabaseClient;
  private authSubscription?: Subscription;
  
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
  tipoContenido: string = 'todos';
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

  // Para usar Math en el template
  Math = Math;

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService
  ) {
    this.supabase = createClient(
      'https://aplusyghdeuyewrstikg.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwbHVzeWdoZGV1eWV3cnN0aWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MzU5MTksImV4cCI6MjA3MzIxMTkxOX0.n1m0CnGGWYVex9AGB9XEsUNDs-VLorFK2tjyKLfQIps'
    );
  }

  ngOnInit() {
    // Verificar estado de autenticación
    this.estaAutenticado = this.authService.isAuthenticated();
    
    // Suscribirse a cambios en la autenticación
    this.authSubscription = this.authService.currentUser.subscribe(user => {
      this.estaAutenticado = user !== null;
    });
    
    this.cargarNoticias();
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
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
          console.log(`📦 Cargado lote: ${data.length} noticias (Total: ${todasLasNoticias.length})`);
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
    
    // Obtener noticias populares (primeras 5 como ejemplo)
    this.noticiasPopulares = this.noticias.slice(0, 5);
    
    // Obtener noticias de autores destacados (noticias 5-10 como ejemplo)
    this.noticiasAutores = this.noticias.slice(5, 10);
  }

  seleccionarCategoria(categoria: string) {
    this.categoriaSeleccionada = categoria;
    this.paginaActual = 1; // Resetear a primera página
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    let noticiasFiltradas = [...this.noticias];

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

    // Filtrar por tipo de contenido
    if (this.tipoContenido !== 'todos') {
      noticiasFiltradas = noticiasFiltradas.filter(noticia => {
        if (this.tipoContenido === 'foto') {
          return noticia.imagen_url && noticia.imagen_url.trim() !== '';
        }
        // Para video y artículo, necesitarías tener un campo que lo indique
        return true;
      });
    }

    // Ordenar
    if (this.ordenSeleccionado === 'recientes') {
      noticiasFiltradas.sort((a, b) => 
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );
    } else {
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
           this.tipoContenido !== 'todos' ||
           this.ordenSeleccionado !== 'recientes' ||
           this.terminoBusqueda !== '' ||
           this.autorSeleccionado !== '';
  }

  limpiarFiltros() {
    this.fuenteSeleccionada = '';
    this.categoriaSeleccionada = '';
    this.paisSeleccionado = '';
    this.tipoContenido = 'todos';
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
      title: '¿Está seguro?',
      text: '¿Desea cerrar su sesión?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'No, cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      reverseButtons: true
    });

    // Si el usuario confirma (Sí)
    if (result.isConfirmed) {
      const signOutResult = await this.authService.signOut();
      if (signOutResult.success) {
        // Mostrar mensaje de confirmación de éxito
        await Swal.fire({
          title: '¡Sesión cerrada!',
          text: 'Has cerrado sesión exitosamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#2563eb'
        });
        // Después de cerrar sesión, quedarse en la página de noticias
        this.router.navigate(['/noticias']);
      } else {
        // Si hubo un error al cerrar sesión
        await Swal.fire({
          title: 'Error',
          text: 'No se pudo cerrar la sesión. Por favor, intente nuevamente.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#dc2626'
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
}