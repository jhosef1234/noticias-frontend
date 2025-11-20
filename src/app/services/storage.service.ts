import { Injectable } from '@angular/core';
import type { Noticia } from '../noticias/noticias';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly FAVORITOS_KEY = 'noticias_favoritas';
  private readonly HISTORIAL_KEY = 'noticias_historial';

  // Métodos para Favoritos
  getFavoritos(): Noticia[] {
    const favoritos = localStorage.getItem(this.FAVORITOS_KEY);
    return favoritos ? JSON.parse(favoritos) : [];
  }

  agregarFavorito(noticia: Noticia): boolean {
    const favoritos = this.getFavoritos();
    const existe = favoritos.some(f => f.id === noticia.id);
    
    if (!existe) {
      favoritos.push(noticia);
      localStorage.setItem(this.FAVORITOS_KEY, JSON.stringify(favoritos));
      return true;
    }
    return false;
  }

  eliminarFavorito(noticiaId: number): boolean {
    const favoritos = this.getFavoritos();
    const index = favoritos.findIndex(f => f.id === noticiaId);
    
    if (index !== -1) {
      favoritos.splice(index, 1);
      localStorage.setItem(this.FAVORITOS_KEY, JSON.stringify(favoritos));
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

  agregarAlHistorial(noticia: Noticia): void {
    const historial = this.getHistorial();
    
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
}

