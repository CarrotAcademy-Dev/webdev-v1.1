import Logo from "../../assets/images/logo1.svg?react";
import StyledNavbar from "./Navbar.Styled";
import { Container } from "@chakra-ui/react";
import { FiBriefcase, FiCheckSquare, FiHome, FiLogOut, FiTrendingUp, FiUser } from "react-icons/fi";
import { PiSuitcaseBold } from "react-icons/pi";
import NavbarMenu from "../Menu";
import { useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

function Navbar() {
    const location = useLocation();
    const { logout } = useContext(AuthContext);

    const menuData = [
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
          { label: "My Tasks", path: "/my-tasks/prospective" },
          { label: "Daftar Kelas Tersedia", path: "/my-tasks/daftar-kelas-tersedia" },
          { label: "Rekap Jadwal Mentor", path: "/my-tasks/rekap-jadwal-mentor" },
          { label: "Daftar Kirim Merchandise", path: "/my-tasks/daftar-kirim-merch" },
          { label: "Daftar Siswa Trial", path: "/my-tasks/daftar-siswa-trial" },
          { label: "Daily Story", path: "/my-tasks/daily-story" },
          { label: "Daftar Offboarding", path: "/my-tasks/daftar-offboarding" },
          { label: "Statistik Prospektif", path: "/my-tasks/statistik-prospektif" },
          { label: "Janji Temu", path: "/my-tasks/janji-temu" },
          { label: "Ticket External", path: "/my-tasks/ticket-external" },
          { label: "Pendaftaran Lanjutan", path: "/my-tasks/pendaftaran-lanjutan" },
          { label: "Daily Story", path: "/my-tasks/daily-story" },
          { label: "Daftar Offboarding", path: "/my-tasks/daftar-offboarding" },
          { label: "Pendaftaran Fulltime Course", path: "/my-tasks/pendaftaranfd-course" },
          { label: "Lost And Found", path: "/my-tasks/lostnfound" },
          { label: "Prospektif Dari Marcom", path: "/my-tasks/prospektif-dari-marcom" },
          { label: "Reports", path: "/reports" },
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
    ];

    return (
            <StyledNavbar>
                <nav className="navbar">
                <div>
                    <h1 className="navbar__brand"><Logo className="brandLogo" /></h1>
                </div>
                <div>
                    <ul className="navbar__list">
                        {menuData.map((menu, index) => {
                        const isActive = menu.items.some(item => location.pathname.startsWith(item.path));

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
            </nav>
        </StyledNavbar>
    )
}

export default Navbar;