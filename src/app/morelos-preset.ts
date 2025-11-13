// src/app/themes/morelos.preset.ts
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

/**
 * 🎨 Preset institucional "Morelos" (2024–2030)
 * Inspirado en la identidad visual del Gobierno del Estado de Morelos.
 * Incluye versión light y dark.
 */

const Morelos = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#f6f6f2',
      100: '#e4e5d9',
      200: '#d0d2b8',
      300: '#b2b892',
      400: '#9ea57c',
      500: '#6e7452', // Verde oliva institucional
      600: '#5f6648',
      700: '#4e533b',
      800: '#3d422f',
      900: '#2e3224',
      950: '#1e1e1e',
    },
    secondary: {
      50: '#fdf8f3',
      100: '#f7e9d8',
      200: '#eed1ac',
      300: '#e2b67b',
      400: '#d9a563',
      500: '#be9c6c', // Dorado tierra institucional
      600: '#a27e4b',
      700: '#856334',
      800: '#6a4e2b',
      900: '#523d22',
      950: '#3b2a18',
    },
  },

  colorScheme: {
    /** 🌞 Modo Claro */
    light: {
      surface: {
        0: '#ffffff',
        50: '#fafafa',
        100: '#f4f4f4',
        200: '#eaeaea',
        300: '#dedede',
        400: '#cfcfcf',
        500: '#bfbfbf',
        600: '#9a9a9a',
        700: '#777777',
        800: '#555555',
        900: '#333333',
        950: '#1a1a1a',
      },
      text: {
        color: '#2b2b2b',
        mutedColor: '#666666',
        linkColor: '#6e7452', // Verde oliva
      },
      focusRing: {
        width: '2px',
        color: '#be9c6c', // Dorado tierra
        style: 'solid',
      },
    },

    /** 🌙 Modo Oscuro */
    dark: {
      surface: {
        0: '#1e1e1e',
        50: '#262626',
        100: '#2f2f2f',
        200: '#3c3c3c',
        300: '#4b4b4b',
        400: '#5a5a5a',
        500: '#6e6e6e',
        600: '#8a8a8a',
        700: '#a7a7a7',
        800: '#c4c4c4',
        900: '#e1e1e1',
        950: '#f5f5f5',
      },
      text: {
        color: '#f3f3f3',
        mutedColor: '#c9c9c9',
        linkColor: '#be9c6c', // Dorado tierra
      },
      focusRing: {
        width: '2px',
        color: '#6e7452', // Verde oliva
        style: 'solid',
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
