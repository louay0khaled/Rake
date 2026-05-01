import React, { useState, useMemo, useCallback } from "react";
import { SlidersHorizontal, ArrowUpDown, Grid3X3, List, ChevronDown, Search } from "lucide-react";
import { ALL_PRODUCTS, CATEGORIES, Product } from "../data/products";
import ProductCard from "../components/ProductCard";

interface ProductsPageProps {
  searchQuery: string;
  onAuthRequired: () => void;
}

type SortOption = "default" | "price-asc" | "price-desc" | "rating" | "newest";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "default", label: "الافتراضي" },
  { value: "price-asc", label: "السعر: من الأرخص" },
  { value: "price-desc", label: "السعر: من الأغلى" },
  { value: "rating", label: "الأعلى تقييماً" },
  { value: "newest", label: "الأحدث" },
];

const PAGE_SIZE = 24;

const ProductsPage: React.FC<ProductsPageProps> = ({ searchQuery, onAuthRequired }) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortOpen, setSortOpen] = useState(false);

  const filtered = useMemo(() => {
    let products: Product[] = [...ALL_PRODUCTS];

    // تصفية حسب الفئة
    if (selectedCategory !== "all") {
      products = products.filter((p) => p.category === selectedCategory);
    }

    // تصفية حسب البحث
    const q = (localSearch || searchQuery).trim().toLowerCase();
    if (q) {
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // تصفية حسب السعر
    products = products.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // ترتيب
    switch (sortBy) {
      case "price-asc":
        products.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        products.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        products.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        products.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
    }

    return products;
  }, [selectedCategory, sortBy, localSearch, searchQuery, priceRange]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleCategoryChange = useCallback((cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((sort: SortOption) => {
    setSortBy(sort);
    setSortOpen(false);
    setCurrentPage(1);
  }, []);

  const maxPrice = Math.max(...ALL_PRODUCTS.map((p) => p.price));

  return (
    <div className="min-h-screen pattern-bg py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* رأس الصفحة */}
        <div className="mb-8">
          <h1 className="text-3xl font-black font-scheherazade gold-text mb-2">المتجر الإلكتروني</h1>
          <p className="text-sm" style={{ color: "#a09880" }}>
            {filtered.length.toLocaleString("ar-SY")} منتج متاح
          </p>
        </div>

        <div className="flex gap-6">
          {/* الشريط الجانبي للتصفية */}
          <aside
            className={`${showFilters ? "block" : "hidden"} md:block w-64 shrink-0`}
          >
            <div
              className="rounded-3xl p-5 sticky top-24"
              style={{ background: "rgba(18,18,30,0.9)", border: "1px solid rgba(201,168,76,0.15)" }}
            >
              <h2 className="font-bold text-base mb-5 font-cairo" style={{ color: "#f0d080" }}>
                التصفية والفرز
              </h2>

              {/* الفئات */}
              <div className="mb-6">
                <div className="font-medium text-sm mb-3" style={{ color: "#a09880" }}>الفئات</div>
                <div className="space-y-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-right transition-all ${
                        selectedCategory === cat.id ? "gold-btn" : "hover:bg-yellow-900/20"
                      }`}
                      style={selectedCategory !== cat.id ? { color: "#a09880" } : {}}
                    >
                      <span>{cat.icon}</span>
                      <span className="flex-1 text-right">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* نطاق السعر */}
              <div className="mb-4">
                <div className="font-medium text-sm mb-3" style={{ color: "#a09880" }}>
                  نطاق السعر (ل.س.ج)
                </div>
                <div className="flex gap-2 mb-2">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                    className="input-field text-xs text-center"
                    placeholder="من"
                  />
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                    className="input-field text-xs text-center"
                    placeholder="إلى"
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={maxPrice}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                  className="w-full accent-yellow-500"
                />
              </div>

              {/* إعادة التعيين */}
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setPriceRange([0, maxPrice]);
                  setSortBy("default");
                  setCurrentPage(1);
                }}
                className="w-full py-2 rounded-xl text-sm font-bold transition-all hover:bg-yellow-900/20"
                style={{ border: "1px solid rgba(201,168,76,0.3)", color: "#c9a84c" }}
              >
                إعادة التعيين
              </button>
            </div>
          </aside>

          {/* المنتجات */}
          <div className="flex-1">
            {/* شريط التحكم */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              {/* بحث */}
              <div className="relative flex-1 min-w-48">
                <input
                  type="text"
                  value={localSearch}
                  onChange={(e) => { setLocalSearch(e.target.value); setCurrentPage(1); }}
                  placeholder="بحث في المنتجات..."
                  className="input-field pl-9 text-sm"
                />
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#c9a84c" }} />
              </div>

              <div className="flex items-center gap-2">
                {/* تصفية الجوال */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden flex items-center gap-2 px-3 py-2 rounded-xl text-sm gold-border"
                  style={{ color: "#c9a84c" }}
                >
                  <SlidersHorizontal size={14} />
                  فلترة
                </button>

                {/* الترتيب */}
                <div className="relative">
                  <button
                    onClick={() => setSortOpen(!sortOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm gold-border transition-all hover:bg-yellow-900/20"
                    style={{ color: "#c9a84c" }}
                  >
                    <ArrowUpDown size={14} />
                    <span className="hidden sm:block">{SORT_OPTIONS.find((s) => s.value === sortBy)?.label}</span>
                    <ChevronDown size={14} className={`transition-transform ${sortOpen ? "rotate-180" : ""}`} />
                  </button>
                  {sortOpen && (
                    <div
                      className="absolute left-0 top-11 w-48 rounded-2xl overflow-hidden z-50"
                      style={{ background: "#12121e", border: "1px solid rgba(201,168,76,0.3)", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleSortChange(opt.value)}
                          className={`w-full px-4 py-3 text-sm text-right transition-all hover:bg-yellow-900/20 ${
                            sortBy === opt.value ? "text-yellow-400" : ""
                          }`}
                          style={sortBy !== opt.value ? { color: "#a09880" } : { color: "#f0d080" }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* وضع العرض */}
                <div className="flex rounded-xl overflow-hidden gold-border">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 transition-all ${viewMode === "grid" ? "" : "hover:bg-yellow-900/20"}`}
                    style={{
                      background: viewMode === "grid" ? "rgba(201,168,76,0.2)" : "transparent",
                      color: viewMode === "grid" ? "#f0d080" : "#a09880",
                    }}
                  >
                    <Grid3X3 size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 transition-all ${viewMode === "list" ? "" : "hover:bg-yellow-900/20"}`}
                    style={{
                      background: viewMode === "list" ? "rgba(201,168,76,0.2)" : "transparent",
                      color: viewMode === "list" ? "#f0d080" : "#a09880",
                    }}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* النتائج */}
            {paginated.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔍</div>
                <div className="font-bold text-lg font-cairo" style={{ color: "#f0d080" }}>
                  لا توجد نتائج
                </div>
                <div className="text-sm mt-2" style={{ color: "#a09880" }}>
                  جرّب تغيير معايير البحث أو الفئة
                </div>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    : "grid grid-cols-1 gap-3"
                }
              >
                {paginated.map((product, index) => (
                  <div
                    key={product.id}
                    style={{ animationDelay: `${(index % PAGE_SIZE) * 0.03}s` }}
                    className="animate-fade-in"
                  >
                    <ProductCard product={product} onAuthRequired={onAuthRequired} />
                  </div>
                ))}
              </div>
            )}

            {/* التصفح */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-40 transition-all hover:bg-yellow-900/20 gold-border"
                  style={{ color: "#c9a84c" }}
                >
                  السابق
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                    let page: number;
                    if (totalPages <= 7) {
                      page = i + 1;
                    } else if (currentPage <= 4) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 3) {
                      page = totalPages - 6 + i;
                    } else {
                      page = currentPage - 3 + i;
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-9 h-9 rounded-xl text-sm font-bold transition-all`}
                        style={{
                          background: currentPage === page ? "linear-gradient(135deg, #8a6a1e, #c9a84c)" : "transparent",
                          color: currentPage === page ? "#0a0a14" : "#a09880",
                          border: currentPage === page ? "none" : "1px solid rgba(201,168,76,0.2)",
                        }}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-40 transition-all hover:bg-yellow-900/20 gold-border"
                  style={{ color: "#c9a84c" }}
                >
                  التالي
                </button>
              </div>
            )}

            <div className="text-center mt-4 text-xs" style={{ color: "#a09880" }}>
              عرض {((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} من {filtered.length} منتج
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
