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
}

@Component({
  selector: 'app-portal-noticias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-lg border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                </svg>
              </div>
              <h1 class="text-3xl font-bold text-gray-900">Portal de Noticias</h1>
            </div>
          </div>
        </div>
      </header>

      <!-- Filters Section -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div class="flex-1">
              <label for="filtroFuente" class="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por fuente:
              </label>
              <select
                id="filtroFuente"
                [(ngModel)]="fuenteSeleccionada"
                (ngModelChange)="filtrarNoticias()"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Todas las fuentes</option>
                <option *ngFor="let fuente of fuentes" [value]="fuente">
                  {{ fuente }}
                </option>
              </select>
            </div>
            
            <div class="flex items-center space-x-4">
              <span class="text-sm text-gray-500">
                {{ noticiasFiltradas.length }} de {{ noticias.length }} noticias
              </span>
              <button
                (click)="cargarNoticias()"
                [disabled]="cargando"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg *ngIf="cargando" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ cargando ? 'Cargando...' : 'Actualizar' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="cargando && noticias.length === 0" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p class="mt-4 text-gray-600">Cargando noticias...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <div class="flex items-center">
            <svg class="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
            <div>
              <h3 class="text-red-800 font-medium">Error al cargar las noticias</h3>
              <p class="text-red-700 text-sm mt-1">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!cargando && noticiasFiltradas.length === 0 && !error" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No hay noticias</h3>
          <p class="mt-1 text-sm text-gray-500">
            {{ fuenteSeleccionada ? 'No se encontraron noticias para la fuente seleccionada.' : 'No se encontraron noticias.' }}
          </p>
        </div>

        <!-- News Grid -->
        <div *ngIf="!cargando && noticiasFiltradas.length > 0" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <article 
            *ngFor="let noticia of noticiasFiltradas" 
            class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200"
          >
            <!-- Image -->
            <div *ngIf="noticia.imagen_url" class="aspect-w-16 aspect-h-9 bg-gray-200">
              <img 
                [src]="noticia.imagen_url" 
                [alt]="noticia.titulo"
                class="w-full h-48 object-cover"
                (error)="onImageError($event)"
              />
            </div>
            
            <!-- Content -->
            <div class="p-6">
              <!-- Source and Date -->
              <div class="flex items-center justify-between mb-3">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ noticia.fuente }}
                </span>
                <time class="text-sm text-gray-500" [dateTime]="noticia.fecha">
                  {{ formatearFecha(noticia.fecha) }}
                </time>
              </div>
              
              <!-- Title -->
              <h2 class="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
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
  `]
})
export class PortalNoticiasComponent implements OnInit {
  private supabase: SupabaseClient;
  
  noticias: Noticia[] = [];
  noticiasFiltradas: Noticia[] = [];
  fuentes: string[] = [];
  fuenteSeleccionada: string = '';
  cargando: boolean = false;
  error: string = '';

  constructor() {
    // Configura tu cliente de Supabase aquí
    this.supabase = createClient(
      'https://aplusyghdeuyewrstikg.supabase.co', // Reemplaza con tu URL de Supabase
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwbHVzeWdoZGV1eWV3cnN0aWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MzU5MTksImV4cCI6MjA3MzIxMTkxOX0.n1m0CnGGWYVex9AGB9XEsUNDs-VLorFK2tjyKLfQIps' // Reemplaza con tu clave anónima de Supabase
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
      this.noticiasFiltradas = [...this.noticias];
      this.extraerFuentes();
      
    } catch (error: any) {
      this.error = error.message || 'Error desconocido al cargar las noticias';
      console.error('Error cargando noticias:', error);
    } finally {
      this.cargando = false;
    }
  }

  private extraerFuentes() {
    const fuentesUnicas = new Set(this.noticias.map(noticia => noticia.fuente));
    this.fuentes = Array.from(fuentesUnicas).sort();
  }

  filtrarNoticias() {
    if (!this.fuenteSeleccionada) {
      this.noticiasFiltradas = [...this.noticias];
    } else {
      this.noticiasFiltradas = this.noticias.filter(
        noticia => noticia.fuente === this.fuenteSeleccionada
      );
    }
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
    // Oculta la imagen si no se puede cargar
    event.target.style.display = 'none';
  }
}