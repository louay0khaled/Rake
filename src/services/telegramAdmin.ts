import AdminDB from './AdminDB';

// ======================================================
// Telegram Admin Bot Service - خدمة بوت إدارة المشرفين
// نظام إشراف كامل لإدارة المتجر عبر تيليجرام
// ======================================================

const BOT_TOKEN = "8324781459:AAHJ5RWpHSGgmX2P3k3AUgB4juQW7P_Bsyc";
const ADMIN_IDS = ["7254003723", "6288453737"];
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// تخزين مؤقت للمحادثات والطلبات
interface Conversation {
  userId: string;
  userName: string;
  messages: Message[];
  lastActivity: number;
  isBlocked: boolean;
}

interface Message {
  id: string;
  text: string;
  from: "user" | "admin";
  adminId?: string;
  timestamp: string;
}

interface PendingRequest {
  id: string;
  type: "charge" | "withdraw" | "product_add" | "product_edit";
  data: any;
  status: "pending" | "approved" | "rejected";
  timestamp: string;
}

// قاعدة بيانات محلية للمنتجات المخزنة في localStorage
interface StoredProduct {
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

// حالة النظام
let conversations: Map<string, Conversation> = new Map();
let pendingRequests: Map<string, PendingRequest> = new Map();
let storedProducts: Map<string, StoredProduct> = new Map();
let shamCashNumber: string = "0991234567";
let systemSettings: Map<string, string> = new Map();

// تتبع حالات المشرفين النشطة
interface AdminState {
  currentAction: string | null;
  targetUserId?: string; // للمحادثات
  waitingForInput?: boolean;
  inputStep?: number; // لخطوات إدخال البيانات
  inputData?: any; // لتخزين البيانات المؤقتة
}

let adminStates: Map<string, AdminState> = new Map();

// علم لمنع رسائل الترحيب المتكررة
let welcomeSent = false;

// ======================================================
// دوال مساعدة للاتصال بتيليجرام API
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

async function sendMessage(chatId: string, text: string, replyMarkup?: any): Promise<boolean> {
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

async function sendInlineKeyboard(chatId: string, text: string, keyboard: any[][]): Promise<boolean> {
  return sendMessage(chatId, text, { inline_keyboard: keyboard });
}

async function editMessage(chatId: string, messageId: number, text: string, keyboard?: any[][]): Promise<boolean> {
  const params: any = {
    chat_id: chatId,
    message_id: messageId,
    text: text,
    parse_mode: "HTML",
  };
  if (keyboard) {
    params.reply_markup = JSON.stringify({ inline_keyboard: keyboard });
  }
  const result = await telegramRequest("editMessageText", params);
  return result?.ok === true;
}

async function answerCallbackQuery(callbackQueryId: string, message?: string): Promise<void> {
  await telegramRequest("answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    text: message,
    show_alert: !!message,
  });
}

// ======================================================
// لوحة التحكم الرئيسية للمشرفين
// ======================================================

async function showAdminMenu(chatId: string): Promise<void> {
  const menuText = `
🎛️ <b>لوحة تحكم المشرفين - سوق الشام</b>
━━━━━━━━━━━━━━━━━━━━
👋 أهلاً بك في نظام الإدارة المتقدم

<b>اختر القسم المطلوب:</b>
`;

  const keyboard: any[][] = [
    [{ text: "📦 إدارة المنتجات", callback_data: "admin_products" }],
    [{ text: "💳 طلبات الشحن", callback_data: "admin_charges" }],
    [{ text: "💸 طلبات السحب", callback_data: "admin_withdrawals" }],
    [{ text: "💬 محادثات المستخدمين", callback_data: "admin_conversations" }],
    [{ text: "⚙️ إعدادات النظام", callback_data: "admin_settings" }],
    [{ text: "📊 إحصائيات النظام", callback_data: "admin_stats" }],
  ];

  await sendInlineKeyboard(chatId, menuText, keyboard);
}

// ======================================================
// إدارة المنتجات
// ======================================================

async function showProductsMenu(chatId: string): Promise<void> {
  const productsCount = storedProducts.size;
  const activeProducts = Array.from(storedProducts.values()).filter(p => p.isActive).length;

  const text = `
📦 <b>إدارة المنتجات</b>
━━━━━━━━━━━━━━━━━━━━
📊 <b>إحصائيات المنتجات:</b>
• إجمالي المنتجات: ${productsCount}
• منتجات نشطة: ${activeProducts}
• منتجات غير نشطة: ${productsCount - activeProducts}

<b>اختر العملية المطلوبة:</b>
`;

  const keyboard: any[][] = [
    [{ text: "➕ إضافة منتج جديد", callback_data: "prod_add_new" }],
    [{ text: "📝 تعديل منتج", callback_data: "prod_edit" }],
    [{ text: "🗑️ حذف منتج", callback_data: "prod_delete" }],
    [{ text: "📋 عرض جميع المنتجات", callback_data: "prod_list" }],
    [{ text: "🔙 رجوع", callback_data: "admin_menu" }],
  ];

  await sendInlineKeyboard(chatId, text, keyboard);
}

async function startAddProduct(chatId: string): Promise<void> {
  const text = `
➕ <b>إضافة منتج جديد</b>
━━━━━━━━━━━━━━━━━━━━
يرجى إرسال بيانات المنتج بالترتيب التالي:

<b>1️⃣ اسم المنتج بالعربية</b>
<b>2️⃣ اسم المنتج بالإنجليزية</b>
<b>3️⃣ الفئة</b> (الإلكترونيات، الهواتف، الأزياء، إلخ...)
<b>4️⃣ السعر</b> (بالليرة السورية)
<b>5️⃣ الوصف</b>
<b>6️⃣ رابط الصورة</b> (اختياري)
<b>7️⃣ الكمية المتوفرة</b>

<b>مثال:</b>
اسم المنتج: لابتوب Dell Inspiron
الاسم الإنجليزي: Dell Inspiron 15
الفئة: الإلكترونيات
السعر: 2800
الوصف: معالج Intel Core i7، ذاكرة 16GB
الصورة: https://example.com/image.jpg
الكمية: 15

<b>أرسل "إلغاء" للعودة للقائمة الرئيسية</b>
`;

  const keyboard: any[][] = [[{ text: "❌ إلغاء", callback_data: "admin_products" }]];
  await sendInlineKeyboard(chatId, text, keyboard);
}

// ======================================================
// إدارة طلبات الشحن
// ======================================================

async function showChargesList(chatId: string): Promise<void> {
  const charges = Array.from(pendingRequests.values()).filter(r => r.type === "charge" && r.status === "pending");
  
  if (charges.length === 0) {
    const text = `
💳 <b>طلبات الشحن</b>
━━━━━━━━━━━━━━━━━━━━
✅ لا توجد طلبات شحن معلقة

جميع الطلبات تم معالجتها!
`;
    const keyboard: any[][] = [[{ text: "🔙 رجوع", callback_data: "admin_menu" }]];
    await sendInlineKeyboard(chatId, text, keyboard);
    return;
  }

  const text = `
💳 <b>طلبات الشحن المعلقة (${charges.length})</b>
━━━━━━━━━━━━━━━━━━━━
يرجى اختيار طلب للمراجعة:
`;

  const keyboard: any[][] = charges.map(charge => [
    { text: `💰 ${charge.data.userName} - ${charge.data.amount} ل.س`, callback_data: `charge_view_${charge.id}` }
  ]);
  keyboard.push([{ text: "🔙 رجوع", callback_data: "admin_menu" }]);

  await sendInlineKeyboard(chatId, text, keyboard);
}

async function showChargeDetails(chatId: string, chargeId: string): Promise<void> {
  const charge = pendingRequests.get(chargeId);
  if (!charge) {
    await sendMessage(chatId, "❌ الطلب غير موجود");
    return;
  }

  const text = `
💳 <b>تفاصيل طلب الشحن</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>المستخدم:</b> ${charge.data.userName}
🆔 <b>معرّف المستخدم:</b> ${charge.data.userId}
💰 <b>المبلغ المطلوب:</b> ${charge.data.amount.toLocaleString("ar-SY")} ل.س.ج
🔢 <b>رقم التحويل:</b> <code>${charge.data.transactionId}</code>
🕐 <b>التوقيت:</b> ${charge.timestamp}
━━━━━━━━━━━━━━━━━━━━

<b>هل تريد الموافقة على هذا الطلب؟</b>
⚡ <i>ملاحظة: عند الموافقة، سيتم مضاعفة المبلغ كمكافأة</i>
`;

  const keyboard: any[][] = [
    [
      { text: "✅ موافقة (2x)", callback_data: `charge_approve_2x_${chargeId}` },
      { text: "✅ موافقة (1x)", callback_data: `charge_approve_1x_${chargeId}` }
    ],
    [{ text: "❌ رفض", callback_data: `charge_reject_${chargeId}` }],
    [{ text: "💬 مراسلة المستخدم", callback_data: `chat_user_${charge.data.userId}` }],
    [{ text: "🔙 رجوع", callback_data: "admin_charges" }],
  ];

  await sendInlineKeyboard(chatId, text, keyboard);
}

// ======================================================
// إدارة طلبات السحب
// ======================================================

async function showWithdrawalsList(chatId: string): Promise<void> {
  const withdrawals = Array.from(pendingRequests.values()).filter(r => r.type === "withdraw" && r.status === "pending");
  
  if (withdrawals.length === 0) {
    const text = `
💸 <b>طلبات السحب</b>
━━━━━━━━━━━━━━━━━━━━
✅ لا توجد طلبات سحب معلقة

جميع الطلبات تم معالجتها!
`;
    const keyboard: any[][] = [[{ text: "🔙 رجوع", callback_data: "admin_menu" }]];
    await sendInlineKeyboard(chatId, text, keyboard);
    return;
  }

  const text = `
💸 <b>طلبات السحب المعلقة (${withdrawals.length})</b>
━━━━━━━━━━━━━━━━━━━━
يرجى اختيار طلب للمراجعة:
`;

  const keyboard: any[][] = withdrawals.map(withdrawal => [
    { text: `💵 ${withdrawal.data.userName} - ${withdrawal.data.amount} ل.س`, callback_data: `withdraw_view_${withdrawal.id}` }
  ]);
  keyboard.push([{ text: "🔙 رجوع", callback_data: "admin_menu" }]);

  await sendInlineKeyboard(chatId, text, keyboard);
}

async function showWithdrawalDetails(chatId: string, withdrawalId: string): Promise<void> {
  const withdrawal = pendingRequests.get(withdrawalId);
  if (!withdrawal) {
    await sendMessage(chatId, "❌ الطلب غير موجود");
    return;
  }

  const text = `
💸 <b>تفاصيل طلب السحب</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>المستخدم:</b> ${withdrawal.data.userName}
🆔 <b>معرّف المستخدم:</b> ${withdrawal.data.userId}
💰 <b>مبلغ السحب:</b> ${withdrawal.data.amount.toLocaleString("ar-SY")} ل.س.ج
🏦 <b>الرصيد الحالي:</b> ${withdrawal.data.walletBalance.toLocaleString("ar-SY")} ل.س.ج
📲 <b>رقم شام كاش:</b> <code>${withdrawal.data.shamCashNumber}</code>
🕐 <b>التوقيت:</b> ${withdrawal.timestamp}
━━━━━━━━━━━━━━━━━━━━

<b>هل تريد الموافقة على هذا الطلب؟</b>
`;

  const keyboard: any[][] = [
    [
      { text: "✅ موافقة", callback_data: `withdraw_approve_${withdrawalId}` },
      { text: "❌ رفض", callback_data: `withdraw_reject_${withdrawalId}` }
    ],
    [{ text: "💬 مراسلة المستخدم", callback_data: `chat_user_${withdrawal.data.userId}` }],
    [{ text: "🔙 رجوع", callback_data: "admin_withdrawals" }],
  ];

  await sendInlineKeyboard(chatId, text, keyboard);
}

// ======================================================
// نظام المحادثات مع المستخدمين
// ======================================================

async function showConversationsList(chatId: string): Promise<void> {
  const activeConversations = Array.from(conversations.entries())
    .filter(([_, conv]) => !conv.isBlocked && conv.messages.length > 0)
    .sort((a, b) => b[1].lastActivity - a[1].lastActivity);

  if (activeConversations.length === 0) {
    const text = `
💬 <b>محادثات المستخدمين</b>
━━━━━━━━━━━━━━━━━━━━
💭 لا توجد محادثات نشطة حالياً

ابدأ محادثة جديدة بالبحث عن مستخدم:
`;
    const keyboard: any[][] = [
      [{ text: "🔍 بحث عن مستخدم", callback_data: "chat_search" }],
      [{ text: "🔙 رجوع", callback_data: "admin_menu" }],
    ];
    await sendInlineKeyboard(chatId, text, keyboard);
    return;
  }

  const text = `
💬 <b>المحادثات النشطة (${activeConversations.length})</b>
━━━━━━━━━━━━━━━━━━━━
آخر الرسائل أولاً:
`;

  const keyboard: any[][] = activeConversations.slice(0, 10).map(([userId, conv]) => {
    const lastMsg = conv.messages[conv.messages.length - 1];
    const preview = lastMsg.text.substring(0, 25) + (lastMsg.text.length > 25 ? "..." : "");
    return [{ 
      text: `👤 ${conv.userName} - ${preview}`, 
      callback_data: `chat_open_${userId}` 
    }];
  });
  
  keyboard.push([
    { text: "🔍 بحث", callback_data: "chat_search" },
    { text: "🔙 رجوع", callback_data: "admin_menu" }
  ]);

  await sendInlineKeyboard(chatId, text, keyboard);
}

async function openConversation(chatId: string, userId: string): Promise<void> {
  const conv = conversations.get(userId);
  if (!conv) {
    await sendMessage(chatId, "❌ المحادثة غير موجودة");
    return;
  }

  // عرض آخر 20 رسالة
  const recentMessages = conv.messages.slice(-20);
  let messagesText = `
💬 <b>محادثة مع: ${conv.userName}</b>
━━━━━━━━━━━━━━━━━━━━
🆔 <b>معرّف المستخدم:</b> <code>${userId}</code>
━━━━━━━━━━━━━━━━━━━━
`;

  for (const msg of recentMessages) {
    const prefix = msg.from === "user" ? "👤" : "👨‍💼";
    const time = new Date(msg.timestamp).toLocaleTimeString("ar-SY", { hour: "2-digit", minute: "2-digit" });
    messagesText += `${prefix} [${time}]: ${msg.text}\n`;
  }

  messagesText += `\n━━━━━━━━━━━━━━━━━━━━
<b>اكتب رسالتك للمستخدم الآن:</b>
(أو اضغط على زر للإجراءات)`;

  const keyboard: any[][] = [
    [{ text: "🚫 حظر المستخدم", callback_data: `chat_block_${userId}` }],
    [{ text: "📋 معلومات المستخدم", callback_data: `user_info_${userId}` }],
    [{ text: "🔙 رجوع", callback_data: "admin_conversations" }],
  ];

  await sendInlineKeyboard(chatId, messagesText, keyboard);
}

async function broadcastMessage(adminChatId: string): Promise<void> {
  const text = `
📢 <b>إرسال رسالة جماعية</b>
━━━━━━━━━━━━━━━━━━━━
يرجى كتابة الرسالة التي تريد إرسالها لجميع المستخدمين المسجلين.

<b>تنبيه:</b> هذه الرسالة ستصل لجميع المستخدمين!

أرسل "إلغاء" للعودة.
`;
  const keyboard: any[][] = [[{ text: "❌ إلغاء", callback_data: "admin_menu" }]];
  await sendInlineKeyboard(adminChatId, text, keyboard);
}

// ======================================================
// إعدادات النظام
// ======================================================

async function showSettingsMenu(chatId: string): Promise<void> {
  const text = `
⚙️ <b>إعدادات النظام</b>
━━━━━━━━━━━━━━━━━━━━
📲 <b>رقم شام كاش الحالي:</b> <code>${shamCashNumber}</code>

<b>اختر الإعداد المراد تعديله:</b>
`;

  const keyboard: any[][] = [
    [{ text: "🔄 تغيير رقم شام كاش", callback_data: "settings_shamcash" }],
    [{ text: "📣 رسالة ترحيبية", callback_data: "settings_welcome" }],
    [{ text: "🎁 مكافأة التسجيل", callback_data: "settings_bonus" }],
    [{ text: "📊 تصدير البيانات", callback_data: "settings_export" }],
    [{ text: "🔙 رجوع", callback_data: "admin_menu" }],
  ];

  await sendInlineKeyboard(chatId, text, keyboard);
}

async function changeShamCashNumber(chatId: string): Promise<void> {
  const text = `
🔄 <b>تغيير رقم شام كاش</b>
━━━━━━━━━━━━━━━━━━━━
الرقم الحالي: <code>${shamCashNumber}</code>

<b>يرجى إرسال الرقم الجديد:</b>
(يجب أن يكون بصيغة صحيحة مثل: 0991234567)

أرسل "إلغاء" للعودة.
`;
  const keyboard: any[][] = [[{ text: "❌ إلغاء", callback_data: "admin_settings" }]];
  await sendInlineKeyboard(chatId, text, keyboard);
}

// ======================================================
// إحصائيات النظام
// ======================================================

async function showStats(chatId: string): Promise<void> {
  const totalUsers = conversations.size;
  const activeUsers = Array.from(conversations.values()).filter(c => !c.isBlocked).length;
  const totalProducts = storedProducts.size;
  const activeProducts = Array.from(storedProducts.values()).filter(p => p.isActive).length;
  const pendingCharges = Array.from(pendingRequests.values()).filter(r => r.type === "charge" && r.status === "pending").length;
  const pendingWithdrawals = Array.from(pendingRequests.values()).filter(r => r.type === "withdraw" && r.status === "pending").length;

  const text = `
📊 <b>إحصائيات النظام - سوق الشام</b>
━━━━━━━━━━━━━━━━━━━━

👥 <b>المستخدمون:</b>
• إجمالي المسجلين: ${totalUsers}
• مستخدمون نشطون: ${activeUsers}
• مستخدمون محظورون: ${totalUsers - activeUsers}

📦 <b>المنتجات:</b>
• إجمالي المنتجات: ${totalProducts}
• منتجات نشطة: ${activeProducts}

💳 <b>الطلبات المعلقة:</b>
• طلبات شحن: ${pendingCharges}
• طلبات سحب: ${pendingWithdrawals}

🕐 <b>آخر تحديث:</b> ${new Date().toLocaleString("ar-SY")}
━━━━━━━━━━━━━━━━━━━━
🛒 <i>سوق الشام الإلكتروني</i>
`;

  const keyboard: any[][] = [
    [{ text: "🔄 تحديث", callback_data: "admin_stats" }],
    [{ text: "🔙 رجوع", callback_data: "admin_menu" }],
  ];

  await sendInlineKeyboard(chatId, text, keyboard);
}

// ======================================================
// معالجة الردود والاستفسارات
// ======================================================

export async function handleUserMessage(message: any): Promise<void> {
  const chatId = message.chat.id.toString();
  const userId = message.from.id.toString();
  const userName = `${message.from.first_name || ""} ${message.from.last_name || ""}`.trim() || "مستخدم";
  const text = message.text || "";

  // التحقق مما إذا كان المستخدم مشرفاً
  if (ADMIN_IDS.includes(userId)) {
    // هذا مشرف - معالجة رسالته كإجراء إداري وليس كمحادثة مستخدم
    await processAdminMessage(message);
    return;
  }

  // حفظ/تحديث المحادثة
  if (!conversations.has(userId)) {
    conversations.set(userId, {
      userId,
      userName,
      messages: [],
      lastActivity: Date.now(),
      isBlocked: false,
    });
  }

  const conv = conversations.get(userId)!;
  if (conv.isBlocked) {
    return;
  }

  // حفظ رسالة المستخدم
  const userMessage: Message = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    text,
    from: "user",
    timestamp: new Date().toISOString(),
  };
  conv.messages.push(userMessage);
  conv.lastActivity = Date.now();

