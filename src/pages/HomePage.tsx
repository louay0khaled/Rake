import React from "react";
import { ShoppingBag, Star, Shield, Truck, Headphones, Award, ChevronLeft } from "lucide-react";
import { FEATURED_PRODUCTS, NEW_PRODUCTS } from "../data/products";
import ProductCard from "../components/ProductCard";

interface HomePageProps {
  onNavigate: (page: string) => void;
  onAuthRequired: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate, onAuthRequired }) => {
  return (
    <div className="min-h-screen">
      {/* قسم الهيرو */}
      <section className="hero-bg relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              {/* شارة */}
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-bold"
                style={{
                  background: "rgba(201,168,76,0.1)",
                  border: "1px solid rgba(201,168,76,0.3)",
                  color: "#f0d080",
                }}
              >
                <Star size={14} fill="currentColor" />
                المتجر الإلكتروني الأول في سوريا
              </div>

              {/* العنوان الرئيسي */}
              <h1
                className="text-4xl md:text-6xl font-black mb-6 leading-tight font-scheherazade"
                style={{ color: "#f1f0e8" }}
              >
                سوق{" "}
                <span className="gold-text">الشام</span>
                <br />
                <span className="text-3xl md:text-4xl font-bold" style={{ color: "#a09880" }}>
                  تسوّق بذكاء وأسلوب
                </span>
              </h1>

              <p
                className="text-base md:text-lg mb-8 leading-relaxed font-cairo"
                style={{ color: "#a09880", maxWidth: "480px" }}
              >
                اكتشف أكثر من <strong style={{ color: "#f0d080" }}>500 منتج</strong> متنوع بالليرة
                السورية الجديدة. سجّل واحصل على{" "}
                <strong style={{ color: "#f0d080" }}>20 ليرة هدية</strong> فورية!
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => onNavigate("products")}
                  className="gold-btn px-8 py-3.5 rounded-2xl font-bold text-base flex items-center gap-2"
                >
                  <ShoppingBag size={18} />
                  تصفح المتجر
                </button>
                <button
                  onClick={onAuthRequired}
                  className="px-8 py-3.5 rounded-2xl font-bold text-base flex items-center gap-2 transition-all hover:bg-yellow-900/20"
                  style={{ border: "1px solid rgba(201,168,76,0.4)", color: "#f0d080" }}
                >
                  سجّل مجاناً
                  <ChevronLeft size={18} />
                </button>
              </div>

              {/* إحصاءات */}
              <div className="flex gap-8 mt-10 pt-8 border-t" style={{ borderColor: "rgba(201,168,76,0.15)" }}>
                {[
                  { num: "500+", label: "منتج متاح" },
                  { num: "10K+", label: "عميل سعيد" },
                  { num: "99%", label: "رضا العملاء" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl font-black gold-text font-cairo">{stat.num}</div>
                    <div className="text-xs" style={{ color: "#a09880" }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* الرسوم التوضيحية */}
            <div className="relative hidden md:block">
              {/* بطاقة المحفظة */}
              <div
                className="absolute top-0 right-0 p-5 rounded-3xl w-64 animate-slide-in"
                style={{
                  background: "linear-gradient(135deg, #8a6a1e, #c9a84c, #f0d080)",
                  boxShadow: "0 20px 60px rgba(201,168,76,0.3)",
                  zIndex: 2,
                  animationDelay: "0.2s",
                }}
              >
                <div className="text-xs font-bold mb-2" style={{ color: "#0a0a14", opacity: 0.7 }}>
                  محفظتك الرقمية
                </div>
                <div className="text-3xl font-black font-cairo" style={{ color: "#0a0a14" }}>
                  20 ل.س.ج
                </div>
                <div className="text-xs mt-1" style={{ color: "#0a0a14", opacity: 0.7 }}>
                  هدية الانضمام الفورية 🎁
                </div>
                <div className="mt-4 pt-3 border-t" style={{ borderColor: "rgba(0,0,0,0.15)" }}>
                  <div className="text-xs font-bold" style={{ color: "#0a0a14" }}>
                    ⭐ 100 نقطة ولاء
                  </div>
                </div>
              </div>

              {/* بطاقة منتج */}
              <div
                className="mt-24 mr-8 p-4 rounded-3xl"
                style={{
                  background: "rgba(18,18,30,0.9)",
                  border: "1px solid rgba(201,168,76,0.3)",
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
                  animationDelay: "0.4s",
                }}
              >
                <div
                  className="w-full h-40 rounded-2xl mb-4 overflow-hidden"
                  style={{ background: "rgba(201,168,76,0.05)" }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80"
                    alt="منتج مميز"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="font-bold text-sm font-cairo" style={{ color: "#f1f0e8" }}>
                  سماعات Sony WH-1000XM5
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="font-black text-lg gold-text font-cairo">850 ل.س.ج</div>
                  <button className="gold-btn px-3 py-1.5 rounded-xl text-xs font-bold">
                    أضف للسلة
                  </button>
                </div>
              </div>

              {/* نقاط الزينة */}
              <div
                className="absolute bottom-10 right-4 w-16 h-16 rounded-full opacity-20"
                style={{ background: "linear-gradient(135deg, #c9a84c, #f0d080)" }}
              />
              <div
                className="absolute top-40 left-0 w-8 h-8 rounded-full opacity-15"
                style={{ background: "#c9a84c" }}
              />
            </div>
          </div>
        </div>

        {/* الموجة السفلية */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16"
          style={{
            background: "linear-gradient(to bottom, transparent, #0a0a14)",
          }}
        />
      </section>

      {/* مميزات المتجر */}
      <section className="py-12 pattern-bg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Truck size={24} />, title: "توصيل سريع", desc: "لجميع أنحاء سوريا" },
              { icon: <Shield size={24} />, title: "دفع آمن", desc: "محمي بتشفير عالي" },
              { icon: <Headphones size={24} />, title: "دعم فوري", desc: "24/7 عبر تيليجرام" },
              { icon: <Award size={24} />, title: "منتجات أصيلة", desc: "مضمونة الجودة" },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl text-center transition-all hover:scale-105"
                style={{
                  background: "rgba(201,168,76,0.04)",
                  border: "1px solid rgba(201,168,76,0.12)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: "linear-gradient(135deg, rgba(138,106,30,0.3), rgba(201,168,76,0.3))", color: "#c9a84c" }}
                >
                  {feature.icon}
                </div>
                <div className="font-bold text-sm mb-1 font-cairo" style={{ color: "#f1f0e8" }}>
                  {feature.title}
                </div>
                <div className="text-xs" style={{ color: "#a09880" }}>
                  {feature.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* المنتجات المميزة */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="ornamental-divider mb-4">
              <span className="text-2xl font-black font-scheherazade gold-text">المنتجات المميزة</span>
            </div>
            <p className="text-sm" style={{ color: "#a09880" }}>
              اختيارات مميزة من أفضل منتجاتنا
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {FEATURED_PRODUCTS.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} onAuthRequired={onAuthRequired} />
            ))}
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => onNavigate("products")}
              className="gold-btn px-8 py-3 rounded-2xl font-bold text-sm inline-flex items-center gap-2"
            >
              عرض جميع المنتجات
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* نظام المكافآت */}
      <section
        className="py-16"
        style={{
          background: "linear-gradient(135deg, rgba(138,106,30,0.08) 0%, rgba(201,168,76,0.04) 50%, rgba(138,106,30,0.08) 100%)",
          borderTop: "1px solid rgba(201,168,76,0.1)",
          borderBottom: "1px solid rgba(201,168,76,0.1)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="ornamental-divider mb-4">
              <span className="text-2xl font-black font-scheherazade gold-text">نظام المكافآت الحصري</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "🎁",
                title: "20 ليرة هدية فورية",
                desc: "احصل على 20 ليرة سورية جديدة تُضاف تلقائياً لمحفظتك فور التسجيل",
                color: "#22c55e",
              },
              {
                icon: "💰",
                title: "ضعف مبلغ الشحن",
                desc: "عند شحن محفظتك، يقوم المشرفون بمضاعفة المبلغ تقديراً لثقتك بنا",
                color: "#c9a84c",
              },
              {
                icon: "💸",
                title: "سحب الأرباح",
                desc: "عند بلوغ رصيدك 500 ليرة، يمكنك سحب أرباحك فوراً عبر شام كاش",
                color: "#6366f1",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 rounded-3xl text-center transition-all hover:-translate-y-1"
                style={{ background: "rgba(18,18,30,0.8)", border: `1px solid rgba(${item.color === "#22c55e" ? "34,197,94" : item.color === "#c9a84c" ? "201,168,76" : "99,102,241"},0.25)` }}
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-lg mb-3 font-cairo" style={{ color: item.color }}>
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#a09880" }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* منتجات جديدة */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="ornamental-divider mb-4">
              <span className="text-2xl font-black font-scheherazade gold-text">وصل حديثاً</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {NEW_PRODUCTS.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} onAuthRequired={onAuthRequired} />
            ))}
          </div>
        </div>
      </section>

      {/* الدعوة للتسجيل */}
      <section className="py-16 pattern-bg">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="text-5xl mb-6">🛒</div>
          <h2 className="text-3xl font-black mb-4 font-scheherazade" style={{ color: "#f1f0e8" }}>
            ابدأ التسوق الآن
          </h2>
          <p className="text-sm mb-8" style={{ color: "#a09880" }}>
            انضم لآلاف المتسوقين السوريين واستمتع بتجربة تسوق فاخرة مع نظام مكافآت حصري
          </p>
          <button
            onClick={onAuthRequired}
            className="gold-btn px-10 py-4 rounded-2xl font-bold text-base pulse-gold"
          >
            سجّل مجاناً واحصل على هديتك 🎁
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
