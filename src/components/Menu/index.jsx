import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useDisclosure,
  Text,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { memo, useState } from "react";
import { prefetchRoute } from "@/utils/prefetch";
import { FiChevronRight, FiChevronLeft } from "react-icons/fi";

function NavbarMenu({ icon, menuList = [], isActive, onMenuItemClick }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [subMenuCategory, setSubMenuCategory] = useState(null);

  const handleLogoutClick = (onClickFn) => {
    onClose();
    setSubMenuCategory(null);
    if (onMenuItemClick) onMenuItemClick();
    
    setTimeout(() => {
      onClickFn();
    }, 0);
  };

  const handleCategoryClick = (category) => {
    setSubMenuCategory(category);
  };

  const handleBackClick = () => {
    setSubMenuCategory(null);
  };

  const handleMenuClose = () => {
    onClose();
    setSubMenuCategory(null);
  };

  const handleLinkClick = () => {
    // Close menu when link is clicked
    setTimeout(() => {
      handleMenuClose();
      if (onMenuItemClick) onMenuItemClick();
    }, 100);
  };

  return (
    <Menu isOpen={isOpen} onOpen={onOpen} onClose={handleMenuClose} closeOnSelect={false} closeOnBlur={true}>
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

      <MenuList zIndex={999} maxH="400px" overflowY="auto">
        {/* Show submenu if category is selected */}
        {subMenuCategory ? (
          <>
            <MenuItem
              icon={<FiChevronLeft />}
              onClick={handleBackClick}
              fontWeight="bold"
              color="gray.600"
              _hover={{ bg: 'gray.100' }}
            >
              Back
            </MenuItem>
            <Text px={3} py={2} fontSize="sm" fontWeight="bold" color="gray.500" borderBottomWidth="1px">
              {subMenuCategory}
            </Text>
            {menuList
              .find(item => item.category === subMenuCategory)
              ?.items.map((item, index) => (
                <MenuItem
                  key={index}
                  icon={item.icon}
                  as={Link}
                  to={item.path}
                  onClick={handleLinkClick}
                  onMouseEnter={() => prefetchRoute(item.path)}
                >
                  {item.label}
                </MenuItem>
              ))}
          </>
        ) : (
          <>
            {/* Show categories or regular menu items */}
            {menuList.map((item, index) => {
              // If has category (nested menu)
              if (item.category && item.items) {
                return (
                  <MenuItem
                    key={index}
                    icon={item.icon || <FiChevronRight />}
                    onClick={() => handleCategoryClick(item.category)}
                    fontWeight="medium"
                  >
                    {item.category}
                  </MenuItem>
                );
              }
              // Regular path item
              if (item.path) {
                return (
                  <MenuItem
                    key={index}
                    icon={item.icon}
                    as={Link}
                    to={item.path}
                    onClick={handleLinkClick}
                    onMouseEnter={() => prefetchRoute(item.path)}
                  >
                    {item.label}
                  </MenuItem>
                );
              }
              // Logout item
              if (item.onClick) {
                return (
                  <MenuItem
                    key={index}
                    onClick={() => handleLogoutClick(item.onClick)}
                    icon={item.icon}
                    color="red.500" 
                    _hover={{ bg: 'red.50' }}
                  >
                    {item.label}
                  </MenuItem>
                );
              }
              return null;
            })}
          </>
        )}
      </MenuList>
    </Menu>
  );
}

export default memo(NavbarMenu);