  // إشعار المشرفين بوجود رسالة جديدة (إذا كانت أول رسالة أو بعد فترة)
  const lastAdminMsg = conv.messages.filter(m => m.from === "admin").pop();
  const lastUserMsg = conv.messages.filter(m => m.from === "user").pop();
  
  if (conv.messages.length === 1 || (lastAdminMsg && Date.now() - new Date(lastAdminMsg.timestamp).getTime() > 3600000)) {
    for (const adminId of ADMIN_IDS) {
      const notifyText = `
💬 <b>رسالة جديدة من مستخدم</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>المستخدم:</b> ${userName}
🆔 <b>المعرّف:</b> <code>${userId}</code>
📝 <b>الرسالة:</b> ${text.substring(0, 100)}${text.length > 100 ? "..." : ""}
🕐 <b>التوقيت:</b> ${new Date().toLocaleString("ar-SY")}
━━━━━━━━━━━━━━━━━━━━
<b>اضغط للرد:</b>
`;
      const keyboard: any[][] = [[{ text: "💬 فتح المحادثة", callback_data: `chat_open_${userId}` }]];
      await sendInlineKeyboard(adminId, notifyText, keyboard);
    }
  }
}

export async function handleCallbackQuery(callbackQuery: any): Promise<void> {
  const chatId = callbackQuery.message.chat.id.toString();
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;
  const adminId = callbackQuery.from.id.toString();

  // التحقق من أن المستخدم مشرف
  if (!ADMIN_IDS.includes(adminId)) {
    await answerCallbackQuery(callbackQuery.id, "❌ غير مصرح لك باستخدام هذه اللوحة");
    return;
  }

  // معالجة الأزرار
  switch (true) {
    case data === "admin_menu":
      await showAdminMenu(chatId);
      break;
    
    case data === "admin_products":
      await showProductsMenu(chatId);
      break;
    
    case data === "admin_charges":
      await showChargesList(chatId);
      break;
    
    case data === "admin_withdrawals":
      await showWithdrawalsList(chatId);
      break;
    
    case data === "admin_conversations":
      await showConversationsList(chatId);
      break;
    
    case data === "admin_settings":
      await showSettingsMenu(chatId);
      break;
    
    case data === "admin_stats":
      await showStats(chatId);
      break;

    // إدارة المنتجات
    case data === "prod_add_new":
      await startAddProduct(chatId);
      break;

    // طلبات الشحن
    case data.startsWith("charge_view_"):
      const chargeId = data.replace("charge_view_", "");
      await showChargeDetails(chatId, chargeId);
      break;
    
    case data.startsWith("charge_approve_2x_"):
      const approve2xId = data.replace("charge_approve_2x_", "");
      await approveCharge(chatId, approve2xId, true);
      break;
    
    case data.startsWith("charge_approve_1x_"):
      const approve1xId = data.replace("charge_approve_1x_", "");
      await approveCharge(chatId, approve1xId, false);
      break;
    
    case data.startsWith("charge_reject_"):
      const rejectChargeId = data.replace("charge_reject_", "");
      await rejectCharge(chatId, rejectChargeId);
      break;

    // طلبات السحب
    case data.startsWith("withdraw_view_"):
      const withdrawId = data.replace("withdraw_view_", "");
      await showWithdrawalDetails(chatId, withdrawId);
      break;
    
    case data.startsWith("withdraw_approve_"):
      const approveWithdrawId = data.replace("withdraw_approve_", "");
      await approveWithdrawal(chatId, approveWithdrawId);
      break;
    
    case data.startsWith("withdraw_reject_"):
      const rejectWithdrawId = data.replace("withdraw_reject_", "");
      await rejectWithdrawal(chatId, rejectWithdrawId);
      break;

    // المحادثات
    case data.startsWith("chat_open_"):
      const targetUserId = data.replace("chat_open_", "");
      // حفظ حالة المشرف للرد على هذا المستخدم
      adminStates.set(adminId, {
        currentAction: `reply_to_user_${targetUserId}`,
        targetUserId,
        waitingForInput: true,
      });
      await openConversation(chatId, targetUserId);
      await sendMessage(chatId, "📝 <b>اكتب رسالتك الآن:</b>\n\n(أرسل الرسالة وسيتم توصيلها للمستخدم فوراً)\n\nأرسل \"إلغاء\" للعودة.");
      break;
    
    case data.startsWith("chat_user_"):
      const chatUserId = data.replace("chat_user_", "");
      adminStates.set(adminId, {
        currentAction: `reply_to_user_${chatUserId}`,
        targetUserId: chatUserId,
        waitingForInput: true,
      });
      await sendMessage(chatId, "📝 <b>اكتب رسالتك للمستخدم:</b>\n\nأرسل \"إلغاء\" للعودة.");
      break;

    // الإعدادات
    case data === "settings_shamcash":
      // تعيين حالة انتظار إدخال الرقم الجديد
      adminStates.set(adminId, {
        currentAction: "change_shamcash",
        waitingForInput: true,
      });
      await changeShamCashNumber(chatId);
      break;

    default:
      await answerCallbackQuery(callbackQuery.id, "⚠️ خيار غير متوفر حالياً");
  }
}

