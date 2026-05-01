import React, { useState } from "react";
import { ShoppingCart, Star, Heart, Eye } from "lucide-react";
import { Product } from "../data/products";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

interface ProductCardProps {
  product: Product;
  onAuthRequired: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAuthRequired }) => {
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [liked, setLiked] = useState(false);
  const [imgErr, setImgErr] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    addItem(product);
    toast.success(`تمت إضافة "${product.name}" للسلة`, {
      duration: 2000,
      style: { background: "#12121e", color: "#f0d080", border: "1px solid rgba(201,168,76,0.3)", fontFamily: "Cairo, sans-serif" },
    });
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
  };

  const renderStars = (r: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={10}
        className={i < Math.floor(r) ? "star-filled" : "star-empty"}
        fill={i < Math.floor(r) ? "currentColor" : "none"}
      />
    ));
  };

  const fallbackImg = `https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400&q=80`;

  return (
    <div className="product-card rounded-2xl overflow-hidden group cursor-pointer">
      {/* صورة المنتج */}
      <div className="relative overflow-hidden" style={{ height: "200px" }}>
        <img
          src={imgErr ? fallbackImg : product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={() => setImgErr(true)}
          loading="lazy"
        />

        {/* طبقة التحديد */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* أزرار */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
          <button
            onClick={handleLike}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
            style={{
              background: liked ? "rgba(239,68,68,0.9)" : "rgba(0,0,0,0.7)",
              backdropFilter: "blur(4px)",
            }}
          >
            <Heart size={13} color={liked ? "white" : "#c9a84c"} fill={liked ? "white" : "none"} />
          </button>
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          >
            <Eye size={13} color="#c9a84c" />
          </button>
        </div>

        {/* شارات */}
        <div className="absolute top-3 right-3 flex flex-col gap-1">
          {product.discount && (
            <span className="badge-sale px-2 py-0.5 text-xs rounded-full font-bold">
              -{product.discount}%
            </span>
          )}
          {product.isNew && (
            <span className="badge-new px-2 py-0.5 text-xs rounded-full font-bold">
              جديد
            </span>
          )}
          {product.badge && !product.discount && !product.isNew && (
            <span className="badge-hot px-2 py-0.5 text-xs rounded-full font-bold">
              {product.badge}
            </span>
          )}
        </div>

        {/* المخزون */}
        {product.stock <= 5 && (
          <div
            className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-xs"
            style={{ background: "rgba(239,68,68,0.85)", color: "white" }}
          >
            آخر {product.stock} قطع
          </div>
        )}
      </div>

      {/* معلومات المنتج */}
      <div className="p-4">
        {/* الفئة */}
        <div className="text-xs mb-1.5" style={{ color: "#c9a84c" }}>
          {product.category}
        </div>

        {/* الاسم */}
        <h3
          className="font-bold text-sm mb-2 leading-snug line-clamp-2"
          style={{ color: "#f1f0e8", fontFamily: "Cairo, sans-serif" }}
        >
          {product.name}
        </h3>

        {/* التقييم */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-0.5">
            {renderStars(product.rating)}
          </div>
          <span className="text-xs" style={{ color: "#a09880" }}>
            {product.rating} ({product.reviews})
          </span>
        </div>

        {/* السعر */}
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold text-base" style={{ color: "#f0d080" }}>
              {product.price.toLocaleString("ar-SY")}
              <span className="text-xs font-normal mr-1" style={{ color: "#a09880" }}>
                ل.س.ج
              </span>
            </div>
            {product.originalPrice && (
              <div className="text-xs line-through" style={{ color: "#a09880" }}>
                {product.originalPrice.toLocaleString("ar-SY")} ل.س.ج
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="gold-btn w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          >
            <ShoppingCart size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
