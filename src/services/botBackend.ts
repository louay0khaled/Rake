// ======================================================
// Backend Service for Telegram Bot - خادم وسيط للبوت
// يحل مشكلة Vercel Serverless ويوفر تخزين دائم
// ======================================================

const BOT_TOKEN = "8324781459:AAHJ5RWpHSGgmX2P3k3AUgB4juQW7P_Bsyc";
const ADMIN_IDS = ["7254003723", "6288453737"];
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// مفاتيح التخزين في localStorage
const STORAGE_KEYS = {
  SHAM_CASH_NUMBER: 'shamCashNumber_v1',
  PENDING_REQUESTS: 'pendingRequests_v1',
  CONVERSATIONS: 'conversations_v1',
  PRODUCTS: 'products_v1',
  WELCOME_SENT: 'welcomeSent_v1',
};

// أنواع البيانات
export interface PendingRequest {
  id: string;
  type: "charge" | "withdraw" | "product_add" | "product_edit";
  data: any;
  status: "pending" | "approved" | "rejected";
  timestamp: string;
  userId: string;
  userName: string;
}

export interface Conversation {
  userId: string;
  userName: string;
  messages: Message[];
  lastActivity: number;
  isBlocked: boolean;
}

export interface Message {
  id: string;
  text: string;
  from: "user" | "admin";
  adminId?: string;
  timestamp: string;
}

export interface StoredProduct {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  price: number;
  image?: string;
  description?: string;
  stock: number;
  isActive: boolean;
  addedBy: string;
  addedAt: string;
}

// دوال التخزين المحلية المحسّنة
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Storage save error:', error);
  }
}

// إدارة رقم شام كاش
export function getShamCashNumber(): string {
  return getFromStorage<string>(STORAGE_KEYS.SHAM_CASH_NUMBER, "0991234567");
}

export function setShamCashNumber(number: string): void {
  saveToStorage(STORAGE_KEYS.SHAM_CASH_NUMBER, number);
  // إشعار جميع أجزاء التطبيق بالتغيير
  window.dispatchEvent(new CustomEvent('shamCashChanged', { detail: { number } }));
}

// إدارة طلبات الشحن والسحب
export function getPendingRequests(): Map<string, PendingRequest> {
  const requestsArray = getFromStorage<PendingRequest[]>(STORAGE_KEYS.PENDING_REQUESTS, []);
  return new Map(requestsArray.map(r => [r.id, r]));
}

export function savePendingRequest(request: PendingRequest): void {
  const requests = getPendingRequests();
  requests.set(request.id, request);
  saveToStorage(STORAGE_KEYS.PENDING_REQUESTS, Array.from(requests.values()));
  
  // إشعار المشرفين عبر تيليجرام
  notifyAdminsOfNewRequest(request);
}

export function updateRequestStatus(requestId: string, status: "approved" | "rejected"): void {
  const requests = getPendingRequests();
  const request = requests.get(requestId);
  if (request) {
    request.status = status;
    saveToStorage(STORAGE_KEYS.PENDING_REQUESTS, Array.from(requests.values()));
  }
}

export function deleteRequest(requestId: string): void {
  const requests = getPendingRequests();
  requests.delete(requestId);
  saveToStorage(STORAGE_KEYS.PENDING_REQUESTS, Array.from(requests.values()));
}

// إدارة المحادثات
export function getConversations(): Map<string, Conversation> {
  const convsArray = getFromStorage<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
  return new Map(convsArray.map(c => [c.userId, c]));
}

export function saveConversation(conv: Conversation): void {
  const conversations = getConversations();
  conversations.set(conv.userId, conv);
  saveToStorage(STORAGE_KEYS.CONVERSATIONS, Array.from(conversations.values()));
}

export function addMessageToConversation(userId: string, message: Message): void {
  const conversations = getConversations();
  let conv = conversations.get(userId);
  
  if (!conv) {
    conv = {
      userId,
      userName: `مستخدم ${userId}`,
      messages: [],
      lastActivity: Date.now(),
      isBlocked: false,
    };
  }
  
  conv.messages.push(message);
  conv.lastActivity = Date.now();
  conversations.set(userId, conv);
  saveToStorage(STORAGE_KEYS.CONVERSATIONS, Array.from(conversations.values()));
}

// إدارة المنتجات
export function getStoredProducts(): Map<string, StoredProduct> {
  const productsArray = getFromStorage<StoredProduct[]>(STORAGE_KEYS.PRODUCTS, []);
  return new Map(productsArray.map(p => [p.id, p]));
}

export function saveStoredProduct(product: StoredProduct): void {
  const products = getStoredProducts();
  products.set(product.id, product);
  saveToStorage(STORAGE_KEYS.PRODUCTS, Array.from(products.values()));
}

