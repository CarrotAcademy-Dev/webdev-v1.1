import Logo from "../../assets/images/logo1.svg?react";
import StyledNavbar from "./Navbar.Styled";
import { IconButton, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, useDisclosure, VStack } from "@chakra-ui/react"
import { FiBriefcase, FiCheckSquare, FiHome, FiLogOut, FiTrendingUp, FiUser, FiMenu } from "react-icons/fi";
import { PiSuitcaseBold } from "react-icons/pi";
import NavbarMenu from "../Menu";
import { useLocation } from "react-router-dom";
import { useContext, useMemo } from "react";
import { AuthContext } from "@/context/AuthContext";

function Navbar() {
    const location = useLocation();
    const { logout } = useContext(AuthContext);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const menuData = useMemo(() => [
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
              { label: "Dashboard Prospektif", path: "/my-tasks/dashboard-prospektif" },
              { label: "Dashboard Reminder", path: "/my-tasks/dashboard-reminder" },
              { label: "Dashboard Daily", path: "/my-tasks/dashboard-daily" },
              { label: "Dashboard Invoice", path: "/my-tasks/dashboard-invoice" },
              { label: "Dashboard Portfolio", path: "/my-tasks/dashboard-portfolio" },
              { label: "FD Student Identity", path: "/my-tasks/fd-student-identity" },
              { label: "Profil Siswa", path: "/my-tasks/profil-siswa" },
              { label: "Prospektif Form", path: "/my-tasks/prospektif-form" },
              { label: "Create Ticketing", path: "/my-tasks/create-ticketing" },
              { label: "Ticketing Internal", path: "/my-tasks/ticketing-internal" },
              { label: "Track Ticket From Me", path: "/my-tasks/track-ticket-fme" },
              { label: "Review Karyawan", path: "/my-tasks/review-karyawan" },
              { label: "Dashboard Karyawan", path: "/my-tasks/dashboard-karyawan" },
            ]
          }
        ],
      },
      {
        mainIcon: <FiUser />,
        items: [
          { label: "Profile", path: "/profile" },
          { label: "Payment", path: "/payment" },
          { label: "Settings", path: "/settings" },
        ],
      },
      {
        mainIcon: <FiLogOut />,
        items: [
            { label: "Logout", onClick: logout }
        ],
      },
    ], [logout]);

    return (
      <StyledNavbar>
        <nav className="navbar">
          <div className="navbar__left">
            <h1 className="navbar__brand"><Logo className="brandLogo" /></h1>
          </div>
                  
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
            </ul>
          </div>

          {/* Mobile Hamburger */}
          <div className="navbar__mobile">
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
          </div>
        </nav>

        {/* Mobile Drawer */}
        <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xs">
          <DrawerOverlay />
          <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <Logo style={{ width: '120px', height: 'auto' }} />
          </DrawerHeader>
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