import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import SessionTimeout from "../components/SessionTimeout";

function Layout({ children, name }) {
  return (
    <>
      <Navbar name={name} />
      <SessionTimeout />
      <main style={{ paddingTop: '70px' }}>
        {children}
        <Footer />
      </main>
    </>
  );
}

export default Layout;