// ======================================================
// دوال عامة للتصدير
// ======================================================

export async function notifyAllAdmins(text: string): Promise<void> {
  for (const adminId of ADMIN_IDS) {
    await sendMessage(adminId, text);
  }
}

// ======================================================
// معالجة طلبات الشحن
// ======================================================

async function approveCharge(chatId: string, chargeId: string, isDouble: boolean): Promise<void> {
  const charge = pendingRequests.get(chargeId);
  if (!charge) {
    await sendMessage(chatId, "❌ الطلب غير موجود");
    return;
  }

  // استخدام AdminDB لتحديث الرصيد فعلياً
  const userIdNum = parseInt(charge.data.userId);
  const finalAmount = isDouble ? charge.data.amount * 2 : charge.data.amount;
  
  const success = AdminDB.updateBalance(userIdNum, finalAmount, 'credit');
  
  if (!success) {
    await sendMessage(chatId, "❌ حدث خطأ أثناء معالجة الطلب");
    return;
  }

  // تحديث حالة الطلب محلياً
  charge.status = "approved";
  
  // إشعار المستخدم بالموافقة
  const userNotifyText = `
✅ <b>تم الموافقة على طلب الشحن!</b>
━━━━━━━━━━━━━━━━━━━━
💰 <b>المبلغ الأصلي:</b> ${charge.data.amount.toLocaleString("ar-SY")} ل.س.ج
${isDouble ? `🎁 <b>المكافأة:</b> ${(charge.data.amount).toLocaleString("ar-SY")} ل.س.ج\n` : ''}
💵 <b>الإجمالي المضاف:</b> ${finalAmount.toLocaleString("ar-SY")} ل.س.ج
━━━━━━━━━━━━━━━━━━━━
شكراً لاستخدامك سوق الشام!
`;
  
  try {
    await sendMessage(charge.data.userId, userNotifyText);
  } catch (e) {
    console.error("Failed to notify user:", e);
  }

  // جلب الرصيد الجديد من AdminDB
  const user = AdminDB.getUser(userIdNum);
  const newBalance = user ? user.balance : finalAmount;
  
  await sendMessage(chatId, `✅ <b>تمت الموافقة بنجاح!</b>\n\nالمستخدم: ${charge.data.userName}\nالمبلغ المضاف: ${finalAmount.toLocaleString("ar-SY")} ل.س.ج\nالرصيد الجديد: ${newBalance.toLocaleString("ar-SY")} ل.س.ج\n${isDouble ? '(مع المكافأة 2x)' : ''}`);
  
  await showChargesList(chatId);
}

