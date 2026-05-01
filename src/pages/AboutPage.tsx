import React from "react";
import { Shield, Award, Users, MessageCircle } from "lucide-react";

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen pattern-bg py-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black font-scheherazade gold-text mb-4">من نحن</h1>
          <p className="text-base leading-relaxed font-cairo" style={{ color: "#a09880", maxWidth: "600px", margin: "0 auto" }}>
            سوق الشام هو المتجر الإلكتروني الأول في سوريا الذي يدعم الليرة السورية الجديدة
            مع نظام مكافآت حصري للعملاء
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {[
            { icon: <Shield size={24} />, title: "الأمان أولاً", desc: "جميع المعاملات محمية بتشفير عالي المستوى وبيانات المستخدمين في أمان تام", color: "#22c55e" },
            { icon: <Award size={24} />, title: "جودة مضمونة", desc: "جميع المنتجات أصيلة ومضمونة الجودة من موردين معتمدين", color: "#c9a84c" },
            { icon: <Users size={24} />, title: "مجتمع سوري", desc: "نفخر بخدمة آلاف العملاء السوريين وندعم الاقتصاد الوطني", color: "#6366f1" },
            { icon: <MessageCircle size={24} />, title: "دعم متواصل", desc: "فريق الدعم متاح 24/7 عبر تيليجرام للإجابة على جميع استفساراتكم", color: "#ec4899" },
          ].map((item, i) => (
            <div
              key={i}
              className="p-6 rounded-3xl"
              style={{ background: "rgba(18,18,30,0.9)", border: `1px solid rgba(${item.color === "#22c55e" ? "34,197,94" : item.color === "#c9a84c" ? "201,168,76" : item.color === "#6366f1" ? "99,102,241" : "236,72,153"},0.2)` }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: `${item.color}20`, color: item.color }}
              >
                {item.icon}
              </div>
              <h3 className="font-bold text-lg mb-2 font-cairo" style={{ color: "#f1f0e8" }}>{item.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#a09880" }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* التواصل */}
        <div
          className="p-8 rounded-3xl text-center"
          style={{ background: "linear-gradient(135deg, rgba(138,106,30,0.1), rgba(201,168,76,0.05))", border: "1px solid rgba(201,168,76,0.3)" }}
        >
          <div className="text-4xl mb-4">📱</div>
          <h2 className="text-2xl font-black font-scheherazade gold-text mb-3">تواصل معنا</h2>
          <p className="text-sm mb-6" style={{ color: "#a09880" }}>
            للتواصل مع فريق الدعم، استخدم المحادثة الفورية عبر تيليجرام
          </p>
          <a
            href="https://t.me/"
            target="_blank"
            rel="noreferrer"
            className="gold-btn px-8 py-3 rounded-2xl font-bold text-sm inline-flex items-center gap-2"
          >
            <MessageCircle size={16} />
            تواصل عبر تيليجرام
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
