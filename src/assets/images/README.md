# Imágenes por Defecto de Noticias

## Instrucciones

1. **Copia todas tus imágenes de periódicos/noticias aquí:**
   - Puedes copiar múltiples imágenes
   - Formatos soportados: JPG, JPEG, PNG, WEBP

2. **Actualiza el array en el código:**
   - Abre `src/app/noticias/noticias.ts`
   - Busca el array `imagenesPorDefecto` (alrededor de la línea 1148)
   - Actualiza los nombres de las imágenes con los nombres exactos de tus archivos

3. **Cómo funciona:**
   - Cada noticia sin imagen usará una imagen aleatoria de este array
   - La misma noticia siempre tendrá la misma imagen (basado en su ID)
   - Esto distribuye las imágenes de forma uniforme entre todas las noticias

4. **Ejemplo del array:**
   ```typescript
   private imagenesPorDefecto: string[] = [
     'portadas-periodicos.jpg',
     'images.jpeg',
     'images (1).jpeg',
     // ... agrega todos los nombres de tus imágenes aquí
   ];
   ```