async function rejectCharge(chatId: string, chargeId: string): Promise<void> {
  const charge = pendingRequests.get(chargeId);
  if (!charge) {
    await sendMessage(chatId, "❌ الطلب غير موجود");
    return;
  }

  // تحديث حالة الطلب محلياً فقط (لا حاجة للخصم لأن الرصيد لم يُضف بعد)
  charge.status = "rejected";
  
  // إشعار المستخدم بالرفض
  const userNotifyText = `
❌ <b>تم رفض طلب الشحن</b>
━━━━━━━━━━━━━━━━━━━━
💰 <b>المبلغ:</b> ${charge.data.amount.toLocaleString("ar-SY")} ل.س.ج
🔢 <b>رقم التحويل:</b> <code>${charge.data.transactionId}</code>
━━━━━━━━━━━━━━━━━━━━
يرجى التأكد من صحة بيانات التحويل والمحاولة مرة أخرى.
`;
  
  try {
    await sendMessage(charge.data.userId, userNotifyText);
  } catch (e) {
    console.error("Failed to notify user:", e);
  }

  await sendMessage(chatId, `❌ <b>تم رفض الطلب</b>\n\nالمستخدم: ${charge.data.userName}`);
  
  await showChargesList(chatId);
}

// ======================================================
// معالجة طلبات السحب
// ======================================================

