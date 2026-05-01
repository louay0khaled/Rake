import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

// تهيئة بوت الإدارة عند بدء التطبيق (مرة واحدة فقط)
if (typeof window !== "undefined") {
  // تأكد من أن الكود يعمل فقط في المتصفح
  const initBot = async () => {
    try {
      console.log("🚀 Initializing Telegram Admin Bot on startup...");
      const { initAdminBot } = await import("./services/telegramAdmin");
      await initAdminBot();
      console.log("✅ Telegram Admin Bot initialized successfully!");
    } catch (error) {
      console.error("❌ Failed to initialize Telegram Admin Bot:", error);
    }
  };

  // تشغيل البوت بعد تحميل الصفحة (مرة واحدة فقط)
  setTimeout(initBot, 1000);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
