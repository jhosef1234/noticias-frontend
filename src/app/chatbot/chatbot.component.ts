import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PlanService } from '../services/plan.service';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Swal from 'sweetalert2';

interface Pregunta {
  id: number;
  pregunta: string;
  respuesta: string;
}

interface NoticiaChatbot {
  id: number;
  titulo: string;
  contenido: string;
  fuente: string;
  categoria?: string;
  autor?: string;
  fecha: string;
  link?: string;
  ciudad?: string;
  departamento?: string;
  pais?: string;
  imagen_url?: string;
}

interface Mensaje {
  tipo: 'usuario' | 'bot';
  contenido: string;
  timestamp: Date;
  noticias?: NoticiaChatbot[]; // Noticias para mostrar como tarjetas
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <!-- Botón flotante del chatbot -->
    <button
      (click)="toggleChat()"
      class="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 dark:from-purple-700 dark:to-indigo-700 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 flex items-center justify-center group hover:scale-110 transform"
      [class.animate-bounce]="!chatAbierto && mensajes.length === 0"
      title="Asistente Virtual Pro - ¿Necesitas ayuda?"
    >
      <svg *ngIf="!chatAbierto" class="w-8 h-8 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
      </svg>
      <svg *ngIf="chatAbierto" class="w-8 h-8 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </button>

    <!-- Ventana del chatbot -->
    <div
      *ngIf="chatAbierto"
      class="fixed bottom-24 right-6 z-50 w-96 h-[600px] bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-purple-200/50 dark:border-purple-700/50 flex flex-col overflow-hidden animate-slide-up"
    >
      <!-- Header del chatbot -->
      <div class="bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-700 dark:to-indigo-700 p-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
            </svg>
          </div>
          <div>
            <h3 class="text-white font-bold text-lg">Asistente Virtual Pro</h3>
            <p class="text-purple-100 text-xs">Soporte exclusivo para miembros Pro</p>
          </div>
        </div>
        <button
          (click)="toggleChat()"
          class="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
          title="Cerrar chat"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Área de mensajes -->
      <div #chatContainer class="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <!-- Mensaje de bienvenida (solo al inicio) -->
        <div *ngIf="mensajes.length === 0" class="flex items-start gap-2">
          <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
          </div>
          <div class="flex-1 bg-white dark:bg-gray-700 rounded-2xl rounded-tl-none p-4 shadow-md">
            <p class="text-gray-800 dark:text-gray-200 text-sm">
              ¡Hola! 👋 Soy tu asistente virtual exclusivo para miembros Pro. Puedes escribirme cualquier pregunta sobre el portal de noticias y te ayudaré con información avanzada.
            </p>
          </div>
        </div>

        <!-- Historial de mensajes -->
        <div *ngFor="let mensaje of mensajes" class="flex items-start gap-2" [class.flex-row-reverse]="mensaje.tipo === 'usuario'">
          <!-- Avatar del bot -->
          <div *ngIf="mensaje.tipo === 'bot'" class="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
          </div>
          <!-- Avatar del usuario -->
          <div *ngIf="mensaje.tipo === 'usuario'" class="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <!-- Contenido del mensaje -->
          <div class="flex-1 max-w-[80%]" [class.bg-white]="mensaje.tipo === 'bot'" [class.dark:bg-gray-700]="mensaje.tipo === 'bot'" [class.bg-purple-100]="mensaje.tipo === 'usuario'" [class.dark:bg-purple-900/30]="mensaje.tipo === 'usuario'" [class.rounded-2xl]="true" [class.rounded-tl-none]="mensaje.tipo === 'bot'" [class.rounded-tr-none]="mensaje.tipo === 'usuario'" [class.p-4]="true" [class.shadow-md]="true">
            <!-- Texto del mensaje (si no hay noticias o hay texto adicional) -->
            <p *ngIf="mensaje.contenido" class="text-gray-800 dark:text-gray-200 text-sm whitespace-pre-line mb-3">{{ mensaje.contenido }}</p>
            
            <!-- Tarjetas de noticias -->
            <div *ngIf="mensaje.noticias && mensaje.noticias.length > 0" class="space-y-2.5 mt-3">
              <div *ngFor="let noticia of mensaje.noticias" class="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer group transform hover:scale-[1.02]" (click)="abrirNoticia(noticia.link)">
                <!-- Layout horizontal: imagen a la izquierda, contenido a la derecha -->
                <div class="flex gap-3">
                  <!-- Imagen de la noticia (si existe) -->
                  <div *ngIf="noticia.imagen_url" class="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg">
                    <img [src]="noticia.imagen_url" [alt]="noticia.titulo" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" (error)="$event.target.style.display='none'" />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                  
                  <!-- Contenido de la tarjeta -->
                  <div class="flex-1 p-2.5 min-w-0">
                    <!-- Tags y fecha -->
                    <div class="flex items-center gap-1.5 mb-1.5 flex-wrap">
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                        {{ noticia.fuente }}
                      </span>
                      <span *ngIf="noticia.ciudad || noticia.pais" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        {{ noticia.ciudad || noticia.pais }}
                      </span>
                      <span class="text-xs text-gray-500 dark:text-gray-400 ml-auto whitespace-nowrap">{{ formatearFechaCorta(noticia.fecha) }}</span>
                    </div>
                    
                    <!-- Título -->
                    <h4 class="text-xs font-bold text-gray-900 dark:text-gray-100 mb-1.5 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors leading-tight">
                      {{ noticia.titulo }}
                    </h4>
                    
                    <!-- Preview del contenido -->
                    <p class="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed mb-2">
                      {{ noticia.contenido }}
                    </p>
                    