async function approveWithdrawal(chatId: string, withdrawalId: string): Promise<void> {
  const withdrawal = pendingRequests.get(withdrawalId);
  if (!withdrawal) {
    await sendMessage(chatId, "❌ الطلب غير موجود");
    return;
  }

  // استخدام AdminDB لخصم المبلغ من الرصيد
  const userIdNum = parseInt(withdrawal.data.userId);
  const amount = parseFloat(withdrawal.data.amount);
  
  const success = AdminDB.updateBalance(userIdNum, amount, 'debit');
  
  if (!success) {
    await sendMessage(chatId, "❌ حدث خطأ: رصيد المستخدم غير كافٍ");
    return;
  }

  // تحديث حالة الطلب محلياً
  withdrawal.status = "approved";

  // إشعار المستخدم بالموافقة
  const userNotifyText = `
✅ <b>تم الموافقة على طلب السحب!</b>
━━━━━━━━━━━━━━━━━━━━
💰 <b>مبلغ السحب:</b> ${withdrawal.data.amount.toLocaleString("ar-SY")} ل.س.ج
📲 <b>رقم شام كاش:</b> <code>${withdrawal.data.shamCashNumber}</code>
━━━━━━━━━━━━━━━━━━━━
سيتم تحويل المبلغ خلال 24 ساعة.
شكراً لاستخدامك سوق الشام!
`;
  
  try {
    await sendMessage(withdrawal.data.userId, userNotifyText);
  } catch (e) {
    console.error("Failed to notify user:", e);
  }

  await sendMessage(chatId, `✅ <b>تمت الموافقة على السحب بنجاح!</b>\n\nالمستخدم: ${withdrawal.data.userName}\nالمبلغ: ${withdrawal.data.amount.toLocaleString("ar-SY")} ل.س.ج`);
  
  await showWithdrawalsList(chatId);
}

