import React, { useState } from "react";
import { X, Eye, EyeOff, User, Mail, Lock, Phone, Star } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

interface AuthModalProps {
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const { login, register, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      const res = await login(form.email, form.password);
      if (res.success) {
        toast.success(res.message, { duration: 4000 });
        onClose();
      } else {
        toast.error(res.message);
      }
    } else {
      const res = await register(form.name, form.email, form.password, form.phone);
      if (res.success) {
        toast.success(res.message, { duration: 5000 });
        onClose();
      } else {
        toast.error(res.message);
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content animate-fade-in">
        {/* رأس النافذة */}
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: "rgba(201,168,76,0.2)" }}
        >
          <div>
            <h2 className="text-xl font-bold gold-text font-cairo">
              {mode === "login" ? "تسجيل الدخول" : "إنشاء حساب جديد"}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#a09880" }}>
              {mode === "login"
                ? "مرحباً بعودتك في سوق الشام"
                : "انضم إلينا واحصل على 20 ليرة سورية هدية!"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-all hover:bg-red-900/30"
            style={{ color: "#a09880" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* محتوى */}
        <div className="p-6">
          {/* مكافأة التسجيل */}
          {mode === "register" && (
            <div
              className="mb-5 p-4 rounded-2xl flex items-start gap-3"
              style={{
                background: "linear-gradient(135deg, rgba(201,168,76,0.1), rgba(240,208,128,0.05))",
                border: "1px solid rgba(201,168,76,0.3)",
              }}
            >
              <Star size={20} style={{ color: "#f0d080", flexShrink: 0 }} fill="currentColor" />
              <div>
                <div className="font-bold text-sm mb-1" style={{ color: "#f0d080" }}>
                  🎁 هدية الانضمام!
                </div>
                <div className="text-xs" style={{ color: "#a09880" }}>
                  احصل على <strong className="gold-text">20 ليرة سورية جديدة</strong> تُضاف تلقائياً
                  لمحفظتك فور إنشاء الحساب، إضافةً إلى 100 نقطة ولاء!
                </div>
              </div>
            </div>
          )}

          {/* تبديل الوضع */}
          <div
            className="flex rounded-xl overflow-hidden mb-6"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,168,76,0.2)" }}
          >
            {[
              { id: "login", label: "تسجيل الدخول" },
              { id: "register", label: "حساب جديد" },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id as "login" | "register")}
                className={`flex-1 py-2.5 text-sm font-bold transition-all ${
                  mode === m.id ? "gold-btn" : ""
                }`}
                style={mode !== m.id ? { color: "#a09880" } : {}}
              >
                {m.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* الاسم */}
            {mode === "register" && (
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "#a09880" }}>
                  الاسم الكامل
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="محمد أحمد"
                    className="input-field pr-10"
                    required
                  />
                  <User size={15} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#c9a84c" }} />
                </div>
              </div>
            )}

            {/* البريد الإلكتروني */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#a09880" }}>
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="example@email.com"
                  className="input-field pr-10"
                  required
                  dir="ltr"
                />
                <Mail size={15} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#c9a84c" }} />
              </div>
            </div>

            {/* الهاتف */}
            {mode === "register" && (
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "#a09880" }}>
                  رقم الهاتف (اختياري)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="09xxxxxxxx"
                    className="input-field pr-10"
                    dir="ltr"
                  />
                  <Phone size={15} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#c9a84c" }} />
                </div>
              </div>
            )}

            {/* كلمة المرور */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#a09880" }}>
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="6 أحرف على الأقل"
                  className="input-field pr-10 pl-10"
                  required
                />
                <Lock size={15} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#c9a84c" }} />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#a09880" }}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* زر الإرسال */}
            <button
              type="submit"
              disabled={isLoading}
              className="gold-btn w-full py-3 rounded-xl font-bold text-sm mt-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  جارٍ المعالجة...
                </>
              ) : mode === "login" ? (
                "تسجيل الدخول"
              ) : (
                "إنشاء الحساب والحصول على 20 ل.س.ج 🎁"
              )}
            </button>
          </form>

          {/* الشروط */}
          {mode === "register" && (
            <p className="text-xs text-center mt-4" style={{ color: "#a09880" }}>
              بإنشاء حساب، أنت توافق على{" "}
              <span className="gold-text cursor-pointer">شروط الاستخدام</span> و
              <span className="gold-text cursor-pointer"> سياسة الخصوصية</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
