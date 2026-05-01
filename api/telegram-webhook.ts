// ======================================================
// Telegram Webhook API for Vercel
// استقبال تحديثات تيليجرام عبر Webhook
// ======================================================

import type { VercelRequest, VercelResponse } from '@vercel/node';

const BOT_TOKEN = "8324781459:AAHJ5RWpHSGgmX2P3k3AUgB4juQW7P_Bsyc";
const ADMIN_IDS = ["7254003723", "6288453737"];

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
  type: "charge" | "withdraw";
  data: any;
  status: "pending" | "approved" | "rejected";
  timestamp: string;
}

interface AdminState {
  currentAction: string | null;
  targetUserId?: string;
  waitingForInput?: boolean;
}

// حالة النظام (ستفقد عند كل طلب - نحتاج قاعدة بيانات حقيقية للإنتاج)
let conversations: Map<string, Conversation> = new Map();
let pendingRequests: Map<string, PendingRequest> = new Map();
let shamCashNumber: string = "0991234567";
let adminStates: Map<string, AdminState> = new Map();

// دوال مساعدة للاتصال بتيليجرام API
async function telegramRequest(method: string, params: any): Promise<any> {
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
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

async function answerCallbackQuery(callbackQueryId: string, message?: string): Promise<void> {
  await telegramRequest("answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    text: message,
    show_alert: !!message,
  });
}

// معالجة الرسائل الواردة
async function handleUserMessage(message: any): Promise<void> {
  const chatId = message.chat.id.toString();
  const userId = message.from.id.toString();
  const userName = `${message.from.first_name || ""} ${message.from.last_name || ""}`.trim() || "مستخدم";
  const text = message.text || "";

  // التحقق مما إذا كان المستخدم مشرفاً
  if (ADMIN_IDS.includes(userId)) {
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

  // إشعار المشرفين بوجود رسالة جديدة
  const lastAdminMsg = conv.messages.filter(m => m.from === "admin").pop();
  
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
`;
      const keyboard: any[][] = [[{ text: "💬 فتح المحادثة", callback_data: `chat_open_${userId}` }]];
      await sendInlineKeyboard(adminId, notifyText, keyboard);
    }
  }
}

// معالجة رسائل المشرفين
async function processAdminMessage(message: any): Promise<void> {
  const chatId = message.chat.id.toString();
  const adminId = message.from.id.toString();
  const text = message.text || "";

  const adminState = adminStates.get(adminId);

  // إذا كان المشرف في انتظار إدخال
  if (adminState?.waitingForInput) {
    if (text.toLowerCase() === "إلغاء" || text.toLowerCase() === "cancel") {
      adminStates.delete(adminId);
      await sendMessage(chatId, "✅ تم الإلغاء.");
      await showAdminMenu(chatId);
      return;
    }

    // معالجة حسب نوع الإدخال
    switch (adminState.currentAction) {
      case "change_shamcash":
        shamCashNumber = text.trim();
        adminStates.delete(adminId);
        await sendMessage(chatId, `✅ <b>تم تغيير رقم شام كاش!</b>\n\nالرقم الجديد: <code>${shamCashNumber}</code>`);
        await showSettingsMenu(chatId);
        break;
    }
    return;
  }

  // إذا كان يرد في محادثة
  if (adminState?.currentAction?.startsWith("reply_to_user_")) {
    const targetUserId = adminState.targetUserId;
    if (targetUserId) {
      const conv = conversations.get(targetUserId);
      if (conv) {
        const adminMessage: Message = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          text,
          from: "admin",
          adminId,
          timestamp: new Date().toISOString(),
        };
        conv.messages.push(adminMessage);
        conv.lastActivity = Date.now();

        const userMsgText = `
💬 <b>رسالة من الدعم الفني</b>
━━━━━━━━━━━━━━━━━━━━
${text}
━━━━━━━━━━━━━━━━━━━━
`;
        await sendMessage(targetUserId, userMsgText);
        await sendMessage(chatId, "✅ تم الإرسال.");
      }
    }
    return;
  }

  // معالجة الأوامر
  if (text.startsWith("/")) {
    await handleCommand(chatId, adminId, text);
  }
}

// معالجة الأزرار
async function handleCallbackQuery(callbackQuery: any): Promise<void> {
  const chatId = callbackQuery.message.chat.id.toString();
  const data = callbackQuery.data;
  const adminId = callbackQuery.from.id.toString();

  if (!ADMIN_IDS.includes(adminId)) {
    await answerCallbackQuery(callbackQuery.id, "❌ غير مصرح");
    return;
  }

  switch (true) {
    case data === "admin_menu":
      await showAdminMenu(chatId);
      break;
    
    case data === "admin_settings":
      await showSettingsMenu(chatId);
      break;
    
    case data === "settings_shamcash":
      adminStates.set(adminId, {
        currentAction: "change_shamcash",
        waitingForInput: true,
      });
      await sendMessage(chatId, `🔄 <b>تغيير رقم شام كاش</b>\n\nالرقم الحالي: <code>${shamCashNumber}</code>\n\nأرسل الرقم الجديد:`);
      break;
    
    case data.startsWith("chat_open_"):
      const targetUserId = data.replace("chat_open_", "");
      adminStates.set(adminId, {
        currentAction: `reply_to_user_${targetUserId}`,
        targetUserId,
        waitingForInput: true,
      });
      await sendMessage(chatId, "📝 اكتب رسالتك للمستخدم:");
      break;
    
    default:
      await answerCallbackQuery(callbackQuery.id, "⚠️ خيار غير متوفر");
  }
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
    
    case "/settings":
    case "/إعدادات":
      await showSettingsMenu(chatId);
      break;
    
    case "/help":
      await sendMessage(chatId, "📚 استخدم /start لفتح القائمة الرئيسية");
      break;
    
    default:
      await sendMessage(chatId, "❌ أمر غير معروف. استخدم /help");
  }
}

// لوحة التحكم
async function showAdminMenu(chatId: string): Promise<void> {
  const menuText = `
🎛️ <b>لوحة تحكم المشرفين - سوق الشام</b>
━━━━━━━━━━━━━━━━━━━━
👋 أهلاً بك في نظام الإدارة

<b>الأوامر المتاحة:</b>
/start - القائمة الرئيسية
/settings - الإعدادات
/help - المساعدة
`;

  const keyboard: any[][] = [
    [{ text: "⚙️ إعدادات النظام", callback_data: "admin_settings" }],
    [{ text: "💬 محادثات المستخدمين", callback_data: "admin_conversations" }],
  ];

  await sendInlineKeyboard(chatId, menuText, keyboard);
}

async function showSettingsMenu(chatId: string): Promise<void> {
  const text = `
⚙️ <b>إعدادات النظام</b>
━━━━━━━━━━━━━━━━━━━━
📲 <b>رقم شام كاش الحالي:</b> <code>${shamCashNumber}</code>
`;

  const keyboard: any[][] = [
    [{ text: "🔄 تغيير رقم شام كاش", callback_data: "settings_shamcash" }],
    [{ text: "🔙 رجوع", callback_data: "admin_menu" }],
  ];

  await sendInlineKeyboard(chatId, text, keyboard);
}

// Handler الرئيسي لـ Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // السماح فقط لطلبات POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const update = req.body;
    console.log('📨 Received Telegram update:', JSON.stringify(update, null, 2));

    // معالجة الرسائل النصية
    if (update.message) {
      await handleUserMessage(update.message);
    }

    // معالجة ضغطات الأزرار
    if (update.callback_query) {
      await handleCallbackQuery(update.callback_query);
    }

    // إرجاع نجاح
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
}
