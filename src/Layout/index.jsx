import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import SessionTimeout from "../components/SessionTimeout";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";

function Layout({ children, name }) {
  const { currentUser } = useContext(AuthContext);
  const { isCollapsed } = useSidebar();
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <Navbar name={name} />
      <SessionTimeout />
      <Sidebar userRole={currentUser?.role} userJabatan={currentUser?.jabatan} />
      <main style={{ 
        paddingTop: '70px',
        paddingLeft: isLargeScreen && !isCollapsed ? '240px' : '0',
        transition: 'padding-left 0.3s ease'
      }}>
        {children}
        <Footer />
      </main>
    </>
  );
}

export default Layout;