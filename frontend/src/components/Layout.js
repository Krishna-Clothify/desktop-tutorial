import Header from "./Header";
import Footer from "./Footer";
import CategoryBar from "./CategoryBar";


function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CategoryBar />
      <main className="page-shell flex-1 pt-4">
        {children}
      </main>

      <Footer />
    </div>
  );
}

export default Layout;
