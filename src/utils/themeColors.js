/**
 * Theme-aware utility untuk replace hardcoded colors
 * Gunakan di komponen Chakra UI untuk auto-adapt ke theme
 */

export const themeColors = {
    // Background colors
    cardBg: { light: 'white', dark: 'dark.bg.card' },
    bodyBg: { light: 'light.bg.primary', dark: 'dark.bg.primary' },
    secondaryBg: { light: 'light.bg.secondary', dark: 'dark.bg.secondary' },
    hoverBg: { light: 'light.bg.hover', dark: 'dark.bg.hover' },
    
    // Text colors
    primaryText: { light: 'light.text.primary', dark: 'dark.text.primary' },
    secondaryText: { light: 'light.text.secondary', dark: 'dark.text.secondary' },
    mutedText: { light: 'light.text.muted', dark: 'dark.text.muted' },
    
    // Border colors
    border: { light: 'light.border', dark: 'dark.border' },
    
    // Brand colors (works in both themes)
    brandPrimary: 'brand.500',
    brandHover: 'brand.600',
};

/**
 * Helper function untuk get theme color
 * Usage di component:
 * 
 * import { useColorModeValue } from '@chakra-ui/react';
 * const bgColor = useColorModeValue('white', 'dark.bg.card');
 */