async function rejectWithdrawal(chatId: string, withdrawalId: string): Promise<void> {
  const withdrawal = pendingRequests.get(withdrawalId);
  if (!withdrawal) {
    await sendMessage(chatId, "❌ الطلب غير موجود");
    return;
  }

  // تحديث حالة الطلب محلياً فقط (لا خصم لأن السحب لم يتم بعد)
  withdrawal.status = "rejected";

  // إشعار المستخدم بالرفض
  const userNotifyText = `
❌ <b>تم رفض طلب السحب</b>
━━━━━━━━━━━━━━━━━━━━
💰 <b>مبلغ السحب:</b> ${withdrawal.data.amount.toLocaleString("ar-SY")} ل.س.ج
━━━━━━━━━━━━━━━━━━━━
يرجى التحقق من رصيدك أو التواصل مع الدعم للمزيد من المعلومات.
`;
  
  try {
    await sendMessage(withdrawal.data.userId, userNotifyText);
  } catch (e) {
    console.error("Failed to notify user:", e);
  }

  await sendMessage(chatId, `❌ <b>تم رفض طلب السحب</b>\n\nالمستخدم: ${withdrawal.data.userName}`);
  
  await showWithdrawalsList(chatId);
}

let isPolling = false;
let pollingInterval: NodeJS.Timeout | null = null;

