import React from "react";
import { Tag } from "lucide-react";
import { ALL_PRODUCTS } from "../data/products";
import ProductCard from "../components/ProductCard";

interface OffersPageProps {
  onAuthRequired: () => void;
}

const OffersPage: React.FC<OffersPageProps> = ({ onAuthRequired }) => {
  const discounted = ALL_PRODUCTS.filter((p) => p.discount && p.discount > 0)
    .sort((a, b) => (b.discount || 0) - (a.discount || 0));

  return (
    <div className="min-h-screen pattern-bg py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 text-sm font-bold"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}>
            <Tag size={14} />
            عروض حصرية ومحدودة
          </div>
          <h1 className="text-3xl font-black font-scheherazade gold-text mb-2">العروض والتخفيضات</h1>
          <p className="text-sm" style={{ color: "#a09880" }}>
            {discounted.length} منتج بخصومات تصل إلى 30%
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {discounted.map((product) => (
            <ProductCard key={product.id} product={product} onAuthRequired={onAuthRequired} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OffersPage;
