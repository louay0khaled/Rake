// ======================================================
// Telegram Bot Integration Service
// خدمة ربط بوت التيليجرام
// ======================================================

const BOT_TOKEN = "8324781459:AAHJ5RWpHSGgmX2P3k3AUgB4juQW7P_Bsyc";
const ADMIN_IDS = ["7254003723", "6288453737"];
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

export interface TelegramMessage {
  chat_id: string;
  text: string;
  parse_mode?: "HTML" | "Markdown" | "MarkdownV2";
}

// إرسال رسالة لمشرف واحد
async function sendMessage(chatId: string, text: string): Promise<boolean> {
  try {
    const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "HTML",
      }),
    });

    const data = await response.json();
    return data.ok === true;
  } catch (error) {
    console.error("Telegram sendMessage error:", error);
    return false;
  }
}

// إرسال رسالة لجميع المشرفين
async function notifyAllAdmins(text: string): Promise<void> {
  const promises = ADMIN_IDS.map((id) => sendMessage(id, text));
  await Promise.allSettled(promises);
}

// ======================================================
// إشعار تسجيل مستخدم جديد
// ======================================================
export async function notifyNewRegistration(userData: {
  name: string;
  email: string;
  phone?: string;
  userId: string;
  timestamp: string;
}): Promise<void> {
  const message = `
🆕 <b>تسجيل مستخدم جديد</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>الاسم:</b> ${userData.name}
📧 <b>البريد:</b> ${userData.email}
📱 <b>الهاتف:</b> ${userData.phone || "غير محدد"}
🆔 <b>المعرّف:</b> ${userData.userId}
🕐 <b>التوقيت:</b> ${userData.timestamp}
💰 <b>الرصيد المبدئي:</b> 20 ليرة سورية جديدة
━━━━━━━━━━━━━━━━━━━━
🛒 <i>سوق الشام الإلكتروني</i>`;

  await notifyAllAdmins(message);
}

// ======================================================
// إشعار تسجيل الدخول
// ======================================================
export async function notifyUserLogin(userData: {
  name: string;
  email: string;
  userId: string;
  timestamp: string;
}): Promise<void> {
  const message = `
🔐 <b>تسجيل دخول</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>الاسم:</b> ${userData.name}
📧 <b>البريد:</b> ${userData.email}
🆔 <b>المعرّف:</b> ${userData.userId}
🕐 <b>التوقيت:</b> ${userData.timestamp}
━━━━━━━━━━━━━━━━━━━━
🛒 <i>سوق الشام الإلكتروني</i>`;

  await notifyAllAdmins(message);
}

// ======================================================
// إشعار طلب شحن المحفظة
// ======================================================
export async function notifyWalletChargeRequest(data: {
  userId: string;
  userName: string;
  amount: number;
  transactionId: string;
  timestamp: string;
}): Promise<void> {
  const message = `
💳 <b>طلب شحن محفظة جديد</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>المستخدم:</b> ${data.userName}
🆔 <b>معرّف المستخدم:</b> ${data.userId}
💰 <b>المبلغ المطلوب شحنه:</b> ${data.amount.toLocaleString("ar-SY")} ل.س.ج
🔢 <b>رقم التحويل:</b> <code>${data.transactionId}</code>
🕐 <b>التوقيت:</b> ${data.timestamp}
━━━━━━━━━━━━━━━━━━━━
⚡ <b>يرجى التحقق وتأكيد الشحن</b>
🎁 <i>تذكير: يمكنك مضاعفة المبلغ كمكافأة</i>
━━━━━━━━━━━━━━━━━━━━
🛒 <i>سوق الشام الإلكتروني</i>`;

  await notifyAllAdmins(message);
}

// ======================================================
// إشعار طلب سحب الأرباح
// ======================================================
export async function notifyWithdrawalRequest(data: {
  userId: string;
  userName: string;
  amount: number;
  walletBalance: number;
  shamCashNumber: string;
  timestamp: string;
}): Promise<void> {
  const message = `
💸 <b>طلب سحب أرباح</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>المستخدم:</b> ${data.userName}
🆔 <b>معرّف المستخدم:</b> ${data.userId}
💰 <b>مبلغ السحب:</b> ${data.amount.toLocaleString("ar-SY")} ل.س.ج
🏦 <b>الرصيد الحالي:</b> ${data.walletBalance.toLocaleString("ar-SY")} ل.س.ج
📲 <b>رقم شام كاش:</b> <code>${data.shamCashNumber}</code>
🕐 <b>التوقيت:</b> ${data.timestamp}
━━━━━━━━━━━━━━━━━━━━
⚠️ <b>يرجى مراجعة الطلب والرد فوراً</b>
━━━━━━━━━━━━━━━━━━━━
🛒 <i>سوق الشام الإلكتروني</i>`;

  await notifyAllAdmins(message);
}

// ======================================================
// إشعار طلب شراء منتج
// ======================================================
export async function notifyProductPurchase(data: {
  userId: string;
  userName: string;
  productName: string;
  productPrice: number;
  timestamp: string;
}): Promise<void> {
  const message = `
🛍️ <b>عملية شراء جديدة</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>المشتري:</b> ${data.userName}
🆔 <b>المعرّف:</b> ${data.userId}
📦 <b>المنتج:</b> ${data.productName}
💵 <b>السعر:</b> ${data.productPrice.toLocaleString("ar-SY")} ل.س.ج
🕐 <b>التوقيت:</b> ${data.timestamp}
━━━━━━━━━━━━━━━━━━━━
🛒 <i>سوق الشام الإلكتروني</i>`;

  await notifyAllAdmins(message);
}

export { notifyAllAdmins, sendMessage };