// بدء استقبال التحديثات من تيليجرام (Polling)
export async function startBot(): Promise<void> {
  if (isPolling) {
    console.log("⚠️ Bot is already running");
    return;
  }

  isPolling = true;
  console.log("🤖 Starting Telegram Admin Bot with Polling...");

  // حذف أي webhook موجود
  await telegramRequest("deleteWebhook", {});

  // بدء polling كل 2 ثانية
  let offset = 0;

  const poll = async () => {
    if (!isPolling) return;

    try {
      const result = await telegramRequest("getUpdates", {
        offset: offset,
        timeout: 30,
      });

      if (result?.ok && result.result) {
        for (const update of result.result) {
          offset = Math.max(offset, update.update_id + 1);

          // معالجة الرسائل النصية
          if (update.message) {
            await processMessage(update.message);
          }

          // معالجة ضغطات الأزرار
          if (update.callback_query) {
            await handleCallbackQuery(update.callback_query);
          }
        }
      }
    } catch (error) {
      console.error("Polling error:", error);
    }

    // الاستمرار في polling
    if (isPolling) {
      setTimeout(poll, 1000);
    }
  };

  poll();
}

// إيقاف البوت
export function stopBot(): void {
  isPolling = false;
  console.log("🛑 Bot stopped");
}

// معالجة الرسائل الواردة
async function processMessage(message: any): Promise<void> {
  const chatId = message.chat.id.toString();
  const userId = message.from.id.toString();
  const text = message.text || "";

  // التحقق من أن المرسل مشرف
  if (!ADMIN_IDS.includes(userId)) {
    // تجاهل رسائل غير المشرفين أو يمكن إضافة رد
    return;
  }

  // معالجة الأوامر
  if (text.startsWith("/")) {
    await handleCommand(chatId, userId, text);
  } else {
    // معالجة الرسائل العادية (للرد في المحادثات أو إدخال البيانات)
    await processAdminMessage(message);
  }
}

// معالجة رسائل المشرفين (للتمييز بين إجراءات الإدارة ومحادثات المستخدمين)
async function processAdminMessage(message: any): Promise<void> {
  const chatId = message.chat.id.toString();
  const adminId = message.from.id.toString();
  const text = message.text || "";

  // الحصول على حالة المشرف الحالية
  const adminState = adminStates.get(adminId);

  // إذا كان المشرف في انتظار إدخال (مثل تغيير رقم شام كاش)
  if (adminState?.waitingForInput) {
    if (text.toLowerCase() === "إلغاء" || text.toLowerCase() === "cancel") {
      adminStates.delete(adminId);
      await sendMessage(chatId, "✅ تم الإلغاء. عدت للقائمة الرئيسية.");
      await showAdminMenu(chatId);
      return;
    }

    // معالجة حسب نوع الإدخال المطلوب
    switch (adminState.currentAction) {
      case "change_shamcash":
        // تحديث رقم شام كاش
        shamCashNumber = text.trim();
        adminStates.delete(adminId);
        
        // مزامنة الرقم مع خدمة telegram
        try {
          const { updateShamCashNumber } = await import('./telegram');
          updateShamCashNumber(shamCashNumber);
        } catch (e) {
          console.error("Failed to sync ShamCash number:", e);
        }
        
        await sendMessage(chatId, `✅ <b>تم تغيير رقم شام كاش بنجاح!</b>\n\nالرقم الجديد: <code>${shamCashNumber}</code>\n\nسيتم استخدام هذا الرقم في جميع عمليات السحب والشحن.`);
        await showSettingsMenu(chatId);
        break;

      default:
        adminStates.delete(adminId);
        await sendMessage(chatId, "❌ حالة غير معروفة. يرجى المحاولة مرة أخرى.");
    }
    return;
  }

  // إذا كان المشرف يرد في محادثة مع مستخدم
  if (adminState?.currentAction?.startsWith("reply_to_user_")) {
    const targetUserId = adminState.targetUserId;
    if (targetUserId) {
      // حفظ رسالة المشرف
      const adminMessage: Message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text,
        from: "admin",
        adminId,
        timestamp: new Date().toISOString(),
      };

      const conv = conversations.get(targetUserId);
      if (conv) {
        conv.messages.push(adminMessage);
        conv.lastActivity = Date.now();

        // إرسال الرسالة للمستخدم
        const userMsgText = `
💬 <b>رسالة جديدة من الدعم الفني</b>
━━━━━━━━━━━━━━━━━━━━
${text}
━━━━━━━━━━━━━━━━━━━━
🛒 <i>سوق الشام الإلكتروني</i>
`;
        await sendMessage(targetUserId, userMsgText);
        await sendMessage(chatId, "✅ تم إرسال رسالتك للمستخدم بنجاح.");
        
        // إعادة فتح المحادثة لعرض الرسالة الجديدة
        await openConversation(chatId, targetUserId);
      } else {
        await sendMessage(chatId, "❌ المستخدم غير موجود.");
      }
    }
    return;
  }

  // إذا لم يكن هناك حالة خاصة، تجاهل الرسالة أو إظهار مساعدة
  await sendMessage(chatId, "ℹ️ استخدم الأزرار التفاعلية أو الأوامر للتنقل في لوحة التحكم.\n\nاستخدم /start لفتح القائمة الرئيسية.");
}