                    <!-- Botón leer más -->
                    <div class="flex justify-end">
                      <span class="inline-flex items-center text-xs text-purple-600 dark:text-purple-400 font-semibold group-hover:underline">
                        Leer más
                        <svg class="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Indicador de escritura -->
        <div *ngIf="procesando" class="flex items-start gap-2">
          <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
          </div>
          <div class="flex-1 bg-white dark:bg-gray-700 rounded-2xl rounded-tl-none p-4 shadow-md">
            <div class="flex gap-1">
              <div class="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
              <div class="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input de mensaje -->
      <div class="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50">
        <form (ngSubmit)="enviarMensaje()" class="flex gap-2">
          <input
            type="text"
            [(ngModel)]="mensajeInput"
            [name]="'mensajeInput'"
            [disabled]="!planService.isPro() || procesando"
            [placeholder]="planService.isPro() ? 'Escribe tu pregunta...' : 'Plan Pro requerido'"
            class="flex-1 px-4 py-2.5 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            (keydown.enter)="enviarMensaje()"
          />
          <button
            type="submit"
            [disabled]="!planService.isPro() || !mensajeInput.trim() || procesando"
            class="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          </button>
        </form>
        
        <!-- Preguntas rápidas (solo si no hay mensajes) -->
        <div *ngIf="mensajes.length === 0" class="mt-3">
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">Preguntas rápidas:</p>
          <div class="flex flex-wrap gap-2">
            <button
              *ngFor="let pregunta of preguntas.slice(0, 3)"
              (click)="enviarPreguntaRapida(pregunta.pregunta)"
              [disabled]="!planService.isPro()"
              class="px-3 py-1.5 text-xs bg-white dark:bg-gray-800 rounded-lg hover:bg-purple-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all text-gray-700 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ pregunta.pregunta }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slide-up {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-slide-up {
      animation: slide-up 0.3s ease-out;
    }

    /* Scrollbar personalizado */
    ::-webkit-scrollbar {
      width: 6px;
    }

    ::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }

    ::-webkit-scrollbar-thumb {
      background: #cbd5e0;
      border-radius: 10px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: #a0aec0;
    }

    .dark ::-webkit-scrollbar-track {
      background: #374151;
    }

    .dark ::-webkit-scrollbar-thumb {
      background: #4b5563;
    }

    .dark ::-webkit-scrollbar-thumb:hover {
      background: #6b7280;
    }

    /* Estilos para tarjetas de noticias */
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  
  chatAbierto = false;
  mensajes: Mensaje[] = [];
  mensajeInput: string = '';
  procesando: boolean = false;
  private supabase: SupabaseClient;
  private noticiasCache: any[] = [];

  constructor(
    public planService: PlanService,
    private router: Router
  ) {
    this.supabase = createClient(
      'https://aplusyghdeuyewrstikg.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwbHVzeWdoZGV1eWV3cnN0aWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MzU5MTksImV4cCI6MjA3MzIxMTkxOX0.n1m0CnGGWYVex9AGB9XEsUNDs-VLorFK2tjyKLfQIps'
    );
  }

  ngOnInit() {
    this.cargarNoticiasCache();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom() {
    if (this.chatContainer) {
      const element = this.chatContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  async cargarNoticiasCache() {
    try {
      const { data } = await this.supabase
        .from('noticias')
        .select('id, titulo, contenido, fuente, categoria, autor, fecha')
        .limit(100)
        .order('fecha', { ascending: false });
      
      if (data) {
        this.noticiasCache = data;
      }
    } catch (error) {
      console.error('Error cargando noticias para el chatbot:', error);
    }
  }

  toggleChat() {
    this.chatAbierto = !this.chatAbierto;
    if (!this.chatAbierto) {
      this.mensajes = [];
      this.mensajeInput = '';
    }
  }

  enviarPreguntaRapida(pregunta: string) {
    if (!this.planService.isPro()) {
      this.mostrarMensajePlanPro();
      return;
    }
    this.mensajeInput = pregunta;
    this.enviarMensaje();
  }

  async enviarMensaje() {
    if (!this.planService.isPro()) {
      this.mostrarMensajePlanPro();
      return;
    }

    const mensajeTexto = this.mensajeInput.trim();
    if (!mensajeTexto || this.procesando) {
      return;
    }

    // Agregar mensaje del usuario
    this.mensajes.push({
      tipo: 'usuario',
      contenido: mensajeTexto,
      timestamp: new Date()
    });

    this.mensajeInput = '';
    this.procesando = true;

    // Simular delay para respuesta más natural
    await new Promise(resolve => setTimeout(resolve, 500));

    // Procesar y obtener respuesta
    const respuesta = await this.procesarPregunta(mensajeTexto);

    // Agregar respuesta del bot
    this.mensajes.push({
      tipo: 'bot',
      contenido: respuesta.contenido || '',
      noticias: respuesta.noticias || [],
      timestamp: new Date()
    });

    this.procesando = false;
  }

  abrirNoticia(link?: string) {
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  }

  mostrarMensajePlanPro() {
    Swal.fire({
      title: '<div style="font-size: 28px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">✨ Asistente Virtual Pro</div>',
      html: `
<div style="text-align: center; padding: 20px 0;">
  <div style="background: linear-gradient(135deg, #475569 0%, #1e40af 100%); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px rgba(71, 85, 105, 0.3);">
    <svg style="width: 45px; height: 45px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
    </svg>
  </div>
  <p style="font-size: 18px; color: #475569; margin-bottom: 24px; font-weight: 500;">
    El <span style="color: #1e40af; font-weight: 600;">Asistente Virtual Pro</span> es exclusivo para miembros Pro
  </p>
  <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 16px; padding: 24px; margin: 20px 0; border: 2px solid #e2e8f0;">
    <p style="font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 16px; text-align: left;">
      🎯 El Asistente Virtual Pro incluye:
    </p>
    <div style="text-align: left;">
      <div style="display: flex; align-items: center; margin-bottom: 12px; padding: 10px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #475569 0%, #334155 100%); width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;">
          <svg style="width: 18px; height: 18px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
          </svg>
        </div>
        <span style="font-size: 15px; color: #334155; font-weight: 500;">Soporte avanzado y guías profesionales</span>
      </div>
      <div style="display: flex; align-items: center; margin-bottom: 12px; padding: 10px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;">
          <svg style="width: 18px; height: 18px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>
        </div>
        <span style="font-size: 15px; color: #334155; font-weight: 500;">Respuestas detalladas sobre funciones premium</span>
      </div>
      <div style="display: flex; align-items: center; padding: 10px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;">
          <svg style="width: 18px; height: 18px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
        </div>
        <span style="font-size: 15px; color: #334155; font-weight: 500;">Tips y trucos para aprovechar al máximo el Plan Pro</span>
      </div>
    </div>
  </div>
  <p style="font-size: 14px; color: #64748b; margin-top: 20px; font-style: italic;">
    💡 Actualiza a Pro para acceder al asistente virtual
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

  preguntas: Pregunta[] = [
    {
      id: 1,
      pregunta: '¿Cómo optimizar mis búsquedas avanzadas?',
      respuesta: 'Como usuario Pro, puedes aprovechar búsquedas avanzadas combinando múltiples filtros:\n\n• Usa la barra de búsqueda junto con filtros por categoría, fuente o autor para resultados precisos\n• Combina filtros de fecha (Hoy, Ayer, Esta Semana, Este Mes) con otros criterios\n• Los filtros se aplican de forma simultánea para refinar tus resultados\n• Guarda tus búsquedas frecuentes agregando noticias a favoritos para acceso rápido'
    },
    {
      id: 2,
      pregunta: '¿Cómo funciona el sistema de popularidad global?',
      respuesta: 'El sistema de "Lo Más Popular" utiliza un algoritmo inteligente que analiza:\n\n• Número de veces que las noticias han sido guardadas en favoritos (por todos los usuarios Pro)\n• Número de lecturas registradas en el historial global\n• Score de popularidad = (Favoritos × 2) + Lecturas\n\nLas noticias se ordenan automáticamente por este score, priorizando contenido relevante y de calidad. Tu interacción (favoritos y lecturas) contribuye a este ranking global.'
    },
    {
      id: 3,
      pregunta: '¿Cómo organizar eficientemente mis favoritos?',
      respuesta: 'Para una gestión óptima de favoritos:\n\n• Usa los filtros avanzados para encontrar noticias específicas antes de agregarlas\n• Revisa regularmente tu sección "Favoritos" para mantenerla organizada\n• Combina favoritos con el historial para crear tu propia biblioteca personalizada\n• Las noticias populares que guardes se reflejarán en el ranking global\n\nRecuerda: Puedes quitar favoritos en cualquier momento haciendo clic nuevamente en el corazón.'
    },
    {
      id: 4,
      pregunta: '¿Cómo aprovechar el historial de lectura para análisis?',
      respuesta: 'El historial de lectura Pro te permite:\n\n• Rastrear todas las noticias que has leído automáticamente\n• Analizar tus patrones de lectura y preferencias temáticas\n• Acceder rápidamente a noticias que leíste anteriormente\n• Contribuir al sistema de popularidad global con tus lecturas\n\nCada lectura se registra automáticamente cuando haces clic en "Leer más", sin necesidad de acción adicional. Tu historial es privado y exclusivo de tu cuenta Pro.'
    },
    {
      id: 5,
      pregunta: '¿Cómo renovar o gestionar mi suscripción Pro?',
      respuesta: 'Para gestionar tu suscripción Pro:\n\n• Tu plan se renueva automáticamente cada mes desde la fecha de aprobación\n• Recibirás un email cuando tu plan esté próximo a expirar\n• Si tu plan expira, puedes renovarlo realizando un nuevo pago desde "Planes"\n• El estado de tu suscripción se refleja en tu perfil (dropdown del usuario)\n• Para renovar: Ve a "Planes", completa el formulario de pago y espera la confirmación\n\nTu historial, favoritos y configuraciones se mantienen durante la renovación.'
    },
    {
      id: 6,
      pregunta: '¿Cómo usar los filtros avanzados de forma profesional?',
      respuesta: 'Los filtros avanzados Pro te permiten:\n\n• Filtrar por categoría: Encuentra noticias por tema específico (política, tecnología, deportes, etc.)\n• Filtrar por fuente: Accede a contenido de medios específicos\n• Filtrar por autor: Sigue a periodistas o escritores específicos\n• Combinar filtros: Usa múltiples filtros simultáneamente para resultados precisos\n• Filtrar por fecha: "Hoy", "Ayer", "Esta Semana", "Este Mes" para contenido reciente\n\nTip: Usa "Limpiar Filtros" para restablecer y comenzar una nueva búsqueda.'
    }
  ];

  seleccionarPregunta(pregunta: Pregunta) {
    // Verificar si es Pro antes de mostrar la respuesta
    if (!this.planService.isPro()) {
      this.mostrarMensajePlanPro();
      return;
    }

    // Agregar pregunta del usuario y respuesta del bot
    this.mensajes.push({
      tipo: 'usuario',
      contenido: pregunta.pregunta,
      timestamp: new Date()
    });

    this.procesando = true;
    setTimeout(() => {
      this.mensajes.push({
        tipo: 'bot',
        contenido: pregunta.respuesta,
        noticias: [],
        timestamp: new Date()
      });
      this.procesando = false;
    }, 500);
  }

  private async procesarPregunta(pregunta: string): Promise<{ contenido: string; noticias?: NoticiaChatbot[] }> {
    const preguntaLower = pregunta.toLowerCase().trim();

    // 1. Buscar en preguntas frecuentes exactas
    const preguntaFrecuente = this.preguntas.find(p => 
      p.pregunta.toLowerCase().includes(preguntaLower) || 
      preguntaLower.includes(p.pregunta.toLowerCase().substring(0, 20))
    );
    if (preguntaFrecuente) {
      return { contenido: preguntaFrecuente.respuesta };
    }

    // 2. PRIORIDAD: Detectar si están pidiendo LISTAR/MOSTRAR noticias específicas
    const palabras = preguntaLower.split(/\s+/);
    const pideListar = this.contienePalabras(palabras, ['listar', 'lista', 'listame', 'muestra', 'muéstrame', 'muestra', 'hay', 'tienes', 'tiene', 'existen', 'existe', 'puedes listar', 'puedes mostrar', 'quiero ver', 'ver', 'mostrar', 'dame', 'darme']);
    const mencionaNoticias = this.contienePalabras(palabras, ['noticia', 'noticias', 'artículo', 'articulo', 'artículos', 'articulos']);
    const mencionaFecha = this.contienePalabras(palabras, ['hoy', 'este día', 'este dia', 'fecha de hoy', 'día de hoy', 'dia de hoy', 'ayer', 'semana', 'mes', 'reciente', 'recientes', 'última', 'ultima', 'nueva', 'nuevas']);
    
    // Detectar categorías ANTES de otras búsquedas
    const categorias = ['deportes', 'deporte', 'política', 'politica', 'tecnología', 'tecnologia', 'economía', 'economia', 'salud', 'cultura', 'entretenimiento', 'ciencia', 'educación', 'educacion', 'otros'];
    const categoriaMencionada = categorias.find(cat => preguntaLower.includes(cat));
    const mencionaPopular = preguntaLower.includes('popular') || preguntaLower.includes('populares') || preguntaLower.includes('más popular') || preguntaLower.includes('mas popular');
    
    // Si piden noticias de una categoría específica (especialmente con "más populares")
    if (categoriaMencionada && (pideListar || mencionaNoticias)) {
      return await this.buscarNoticiasPorCategoria(categoriaMencionada, mencionaPopular);
    }
    
    // Si piden listar noticias (especialmente con fecha), buscar en la BD
    if (pideListar && mencionaNoticias) {
      return await this.buscarYListarNoticias(preguntaLower, palabras);
    }

    // Si mencionan noticias con fecha pero no piden listar explícitamente, también buscar
    if (mencionaNoticias && mencionaFecha && !preguntaLower.includes('cómo') && !preguntaLower.includes('como')) {
      return await this.buscarYListarNoticias(preguntaLower, palabras);
    }
    
    // Búsquedas y filtros (solo si NO están pidiendo listar noticias)
    if (this.contienePalabras(palabras, ['buscar', 'búsqueda', 'busco', 'encontrar']) && !pideListar) {
      return { contenido: this.obtenerRespuestaBusqueda(preguntaLower) };
    }

    // Favoritos
    if (this.contienePalabras(palabras, ['favorito', 'favoritos', 'guardar', 'guardado'])) {
      return { contenido: 'Los favoritos te permiten guardar noticias importantes para acceder rápidamente después. Como usuario Pro, puedes:\n\n• Agregar noticias a favoritos haciendo clic en el corazón\n• Ver todas tus noticias favoritas en la sección "Favoritos"\n• Eliminar favoritos cuando ya no los necesites\n• Tus favoritos contribuyen al ranking global de popularidad\n\n¿Te gustaría saber más sobre alguna función específica?' };
    }

    // Historial
    if (this.contienePalabras(palabras, ['historial', 'leído', 'leidas', 'lectura'])) {
      return { contenido: 'El historial de lectura registra automáticamente todas las noticias que has leído. Como usuario Pro:\n\n• Cada vez que haces clic en "Leer más", se guarda en tu historial\n• Puedes acceder a tu historial completo desde el botón "Historial"\n• Tu historial es privado y exclusivo de tu cuenta\n• Las lecturas contribuyen al sistema de popularidad global\n\n¿Necesitas ayuda con algo más?' };
    }

    // Popularidad (solo si NO están pidiendo noticias de una categoría)
    if (this.contienePalabras(palabras, ['popular', 'popularidad', 'trending', 'tendencia', 'más visto']) && !categoriaMencionada) {
      return { contenido: 'El sistema de "Lo Más Popular" funciona así:\n\n• Analiza cuántas veces las noticias han sido guardadas en favoritos (por todos los usuarios Pro)\n• Cuenta las lecturas registradas en el historial global\n• Calcula un score: (Favoritos × 2) + Lecturas\n• Ordena automáticamente las noticias por este score\n\nTu interacción (favoritos y lecturas) contribuye a este ranking global. ¿Quieres saber más?' };
    }

    // Plan Pro / Suscripción
    if (this.contienePalabras(palabras, ['plan', 'pro', 'suscripción', 'pago', 'renovar', 'renovación', 'precio', 'costo'])) {
      return { contenido: 'El Plan Pro incluye:\n\n• Filtros avanzados (categoría, fuente, autores)\n• Guardar noticias en favoritos\n• Historial de lectura completo\n• Acceso a "Lo Más Popular" y "Autores Destacados"\n• Este asistente virtual exclusivo\n\nTu plan se renueva automáticamente cada mes. Puedes gestionarlo desde la sección "Planes". ¿Tienes alguna pregunta específica sobre el plan?' };
    }

    // Filtros
    if (this.contienePalabras(palabras, ['filtro', 'filtrar', 'categoría', 'categoria', 'fuente', 'autor', 'país', 'pais', 'fecha'])) {
      return { contenido: 'Los filtros avanzados Pro te permiten:\n\n• Filtrar por categoría: Encuentra noticias por tema (política, tecnología, deportes, etc.)\n• Filtrar por fuente: Accede a contenido de medios específicos\n• Filtrar por autor: Sigue a periodistas o escritores específicos\n• Filtrar por país: Encuentra noticias de países específicos\n• Filtrar por fecha: "Hoy", "Ayer", "Esta Semana", "Este Mes"\n• Combinar múltiples filtros simultáneamente\n\nUsa "Limpiar Filtros" para restablecer. ¿Necesitas ayuda con algún filtro específico?' };
    }

    // Noticias específicas
    if (this.contienePalabras(palabras, ['noticia', 'noticias', 'artículo', 'articulo', 'última', 'reciente', 'nueva'])) {
      return await this.obtenerRespuestaNoticias(preguntaLower);
    }

    // Autores
    if (this.contienePalabras(palabras, ['autor', 'autores', 'escritor', 'periodista', 'destacado'])) {
      return { contenido: 'Los "Autores Destacados" son periodistas y escritores que aparecen frecuentemente en el portal. Como usuario Pro:\n\n• Puedes filtrar noticias por autor específico\n• Ver cuántas noticias tiene cada autor\n• Acceder directamente a su contenido desde el sidebar\n• Seguir a tus autores favoritos\n\n¿Quieres saber más sobre cómo usar los filtros de autor?' };
    }

    // Saludos
    if (this.contienePalabras(palabras, ['hola', 'hi', 'buenos', 'buenas', 'saludo'])) {
      return { contenido: '¡Hola! 👋 Soy tu asistente virtual Pro. Puedo ayudarte con:\n\n• Información sobre funciones del portal\n• Cómo usar filtros avanzados\n• Gestión de favoritos e historial\n• Sistema de popularidad\n• Suscripción y planes\n• Y mucho más...\n\n¿En qué puedo ayudarte hoy?' };
    }

    // Despedidas
    if (this.contienePalabras(palabras, ['adiós', 'adios', 'gracias', 'chao', 'bye', 'hasta luego'])) {
      return { contenido: '¡De nada! 😊 Estoy aquí siempre que necesites ayuda. Si tienes más preguntas sobre el portal de noticias, no dudes en escribirme. ¡Que tengas un excelente día!' };
    }

    // Respuesta genérica inteligente
    return { contenido: this.obtenerRespuestaGenerica(preguntaLower) };
  }

  private contienePalabras(palabras: string[], palabrasClave: string[]): boolean {
    return palabras.some(p => palabrasClave.some(k => p.includes(k) || k.includes(p)));
  }

  private obtenerRespuestaBusqueda(pregunta: string): string {
    if (pregunta.includes('avanzada') || pregunta.includes('avanzado')) {
      return 'Las búsquedas avanzadas Pro te permiten:\n\n• Combinar la barra de búsqueda con múltiples filtros\n• Buscar por título, contenido, autor o fuente simultáneamente\n• Usar filtros de fecha junto con otros criterios\n• Guardar resultados en favoritos para acceso rápido\n• Los filtros se aplican de forma simultánea para resultados precisos\n\nTip: Combina búsqueda de texto con filtros de categoría para resultados más específicos. ¿Necesitas ayuda con algo más?';
    }
    return 'Para buscar noticias:\n\n• Usa la barra de búsqueda en el header para buscar por título, contenido, autor o fuente\n• Como usuario Pro, puedes combinar la búsqueda con filtros avanzados\n• Los resultados se actualizan en tiempo real mientras escribes\n• Puedes limpiar la búsqueda con el botón X\n\n¿Quieres saber más sobre búsquedas avanzadas?';
  }

  private async buscarYListarNoticias(pregunta: string, palabras: string[]): Promise<{ contenido: string; noticias?: NoticiaChatbot[] }> {
    try {
      // Detectar si se menciona una ciudad, lugar o término específico
      let terminoBusqueda: string | null = null;
      
      // Patrones para detectar términos de búsqueda específicos (mejorados)
      const patrones = [
        // "ciudad de juliaca", "ciudad juliaca"
        /(?:ciudad\s+de\s+|ciudad\s+)([a-záéíóúñü]+(?:\s+[a-záéíóúñü]+)*)/i,
        // "noticias de juliaca", "noticias sobre juliaca"
        /(?:noticias?\s+)(?:de|sobre|acerca\s+de|relacionadas?\s+con)\s+([a-záéíóúñü]+(?:\s+[a-záéíóúñü]+)*)/i,
        // "menciona juliaca", "mencionan juliaca"
        /(?:menciona|mencionan|aparece|aparecen|habla|hablan)\s+(?:específicamente|especificamente|a|de|sobre)?\s*(?:la\s+)?(?:ciudad\s+de\s+)?([a-záéíóúñü]+(?:\s+[a-záéíóúñü]+)*)/i,
        // "donde menciona juliaca"
        /donde\s+(?:menciona|mencionan|aparece|aparecen|habla|hablan)\s+(?:específicamente|especificamente|a|de|sobre)?\s*(?:la\s+)?(?:ciudad\s+de\s+)?([a-záéíóúñü]+(?:\s+[a-záéíóúñü]+)*)/i,
        // "dame noticias de juliaca"
        /(?:dame|darme|muestra|muéstrame|listar|lista|quiero|quiero\s+ver)\s+(?:las\s+)?(?:noticias\s+)?(?:donde|que|en\s+que|en\s+las\s+que|de|sobre)\s+(?:menciona|mencionan|aparece|aparecen|habla|hablan|es)?\s+(?:específicamente|especificamente|a|de|sobre)?\s*(?:la\s+)?(?:ciudad\s+de\s+)?([a-záéíóúñü]+(?:\s+[a-záéíóúñü]+)*)/i
      ];

      for (const patron of patrones) {
        const match = pregunta.match(patron);
        if (match && match[1]) {
          terminoBusqueda = match[1].trim().toLowerCase();
          // Limpiar palabras comunes que puedan haber sido capturadas
          const palabrasComunes = ['la', 'el', 'los', 'las', 'de', 'del', 'en', 'a', 'al'];
          const terminoLimpio = terminoBusqueda.split(/\s+/)
            .filter(p => !palabrasComunes.includes(p) && p.length > 2)
            .join(' ');
          if (terminoLimpio.length > 2) {
            terminoBusqueda = terminoLimpio;
            break;
          }
        }
      }

      // Si no se encontró con patrones, buscar palabras relevantes
      if (!terminoBusqueda) {
        const palabrasComunes = ['noticias', 'noticia', 'puedes', 'dame', 'darme', 'listar', 'lista', 'muestra', 'muéstrame', 'hay', 'tienes', 'tiene', 'existen', 'existe', 'donde', 'dónde', 'menciona', 'mencionan', 'especificamente', 'específicamente', 'ciudad', 'de', 'la', 'el', 'los', 'las', 'un', 'una', 'este', 'esta', 'hoy', 'ayer', 'semana', 'mes', 'fecha', 'que', 'en', 'a', 'al', 'sobre', 'acerca', 'relacionadas', 'relacionados', 'relacionada', 'relacionado'];
        
        // Lista de ciudades conocidas para priorizar
        const ciudadesConocidas = ['lima', 'arequipa', 'cusco', 'trujillo', 'chiclayo', 'piura', 'iquitos', 'huancayo', 'pucallpa', 'tacna', 'juliaca', 'cajamarca', 'ayacucho', 'iquique', 'tarapoto', 'moquegua', 'tumbes', 'puno', 'huaraz', 'ica', 'sullana', 'chincha', 'huanuco', 'ferrenafe', 'chimbote', 'abancay'];
        
        // Primero buscar si alguna palabra es una ciudad conocida
        const ciudadEncontrada = palabras.find(p => ciudadesConocidas.includes(p.toLowerCase()));
        if (ciudadEncontrada) {
          terminoBusqueda = ciudadEncontrada.toLowerCase();
        } else {
          // Si no, buscar palabras relevantes
          const palabrasRelevantes = palabras.filter(p => 
            p.length > 3 && 
            !palabrasComunes.includes(p.toLowerCase()) &&
            !p.match(/^\d+$/) // No números
          );
          
          if (palabrasRelevantes.length > 0) {
            terminoBusqueda = palabrasRelevantes.sort((a, b) => b.length - a.length)[0].toLowerCase();
          }
        }
      }

      // Si hay un término de búsqueda específico (ciudad, lugar, etc.), buscar directamente
      if (terminoBusqueda && terminoBusqueda.length > 3) {
        return await this.buscarNoticiasPorTermino(terminoBusqueda, pregunta);
      }

      let query = this.supabase
        .from('noticias')
        .select('id, titulo, contenido, fuente, categoria, autor, fecha, link, ciudad, departamento, pais, imagen_url')
        .order('fecha', { ascending: false });

      // Detectar filtro por fecha
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const finHoy = new Date();
      finHoy.setHours(23, 59, 59, 999);

      if (pregunta.includes('hoy') || pregunta.includes('este día') || pregunta.includes('este dia') || pregunta.includes('fecha de hoy') || pregunta.includes('día de hoy') || pregunta.includes('dia de hoy')) {
        // Filtrar noticias de hoy
        query = query.gte('fecha', hoy.toISOString()).lte('fecha', finHoy.toISOString());
      } else if (pregunta.includes('ayer')) {
        const ayer = new Date(hoy);
        ayer.setDate(ayer.getDate() - 1);
        const finAyer = new Date(ayer);
        finAyer.setHours(23, 59, 59, 999);
        query = query.gte('fecha', ayer.toISOString()).lte('fecha', finAyer.toISOString());
      } else if (pregunta.includes('semana')) {
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() - hoy.getDay());
        query = query.gte('fecha', inicioSemana.toISOString());
      } else if (pregunta.includes('mes')) {
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        query = query.gte('fecha', inicioMes.toISOString());
      }

      // Detectar categoría si se menciona (se filtrará después en memoria)
      const categorias = ['política', 'politica', 'tecnología', 'tecnologia', 'deportes', 'economía', 'economia', 'salud', 'cultura', 'entretenimiento', 'ciencia', 'educación', 'educacion'];
      const categoriaMencionada = categorias.find(cat => pregunta.includes(cat));

      // Detectar país si se menciona (se filtrará después en memoria)
      const paises = ['perú', 'peru', 'argentina', 'chile', 'colombia', 'méxico', 'mexico', 'españa', 'espana', 'estados unidos', 'brasil', 'ecuador', 'venezuela', 'uruguay', 'bolivia'];
      const paisMencionado = paises.find(pais => pregunta.includes(pais));

      // Aumentar límite para tener más datos para filtrar
      query = query.limit(100);

      const { data, error } = await query;

      if (error) {
        console.error('Error buscando noticias:', error);
        return { contenido: 'Lo siento, hubo un error al buscar las noticias. Por favor intenta de nuevo o usa los filtros en el portal.' };
      }

      // Filtrar por categoría y país si se mencionaron (en memoria)
      let noticiasFiltradas = data || [];
      if (categoriaMencionada && noticiasFiltradas.length > 0) {
        noticiasFiltradas = noticiasFiltradas.filter(n => {
          const catNoticia = (n.categoria || '').toLowerCase();
          return catNoticia.includes(categoriaMencionada) || catNoticia.includes(categoriaMencionada.replace('í', 'i').replace('ó', 'o'));
        });
      }
      if (paisMencionado && noticiasFiltradas.length > 0) {
        noticiasFiltradas = noticiasFiltradas.filter(n => {
          const texto = `${n.titulo} ${n.contenido} ${n.ciudad || ''} ${n.departamento || ''} ${n.pais || ''}`.toLowerCase();
          return texto.includes(paisMencionado);
        });
      }

      if (!noticiasFiltradas || noticiasFiltradas.length === 0) {
        let mensaje = 'No encontré noticias';
        if (pregunta.includes('hoy') || pregunta.includes('este día')) {
          mensaje += ' para el día de hoy';
        } else if (pregunta.includes('ayer')) {
          mensaje += ' de ayer';
        } else if (pregunta.includes('semana')) {
          mensaje += ' de esta semana';
        } else if (pregunta.includes('mes')) {
          mensaje += ' de este mes';
        }
        mensaje += '. Puedes intentar con otros filtros o buscar en el portal directamente.';
        return { contenido: mensaje };
      }

      // Limitar a las 10 más recientes
      const noticiasMostrar = noticiasFiltradas.slice(0, 10);

      let contenido = `📰 Encontré ${noticiasFiltradas.length} noticia(s):`;
      if (noticiasFiltradas.length > 10) {
        contenido += ` (mostrando las 10 más recientes)`;
      }

      return {
        contenido: contenido,
        noticias: noticiasMostrar.map(n => ({
          id: n.id,
          titulo: n.titulo,
          contenido: n.contenido,
          fuente: n.fuente,
          categoria: n.categoria,
          autor: n.autor,
          fecha: n.fecha,
          link: n.link,
          ciudad: n.ciudad,
          departamento: n.departamento,
          pais: n.pais,
          imagen_url: n.imagen_url
        }))
      };

    } catch (error) {
      console.error('Error en buscarYListarNoticias:', error);
      return { contenido: 'Lo siento, hubo un error al buscar las noticias. Por favor intenta de nuevo o usa los filtros en el portal.' };
    }
  }

  private async buscarNoticiasPorCategoria(categoria: string, masPopulares: boolean): Promise<{ contenido: string; noticias?: NoticiaChatbot[] }> {
    try {
      // Normalizar nombre de categoría
      const categoriaNormalizada = categoria === 'deporte' ? 'deportes' : categoria;
      
      let query = this.supabase
        .from('noticias')
        .select('id, titulo, contenido, fuente, categoria, autor, fecha, link, ciudad, departamento, pais, imagen_url')
        .ilike('categoria', `%${categoriaNormalizada}%`)
        .order('fecha', { ascending: false })
        .limit(masPopulares ? 50 : 20);

      const { data, error } = await query;

      if (error) {
        console.error('Error buscando noticias por categoría:', error);
        return { contenido: 'Lo siento, hubo un error al buscar las noticias. Por favor intenta de nuevo.' };
      }

      if (!data || data.length === 0) {
        return { contenido: `No encontré noticias de la categoría "${categoriaNormalizada}". Puedes intentar buscar en el portal directamente.` };
      }

      // Si piden "más populares", necesitaríamos datos de favoritos/lecturas, por ahora ordenamos por fecha
      const noticiasMostrar = data.slice(0, 10);

      const contenido = `📰 Encontré ${data.length} noticia(s) de ${categoriaNormalizada}${masPopulares ? ' (más recientes)' : ''}:`;
      
      return {
        contenido: contenido,
        noticias: noticiasMostrar.map(n => ({
          id: n.id,
          titulo: n.titulo,
          contenido: n.contenido,
          fuente: n.fuente,
          categoria: n.categoria,
          autor: n.autor,
          fecha: n.fecha,
          link: n.link,
          ciudad: n.ciudad,
          departamento: n.departamento,
          pais: n.pais,
          imagen_url: n.imagen_url
        }))
      };

    } catch (error) {
      console.error('Error en buscarNoticiasPorCategoria:', error);
      return { contenido: 'Lo siento, hubo un error al buscar las noticias. Por favor intenta de nuevo.' };
    }
  }

  private async buscarNoticiasPorTermino(termino: string, preguntaOriginal: string): Promise<{ contenido: string; noticias?: NoticiaChatbot[] }> {
    try {
      // Buscar en título, contenido, ciudad, departamento y país
      const terminoLower = termino.toLowerCase().trim();
      
      // Detectar si es una búsqueda de ciudad (explícita o implícita)
      const esBusquedaCiudadExplicita = preguntaOriginal.includes('ciudad') || preguntaOriginal.includes('ciudad de');
      
      // Lista de ciudades conocidas en Perú para detectar búsquedas implícitas
      const ciudadesConocidas = ['lima', 'arequipa', 'cusco', 'trujillo', 'chiclayo', 'piura', 'iquitos', 'huancayo', 'pucallpa', 'tacna', 'juliaca', 'cajamarca', 'ayacucho', 'iquique', 'tarapoto', 'moquegua', 'tumbes', 'puno', 'huaraz', 'ica', 'sullana', 'chincha', 'huanuco', 'ferrenafe', 'chimbote', 'abancay', 'ayaviri', 'azangaro', 'ilave', 'lampa', 'macusani', 'moho', 'pomata', 'putina', 'sandia', 'san antonio de putina', 'san roman', 'yunguyo'];
      
      // Detectar si el término es probablemente una ciudad (está en la lista)
      const esProbableCiudad = ciudadesConocidas.includes(terminoLower);
      
      const esBusquedaCiudad = esBusquedaCiudadExplicita || esProbableCiudad;
      
      // Buscar en la base de datos - obtener más resultados para filtrar mejor
      const { data, error } = await this.supabase
        .from('noticias')
        .select('id, titulo, contenido, fuente, categoria, autor, fecha, link, ciudad, departamento, pais, imagen_url')
        .order('fecha', { ascending: false })
        .limit(2000); // Aumentar para tener más datos para filtrar

      if (error) {
        console.error('Error buscando noticias por término:', error);
        return { contenido: 'Lo siento, hubo un error al buscar las noticias. Por favor intenta de nuevo.' };
      }

      if (!data || data.length === 0) {
        return { contenido: `No encontré noticias que mencionen "${termino}". Puedes intentar buscar en el portal directamente o con otros términos.` };
      }

      // Filtrar noticias que mencionen el término
      let noticiasFiltradas: any[] = [];
      
      if (esBusquedaCiudad) {
        // Búsqueda MUY estricta para ciudades: PRIORIDAD AL CAMPO CIUDAD
        noticiasFiltradas = data.filter(noticia => {
          const ciudadNoticia = (noticia.ciudad || '').toLowerCase().trim();
          const titulo = (noticia.titulo || '').toLowerCase();
          const contenido = (noticia.contenido || '').toLowerCase();
          const departamento = (noticia.departamento || '').toLowerCase();
          
          // PRIORIDAD 1: Coincidencia EXACTA en el campo ciudad (más confiable)
          if (ciudadNoticia === terminoLower) {
            return true;
          }
          
          // PRIORIDAD 2: Coincidencia parcial en ciudad (solo si el término está completo en la ciudad)
          if (ciudadNoticia && ciudadNoticia.includes(terminoLower) && terminoLower.length >= 4) {
            return true;
          }
          
          // PRIORIDAD 3: Aparece en el título como palabra completa (regex estricto)
          const regexTitulo = new RegExp(`\\b${terminoLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          if (regexTitulo.test(titulo)) {
            // Verificar que no sea una coincidencia casual - debe aparecer de forma prominente
            const posicionEnTitulo = titulo.indexOf(terminoLower);
            if (posicionEnTitulo >= 0 && posicionEnTitulo < 100) {
              return true;
            }
          }
          
          // PRIORIDAD 4: Aparece en contenido PERO solo si también está en ciudad o título
          const regexContenido = new RegExp(`\\b${terminoLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          if (regexContenido.test(contenido)) {
            // Solo si también está en ciudad o en las primeras 200 palabras del contenido
            if (ciudadNoticia.includes(terminoLower) || contenido.indexOf(terminoLower) < 1000) {
              return true;
            }
          }
          
          return false;
        });
      } else {
        // Búsqueda normal: buscar en título, contenido, ciudad, departamento o país
        // Pero usar regex para palabras completas cuando el término es largo
        const regexTermino = terminoLower.length >= 4 ? 
          new RegExp(`\\b${terminoLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i') : 
          null;
        
        noticiasFiltradas = data.filter(noticia => {
          const ciudadNoticia = (noticia.ciudad || '').toLowerCase();
          const titulo = (noticia.titulo || '').toLowerCase();
          const contenido = (noticia.contenido || '').toLowerCase();
          const departamento = (noticia.departamento || '').toLowerCase();
          const pais = (noticia.pais || '').toLowerCase();
          
          // Si hay regex, usarlo para búsqueda de palabras completas
          if (regexTermino) {
            return regexTermino.test(titulo) || 
                   regexTermino.test(contenido) || 
                   regexTermino.test(ciudadNoticia) || 
                   regexTermino.test(departamento) || 
                   regexTermino.test(pais);
          } else {
            // Para términos cortos, búsqueda simple
            return titulo.includes(terminoLower) || 
                   contenido.includes(terminoLower) || 
                   ciudadNoticia.includes(terminoLower) || 
                   departamento.includes(terminoLower) || 
                   pais.includes(terminoLower);
          }
        });
      }

      if (noticiasFiltradas.length === 0) {
        return { contenido: `No encontré noticias que mencionen específicamente "${termino}". Puedes intentar buscar en el portal directamente o verificar si el término está escrito correctamente.` };
      }

      // Limitar a las 10 más recientes
      const noticiasMostrar = noticiasFiltradas.slice(0, 10);

      const contenido = `📰 Encontré ${noticiasFiltradas.length} noticia(s) que mencionan "${termino}":`;
      
      return {
        contenido: contenido,
        noticias: noticiasMostrar.map(n => ({
          id: n.id,
          titulo: n.titulo,
          contenido: n.contenido,
          fuente: n.fuente,
          categoria: n.categoria,
          autor: n.autor,
          fecha: n.fecha,
          link: n.link,
          ciudad: n.ciudad,
          departamento: n.departamento,
          pais: n.pais,
          imagen_url: n.imagen_url
        }))
      };

    } catch (error) {
      console.error('Error en buscarNoticiasPorTermino:', error);
      return { contenido: 'Lo siento, hubo un error al buscar las noticias. Por favor intenta de nuevo.' };
    }
  }

  formatearFechaCorta(fecha: string): string {
    try {
      const fechaObj = new Date(fecha);
      return fechaObj.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return fecha;
    }
  }

  private async obtenerRespuestaNoticias(pregunta: string): Promise<{ contenido: string; noticias?: NoticiaChatbot[] }> {
    // Si no se detectó como petición de listar, buscar en cache
    const palabrasBusqueda = pregunta.split(/\s+/).filter(p => p.length > 3);
    const noticiasRelevantes = this.noticiasCache.filter(n => {
      const texto = `${n.titulo} ${n.contenido} ${n.categoria || ''} ${n.autor || ''}`.toLowerCase();
      return palabrasBusqueda.some(p => texto.includes(p));
    }).slice(0, 3);

    if (noticiasRelevantes.length > 0) {
      return {
        contenido: `Encontré ${noticiasRelevantes.length} noticia(s) relacionada(s):`,
        noticias: noticiasRelevantes.map(n => ({
          id: n.id,
          titulo: n.titulo,
          contenido: n.contenido,
          fuente: n.fuente,
          categoria: n.categoria,
          autor: n.autor,
          fecha: n.fecha,
          link: n.link,
          ciudad: n.ciudad,
          departamento: n.departamento,
          pais: n.pais,
          imagen_url: n.imagen_url
        }))
      };
    }

    if (pregunta.includes('última') || pregunta.includes('reciente') || pregunta.includes('nueva')) {
      return { contenido: 'Las noticias más recientes aparecen primero en el portal. Como usuario Pro puedes:\n\n• Filtrar por "Hoy", "Ayer", "Esta Semana" o "Este Mes"\n• Ordenar por "Más Recientes" o "Más Antiguos"\n• Ver la noticia destacada en la parte superior\n• Acceder a noticias populares en el sidebar\n\n¿Quieres saber cómo usar los filtros de fecha?' };
    }

    return { contenido: 'El portal tiene miles de noticias actualizadas constantemente. Como usuario Pro puedes:\n\n• Buscar noticias específicas con la barra de búsqueda\n• Filtrar por categoría, fuente, autor o país\n• Ver noticias populares y destacadas\n• Guardar tus favoritas para acceso rápido\n\n¿Sobre qué tema te gustaría buscar noticias?' };
  }

  private obtenerRespuestaGenerica(pregunta: string): string {
    // Intentar extraer intención de la pregunta
    if (pregunta.includes('cómo') || pregunta.includes('como')) {
      return 'Puedo ayudarte con información sobre cómo usar las funciones del portal. Algunos temas que puedo explicar:\n\n• Cómo usar filtros avanzados\n• Cómo guardar favoritos\n• Cómo funciona el historial\n• Cómo buscar noticias\n• Cómo funciona la popularidad\n\n¿Sobre cuál de estos temas quieres saber más?';
    }

    if (pregunta.includes('qué') || pregunta.includes('que') || pregunta.includes('quien') || pregunta.includes('quién')) {
      return 'Puedo explicarte sobre las funciones del portal de noticias. Algunos temas:\n\n• Qué es el Plan Pro y qué incluye\n• Qué son los favoritos y cómo usarlos\n• Qué es el historial de lectura\n• Qué son las noticias populares\n• Qué filtros están disponibles\n\n¿Sobre cuál tema quieres información?';
    }

    return 'Entiendo tu pregunta. Puedo ayudarte con información sobre:\n\n• Funciones del Plan Pro\n• Cómo usar filtros avanzados\n• Gestión de favoritos e historial\n• Sistema de popularidad\n• Búsqueda de noticias\n• Suscripción y planes\n\n¿Puedes ser más específico sobre qué necesitas? O puedes seleccionar una pregunta rápida de arriba.';
  }
}

