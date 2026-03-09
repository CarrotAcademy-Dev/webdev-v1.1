import Logo from "../../assets/images/logo1.svg?react";
import StyledNavbar from "./Navbar.Styled";
import { IconButton, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, useDisclosure, VStack, Text, Tooltip, Badge, HStack } from "@chakra-ui/react"
import { FiBriefcase, FiCheckSquare, FiHome, FiLogOut, FiTrendingUp, FiUser, FiMenu, FiShield, FiClock } from "react-icons/fi";
import { PiSuitcaseBold } from "react-icons/pi";
import NavbarMenu from "../Menu";
import ThemeToggle from "../ThemeToggle";
import { useLocation } from "react-router-dom";
import { useContext, useMemo, useState, useEffect } from "react";
import { AuthContext } from "@/context/AuthContext";
import { JABATAN } from "@/utils/constants/accessControl";

function Navbar() {
    const location = useLocation();
    const { logout, currentUser, getSessionTimeRemaining } = useContext(AuthContext);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [sessionTime, setSessionTime] = useState(0);

    // Check if user is admin or super_admin
    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';
    // Check if user is CSO
    const isCSO = currentUser?.jabatan === JABATAN.CSO;
    // Check if user is ESO
    const isESO = currentUser?.jabatan === JABATAN.ESO;
    // Show CSO menu if user is CSO or Admin
    const showCSOMenu = isCSO || isAdmin;
    // Show ESO menu if user is ESO or Admin
    const showESOMenu = isESO || isAdmin;
    
    // Update session time every minute
    useEffect(() => {
        if (!currentUser) return;
        
        const updateTime = () => {
            const remaining = getSessionTimeRemaining();
            setSessionTime(remaining);
        };
        
        updateTime();
        const interval = setInterval(updateTime, 60 * 1000); // Update every minute
        
        return () => clearInterval(interval);
    }, [currentUser, getSessionTimeRemaining]);
    
    // Format session time untuk display
    const formatSessionTime = (minutes) => {
        if (minutes === Infinity || minutes > 600) return '∞'; // > 10 jam = unlimited
        if (minutes >= 60) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return `${hours}j ${mins}m`;
        }
        return `${minutes}m`;
    };
    
    // Color untuk badge berdasarkan waktu tersisa
    const getSessionColor = (minutes) => {
        if (minutes === Infinity || minutes > 600) return 'gray'; // > 10 jam = unlimited
        if (minutes <= 10) return 'red';
        if (minutes <= 30) return 'orange';
        if (minutes <= 120) return 'yellow';
        return 'green';
    };

    const menuData = useMemo(() => {
      const baseMenu = [
      {
        mainIcon: <FiHome />,
        items: [
          { label: "Overview", path: "/home", icon: <FiTrendingUp /> },
          { label: "Attendance", path: "/attendance", icon: <FiCheckSquare /> },
          { label: "KPI Details", path: "/home/kpi", icon: <FiBriefcase /> },
          { label: "Leave Request", path: "/leave-request", icon: <FiBriefcase /> },
        ],
      },
      {
        mainIcon: <FiUser />,
        items: [
          { label: "Profile", path: "/profile" },
          { label: "Payslip", path: "/payslip" },
          { label: "Settings", path: "/settings" },
        ],
      },
      {
        mainIcon: <FiLogOut />,
        items: [
            { label: "Logout", onClick: logout }
        ],
      },
    ];

    // Add CSO menu only for CSO jabatan or Admin
    if (showCSOMenu) {
      baseMenu.splice(1, 0, {
        mainIcon: <PiSuitcaseBold />,
        items: [
          {
            category: "Bersama", 
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
            category: "Personal",
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
        ],
      });
    }

    // Add ESO menu only for ESO jabatan or Admin
    if (showESOMenu) {
      baseMenu.splice(showCSOMenu ? 2 : 1, 0, {
        mainIcon: <PiSuitcaseBold />,
        items: [
          {
            category: "Bersama", 
            items: [
              { label: "Nomor Urut Sertifikat", path: "/eso/nomor-urut-sertifikat" },
              { label: "Pendaftaran Lanjutan", path: "/eso/pendaftaran-lanjutan" },
              { label: "Kelengkapan Data", path: "/eso/kelengkapan-data" },
              { label: "Artwork of The Month", path: "/eso/artwork-of-the-month" },
            ]
          },
          {
            category: "Personal",
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
        ],
      });
    }

    // Add Admin menu only for admin/super_admin
    if (isAdmin) {
      baseMenu.splice((showCSOMenu ? 1 : 0) + (showESOMenu ? 1 : 0) + 1, 0, {
        mainIcon: <FiShield />,
        items: [
          {
            category: "Admin",
            items: [
              { label: "Register User", path: "/admin/register-user" },
            ]
          }
        ],
      });
    }

    return baseMenu;
  }, [logout, isAdmin, showCSOMenu, showESOMenu]);

    return (
      <StyledNavbar>
        <nav className="navbar">
          <div className="navbar__left">
            <h1 className="navbar__brand"><Logo className="brandLogo" /></h1>
          </div>
          
          {/* Session Timer Badge */}
          {currentUser && (
            <div className="navbar__session">
              <Tooltip 
                content={`Sesi akan berakhir dalam ${formatSessionTime(sessionTime)}`}
                positioning={{ placement: 'bottom' }}
              >
                <Badge 
                  colorScheme={getSessionColor(sessionTime)}
                  variant="subtle"
                  display="flex"
                  alignItems="center"
                  gap={1}
                  px={2}
                  py={1}
                  borderRadius="md"
                  fontSize="xs"
                >
                  <FiClock />
                  <Text fontSize="xs">{formatSessionTime(sessionTime)}</Text>
                </Badge>
              </Tooltip>
            </div>
          )}
                  
          {/* Desktop Menu */}
          <div className="navbar__desktop">
            <ul className="navbar__list">
              {menuData.map((menu, index) => {
                // Check if active - handle nested structure for My Tasks
                const isActive = menu.items.some(item => {
                  // If item has category (nested), check its items
                  if (item.category && item.items) {
                    return item.items.some(subItem => location.pathname.startsWith(subItem.path));
                  }
                  // Otherwise check regular path
                  return item.path && location.pathname.startsWith(item.path);
                });

                return (
                  <li key={index} className="navbar__item">
                    <NavbarMenu
                      icon={menu.mainIcon}
                      menuList={menu.items}
                      isActive={isActive}
                  />
                  </li>
                )
              })}
              
              {/* Theme Toggle in Desktop */}
              <li className="navbar__item">
                <ThemeToggle />
              </li>
            </ul>
          </div>

          {/* Mobile Hamburger + Theme Toggle */}
          <div className="navbar__mobile">
            <HStack spacing={2}>
              <ThemeToggle size="md" />
              <IconButton
                icon={<FiMenu />}
                onClick={onOpen}
                variant="ghost"
                colorScheme="gray"
                fontSize="24px"
                aria-label="Open menu"
                _hover={{
                  color: '#FE7743',
                  backgroundColor: 'gray.100'
                }}
              />
            </HStack>
          </div>
        </nav>

        {/* Mobile Drawer */}
        <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xs">
          <DrawerOverlay />
          <DrawerContent>
          <DrawerCloseButton />
          <DrawerBody overflowY="auto" pb={8}>
            <VStack spacing={4} align="stretch" mt={4}>
              {menuData.map((menu, index) => {
                // Check if active - handle nested structure for My Tasks
                const isActive = menu.items.some(item => {
                  // If item has category (nested), check its items
                  if (item.category && item.items) {
                    return item.items.some(subItem => location.pathname.startsWith(subItem.path));
                  }
                  // Otherwise check regular path
                  return item.path && location.pathname.startsWith(item.path);
                });
                
                return (
                  <NavbarMenu
                    key={index}
                    icon={menu.mainIcon}
                    menuList={menu.items}
                    isActive={isActive}
                    onMenuItemClick={onClose}
                  />
                );
              })}
            </VStack>
          </DrawerBody>
          </DrawerContent>
        </Drawer>
      </StyledNavbar>
    )
}

export default Navbar;