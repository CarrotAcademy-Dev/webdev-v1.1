import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

function NavbarMenu({ icon, menuList = [], isActive }) {
  return (
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label="Options"
        icon={icon}
        variant="ghost"
        colorScheme="gray"
        fontSize="24px"
        color={isActive ? '#FE7743' : 'gray.600'}
        _hover={{
          color: '#FE7743',
          backgroundColor: 'gray.100'
        }}
      />

      <MenuList zIndex={999}>
        {menuList.map((item, index) => {
          if (item.path) {
            return (
              <MenuItem
                key={index}
                as={RouterLink}
                to={item.path}
                icon={item.icon}
              >
                {item.label}
              </MenuItem>
            );
          }
          if (item.onClick) {
            return (
              <MenuItem
                key={index}
                onClick={item.onClick}
                icon={item.icon}
                color="red.500" 
                _hover={{ bg: 'red.50' }}
              >
                {item.label}
              </MenuItem>
            )
          }
          return null;
        })}
      </MenuList>
    </Menu>
  );
}

export default NavbarMenu;