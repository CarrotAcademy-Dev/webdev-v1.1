import { useState, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Box, IconButton } from '@chakra-ui/react';
import { FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import { 
  FiHome, FiTrendingUp, FiCheckSquare, FiBriefcase, 
  FiUser, FiSettings, FiCreditCard 
} from 'react-icons/fi';
import { PiSuitcaseBold } from 'react-icons/pi';
import { useSidebar } from '@/context/SidebarContext';

function Sidebar({ userRole }) {
  const location = useLocation();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [expandedCategories, setExpandedCategories] = useState({
    'Bersama': true,
    'Personal': true,
    'Admin': true,
  });

  // Check if user is admin
  const isAdmin = userRole === 'admin' || userRole === 'super_admin';

  // Toggle category expansion
  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Determine which menu to show based on current path
  const currentSection = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith('/my-tasks')) return 'cso';
    if (path.startsWith('/eso')) return 'eso';
    if (path.startsWith('/admin')) return 'admin';
    if (path.startsWith('/profile') || path.startsWith('/payslip') || path.startsWith('/settings')) return 'profile';
    if (path === '/home' || path.startsWith('/attendance') || path.startsWith('/leave-request') || path.startsWith('/home/kpi')) return 'home';
    return null;
  }, [location.pathname]);

  // Menu data for each section
  const menuData = useMemo(() => {
    const menus = {
      home: {
        title: 'Home',
        icon: <FiHome />,
        items: [
          { label: "Overview", path: "/home", icon: <FiTrendingUp /> },
          { label: "Attendance", path: "/attendance", icon: <FiCheckSquare /> },
          { label: "KPI Details", path: "/home/kpi", icon: <FiBriefcase /> },
          { label: "Leave Request", path: "/leave-request", icon: <FiBriefcase /> },
        ]
      },
      profile: {
        title: 'Profile',
        icon: <FiUser />,
        items: [
          { label: "My Profile", path: "/profile", icon: <FiUser /> },
          { label: "Payslip", path: "/payslip", icon: <FiCreditCard /> },
          { label: "Settings", path: "/settings", icon: <FiSettings /> },
        ]
      },
    };

    // Add CSO menu - always available if user can access /my-tasks routes
    menus.cso = {
      title: 'CSO Tasks',
      icon: <PiSuitcaseBold />,
      categories: [
          {
            name: 'Bersama',
            items: [
              { label: "Statistik Prospektif", path: "/my-tasks/statistik-prospektif" },
              { label: "Rekap Jadwal Mentor", path: "/my-tasks/rekap-jadwal-mentor" },
              { label: "Daftar Kelas Tersedia", path: "/my-tasks/daftar-kelas-tersedia" },
              { label: "Daftar Kirim Merchandise", path: "/my-tasks/daftar-kirim-merch" },
              { label: "Daftar Siswa Trial", path: "/my-tasks/daftar-siswa-trial" },
              { label: "Daftar Offboarding", path: "/my-tasks/daftar-offboarding" },
              { label: "Daily Story", path: "/my-tasks/daily-story" },
              { label: "Janji Temu", path: "/my-tasks/janji-temu" },
              { label: "Ticket External", path: "/my-tasks/ticket-external" },
              { label: "Pendaftaran Lanjutan", path: "/my-tasks/pendaftaran-lanjutan" },
              { label: "Pendaftaran Fulltime Course", path: "/my-tasks/pendaftaranfd-course" },
              { label: "Lost And Found", path: "/my-tasks/lostnfound" },
              { label: "Prospektif Dari Marcom", path: "/my-tasks/prospektif-dari-marcom" },
              { label: "Partnership", path: "/my-tasks/partnership" },
              { label: "Dashboard Siswa Aktif", path: "/my-tasks/dashboard-siswa-aktif" },
            ]
          },
          {
            name: 'Personal',
            items: [
              { label: "Prospektif Form", path: "/my-tasks/prospektif-form" },
              { label: "Dashboard Prospektif", path: "/my-tasks/dashboard-prospektif" },
              { label: "Dashboard Reminder", path: "/my-tasks/dashboard-reminder" },
              { label: "Dashboard Daily", path: "/my-tasks/dashboard-daily" },
              { label: "Dashboard Invoice", path: "/my-tasks/dashboard-invoice" },
              { label: "Dashboard Portfolio", path: "/my-tasks/dashboard-portfolio" },
              { label: "FD Student Identity", path: "/my-tasks/fd-student-identity" },
              { label: "Profil Siswa", path: "/my-tasks/profil-siswa" },
              { label: "Create Ticketing", path: "/my-tasks/create-ticketing" },
              { label: "Ticketing Internal", path: "/my-tasks/ticketing-internal" },
              { label: "Track Ticket From Me", path: "/my-tasks/track-ticket-fme" },
              { label: "Review Karyawan", path: "/my-tasks/review-karyawan" },
              { label: "Dashboard Karyawan", path: "/my-tasks/dashboard-karyawan" },
            ]
          }
        ]
      };

    // Add ESO menu - always available if user can access /eso routes
    menus.eso = {
        title: 'ESO Tasks',
        icon: <PiSuitcaseBold />,
        categories: [
          {
            name: 'Bersama',
            items: [
              { label: "Nomor Urut Sertifikat", path: "/eso/nomor-urut-sertifikat" },
              { label: "Pendaftaran Lanjutan", path: "/eso/pendaftaran-lanjutan" },
              { label: "Kelengkapan Data", path: "/eso/kelengkapan-data" },
            ]
          },
          {
            name: 'Personal',
            items: [
              { label: "Dashboard Full-Time", path: "/eso/dashboard-fulltime" },
              { label: "Dashboard Ticketing Mentor", path: "/eso/dashboard-ticketing-mentor" },
              { label: "FD Identity", path: "/eso/fd-identity" },
              { label: "Review Karyawan", path: "/eso/review-karyawan" },
              { label: "Create Ticketing Internal", path: "/eso/create-ticketing-internal" },
              { label: "Track Ticket From Me", path: "/eso/track-ticket-fme" },
              { label: "Ticketing Internal", path: "/eso/ticketing-internal" },
              { label: "Cari Data Student Report", path: "/eso/cari-data-student-report" },
            ]
          }
        ]
      };

    // Add Admin menu - only for admin users
    if (isAdmin) {
      menus.admin = {
        title: 'Admin',
        icon: <FiSettings />,
        categories: [
          {
            name: 'Admin',
            items: [
              { label: "Register User", path: "/admin/register-user" },
            ]
          }
        ]
      };
    }

    return menus;
  }, [isAdmin]);

  // Get current menu based on section
  const currentMenu = menuData[currentSection];

  // Don't show sidebar if no menu or user not logged in
  if (!currentMenu) return null;

  return (
    <>
      {/* Toggle Button - Fixed position - Only on large screens */}
      <IconButton
        display={{ base: 'none', lg: 'flex' }}
        position="fixed"
        left={isCollapsed ? '4px' : '240px'}
        top="100px"
        size="lg"
        bg="white"
        color="gray.700"
        _dark={{ bg: 'gray.800', color: 'gray.200', borderColor: 'gray.600' }}
        border="1px solid"
        borderColor="gray.300"
        borderRadius="md"
        boxShadow="md"
        onClick={toggleSidebar}
        icon={isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
        aria-label="Toggle sidebar"
        _hover={{ 
          bg: 'gray.100', 
          color: 'gray.900',
          _dark: { bg: 'gray.700', color: 'white' } 
        }}
        zIndex={200}
        transition="all 0.3s ease"
      />

      <Box
        as="aside"
        display={{ base: 'none', lg: 'block' }}
        position="fixed"
        left={isCollapsed ? '-240px' : '0'}
        top="100px"
        width="240px"
        height="calc(100vh - 100px)"
        bg="white"
        _dark={{ bg: 'gray.800', borderColor: 'gray.700' }}
        borderRight="1px solid"
        borderColor="gray.200"
        overflowY="auto"
        transition="left 0.3s ease"
        zIndex={150}
        css={{
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '2px',
          },
        }}
      >

      {/* Sidebar Content */}
      <Box p={4}>
        <Box mb={4}>
          {/* Section Title */}
          <Box
            fontSize="10px"
            fontWeight="600"
            textTransform="uppercase"
            color="gray.500"
            _dark={{ color: 'gray.400' }}
            mb={2}
            px={2}
            letterSpacing="0.5px"
            display="flex"
            alignItems="center"
            gap={1.5}
          >
            <Box fontSize="sm">{currentMenu.icon}</Box>
            {currentMenu.title}
          </Box>

          {/* Simple menu without categories */}
          {currentMenu.items && (
            <Box as="ul" listStyleType="none" p={0} m={0}>
              {currentMenu.items.map((item, index) => (
                <Box as="li" key={index} mb={0.5}>
                  <Box
                    as={Link}
                    to={item.path}
                    display="flex"
                    alignItems="center"
                    gap={2.5}
                    px={2.5}
                    py={2}
                    color={location.pathname === item.path ? 'white' : 'gray.700'}
                    _dark={{ color: location.pathname === item.path ? 'white' : 'gray.300' }}
                    textDecoration="none"
                    borderRadius="md"
                    transition="all 0.2s"
                    fontSize="13px"
                    bg={location.pathname === item.path ? 'orange.500' : 'transparent'}
                    fontWeight={location.pathname === item.path ? '500' : 'normal'}
                    _hover={{
                      bg: location.pathname === item.path ? 'orange.600' : 'gray.100',
                      _dark: { bg: location.pathname === item.path ? 'orange.600' : 'gray.700' }
                    }}
                  >
                    <Box as="span" fontSize="md">
                      {item.icon}
                    </Box>
                    <Box as="span">{item.label}</Box>
                  </Box>
                </Box>
              ))}
            </Box>
          )}

          {/* Menu with categories */}
          {currentMenu.categories && currentMenu.categories.map((category, catIndex) => (
            <Box key={catIndex} mb={3}>
              {/* Category Header */}
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                px={2.5}
                py={1.5}
                cursor="pointer"
                borderRadius="md"
                transition="all 0.2s"
                userSelect="none"
                onClick={() => toggleCategory(category.name)}
                _hover={{ bg: 'gray.100', _dark: { bg: 'gray.700' } }}
              >
                <Box
                  fontSize="12px"
                  fontWeight="600"
                  color="gray.700"
                  _dark={{ color: 'gray.300' }}
                  display="flex"
                  alignItems="center"
                  gap={1.5}
                >
                  <Box
                    as={FiChevronRight}
                    fontSize="xs"
                    transition="transform 0.2s"
                    transform={expandedCategories[category.name] ? 'rotate(90deg)' : 'rotate(0deg)'}
                  />
                  {category.name}
                </Box>
              </Box>

              {/* Category Items */}
              {expandedCategories[category.name] && (
                <Box pl={2} mt={0.5}>
                  <Box as="ul" listStyleType="none" p={0} m={0}>
                    {category.items.map((item, itemIndex) => (
                      <Box as="li" key={itemIndex} mb={0.5}>
                        <Box
                          as={Link}
                          to={item.path}
                          display="flex"
                          alignItems="center"
                          gap={2.5}
                          px={2.5}
                          py={2}
                          color={location.pathname === item.path ? 'white' : 'gray.700'}
                          _dark={{ color: location.pathname === item.path ? 'white' : 'gray.300' }}
                          textDecoration="none"
                          borderRadius="md"
                          transition="all 0.2s"
                          fontSize="13px"
                          bg={location.pathname === item.path ? 'orange.500' : 'transparent'}
                          fontWeight={location.pathname === item.path ? '500' : 'normal'}
                          _hover={{
                            bg: location.pathname === item.path ? 'orange.600' : 'gray.100',
                            _dark: { bg: location.pathname === item.path ? 'orange.600' : 'gray.700' }
                          }}
                        >
                          {item.icon && <Box as="span" fontSize="md">{item.icon}</Box>}
                          <Box as="span">{item.label}</Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
    </>
  );
}

export default Sidebar;
