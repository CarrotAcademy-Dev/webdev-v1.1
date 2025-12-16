'use client'

import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { mode } from '@chakra-ui/theme-tools'

const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  
  // Custom color palette
  colors: {
    brand: {
      20: '#FCF9E8FF',
      50: '#FFF5F0',
      100: '#FFE8DC',
      200: '#FFD1B8',
      300: '#FFB994',
      400: '#FFA270',
      500: '#FE7743', // Main orange
      600: '#E5653A',
      700: '#CC5331',
      800: '#B24128',
      900: '#992F1F',
    },
    // Dark mode specific colors
    dark: {
      bg: {
        primary: '#1A202C',      // Main dark background
        secondary: '#2D3748',    // Container/Card background (lighter than primary)
        tertiary: '#374151',     // Input/elevated surfaces
        card: '#2D3748',
        hover: '#374151',
      },
      text: {
        primary: '#F7FAFC',      // Main headings/important text
        secondary: '#E2E8F0',    // Body text
        muted: '#A0AEC0',        // Less important text
        disabled: '#718096',
      },
      border: '#4A5568',
    },
    // Light mode specific colors
    light: {
      bg: {
        primary: '#EFEEEA',      // Main light background (warm beige)
        secondary: '#FFFFFF',    // Container/Card background (pure white - contrast)
        tertiary: '#F7FAFC',     // Input/elevated surfaces
        card: '#FFFFFF',
        hover: '#F7FAFC',
      },
      text: {
        primary: '#1A202C',      // Main headings/important text
        secondary: '#2D3748',    // Body text
        muted: '#718096',        // Less important text
        disabled: '#A0AEC0',
      },
      border: '#E2E8F0',
    },
  },
  
  // Semantic tokens for automatic theme switching
  semanticTokens: {
    colors: {
      'chakra-body-text': {
        _light: 'light.text.primary',
        _dark: 'dark.text.primary',
      },
      'chakra-body-bg': {
        _light: 'light.bg.secondary',
        _dark: 'dark.bg.secondary',
      },
      'chakra-border-color': {
        _light: 'light.border',
        _dark: 'dark.border',
      },
      'chakra-subtle-text': {
        _light: 'light.text.muted',
        _dark: 'dark.text.muted',
      },
    },
  },
  
  fonts: {
    heading: `'Poppins', sans-serif`,
    body: `'Poppins', sans-serif`,
  },

  styles: {
    global: (props) => ({
      body: {
        bg: mode('light.bg.primary', 'dark.bg.primary')(props),
        color: mode('light.text.primary', 'dark.text.primary')(props),
        transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
      },
      // Override Chakra's default gray colors with theme-aware colors
      '.chakra-text': {
        color: mode('light.text.secondary', 'dark.text.secondary')(props),
      },
      'h1, h2, h3, h4, h5, h6': {
        color: mode('light.text.primary', 'dark.text.primary')(props) + ' !important',
      },
      'p': {
        color: mode('light.text.secondary', 'dark.text.secondary')(props),
      },
      // Scrollbar styling
      '::-webkit-scrollbar': {
        width: '10px',
        height: '10px',
      },
      '::-webkit-scrollbar-track': {
        bg: mode('light.bg.tertiary', 'dark.bg.secondary')(props),
      },
      '::-webkit-scrollbar-thumb': {
        bg: mode('gray.400', 'gray.600')(props),
        borderRadius: '10px',
        '&:hover': {
          bg: mode('gray.500', 'gray.500')(props),
        },
      },
    }),
  },
  
  // Component style overrides
  components: {
    Text: {
      baseStyle: (props) => ({
        color: mode('light.text.secondary', 'dark.text.secondary')(props),
      }),
    },
    Heading: {
      baseStyle: (props) => ({
        color: mode('light.text.primary', 'dark.text.primary')(props),
      }),
    },
    Button: {
      baseStyle: () => ({
        fontWeight: 'medium',
        borderRadius: 'md',
        transition: 'all 0.2s',
      }),
      variants: {
        solid: (props) => ({
          bg: mode('brand.500', 'brand.600')(props),
          color: 'white',
          _hover: {
            bg: mode('brand.600', 'brand.700')(props),
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          },
          _active: {
            transform: 'translateY(0)',
          },
        }),
      },
    },
    Card: {
      baseStyle: (props) => ({
        container: {
          bg: mode('light.bg.card', 'dark.bg.card')(props),
          borderColor: mode('light.border', 'dark.border')(props),
          transition: 'all 0.2s',
          _hover: {
            boxShadow: mode('md', 'dark-lg')(props),
          },
        },
      }),
    },
    Modal: {
      baseStyle: (props) => ({
        dialog: {
          bg: mode('light.bg.secondary', 'dark.bg.secondary')(props),
        },
        overlay: {
          bg: mode('blackAlpha.600', 'blackAlpha.800')(props),
        },
      }),
    },
    Input: {
      variants: {
        outline: (props) => ({
          field: {
            bg: mode('white', 'dark.bg.tertiary')(props),
            borderColor: mode('light.border', 'dark.border')(props),
            _hover: {
              borderColor: mode('brand.500', 'brand.400')(props),
            },
            _focus: {
              borderColor: mode('brand.500', 'brand.400')(props),
              boxShadow: `0 0 0 1px ${mode('brand.500', 'brand.400')(props)}`,
            },
          },
        }),
      },
    },
    Table: {
      variants: {
        simple: (props) => ({
          th: {
            bg: mode('gray.100', 'dark.bg.tertiary')(props),
            color: mode('light.text.primary', 'dark.text.primary')(props),
            borderColor: mode('light.border', 'dark.border')(props),
          },
          td: {
            borderColor: mode('light.border', 'dark.border')(props),
          },
          tr: {
            _hover: {
              bg: mode('light.bg.hover', 'dark.bg.hover')(props),
            },
          },
        }),
      },
    },
  },
});

export function Provider({ children }) {
  return (
    <ChakraProvider theme={theme}>
      {children}
    </ChakraProvider>
  )
}