import React from "react";
import { X, ShoppingCart, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { notifyProductPurchase } from "../services/telegram";
import toast from "react-hot-toast";

interface CartSidebarProps {
  onAuthRequired: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ onAuthRequired }) => {
  const { items, isOpen, toggleCart, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore();
  const { isAuthenticated, user, deductWalletBalance, addLoyaltyPoints } = useAuthStore();

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }

    const total = getTotalPrice();

    if (user!.walletBalance < total) {
      toast.error(
        `رصيدك غير كافٍ! رصيدك: ${user!.walletBalance.toFixed(0)} ل.س.ج والمطلوب: ${total.toFixed(0)} ل.س.ج`,
        { duration: 4000, style: { fontFamily: "Cairo, sans-serif" } }
      );
      return;
    }

    const success = deductWalletBalance(total);
    if (success) {
      // نقاط الولاء: 1 نقطة لكل 10 ليرات
      const pointsEarned = Math.floor(total / 10);
      addLoyaltyPoints(pointsEarned);

      // إرسال إشعارات لكل منتج
      const timestamp = new Date().toLocaleString("ar-SY", {
        year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
      });

      for (const item of items) {
        notifyProductPurchase({
          userId: user!.id,
          userName: user!.name,
          productName: item.product.name,
          productPrice: item.product.price * item.quantity,
          timestamp,
        }).catch(console.error);
      }

      clearCart();
      toast.success(
        `تم الشراء بنجاح! حصلت على ${pointsEarned} نقطة ولاء 🎉`,
        { duration: 5000, style: { fontFamily: "Cairo, sans-serif" } }
      );
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* خلفية معتمة */}
      <div
        className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
        onClick={toggleCart}
      />

      {/* الشريط الجانبي */}
      <div className={`cart-sidebar open z-50`}>
        {/* رأس السلة */}
        <div
          className="flex items-center justify-between p-5 sticky top-0"
          style={{
            background: "linear-gradient(180deg, #12121e, #12121e)",
            borderBottom: "1px solid rgba(201,168,76,0.2)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #8a6a1e, #c9a84c)" }}
            >
              <ShoppingCart size={18} style={{ color: "#0a0a14" }} />
            </div>
            <div>
              <h2 className="font-bold gold-text font-cairo">سلة التسوق</h2>
              <p className="text-xs" style={{ color: "#a09880" }}>
                {items.length} {items.length === 1 ? "منتج" : "منتجات"}
              </p>
            </div>
          </div>
          <button
            onClick={toggleCart}
            className="p-2 rounded-xl hover:bg-red-900/30 transition-all"
            style={{ color: "#a09880" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* محتوى السلة */}
        <div className="flex flex-col h-[calc(100vh-70px)]">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="text-6xl mb-4">🛒</div>
              <div className="font-bold mb-2 font-cairo" style={{ color: "#f0d080" }}>
                السلة فارغة
              </div>
              <div className="text-sm" style={{ color: "#a09880" }}>
                أضف منتجات لتبدأ التسوق
              </div>
              <button
                onClick={toggleCart}
                className="gold-btn mt-6 px-6 py-2.5 rounded-xl font-bold text-sm"
              >
                تصفح المنتجات
              </button>
            </div>
          ) : (
            <>
              {/* قائمة المنتجات */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-3 p-3 rounded-2xl animate-fade-in"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(201,168,76,0.15)",
                    }}
                  >
                    {/* صورة */}
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200&q=80";
                      }}
                    />

                    {/* المعلومات */}
                    <div className="flex-1 min-w-0">
                      <h4
                        className="text-xs font-bold mb-1 line-clamp-2 leading-snug font-cairo"
                        style={{ color: "#f1f0e8" }}
                      >
                        {item.product.name}
                      </h4>
                      <div className="text-xs mb-2" style={{ color: "#f0d080" }}>
                        {(item.product.price * item.quantity).toLocaleString("ar-SY")} ل.س.ج
                      </div>

                      {/* الكمية */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:bg-yellow-900/30"
                          style={{ border: "1px solid rgba(201,168,76,0.3)", color: "#c9a84c" }}
                        >
                          <Minus size={10} />
                        </button>
                        <span className="text-sm font-bold w-6 text-center" style={{ color: "#f1f0e8" }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:bg-yellow-900/30"
                          style={{ border: "1px solid rgba(201,168,76,0.3)", color: "#c9a84c" }}
                        >
                          <Plus size={10} />
                        </button>

                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="mr-auto w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:bg-red-900/30"
                          style={{ color: "#ef4444" }}
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ملخص الطلب */}
              <div
                className="p-4 border-t"
                style={{ borderColor: "rgba(201,168,76,0.2)", background: "#0a0a14" }}
              >
                {/* الرصيد المتاح */}
                {isAuthenticated && (
                  <div
                    className="flex justify-between items-center mb-3 p-2 rounded-xl"
                    style={{ background: "rgba(201,168,76,0.06)" }}
                  >
                    <span className="text-xs" style={{ color: "#a09880" }}>رصيدك المتاح:</span>
                    <span className="font-bold text-sm" style={{ color: "#22c55e" }}>
                      {user?.walletBalance.toFixed(0)} ل.س.ج
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm" style={{ color: "#a09880" }}>المجموع:</span>
                  <span className="font-bold text-lg" style={{ color: "#f0d080" }}>
                    {getTotalPrice().toLocaleString("ar-SY")} ل.س.ج
                  </span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="gold-btn w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={16} />
                  إتمام الشراء
                </button>

                <button
                  onClick={clearCart}
                  className="w-full py-2 mt-2 rounded-xl text-xs transition-all hover:bg-red-900/20"
                  style={{ color: "#ef4444" }}
                >
                  إفراغ السلة
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar;
