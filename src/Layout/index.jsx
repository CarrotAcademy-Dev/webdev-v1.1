import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

function Layout({ children, name }) {
  return (
    <>
      <Navbar name={name} />
      <main style={{ paddingTop: '70px' }}>
        {children}
        <Footer />
      </main>
    </>
  );
}

export default Layout;