import { IconButton, useColorMode, Tooltip } from '@chakra-ui/react';
import { FiSun, FiMoon } from 'react-icons/fi';

export default function ThemeToggle({ variant = 'ghost', size = 'md', showLabel = false }) {
    const { colorMode, toggleColorMode } = useColorMode();
    const isDark = colorMode === 'dark';

    return (
        <Tooltip 
            label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            placement="bottom"
        >
            <IconButton
                icon={isDark ? <FiSun /> : <FiMoon />}
                onClick={toggleColorMode}
                variant={variant}
                size={size}
                aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                fontSize={size === 'lg' ? '24px' : '20px'}
                _hover={{
                    transform: 'rotate(15deg)',
                    transition: 'transform 0.3s ease',
                }}
                transition="all 0.2s"
            >
                {showLabel && (isDark ? 'Light' : 'Dark')}
            </IconButton>
        </Tooltip>
    );
}
