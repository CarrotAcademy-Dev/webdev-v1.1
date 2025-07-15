import * as React from 'react';
import { useColorMode, IconButton } from '@chakra-ui/react';
import { LuSun, LuMoon } from 'react-icons/lu';

export const ColorModeSwitcher = (props) => {
  const { colorMode, toggleColorMode } = useColorMode();

  const text = `Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`;

  const SwitchIcon = colorMode === 'light' ? LuMoon : LuSun;

  return (
    <IconButton
      size="md"
      fontSize="lg"
      aria-label={text}
      variant="ghost"
      color="current"
      marginLeft="2"
      onClick={toggleColorMode}
      icon={<SwitchIcon />}
      {...props}
    />
  );
};