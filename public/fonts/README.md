
# Carpeta de Fuentes

Esta carpeta (`public/fonts/`) está destinada a alojar los archivos de fuentes personalizadas para la aplicación, como la familia tipográfica "Riojana".

**Instrucciones:**

1.  **Obtén los archivos de fuentes:** Descarga o adquiere los archivos de fuentes de la familia "Riojana" (variantes Regular, Condensed, Slab, y sus respectivos pesos e itálicas) en formato WOFF2 (preferido para web) o TTF/OTF.
2.  **Coloca los archivos aquí:** Copia los archivos de fuentes a esta carpeta.
3.  **Nomenclatura (Ejemplo):**
    *   `Riojana-Regular.woff2`
    *   `Riojana-RegularItalic.woff2`
    *   `Riojana-Bold.woff2`
    *   `RiojanaCondensed-Regular.woff2`
    *   `RiojanaCondensed-Bold.woff2`
    *   `RiojanaSlab-Regular.woff2`
    *   etc.
4.  **Actualiza `@font-face`:** En `src/app/globals.css`, asegúrate de que las declaraciones `@font-face` apunten correctamente a los nombres de archivo que has utilizado.

**Ejemplo de declaración `@font-face` en `globals.css`:**

```css
@font-face {
  font-family: 'Riojana Regular';
  src: url('/fonts/Riojana-Regular.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
```

Asegúrate de tener las licencias adecuadas para el uso de estas fuentes en tu aplicación.
