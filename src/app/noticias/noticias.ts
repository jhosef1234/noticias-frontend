import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

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
}

@Component({
  selector: 'app-portal-noticias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                </svg>
              </div>
              <h1 class="text-2xl md:text-3xl font-bold text-gray-900">Portal de Noticias</h1>
              <span class="hidden md:inline-block text-sm text-gray-500">Tu fuente de información confiable</span>
            </div>
            
            <button
              (click)="cargarNoticias()"
              [disabled]="cargando"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg *ngIf="cargando" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ cargando ? 'Cargando...' : 'Actualizar' }}
            </button>
          </div>
        </div>
      </header>

      <!-- Categories Bar -->
      <div class="bg-white border-b border-gray-200 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex overflow-x-auto py-3 space-x-2 scrollbar-hide">
            <button
              (click)="seleccionarCategoria('')"
              [class.bg-blue-600]="categoriaSeleccionada === ''"
              [class.text-white]="categoriaSeleccionada === ''"
              [class.bg-gray-100]="categoriaSeleccionada !== ''"
              [class.text-gray-700]="categoriaSeleccionada !== ''"
              class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors hover:bg-blue-500 hover:text-white"
            >
              Todas
            </button>
            <button
              *ngFor="let categoria of categorias"
              (click)="seleccionarCategoria(categoria)"
              [class.bg-blue-600]="categoriaSeleccionada === categoria"
              [class.text-white]="categoriaSeleccionada === categoria"
              [class.bg-gray-100]="categoriaSeleccionada !== categoria"
              [class.text-gray-700]="categoriaSeleccionada !== categoria"
              class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors hover:bg-blue-500 hover:text-white"
            >
              {{ categoria }}
            </button>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col lg:flex-row gap-6">
          <!-- Sidebar Filters -->
          <aside class="w-full lg:w-64 flex-shrink-0">
            <div class="bg-white rounded-lg shadow-md p-6 sticky top-24">
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
                  <option *ngFor="let pais of paises" [value]="pais">
                    {{ pais }}
                  </option>
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

              <!-- Botón Limpiar Filtros -->
              <button
                *ngIf="hayFiltrosActivos()"
                (click)="limpiarFiltros()"
                class="w-full mt-4 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
              >
                Limpiar filtros
              </button>

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
                    <div class="flex items-center justify-between mb-4">
                      <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white">
                        DESTACADA
                      </span>
                      <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {{ noticiaDestacada.fuente }}
                      </span>
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
                        [href]="noticiaDestacada.link" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
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
                    <!-- Source and Date -->
                    <div class="flex items-center justify-between mb-3">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {{ noticia.fuente }}
                      </span>
                      <time class="text-xs text-gray-500" [dateTime]="noticia.fecha">
                        {{ formatearFecha(noticia.fecha) }}
                      </time>
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
                        [href]="noticia.link" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        class="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
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
                    Mostrando {{ ((paginaActual - 1) * noticiasPorPagina) + 1 }} - 
                    {{ Math.min(paginaActual * noticiasPorPagina, noticiasFiltradas.length) }} 
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
  `]
})
export class PortalNoticiasComponent implements OnInit {
  private supabase: SupabaseClient;
  
  // Datos
  noticias: Noticia[] = [];
  noticiasFiltradas: Noticia[] = [];
  noticiasPaginadas: Noticia[] = [];
  noticiaDestacada: Noticia | null = null;
  noticiasPopulares: Noticia[] = [];
  
  // Filtros
  fuentes: string[] = [];
  categorias: string[] = [];
  paises: string[] = [];
  
  // Selecciones de filtros
  fuenteSeleccionada: string = '';
  categoriaSeleccionada: string = '';
  paisSeleccionado: string = '';
  ordenSeleccionado: string = 'recientes';
  tipoContenido: string = 'todos';
  
  // Paginación
  paginaActual: number = 1;
  noticiasPorPagina: number = 12;
  totalPaginas: number = 0;
  
  // Estados
  cargando: boolean = false;
  error: string = '';

  // Para usar Math en el template
  Math = Math;

  constructor() {
    this.supabase = createClient(
      'https://aplusyghdeuyewrstikg.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwbHVzeWdoZGV1eWV3cnN0aWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MzU5MTksImV4cCI6MjA3MzIxMTkxOX0.n1m0CnGGWYVex9AGB9XEsUNDs-VLorFK2tjyKLfQIps'
    );
  }

  ngOnInit() {
    this.cargarNoticias();
  }

  async cargarNoticias() {
    this.cargando = true;
    this.error = '';
    
    try {
      const { data, error } = await this.supabase
        .from('noticias')
        .select('*')
        .order('fecha', { ascending: false });

      if (error) {
        throw error;
      }

      this.noticias = data || [];
      this.extraerDatosUnicos();
      this.aplicarFiltros();
      
    } catch (error: any) {
      this.error = error.message || 'Error desconocido al cargar las noticias';
      console.error('Error cargando noticias:', error);
    } finally {
      this.cargando = false;
    }
  }

  private extraerDatosUnicos() {
    // Extraer fuentes únicas
    const fuentesUnicas = new Set(this.noticias.map(noticia => noticia.fuente));
    this.fuentes = Array.from(fuentesUnicas).sort();
    
    // Extraer categorías únicas (asumiendo que existe el campo categoria)
    const categoriasUnicas = new Set(
      this.noticias
        .map(noticia => noticia.categoria)
        .filter(cat => cat && cat.trim() !== '')
    );
    this.categorias = Array.from(categoriasUnicas).sort();
    
    // Si no hay categorías en la BD, usar categorías por defecto basadas en palabras clave
    if (this.categorias.length === 0) {
      this.categorias = [
        'ciencia', 'cultura', 'delincuencia', 'deportes', 'economía',
        'educación', 'electrodomésticos', 'entretenimiento', 'incidentes',
        'medio ambiente', 'negocios', 'política', 'salud', 'tecnología', 'turismo'
      ];
    }
    
    // Extraer países (si existe el campo, sino usar valores por defecto)
    // Esto es un ejemplo, ajusta según tu estructura de datos
    this.paises = ['Todos los países'];
    
    // Obtener noticias populares (primeras 5 como ejemplo)
    this.noticiasPopulares = this.noticias.slice(0, 5);
  }

  seleccionarCategoria(categoria: string) {
    this.categoriaSeleccionada = categoria;
    this.paginaActual = 1; // Resetear a primera página
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    let noticiasFiltradas = [...this.noticias];

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
    this.totalPaginas = Math.ceil(this.noticiasFiltradas.length / this.noticiasPorPagina);
    
    // Asegurar que la página actual no exceda el total
    if (this.paginaActual > this.totalPaginas) {
      this.paginaActual = Math.max(1, this.totalPaginas);
    }
    
    // Obtener noticias de la página actual
    // Excluir la noticia destacada de la paginación
    const noticiasParaPaginar = this.noticiasFiltradas.slice(1);
    const inicio = (this.paginaActual - 1) * this.noticiasPorPagina;
    const fin = inicio + this.noticiasPorPagina;
    this.noticiasPaginadas = noticiasParaPaginar.slice(inicio, fin);
  }

  hayFiltrosActivos(): boolean {
    return this.fuenteSeleccionada !== '' || 
           this.categoriaSeleccionada !== '' ||
           this.paisSeleccionado !== '' ||
           this.tipoContenido !== 'todos' ||
           this.ordenSeleccionado !== 'recientes';
  }

  limpiarFiltros() {
    this.fuenteSeleccionada = '';
    this.categoriaSeleccionada = '';
    this.paisSeleccionado = '';
    this.tipoContenido = 'todos';
    this.ordenSeleccionado = 'recientes';
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
}