// معالجة الأوامر
async function handleCommand(chatId: string, userId: string, command: string): Promise<void> {
  const cmd = command.toLowerCase().trim();

  switch (cmd) {
    case "/start":
    case "/menu":
    case "/القائمة":
      await showAdminMenu(chatId);
      break;

    case "/products":
    case "/منتجات":
      await showProductsMenu(chatId);
      break;

    case "/charges":
    case "/شحن":
      await showChargesList(chatId);
      break;

    case "/withdrawals":
    case "/سحب":
      await showWithdrawalsList(chatId);
      break;

    case "/conversations":
    case "/محادثات":
      await showConversationsList(chatId);
      break;

    case "/settings":
    case "/إعدادات":
      await showSettingsMenu(chatId);
      break;

    case "/stats":
    case "/احصائيات":
      await showStats(chatId);
      break;

    case "/help":
    case "/مساعدة":
      const helpText = `
📚 <b>مساعدة - أوامر بوت الإدارة</b>
━━━━━━━━━━━━━━━━━━━━
<b>الأوامر المتاحة:</b>

/start - عرض القائمة الرئيسية
/products - إدارة المنتجات
/charges - طلبات الشحن
/withdrawals - طلبات السحب
/conversations - محادثات المستخدمين
/settings - إعدادات النظام
/stats - إحصائيات النظام

<b>أيضاً يمكنك استخدام الأزرار التفاعلية!</b>
━━━━━━━━━━━━━━━━━━━━
🛒 <i>سوق الشام الإلكتروني</i>
`;
      await sendMessage(chatId, helpText);
      break;

    default:
      await sendMessage(chatId, "❌ أمر غير معروف. استخدم /help للمساعدة.");
  }
}

export async function initAdminBot(): Promise<void> {
  console.log("🎛️ Initializing Admin Bot...");
  
  // تحميل رقم شام كاش من localStorage إذا وجد
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("shamCashNumber");
    if (stored) {
      shamCashNumber = stored;
    }
  }
  
  // بدء البوت للاستماع للتحديثات
  await startBot();
  
  // إرسال رسالة ترحيبية للمشرفين مرة واحدة فقط
  if (!welcomeSent) {
    welcomeSent = true;
    for (const adminId of ADMIN_IDS) {
      const welcomeText = `
🎛️ <b>نظام إدارة سوق الشام جاهز!</b>
━━━━━━━━━━━━━━━━━━━━
مرحباً بك في لوحة التحكم المتقدمة

<b>الأوامر السريعة:</b>
/start - فتح القائمة الرئيسية
/help - عرض المساعدة

<b>الميزات المتاحة:</b>
✅ إدارة المنتجات (إضافة، تعديل، حذف)
✅ الموافقة على طلبات الشحن والسحب
✅ محادثة المستخدمين بشكل فردي
✅ تغيير إعدادات النظام (بما فيها رقم شام كاش)
✅ متابعة إحصائيات المتجر

<b>استخدم الأمر /start لفتح القائمة الرئيسية</b>
━━━━━━━━━━━━━━━━━━━━
🛒 <i>سوق الشام الإلكتروني</i>
`;
      
      const keyboard: any[][] = [
        [{ text: "🎛️ فتح لوحة التحكم", callback_data: "admin_menu" }]
      ];
      await sendInlineKeyboard(adminId, welcomeText, keyboard);
    }
  }
}

export function getShamCashNumber(): string {
  return shamCashNumber;
}

export function setShamCashNumber(newNumber: string): void {
  shamCashNumber = newNumber;
}

export function addPendingRequest(request: PendingRequest): void {
  pendingRequests.set(request.id, request);
}

export function updateRequestStatus(requestId: string, status: "approved" | "rejected"): void {
  const request = pendingRequests.get(requestId);
  if (request) {
    request.status = status;
  }
}

export function getConversation(userId: string): Conversation | undefined {
  return conversations.get(userId);
}

export function addMessageToConversation(userId: string, message: Message): void {
  const conv = conversations.get(userId);
  if (conv) {
    conv.messages.push(message);
    conv.lastActivity = Date.now();
  }
}
