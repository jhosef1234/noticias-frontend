import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Noticia } from '../noticias/noticias';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly FAVORITOS_KEY = 'noticias_favoritas';
  private readonly HISTORIAL_KEY = 'noticias_historial';
  private readonly supabase: SupabaseClient;
  
  constructor() {
    // Inicializar Supabase para estadísticas globales
    this.supabase = createClient(
      'https://aplusyghdeuyewrstikg.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwbHVzeWdoZGV1eWV3cnN0aWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MzU5MTksImV4cCI6MjA3MzIxMTkxOX0.n1m0CnGGWYVex9AGB9XEsUNDs-VLorFK2tjyKLfQIps'
    );
  }

  // Métodos para Favoritos
  getFavoritos(): Noticia[] {
    const favoritos = localStorage.getItem(this.FAVORITOS_KEY);
    return favoritos ? JSON.parse(favoritos) : [];
  }

  async agregarFavorito(noticia: Noticia): Promise<boolean> {
    const favoritos = this.getFavoritos();
    const existe = favoritos.some(f => f.id === noticia.id);
    
    if (!existe) {
      favoritos.push(noticia);
      localStorage.setItem(this.FAVORITOS_KEY, JSON.stringify(favoritos));
      // Incrementar contador de popularidad GLOBAL (todos los usuarios)
      await this.incrementarFavoritosPopularidad(noticia.id);
      return true;
    }
    return false;
  }

  async eliminarFavorito(noticiaId: number): Promise<boolean> {
    const favoritos = this.getFavoritos();
    const index = favoritos.findIndex(f => f.id === noticiaId);
    
    if (index !== -1) {
      favoritos.splice(index, 1);
      localStorage.setItem(this.FAVORITOS_KEY, JSON.stringify(favoritos));
      // Decrementar contador de popularidad GLOBAL (todos los usuarios)
      await this.decrementarFavoritosPopularidad(noticiaId);
      return true;
    }
    return false;
  }

  esFavorito(noticiaId: number): boolean {
    const favoritos = this.getFavoritos();
    return favoritos.some(f => f.id === noticiaId);
  }

  // Métodos para Historial
  getHistorial(): Noticia[] {
    const historial = localStorage.getItem(this.HISTORIAL_KEY);
    return historial ? JSON.parse(historial) : [];
  }

  async agregarAlHistorial(noticia: Noticia): Promise<void> {
    const historial = this.getHistorial();
    
    // Verificar si ya existe (para no contar múltiples lecturas del mismo usuario)
    const yaExiste = historial.some(h => h.id === noticia.id);
    
    // Eliminar si ya existe (para moverlo al final)
    const index = historial.findIndex(h => h.id === noticia.id);
    if (index !== -1) {
      historial.splice(index, 1);
    }
    
    // Agregar al inicio
    historial.unshift(noticia);
    
    // Limitar a las últimas 100 noticias
    if (historial.length > 100) {
      historial.splice(100);
    }
    
    localStorage.setItem(this.HISTORIAL_KEY, JSON.stringify(historial));
    
    // Incrementar contador de popularidad GLOBAL solo si es la primera vez que este usuario la lee
    // Esto suma a las estadísticas de TODOS los usuarios
    if (!yaExiste) {
      await this.incrementarLecturasPopularidad(noticia.id);
    }
  }

  limpiarHistorial(): void {
    localStorage.removeItem(this.HISTORIAL_KEY);
  }

  eliminarDelHistorial(noticiaId: number): boolean {
    const historial = this.getHistorial();
    const index = historial.findIndex(h => h.id === noticiaId);
    
    if (index !== -1) {
      historial.splice(index, 1);
      localStorage.setItem(this.HISTORIAL_KEY, JSON.stringify(historial));
      return true;
    }
    return false;
  }

  // Métodos para Popularidad (estadísticas GLOBALES en Supabase)
  
  /**
   * Incrementa el contador de favoritos para una noticia (GLOBAL - todos los usuarios)
   */
  async incrementarFavoritosPopularidad(noticiaId: number): Promise<void> {
    try {
      // Buscar si ya existe un registro para esta noticia
      const { data: existing } = await this.supabase
        .from('noticias_popularidad')
        .select('*')
        .eq('noticia_id', noticiaId)
        .single();

      if (existing) {
        // Actualizar el contador existente
        await this.supabase
          .from('noticias_popularidad')
          .update({ 
            favoritos: (existing.favoritos || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('noticia_id', noticiaId);
      } else {
        // Crear nuevo registro
        await this.supabase
          .from('noticias_popularidad')
          .insert({
            noticia_id: noticiaId,
            favoritos: 1,
            lecturas: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Error incrementando favoritos de popularidad:', error);
      // Si falla, no hacer nada (no crítico)
    }
  }

  /**
   * Incrementa el contador de lecturas para una noticia (GLOBAL - todos los usuarios)
   */
  async incrementarLecturasPopularidad(noticiaId: number): Promise<void> {
    try {
      // Buscar si ya existe un registro para esta noticia
      const { data: existing } = await this.supabase
        .from('noticias_popularidad')
        .select('*')
        .eq('noticia_id', noticiaId)
        .single();

      if (existing) {
        // Actualizar el contador existente
        await this.supabase
          .from('noticias_popularidad')
          .update({ 
            lecturas: (existing.lecturas || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('noticia_id', noticiaId);
      } else {
        // Crear nuevo registro
        await this.supabase
          .from('noticias_popularidad')
          .insert({
            noticia_id: noticiaId,
            favoritos: 0,
            lecturas: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Error incrementando lecturas de popularidad:', error);
      // Si falla, no hacer nada (no crítico)
    }
  }

  /**
   * Decrementa el contador de favoritos cuando se elimina de favoritos (GLOBAL)
   */
  async decrementarFavoritosPopularidad(noticiaId: number): Promise<void> {
    try {
      const { data: existing } = await this.supabase
        .from('noticias_popularidad')
        .select('*')
        .eq('noticia_id', noticiaId)
        .single();

      if (existing && existing.favoritos > 0) {
        await this.supabase
          .from('noticias_popularidad')
          .update({ 
            favoritos: Math.max(0, (existing.favoritos || 0) - 1),
            updated_at: new Date().toISOString()
          })
          .eq('noticia_id', noticiaId);
      }
    } catch (error) {
      console.error('Error decrementando favoritos de popularidad:', error);
      // Si falla, no hacer nada (no crítico)
    }
  }

  /**
   * Obtiene todas las estadísticas de popularidad GLOBALES (de todos los usuarios)
   */
  async getAllPopularidadStats(): Promise<Record<number, { favoritos: number; lecturas: number; score: number }>> {
    try {
      const { data, error } = await this.supabase
        .from('noticias_popularidad')
        .select('*');

      if (error) {
        console.error('Error obteniendo estadísticas de popularidad:', error);
        return {};
      }

      const result: Record<number, { favoritos: number; lecturas: number; score: number }> = {};
      
      if (data) {
        for (const stat of data) {
          const favoritos = stat.favoritos || 0;
          const lecturas = stat.lecturas || 0;
          // Score = (favoritos * 2) + lecturas
          result[stat.noticia_id] = {
            favoritos,
            lecturas,
            score: (favoritos * 2) + lecturas
          };
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error obteniendo estadísticas de popularidad:', error);
      return {};
    }
  }
}

