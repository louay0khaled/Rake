import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";
import WalletModal from "./components/WalletModal";
import CartSidebar from "./components/CartSidebar";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import OffersPage from "./pages/OffersPage";
import AboutPage from "./pages/AboutPage";

type Page = "home" | "products" | "offers" | "about";

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [showAuth, setShowAuth] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setCurrentPage("products");
  };

  const handleAuthRequired = () => {
    setShowAuth(true);
  };

  return (
    <div className="min-h-screen" style={{ background: "#0a0a14" }}>
      {/* Toast Notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#12121e",
            color: "#f1f0e8",
            border: "1px solid rgba(201,168,76,0.3)",
            fontFamily: "Cairo, sans-serif",
            fontSize: "13px",
            borderRadius: "12px",
            direction: "rtl",
          },
        }}
      />

      {/* شريط التنقل */}
      <Navbar
        onAuthOpen={() => setShowAuth(true)}
        onWalletOpen={() => setShowWallet(true)}
        onSearch={handleSearch}
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />

      {/* سلة التسوق */}
      <CartSidebar onAuthRequired={handleAuthRequired} />

      {/* الصفحات */}
      <main>
        {currentPage === "home" && (
          <HomePage
            onNavigate={handleNavigate}
            onAuthRequired={handleAuthRequired}
          />
        )}
        {currentPage === "products" && (
          <ProductsPage
            searchQuery={searchQuery}
            onAuthRequired={handleAuthRequired}
          />
        )}
        {currentPage === "offers" && (
          <OffersPage onAuthRequired={handleAuthRequired} />
        )}
        {currentPage === "about" && <AboutPage />}
      </main>

      {/* التذييل */}
      <Footer />

      {/* نافذة تسجيل الدخول */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {/* نافذة المحفظة */}
      {showWallet && <WalletModal onClose={() => setShowWallet(false)} />}
    </div>
  );
};

export default App;
