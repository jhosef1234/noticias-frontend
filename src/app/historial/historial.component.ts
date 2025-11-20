import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { Noticia } from '../noticias/noticias';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-gradient-to-r from-blue-600 to-blue-800 shadow-2xl border-b border-blue-900">
        <div class="w-full px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <button
                routerLink="/noticias"
                class="p-2 bg-white rounded-lg hover:bg-blue-50 transition-colors"
                title="Volver a noticias"
              >
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
              </button>
              <div>
                <h1 class="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  Historial
                </h1>
                <p class="text-blue-100 text-sm md:text-base mt-1">
                  Noticias que has leído
                </p>
              </div>
            </div>
            <button
              *ngIf="historial.length > 0"
              (click)="limpiarHistorial()"
              class="px-4 py-2 bg-white text-red-600 text-sm font-semibold rounded-full hover:bg-red-50 transition-colors shadow-lg flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              Limpiar historial
            </button>
          </div>
        </div>
      </header>

      <div class="w-full px-4 sm:px-6 lg:px-8 py-6">
        <!-- Empty State -->
        <div *ngIf="historial.length === 0" class="text-center py-12 bg-white rounded-lg shadow-md">
          <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No hay historial</h3>
          <p class="mt-1 text-sm text-gray-500">
            Las noticias que leas aparecerán aquí.
          </p>
          <div class="mt-6">
            <button
              routerLink="/noticias"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Ver noticias
            </button>
          </div>
        </div>

        <!-- Historial Grid -->
        <div *ngIf="historial.length > 0" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <article 
            *ngFor="let noticia of historial" 
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
              <!-- Badge de leído -->
              <div class="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                Leído
              </div>
            </div>
            
            <!-- Content -->
            <div class="p-5">
              <!-- Source and Date -->
              <div class="flex flex-col gap-2 mb-3">
                <div class="flex items-center justify-between flex-wrap gap-2">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {{ noticia.fuente }}
                    </span>
                    <span 
                      *ngIf="obtenerUbicacion(noticia)" 
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
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
export class HistorialComponent implements OnInit {
  historial: Noticia[] = [];

  constructor(private storageService: StorageService) {}

  ngOnInit() {
    this.cargarHistorial();
  }

  cargarHistorial() {
    this.historial = this.storageService.getHistorial();
  }

  limpiarHistorial() {
    Swal.fire({
      title: '¿Limpiar historial?',
      text: 'Se eliminarán todas las noticias del historial. Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, limpiar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280'
    }).then((result) => {
      if (result.isConfirmed) {
        this.storageService.limpiarHistorial();
        this.cargarHistorial();
        Swal.fire({
          title: 'Historial limpiado',
          text: 'El historial ha sido limpiado exitosamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#2563eb',
          timer: 2000
        });
      }
    });
  }

  obtenerUbicacion(noticia: Noticia): string {
    if (noticia.pais) {
      return noticia.pais;
    }
    return '';
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

