import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Text,
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { memo, useState, useEffect } from "react";
import { prefetchRoute } from "@/utils/prefetch";
import { FiChevronRight, FiChevronLeft } from "react-icons/fi";

function NavbarMenu({ icon, menuList = [], isActive, onMenuItemClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const [subMenuCategory, setSubMenuCategory] = useState(null);
  const navigate = useNavigate();

  // Reset submenu when menu closes
  useEffect(() => {
    if (!isOpen) {
      setSubMenuCategory(null);
    }
  }, [isOpen]);

  const handleLogoutClick = (onClickFn) => {
    setIsOpen(false);
    setSubMenuCategory(null);
    if (onMenuItemClick) onMenuItemClick();
    onClickFn();
  };

  const handleCategoryClick = (category) => {
    setSubMenuCategory(category);
    // Jangan close menu, biarkan tetap terbuka untuk pilih submenu
  };

  const handleBackClick = () => {
    setSubMenuCategory(null);
  };

  const handleMenuClose = () => {
    setIsOpen(false);
    setSubMenuCategory(null);
  };

  const handleLinkClick = (path) => {
    // Close menu first
    setSubMenuCategory(null);
    setIsOpen(false);
    
    // Small delay to ensure menu closes before navigation
    setTimeout(() => {
      if (onMenuItemClick) onMenuItemClick();
      navigate(path);
    }, 50);
  };

  return (
    <Menu 
      isOpen={isOpen} 
      onOpen={() => setIsOpen(true)} 
      onClose={handleMenuClose}
      closeOnSelect={false}
      closeOnBlur={true}
      placement="bottom-start"
      strategy="fixed"
      gutter={8}
    >
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
                  onClick={() => handleLinkClick(item.path)}
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
                    onClick={() => handleLinkClick(item.path)}
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