import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PlanService } from '../services/plan.service';
import Swal from 'sweetalert2';

interface Pregunta {
  id: number;
  pregunta: string;
  respuesta: string;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Botón flotante del chatbot -->
    <button
      (click)="toggleChat()"
      class="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 dark:from-purple-700 dark:to-indigo-700 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 flex items-center justify-center group hover:scale-110 transform"
      [class.animate-bounce]="!chatAbierto && !mensajeEnviado"
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
      <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <!-- Mensaje de bienvenida -->
        <div class="flex items-start gap-2">
          <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
          </div>
          <div class="flex-1 bg-white dark:bg-gray-700 rounded-2xl rounded-tl-none p-4 shadow-md">
            <p class="text-gray-800 dark:text-gray-200 text-sm">
              ¡Hola! 👋 Soy tu asistente virtual exclusivo para miembros Pro. Selecciona una pregunta frecuente y te ayudaré con información avanzada sobre las funciones premium.
            </p>
          </div>
        </div>

        <!-- Respuesta del bot (si hay una pregunta seleccionada) -->
        <div *ngIf="respuestaActual" class="flex items-start gap-2">
          <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
          </div>
          <div class="flex-1 bg-white dark:bg-gray-700 rounded-2xl rounded-tl-none p-4 shadow-md">
            <p class="text-gray-800 dark:text-gray-200 text-sm whitespace-pre-line">{{ respuestaActual }}</p>
          </div>
        </div>
      </div>

      <!-- Preguntas frecuentes -->
      <div class="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50 max-h-64 overflow-y-auto">
        <h4 class="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <svg class="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Preguntas Frecuentes
        </h4>
        <div class="space-y-2">
          <button
            *ngFor="let pregunta of preguntas"
            (click)="seleccionarPregunta(pregunta)"
            class="w-full text-left px-3 py-2.5 bg-white dark:bg-gray-800 rounded-lg hover:bg-purple-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-400"
          >
            <div class="flex items-start gap-2">
              <svg class="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span class="flex-1">{{ pregunta.pregunta }}</span>
            </div>
          </button>
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
  `]
})
export class ChatbotComponent implements OnInit {
  chatAbierto = false;
  mensajeEnviado = false;
  respuestaActual: string = '';

  constructor(
    public planService: PlanService,
    private router: Router
  ) {}

  ngOnInit() {
    // Verificar el estado del plan al inicializar
  }

  toggleChat() {
    this.chatAbierto = !this.chatAbierto;
    if (!this.chatAbierto) {
      this.respuestaActual = '';
      this.mensajeEnviado = false;
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

    this.respuestaActual = pregunta.respuesta;
    this.mensajeEnviado = true;
    
    // Scroll automático al final
    setTimeout(() => {
      const chatContainer = document.querySelector('.overflow-y-auto');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  }
}

