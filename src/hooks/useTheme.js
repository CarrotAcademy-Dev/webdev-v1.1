import { useColorMode } from '@chakra-ui/react';
import { useEffect } from 'react';

/**
 * Custom hook untuk manage theme dengan localStorage persistence
 * Automatically saves user theme preference
 */
export function useTheme() {
    const { colorMode, toggleColorMode, setColorMode } = useColorMode();

    // Save theme preference to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('carrot-academy-theme', colorMode);
    }, [colorMode]);

    // Load theme preference on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('carrot-academy-theme');
        if (savedTheme && savedTheme !== colorMode) {
            setColorMode(savedTheme);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on mount

    const isDark = colorMode === 'dark';
    const isLight = colorMode === 'light';

    return {
        colorMode,
        isDark,
        isLight,
        toggleColorMode,
        setColorMode,
        setDark: () => setColorMode('dark'),
        setLight: () => setColorMode('light'),
    };
}
