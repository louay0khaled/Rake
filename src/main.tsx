import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { initAdminBot } from "./services/telegramAdmin";

// تهيئة بوت الإدارة عند بدء التطبيق
if (typeof window !== "undefined") {
  // تأكد من أن الكود يعمل فقط في المتصفح
  const initBot = async () => {
    try {
      console.log("🚀 Initializing Telegram Admin Bot on startup...");
      await initAdminBot();
      console.log("✅ Telegram Admin Bot initialized successfully!");
    } catch (error) {
      console.error("❌ Failed to initialize Telegram Admin Bot:", error);
    }
  };

  // تشغيل البوت بعد تحميل الصفحة
  setTimeout(initBot, 1000);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
