// src/app/themes/morelos.preset.ts
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

/**
 * 🎨 Preset institucional "Morelos" (2024–2030)
 * Inspirado en la identidad visual del Gobierno del Estado de Morelos.
 * Mejora de paleta, contraste y estructura.
 */

const Morelos = definePreset(Aura, {
  semantic: {
    colorScheme: {
      // 🌞 LIGHT MODE: paleta basada en la imagen institucional (verde oliva + beige/tierra)
      light: {
        primary: {
          0: '#ffffff',
          50: '#f6f7f3',
          100: '#eef1e3',
          200: '#e1e7cc',
          300: '#cfd9ad',
          400: '#b7c281',
          500: '#6E7E58', // Verde oliva institucional
          600: '#5f6d47',
          700: '#4f5b37',
          800: '#3b4327',
          900: '#2a311c',
          950: '#191b12',
        },
        secondary: {
          0: '#ffffff',
          50: '#fbf6f0',
          100: '#f5ece0',
          200: '#eedcc3',
          300: '#e3c69b',
          400: '#d1a671',
          500: '#C69D6A', // Beige / dorado tierra institucional
          600: '#aa8251',
          700: '#885f3b',
          800: '#614126',
          900: '#3f2a17',
          950: '#25170e',
        },
        surface: {
          0: '#ffffff',
          50: '#fbf9f5',
          100: '#f6f1e8',
          200: '#efe3d1',
          300: '#e7d5ba',
          400: '#d6c0a3',
          500: '#c6ab8b',
          600: '#a88869',
          700: '#84634b',
          800: '#5d4030',
          900: '#3b261a',
          950: '#24160f',
        },
      },
    },
  },

  typography: {
    fontFamily: `'Poppins', sans-serif`,
    fontSize: '1rem',
    fontWeight: '400',
    headings: {
      fontWeight: '600',
    },
  },
});

export default Morelos;
