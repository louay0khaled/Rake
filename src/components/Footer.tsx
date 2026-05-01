import React from "react";
import { MessageCircle, Shield, Award } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer
      style={{
        background: "#06060f",
        borderTop: "1px solid rgba(201,168,76,0.15)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* الشعار */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold"
                style={{ background: "linear-gradient(135deg, #8a6a1e, #c9a84c)", color: "#0a0a14" }}
              >
                س
              </div>
              <div>
                <div className="gold-text text-xl font-black font-scheherazade">سوق الشام</div>
                <div className="text-xs" style={{ color: "#a09880" }}>المتجر الإلكتروني السوري</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed font-cairo mb-4" style={{ color: "#a09880", maxWidth: "320px" }}>
              أول منصة تسوق إلكترونية سورية تدعم الليرة السورية الجديدة مع نظام مكافآت حصري ومدمج.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs" style={{ color: "#a09880" }}>
                <Shield size={13} style={{ color: "#22c55e" }} />
                دفع آمن ومشفّر
              </div>
              <div className="flex items-center gap-2 text-xs" style={{ color: "#a09880" }}>
                <Award size={13} style={{ color: "#c9a84c" }} />
                جودة مضمونة
              </div>
            </div>
          </div>

          {/* روابط سريعة */}
          <div>
            <h3 className="font-bold mb-4 text-sm font-cairo" style={{ color: "#f0d080" }}>روابط سريعة</h3>
            <ul className="space-y-2">
              {["الرئيسية", "المتجر", "العروض", "من نحن", "سياسة الخصوصية"].map((link) => (
                <li key={link}>
                  <span
                    className="text-sm cursor-pointer hover:text-yellow-400 transition-colors"
                    style={{ color: "#a09880" }}
                  >
                    {link}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* التواصل */}
          <div>
            <h3 className="font-bold mb-4 text-sm font-cairo" style={{ color: "#f0d080" }}>التواصل</h3>
            <div className="space-y-3">
              <a
                href="https://t.me/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm transition-all hover:text-yellow-400"
                style={{ color: "#a09880" }}
              >
                <MessageCircle size={15} style={{ color: "#c9a84c" }} />
                تيليجرام - دعم فوري
              </a>
              <div className="text-sm" style={{ color: "#a09880" }}>
                <div className="mb-1">💳 شحن عبر: شام كاش</div>
                <div>⏰ خدمة العملاء: 24/7</div>
              </div>
            </div>

            {/* شعار شام كاش */}
            <div
              className="mt-4 p-3 rounded-xl"
              style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)" }}
            >
              <div className="text-xs font-bold mb-1" style={{ color: "#f0d080" }}>
                💳 شام كاش
              </div>
              <div className="text-xs" style={{ color: "#a09880" }}>
                وسيلة الدفع المعتمدة
              </div>
            </div>
          </div>
        </div>

        {/* الخط الفاصل */}
        <div
          className="border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderColor: "rgba(201,168,76,0.1)" }}
        >
          <div className="text-xs" style={{ color: "#a09880" }}>
            © {new Date().getFullYear()} سوق الشام. جميع الحقوق محفوظة.
          </div>
          <div className="text-xs" style={{ color: "#a09880" }}>
            صُنع بـ ❤️ لخدمة السوق السوري
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
