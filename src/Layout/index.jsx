import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

function Layout({ children, name }) {
  return (
    <>
      <main>
        <Navbar name={name} />
        {children}
        <Footer />
      </main>
    </>
  );
}

export default Layout;