export function deleteStoredProduct(productId: string): void {
  const products = getStoredProducts();
  products.delete(productId);
  saveToStorage(STORAGE_KEYS.PRODUCTS, Array.from(products.values()));
}

// تتبع إرسال الترحيب
export function hasWelcomeBeenSent(): boolean {
  return getFromStorage<boolean>(STORAGE_KEYS.WELCOME_SENT, false);
}

export function markWelcomeAsSent(): void {
  saveToStorage(STORAGE_KEYS.WELCOME_SENT, true);
}

// ======================================================
// دوال الاتصال بتيليجرام
// ======================================================

async function telegramRequest(method: string, params: any): Promise<any> {
  try {
    const response = await fetch(`${TELEGRAM_API}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    return await response.json();
  } catch (error) {
    console.error("Telegram API Error:", error);
    return null;
  }
}

export async function sendTelegramMessage(chatId: string, text: string, replyMarkup?: any): Promise<boolean> {
  const params: any = {
    chat_id: chatId,
    text: text,
    parse_mode: "HTML",
  };
  if (replyMarkup) {
    params.reply_markup = JSON.stringify(replyMarkup);
  }
  const result = await telegramRequest("sendMessage", params);
  return result?.ok === true;
}

export async function sendInlineKeyboard(chatId: string, text: string, keyboard: any[][]): Promise<boolean> {
  return sendTelegramMessage(chatId, text, { inline_keyboard: keyboard });
}

// إشعار المشرفين بطلب جديد
async function notifyAdminsOfNewRequest(request: PendingRequest): Promise<void> {
  let message = "";
  
  if (request.type === "charge") {
    message = `
💳 <b>طلب شحن محفظة جديد</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>المستخدم:</b> ${request.userName}
🆔 <b>معرّف المستخدم:</b> ${request.userId}
💰 <b>المبلغ المطلوب:</b> ${request.data.amount.toLocaleString("ar-SY")} ل.س.ج
🔢 <b>رقم التحويل:</b> <code>${request.data.transactionId}</code>
🕐 <b>التوقيت:</b> ${request.timestamp}
━━━━━━━━━━━━━━━━━━━━
⚡ <b>يرجى التحقق وتأكيد الشحن</b>
🎁 <i>تذكير: يمكنك مضاعفة المبلغ كمكافأة</i>
`;
  } else if (request.type === "withdraw") {
    const shamCash = getShamCashNumber();
    message = `
💸 <b>طلب سحب أرباح</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>المستخدم:</b> ${request.userName}
🆔 <b>معرّف المستخدم:</b> ${request.userId}
💰 <b>مبلغ السحب:</b> ${request.data.amount.toLocaleString("ar-SY")} ل.س.ج
🏦 <b>الرصيد الحالي:</b> ${request.data.walletBalance.toLocaleString("ar-SY")} ل.س.ج
📲 <b>رقم شام كاش:</b> <code>${request.data.shamCashNumber}</code>
📞 <b>رقم شام كاش الرسمي:</b> <code>${shamCash}</code>
🕐 <b>التوقيت:</b> ${request.timestamp}
━━━━━━━━━━━━━━━━━━━━
⚠️ <b>يرجى مراجعة الطلب والرد فوراً</b>
`;
  }
  
  if (message) {
    const keyboard: any[][] = [
      [{ text: "✅ موافقة", callback_data: `req_approve_${request.id}` }],
      [{ text: "❌ رفض", callback_data: `req_reject_${request.id}` }],
      [{ text: "💬 مراسلة", callback_data: `chat_user_${request.userId}` }],
    ];
    
    for (const adminId of ADMIN_IDS) {
      await sendInlineKeyboard(adminId, message, keyboard);
    }
  }
}

// ======================================================
// تهيئة النظام
// ======================================================

export function initBotBackend(): void {
  console.log("🔧 Initializing Bot Backend...");
  
  // تحميل البيانات من التخزين المحلي
  const shamCash = getShamCashNumber();
  const requests = getPendingRequests();
  const conversations = getConversations();
  const products = getStoredProducts();
  
  console.log(`✅ Loaded ${requests.size} pending requests`);
  console.log(`✅ Loaded ${conversations.size} conversations`);
  console.log(`✅ Loaded ${products.size} products`);
  console.log(`✅ Sham Cash Number: ${shamCash}`);
  
  // الاستماع للتغييرات من نوافذ أخرى
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEYS.SHAM_CASH_NUMBER) {
      console.log('🔄 Sham Cash Number updated from another tab');
      window.dispatchEvent(new CustomEvent('shamCashChanged', { 
        detail: { number: event.newValue ? JSON.parse(event.newValue) : "0991234567" } 
      }));
    }
  });
}

// تصدير جميع الدوال للاستخدام
export {
  STORAGE_KEYS,
  ADMIN_IDS,
  BOT_TOKEN,
  TELEGRAM_API,
};
