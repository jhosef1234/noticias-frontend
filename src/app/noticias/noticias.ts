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
  ciudad?: string;
  autor?: string;
  popularidad?: number;
  tipo_contenido?: string;
  pais?: string;
  departamento?: string;
}

@Component({
  selector: 'app-portal-noticias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      <!-- Header Superior -->
      <header class="bg-white shadow-xl sticky top-0 z-50 border-b-4 border-blue-600">
        <div class="w-full px-4 sm:px-6 lg:px-8 max-w-[1920px] mx-auto">
          <!-- Top Bar -->
          <div class="flex items-center justify-between py-4">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                </svg>
              </div>
              <div>
                <h1 class="text-3xl font-black text-gray-900 tracking-tight">Portal de Noticias</h1>
                <p class="text-sm text-gray-500 font-medium">Tu fuente de información confiable</p>
              </div>
            </div>

            <!-- Search Bar -->
            <div class="hidden md:flex items-center flex-1 max-w-2xl mx-8">
              <div class="relative w-full">
                <input
                  type="text"
                  [(ngModel)]="busqueda"
                  (ngModelChange)="filtrarNoticias()"
                  placeholder="Buscar noticias, autor, contenido..."
                  class="w-full px-5 py-3 pl-12 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-md"
                />
                <svg class="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
            </div>

            <button
              (click)="cargarNoticias()"
              [disabled]="cargando"
              class="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-full hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg transform hover:scale-105"
            >
              <svg *ngIf="cargando" class="animate-spin h-5 w-5 text-white inline" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span *ngIf="!cargando">Actualizar</span>
              <span *ngIf="cargando">Cargando...</span>
            </button>
          </div>

          <!-- Mobile Search -->
          <div class="md:hidden pb-4">
            <div class="relative">
              <input
                type="text"
                [(ngModel)]="busqueda"
                (ngModelChange)="filtrarNoticias()"
                placeholder="Buscar noticias..."
                class="w-full px-5 py-3 pl-12 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg class="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
          </div>

          <!-- Navigation Categories -->
          <nav class="flex space-x-1 overflow-x-auto pb-4 scrollbar-hide">
            <button
              (click)="seleccionarCategoria('')"
              [class.bg-blue-600]="categoriaSeleccionada === ''"
              [class.text-white]="categoriaSeleccionada === ''"
              [class.bg-gray-100]="categoriaSeleccionada !== ''"
              [class.text-gray-700]="categoriaSeleccionada !== ''"
              class="px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all hover:shadow-md"
            >
              Todas
            </button>
            <button
              *ngFor="let cat of categorias"
              (click)="seleccionarCategoria(cat)"
              [class.bg-blue-600]="categoriaSeleccionada === cat"
              [class.text-white]="categoriaSeleccionada === cat"
              [class.bg-gray-100]="categoriaSeleccionada !== cat"
              [class.text-gray-700]="categoriaSeleccionada !== cat"
              class="px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all hover:shadow-md"
            >
              {{ cat }}
            </button>
          </nav>
        </div>
      </header>

      <!-- Main Content -->
      <div class="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col lg:flex-row gap-8 max-w-[1920px] mx-auto">
          <!-- Sidebar Filters -->
          <aside class="lg:w-80 space-y-6">
            <!-- Filters Card -->
            <div class="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto scrollbar-thin">
              <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
                </svg>
                Filtros
              </h3>

              <!-- Ordenar -->
              <div class="mb-6">
                <label class="block text-sm font-bold text-gray-700 mb-2">Ordenar por</label>
                <select
                  [(ngModel)]="ordenSeleccionado"
                  (ngModelChange)="filtrarNoticias()"
                  class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="recientes">Más Recientes</option>
                  <option value="populares">Más Populares</option>
                </select>
              </div>

              <!-- Fuente -->
              <div class="mb-6">
                <label class="block text-sm font-bold text-gray-700 mb-2">Fuente</label>
                <select
                  [(ngModel)]="fuenteSeleccionada"
                  (ngModelChange)="filtrarNoticias()"
                  class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todas las fuentes</option>
                  <option *ngFor="let fuente of fuentes" [value]="fuente">{{ fuente }}</option>
                </select>
              </div>

              <!-- País -->
              <div class="mb-6">
                <label class="block text-sm font-bold text-gray-700 mb-2">País</label>
                <select
                  [(ngModel)]="paisSeleccionado"
                  (ngModelChange)="onPaisChange()"
                  class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos los países</option>
                  <option *ngFor="let pais of paises" [value]="pais">{{ pais }}</option>
                </select>
              </div>

              <!-- Departamento -->
              <div class="mb-6" *ngIf="departamentos.length > 0">
                <label class="block text-sm font-bold text-gray-700 mb-2">Departamento</label>
                <select
                  [(ngModel)]="departamentoSeleccionado"
                  (ngModelChange)="filtrarNoticias()"
                  class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos los departamentos</option>
                  <option *ngFor="let dept of departamentos" [value]="dept">{{ dept }}</option>
                </select>
              </div>

              <!-- Tipo Contenido -->
              <div class="mb-6">
                <label class="block text-sm font-bold text-gray-700 mb-3">Tipo de Contenido</label>
                <div class="space-y-2">
                  <label *ngFor="let tipo of tiposContenido" class="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    <input
                      type="radio"
                      name="tipoContenido"
                      [value]="tipo"
                      [(ngModel)]="tipoContenidoSeleccionado"
                      (ngModelChange)="filtrarNoticias()"
                      class="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span class="ml-2 text-sm text-gray-700 font-medium">{{ tipo }}</span>
                  </label>
                </div>
              </div>

              <!-- Stats -->
              <div class="pt-4 border-t border-gray-200 mb-6">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600 font-medium">Mostrando:</span>
                  <span class="font-bold text-blue-600">{{ noticiasFiltradas.length }} / {{ noticias.length }}</span>
                </div>
              </div>

              <!-- Lo Más Popular -->
              <div class="pt-6 border-t-2 border-orange-200">
                <h4 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <span class="text-xl mr-2">🔥</span>
                  Lo Más Popular
                </h4>
                <div class="space-y-3">
                  <div *ngFor="let noticia of noticiasPopulares; let i = index" 
                       class="flex items-start space-x-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                    <span class="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {{ i + 1 }}
                    </span>
                    <div class="flex-1 min-w-0">
                      <a [href]="noticia.link" target="_blank" class="text-sm font-semibold text-gray-900 hover:text-blue-600 line-clamp-2">
                        {{ noticia.titulo }}
                      </a>
                      <p class="text-xs text-gray-500 mt-1">{{ noticia.fuente }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Autores Destacados -->
              <div class="pt-6 border-t-2 border-purple-200 mt-6" *ngIf="autoresDestacados.length > 0">
                <h4 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  Autores Destacados
                </h4>
                <div class="space-y-2">
                  <button
                    *ngFor="let autor of autoresDestacados"
                    (click)="filtrarPorAutor(autor)"
                    class="w-full text-left px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:shadow-md transition-all text-sm font-medium text-gray-700 hover:text-purple-600"
                  >
                    {{ autor }}
                  </button>
                </div>
              </div>
            </div>
          </aside>

          <!-- News Content -->
          <main class="flex-1">
            <!-- Hero Section - Featured News -->
            <div *ngIf="noticiaDestacada && !cargando" class="mb-8">
              <div class="bg-white rounded-2xl shadow-2xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
                <div class="md:flex">
                  <div class="md:w-1/2">
                    <img 
                      [src]="noticiaDestacada.imagen_url" 
                      [alt]="noticiaDestacada.titulo"
                      class="w-full h-full object-cover"
                      (error)="onImageError($event)"
                    />
                  </div>
                  <div class="md:w-1/2 p-8 flex flex-col justify-center">
                    <div class="flex items-center space-x-3 mb-4">
                      <span class="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold uppercase tracking-wide">
                        Destacada
                      </span>
                      <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                        {{ noticiaDestacada.categoria || noticiaDestacada.fuente }}
                      </span>
                      <span *ngIf="noticiaDestacada.popularidad" class="flex items-center text-orange-600">
                        🔥 {{ noticiaDestacada.popularidad }}
                      </span>
                    </div>
                    <h2 class="text-3xl font-black text-gray-900 mb-4 leading-tight">
                      {{ noticiaDestacada.titulo }}
                    </h2>
                    <p class="text-gray-600 mb-6 line-clamp-3">
                      {{ noticiaDestacada.contenido }}
                    </p>
                    <div class="flex items-center justify-between">
                      <div class="text-sm text-gray-500">
                        <p class="font-semibold" *ngIf="noticiaDestacada.autor">{{ noticiaDestacada.autor }}</p>
                        <p>{{ formatearFecha(noticiaDestacada.fecha) }}</p>
                      </div>
                      <a 
                        [href]="noticiaDestacada.link" 
                        target="_blank"
                        class="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-full hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg transform hover:scale-105"
                      >
                        Leer más →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Loading State -->
            <div *ngIf="cargando && noticias.length === 0" class="text-center py-20">
              <div class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
              <p class="mt-4 text-gray-600 font-medium text-lg">Cargando noticias...</p>
            </div>

            <!-- Error State -->
            <div *ngIf="error" class="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-8 mb-6">
              <div class="flex items-center">
                <svg class="w-8 h-8 text-red-600 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>
                <div>
                  <h3 class="text-red-900 font-bold text-lg">Error al cargar las noticias</h3>
                  <p class="text-red-700 mt-1">{{ error }}</p>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div *ngIf="!cargando && noticiasFiltradas.length === 0 && !error" class="text-center py-20">
              <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
              </svg>
              <h3 class="mt-4 text-xl font-bold text-gray-900">No hay noticias</h3>
              <p class="mt-2 text-gray-500">No se encontraron noticias con los filtros seleccionados.</p>
            </div>

            <!-- News Grid -->
            <div *ngIf="!cargando && noticiasFiltradas.length > 0" class="grid gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              <article 
                *ngFor="let noticia of noticiasFiltradas" 
                class="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:-translate-y-1"
              >
                <!-- Image -->
                <div *ngIf="noticia.imagen_url" class="relative aspect-w-16 aspect-h-9 bg-gradient-to-br from-gray-200 to-gray-300">
                  <img 
                    [src]="noticia.imagen_url" 
                    [alt]="noticia.titulo"
                    class="w-full h-56 object-cover"
                    (error)="onImageError($event)"
                  />
                  <div *ngIf="noticia.tipo_contenido" class="absolute top-4 right-4">
                    <span class="px-3 py-1 bg-black bg-opacity-70 text-white rounded-full text-xs font-bold backdrop-blur-sm">
                      {{ noticia.tipo_contenido }}
                    </span>
                  </div>
                  <div *ngIf="noticia.popularidad && noticia.popularidad > 100" class="absolute top-4 left-4">
                    <span class="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-xs font-bold flex items-center shadow-lg">
                      🔥 {{ noticia.popularidad }}
                    </span>
                  </div>
                </div>
                
                <!-- Content -->
                <div class="p-6">
                  <!-- Meta -->
                  <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <span class="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800">
                      {{ noticia.categoria || noticia.fuente }}
                    </span>
                    <time class="text-xs text-gray-500 font-medium" [dateTime]="noticia.fecha">
                      {{ formatearFecha(noticia.fecha) }}
                    </time>
                  </div>
                  
                  <!-- Title -->
                  <h2 class="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors">
                    {{ noticia.titulo }}
                  </h2>
                  
                  <!-- Content Preview -->
                  <p class="text-gray-600 text-sm mb-4 line-clamp-3">
                    {{ noticia.contenido }}
                  </p>
                  
                  <!-- Footer -->
                  <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div class="flex items-center space-x-2">
                      <div *ngIf="noticia.autor" class="flex items-center text-xs text-gray-500">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        {{ noticia.autor }}
                      </div>
                      <div *ngIf="noticia.ciudad" class="flex items-center text-xs text-gray-500">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        {{ noticia.ciudad }}
                      </div>
                    </div>
                    <a 
                      [href]="noticia.link" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      class="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-bold transition-colors duration-200"
                    >
                      Leer más
                      <svg class="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </article>
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

    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
    
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }

    .scrollbar-thin::-webkit-scrollbar {
      width: 6px;
    }

    .scrollbar-thin::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }

    .scrollbar-thin::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 10px;
    }

    .scrollbar-thin::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }

    .scrollbar-thin {
      scrollbar-width: thin;
      scrollbar-color: #cbd5e1 #f1f1f1;
    }
  `]
})
export class PortalNoticiasComponent implements OnInit {
  private supabase: SupabaseClient;
  
  noticias: Noticia[] = [];
  noticiasFiltradas: Noticia[] = [];
  noticiaDestacada: Noticia | null = null;
  noticiasPopulares: Noticia[] = [];
  
  // Filtros
  busqueda: string = '';
  fuenteSeleccionada: string = '';
  categoriaSeleccionada: string = '';
  paisSeleccionado: string = '';
  departamentoSeleccionado: string = '';
  tipoContenidoSeleccionado: string = '';
  ordenSeleccionado: string = 'recientes';
  
  // Listas para filtros
  fuentes: string[] = [];
  categorias: string[] = [];
  paises: string[] = [];
  departamentos: string[] = [];
  tiposContenido: string[] = ['Todos'];
  autoresDestacados: string[] = [];
  
  cargando: boolean = false;
  error: string = '';

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
      // Primero obtener el conteo total
      const { count } = await this.supabase
        .from('noticias')
        .select('*', { count: 'exact', head: true });

      console.log(`Total de noticias en DB: ${count}`);

      // Cargar todas las noticias en lotes
      const pageSize = 1000;
      const totalPages = Math.ceil((count || 0) / pageSize);
      let todasLasNoticias: Noticia[] = [];

      for (let page = 0; page < totalPages; page++) {
        const { data, error } = await this.supabase
          .from('noticias')
          .select('*')
          .order('fecha', { ascending: false })
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) {
          throw error;
        }

        if (data) {
          todasLasNoticias = [...todasLasNoticias, ...data];
        }

        console.log(`Cargado lote ${page + 1}/${totalPages}: ${data?.length} noticias`);
      }

      console.log(`✅ Total cargado: ${todasLasNoticias.length} noticias`);
      
      this.noticias = todasLasNoticias;
      this.noticiasFiltradas = [...this.noticias];
      this.extraerDatos();
      this.establecerNoticiaDestacada();
      this.establecerNoticiasPopulares();
      
    } catch (error: any) {
      this.error = error.message || 'Error desconocido al cargar las noticias';
      console.error('Error cargando noticias:', error);
    } finally {
      this.cargando = false;
    }
  }

  private extraerDatos() {
    // Extraer fuentes únicas
    const fuentesUnicas = new Set(this.noticias.map(n => n.fuente).filter((f): f is string => Boolean(f)));
    this.fuentes = Array.from(fuentesUnicas).sort();
    
    // Extraer categorías únicas y agregar categorías faltantes si no existen
    const categoriasUnicas = new Set(this.noticias.map(n => n.categoria).filter((c): c is string => Boolean(c)));
    
    // Categorías completas basadas en tu código Python
    const categoriasCompletas = [
      'delincuencia',
      'electrodomésticos',
      'tecnología',
      'ciencia',
      'medio ambiente',
      'negocios',
      'educación',
      'turismo',
      'entretenimiento',
      'política',
      'economía',
      'incidentes',
      'deportes',
      'cultura',
      'salud'
    ];
    
    // Combinar categorías existentes con las completas
    const todasCategorias = new Set([...categoriasUnicas, ...categoriasCompletas]);
    this.categorias = Array.from(todasCategorias).sort();
    
    // Extraer países únicos
    const paisesUnicos = new Set(this.noticias.map(n => n.pais).filter((p): p is string => Boolean(p)));
    this.paises = Array.from(paisesUnicos).sort();
    
    // Extraer tipos de contenido únicos
    const tiposUnicos = new Set(this.noticias.map(n => n.tipo_contenido).filter((t): t is string => Boolean(t)));
    this.tiposContenido = ['Todos', ...Array.from(tiposUnicos).sort()];
    
    // Extraer autores destacados (top 5 por cantidad de artículos)
    const autoresCount: { [key: string]: number } = {};
    this.noticias.forEach(n => {
      if (n.autor) {
        autoresCount[n.autor] = (autoresCount[n.autor] || 0) + 1;
      }
    });
    this.autoresDestacados = Object.entries(autoresCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([autor]) => autor);
  }

  private establecerNoticiaDestacada() {
    if (this.noticias.length > 0) {
      // Priorizar noticias con popularidad alta y recientes
      const noticiasConImagen = this.noticias.filter(n => n.imagen_url);
      if (noticiasConImagen.length > 0) {
        this.noticiaDestacada = noticiasConImagen.sort((a, b) => {
          const popA = a.popularidad || 0;
          const popB = b.popularidad || 0;
          return popB - popA;
        })[0];
      } else {
        this.noticiaDestacada = this.noticias[0];
      }
    }
  }

  private establecerNoticiasPopulares() {
    this.noticiasPopulares = [...this.noticias]
      .filter(n => n.popularidad && n.popularidad > 0)
      .sort((a, b) => (b.popularidad || 0) - (a.popularidad || 0))
      .slice(0, 5);
  }

  seleccionarCategoria(categoria: string) {
    this.categoriaSeleccionada = categoria;
    this.filtrarNoticias();
  }

  onPaisChange() {
    this.departamentoSeleccionado = '';
    
    if (this.paisSeleccionado) {
      const deptosUnicos = new Set(
        this.noticias
          .filter(n => n.pais === this.paisSeleccionado && n.departamento)
          .map(n => n.departamento!)
      );
      this.departamentos = Array.from(deptosUnicos).sort();
    } else {
      this.departamentos = [];
    }
    
    this.filtrarNoticias();
  }

  filtrarPorAutor(autor: string) {
    this.busqueda = autor;
    this.filtrarNoticias();
  }

  filtrarNoticias() {
    let resultado = [...this.noticias];

    // Filtro de búsqueda
    if (this.busqueda.trim()) {
      const busquedaLower = this.busqueda.toLowerCase();
      resultado = resultado.filter(n => 
        n.titulo.toLowerCase().includes(busquedaLower) ||
        n.contenido.toLowerCase().includes(busquedaLower) ||
        (n.autor && n.autor.toLowerCase().includes(busquedaLower))
      );
    }

    // Filtro de fuente
    if (this.fuenteSeleccionada) {
      resultado = resultado.filter(n => n.fuente === this.fuenteSeleccionada);
    }

    // Filtro de categoría
    if (this.categoriaSeleccionada) {
      resultado = resultado.filter(n => n.categoria === this.categoriaSeleccionada);
    }

    // Filtro de país
    if (this.paisSeleccionado) {
      resultado = resultado.filter(n => n.pais === this.paisSeleccionado);
    }

    // Filtro de departamento
    if (this.departamentoSeleccionado) {
      resultado = resultado.filter(n => n.departamento === this.departamentoSeleccionado);
    }

    // Filtro de tipo de contenido
    if (this.tipoContenidoSeleccionado && this.tipoContenidoSeleccionado !== 'Todos') {
      resultado = resultado.filter(n => n.tipo_contenido === this.tipoContenidoSeleccionado);
    }

    // Ordenamiento
    if (this.ordenSeleccionado === 'recientes') {
      resultado.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    } else if (this.ordenSeleccionado === 'populares') {
      resultado.sort((a, b) => (b.popularidad || 0) - (a.popularidad || 0));
    }

    this.noticiasFiltradas = resultado;
  }

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