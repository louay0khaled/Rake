import React, { useState } from "react";
import { ShoppingCart, Menu, X, Search, Bell, LogOut, Wallet } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";

interface NavbarProps {
  onAuthOpen: () => void;
  onWalletOpen: () => void;
  onSearch: (q: string) => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onAuthOpen, onWalletOpen, onSearch, currentPage, onNavigate }) => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { getTotalItems, toggleCart } = useCartStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchVal);
    onNavigate("products");
  };

  return (
    <nav className="navbar sticky top-0 z-50">
      {/* شريط الإعلانات */}
      <div
        className="text-center py-1.5 text-xs font-medium"
        style={{
          background: "linear-gradient(90deg, #8a6a1e, #c9a84c, #f0d080, #c9a84c, #8a6a1e)",
          color: "#0a0a14",
        }}
      >
        🎁 مرحباً بك في سوق الشام! سجّل الآن واحصل على 20 ليرة سورية جديدة هدية فورية 🎁
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* الشعار */}
          <button
            onClick={() => onNavigate("home")}
            className="flex items-center gap-2 shrink-0"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold"
              style={{ background: "linear-gradient(135deg, #8a6a1e, #c9a84c)" }}
            >
              س
            </div>
            <div className="hidden sm:block">
              <div className="gold-text text-lg font-bold font-cairo leading-none">
                سوق الشام
              </div>
              <div className="text-xs" style={{ color: "#a09880" }}>
                المتجر الإلكتروني السوري
              </div>
            </div>
          </button>

          {/* بحث */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:flex">
            <div className="relative w-full">
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="ابحث عن منتج..."
                className="input-field pl-10 text-sm"
              />
              <button
                type="submit"
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "#c9a84c" }}
              >
                <Search size={16} />
              </button>
            </div>
          </form>

          {/* أيقونات */}
          <div className="flex items-center gap-2">
            {/* سلة التسوق */}
            <button
              onClick={toggleCart}
              className="relative p-2.5 rounded-xl gold-border flex items-center justify-center transition-all hover:bg-yellow-900/20"
              title="سلة التسوق"
            >
              <ShoppingCart size={20} style={{ color: "#c9a84c" }} />
              {getTotalItems() > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #c9a84c, #f0d080)",
                    color: "#0a0a14",
                  }}
                >
                  {getTotalItems()}
                </span>
              )}
            </button>

            {/* إشعارات */}
            {isAuthenticated && (
              <button
                className="p-2.5 rounded-xl gold-border transition-all hover:bg-yellow-900/20"
                title="الإشعارات"
              >
                <Bell size={20} style={{ color: "#c9a84c" }} />
              </button>
            )}

            {/* المحفظة */}
            {isAuthenticated && (
              <button
                onClick={onWalletOpen}
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl gold-border transition-all hover:bg-yellow-900/20"
              >
                <Wallet size={16} style={{ color: "#c9a84c" }} />
                <span className="text-sm font-bold" style={{ color: "#f0d080" }}>
                  {user?.walletBalance.toFixed(0)} ل.س.ج
                </span>
              </button>
            )}

            {/* المستخدم */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-xl gold-border transition-all hover:bg-yellow-900/20"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
                    style={{ background: "linear-gradient(135deg, #8a6a1e, #c9a84c)", color: "#0a0a14" }}
                  >
                    {user?.name[0]}
                  </div>
                  <span className="hidden sm:block text-sm font-medium" style={{ color: "#f1f0e8" }}>
                    {user?.name.split(" ")[0]}
                  </span>
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute left-0 top-12 w-52 rounded-2xl overflow-hidden z-50 shadow-2xl"
                    style={{ background: "#12121e", border: "1px solid rgba(201,168,76,0.3)" }}
                  >
                    <div className="p-3 border-b" style={{ borderColor: "rgba(201,168,76,0.2)" }}>
                      <div className="font-bold text-sm" style={{ color: "#f0d080" }}>
                        {user?.name}
                      </div>
                      <div className="text-xs" style={{ color: "#a09880" }}>
                        {user?.email}
                      </div>
                    </div>
                    <button
                      onClick={() => { onWalletOpen(); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-yellow-900/20 transition-all"
                      style={{ color: "#f1f0e8" }}
                    >
                      <Wallet size={15} style={{ color: "#c9a84c" }} />
                      المحفظة والمكافآت
                    </button>
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-red-900/20 transition-all text-red-400"
                    >
                      <LogOut size={15} />
                      تسجيل الخروج
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={onAuthOpen} className="gold-btn px-4 py-2 rounded-xl text-sm font-bold">
                تسجيل الدخول
              </button>
            )}

            {/* قائمة الجوال */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-xl gold-border"
              style={{ color: "#c9a84c" }}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* بحث الجوال */}
        <div className="md:hidden mt-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="ابحث عن منتج..."
                className="input-field pl-10 text-sm"
              />
              <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#c9a84c" }}>
                <Search size={16} />
              </button>
            </div>
          </form>
        </div>

        {/* روابط التنقل */}
        <div className={`${menuOpen ? "flex" : "hidden"} md:flex flex-wrap gap-1 mt-3 pt-3 border-t`} style={{ borderColor: "rgba(201,168,76,0.15)" }}>
          {[
            { id: "home", label: "الرئيسية" },
            { id: "products", label: "المتجر" },
            { id: "offers", label: "العروض" },
            { id: "about", label: "من نحن" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); setMenuOpen(false); }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentPage === item.id
                  ? "gold-btn"
                  : "hover:bg-yellow-900/20"
              }`}
              style={currentPage !== item.id ? { color: "#a09880" } : {}}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
