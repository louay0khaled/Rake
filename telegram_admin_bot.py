import logging
import asyncio
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, MessageHandler, filters, CallbackQueryHandler, ContextTypes
import sqlite3
from datetime import datetime

# --- إعدادات التسجيل ---
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# --- ثوابت التوكن ومعرفات المشرفين ---
# استبدل هذا بالتوكن الخاص بك
BOT_TOKEN = "YOUR_BOT_TOKEN_HERE"
# أضف معرفات المشرفين هنا (الأرقام فقط)
ADMIN_IDS = [123456789, 987654321] 

# --- إدارة قاعدة البيانات ---
def init_db():
    conn = sqlite3.connect('bot_database.db')
    c = conn.cursor()
    
    # جدول الإعدادات العامة
    c.execute('''CREATE TABLE IF NOT EXISTS settings 
                 (key TEXT PRIMARY KEY, value TEXT)''')
    
    # جدول المستخدمين
    c.execute('''CREATE TABLE IF NOT EXISTS users 
                 (user_id INTEGER PRIMARY KEY, username TEXT, first_name TEXT, last_login TIMESTAMP)''')
    
    # جدول المنتجات
    c.execute('''CREATE TABLE IF NOT EXISTS products 
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, price REAL, description TEXT, created_at TIMESTAMP)''')
    
    # جدول العمليات (سحب/شحن)
    c.execute('''CREATE TABLE IF NOT EXISTS transactions 
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, type TEXT, amount REAL, status TEXT, request_date TIMESTAMP)''')
    
    # جدول رسائل الدعم (محادثة المشرفين مع المستخدمين)
    c.execute('''CREATE TABLE IF NOT EXISTS support_messages 
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, admin_id INTEGER, message_text TEXT, sender TEXT, timestamp TIMESTAMP)''')
    
    # إدخال إعداد افتراضي إذا لم يوجد
    c.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('sham_cash_number', '0912345678')")
    
    conn.commit()
    conn.close()

def get_setting(key):
    conn = sqlite3.connect('bot_database.db')
    c = conn.cursor()
    c.execute("SELECT value FROM settings WHERE key=?", (key,))
    result = c.fetchone()
    conn.close()
    return result[0] if result else None

def update_setting(key, value):
    conn = sqlite3.connect('bot_database.db')
    c = conn.cursor()
    c.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (key, value))
    conn.commit()
    conn.close()

def is_admin(user_id):
    return user_id in ADMIN_IDS

# --- دوال مساعدة للوحات المفاتيح ---
def main_admin_keyboard():
    keyboard = [
        [InlineKeyboardButton("📦 إدارة المنتجات", callback_data="admin_products"),
         InlineKeyboardButton("💰 العمليات المعلقة", callback_data="admin_transactions")],
        [InlineKeyboardButton("💬 دعم المستخدمين", callback_data="admin_support"),
         InlineKeyboardButton("⚙️ إعدادات الموقع", callback_data="admin_settings")],
        [InlineKeyboardButton("📊 الإحصائيات", callback_data="admin_stats")]
    ]
    return InlineKeyboardMarkup(keyboard)

def products_management_keyboard():
    keyboard = [
        [InlineKeyboardButton("➕ إضافة منتج", callback_data="prod_add"),
         InlineKeyboardButton("📋 قائمة المنتجات", callback_data="prod_list")],
        [InlineKeyboardButton("🔙 عودة للقائمة الرئيسية", callback_data="admin_main")]
    ]
    return InlineKeyboardMarkup(keyboard)

def transaction_action_keyboard(trans_id):
    keyboard = [
        [InlineKeyboardButton("✅ موافقة", callback_data=f"trans_approve_{trans_id}"),
         InlineKeyboardButton("❌ رفض", callback_data=f"trans_reject_{trans_id}")],
        [InlineKeyboardButton("🔙 عودة", callback_data="admin_transactions")]
    ]
    return InlineKeyboardMarkup(keyboard)

# --- المعالجات (Handlers) ---

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    user_id = user.id
    
    # تسجيل دخول المستخدم
    conn = sqlite3.connect('bot_database.db')
    c = conn.cursor()
    c.execute("INSERT OR REPLACE INTO users (user_id, username, first_name, last_login) VALUES (?, ?, ?, ?)",
              (user_id, user.username, user.first_name, datetime.now()))
    conn.commit()
    conn.close()

    if is_admin(user_id):
        await update.message.reply_text(
            f"مرحباً بك أيها المشرف {user.first_name} 👋\n"
            "اختر العملية التي تريد تنفيذها:",
            reply_markup=main_admin_keyboard()
        )
    else:
        sham_number = get_setting('sham_cash_number')
        await update.message.reply_text(
            f"مرحباً {user.first_name}!\n"
            "أهلاً بك في متجرنا.\n"
            f"للشراء يرجى التحويل على رقم شام كاش: `{sham_number}`\n"
            "ثم أرسل إيصال التحويل.",
            parse_mode='Markdown'
        )

async def admin_menu_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    
    if not is_admin(query.from_user.id):
        await query.edit_message_text("⛔ ليس لديك صلاحيات للوصول لهذه القائمة.")
        return

    action = query.data
    
    if action == "admin_main":
        await query.edit_message_text("القائمة الرئيسية للمشرفين:", reply_markup=main_admin_keyboard())
        
    elif action == "admin_products":
        await query.edit_message_text("إدارة المنتجات:", reply_markup=products_management_keyboard())
        
    elif action == "admin_settings":
        sham_num = get_setting('sham_cash_number')
        keyboard = [[InlineKeyboardButton("🔄 تغيير رقم شام كاش", callback_data="set_sham_cash")],
                    [InlineKeyboardButton("🔙 عودة", callback_data="admin_main")]]
        await query.edit_message_text(
            f"⚙️ إعدادات الموقع:\n\n"
            f"رقم شام كاش الحالي: `{sham_num}`",
            parse_mode='Markdown',
            reply_markup=InlineKeyboardMarkup(keyboard)
        )

    elif action == "admin_transactions":
        # جلب العمليات المعلقة
        conn = sqlite3.connect('bot_database.db')
        c = conn.cursor()
        c.execute("SELECT id, user_id, type, amount FROM transactions WHERE status='pending' LIMIT 5")
        rows = c.fetchall()
        conn.close()
        
        if not rows:
            keyboard = [[InlineKeyboardButton("🔙 عودة", callback_data="admin_main")]]
            await query.edit_message_text("لا توجد عمليات معلقة حالياً ✅", reply_markup=InlineKeyboardMarkup(keyboard))
        else:
            text = "💰 العمليات المعلقة للمراجعة:\n\n"
            keyboard = []
            for row in rows:
                t_id, u_id, t_type, amount = row
                text += f"🆔 ID: `{t_id}` | 👤 User: `{u_id}`\n"
                text += f"📝 النوع: {t_type} | 💵 المبلغ: {amount}\n"
                text += "--------------------------\n"
                keyboard.append([InlineKeyboardButton(f"مراجعة #{t_id}", callback_data=f"trans_view_{t_id}")])
            keyboard.append([InlineKeyboardButton("🔙 عودة", callback_data="admin_main")])
            
            await query.edit_message_text(text, parse_mode='Markdown', reply_markup=InlineKeyboardMarkup(keyboard))

    elif action.startswith("trans_view_"):
        t_id = int(action.split("_")[-1])
        conn = sqlite3.connect('bot_database.db')
        c = conn.cursor()
        c.execute("SELECT * FROM transactions WHERE id=?", (t_id,))
        row = c.fetchone()
        conn.close()
        
        if row:
            text = f"تفاصيل العملية #{t_id}:\n"
            text += f"المستخدم: {row[1]}\nالنوع: {row[2]}\nالمبلغ: {row[3]}\nالحالة: {row[4]}"
            await query.edit_message_text(text, reply_markup=transaction_action_keyboard(t_id))

    elif action.startswith("trans_approve_"):
        t_id = int(action.split("_")[-1])
        conn = sqlite3.connect('bot_database.db')
        c = conn.cursor()
        c.execute("UPDATE transactions SET status='approved' WHERE id=?", (t_id,))
        conn.commit()
        conn.close()
        await query.edit_message_text(f"✅ تمت الموافقة على العملية #{t_id} بنجاح.")
        # إشعار المستخدم (يمكن تطويره لإرسال رسالة للمستخدم)
        
    elif action.startswith("trans_reject_"):
        t_id = int(action.split("_")[-1])
        conn = sqlite3.connect('bot_database.db')
        c = conn.cursor()
        c.execute("UPDATE transactions SET status='rejected' WHERE id=?", (t_id,))
        conn.commit()
        conn.close()
        await query.edit_message_text(f"❌ تم رفض العملية #{t_id}.")

    elif action == "set_sham_cash":
        await query.edit_message_text("📝 أرجو إرسال رقم شام كاش الجديد الآن:")
        context.user_data['awaiting_sham_update'] = True

    elif action == "admin_support":
        # قائمة آخر المستخدمين النشطين للمحادثة
        conn = sqlite3.connect('bot_database.db')
        c = conn.cursor()
        c.execute("SELECT user_id, first_name, last_login FROM users ORDER BY last_login DESC LIMIT 10")
        rows = c.fetchall()
        conn.close()
        
        keyboard = []
        text = "💬 اختر المستخدم للمحادثة:\n"
        for row in rows:
            u_id, name, _ = row
            text += f"- {name} (`{u_id}`)\n"
            keyboard.append([InlineKeyboardButton(f"👤 {name}", callback_data=f"chat_with_{u_id}")])
        keyboard.append([InlineKeyboardButton("🔙 عودة", callback_data="admin_main")])
        
        await query.edit_message_text(text, parse_mode='Markdown', reply_markup=InlineKeyboardMarkup(keyboard))

    elif action.startswith("chat_with_"):
        target_user = int(action.split("_")[-1])
        context.user_data['chatting_with'] = target_user
        await query.edit_message_text(
            f"💬 أنت الآن تتحدث مع المستخدم ID: `{target_user}`\n"
            "اكتب الرسالة وسأقوم بإرسالها له.\n"
            "اكتب /cancel لإنهاء المحادثة.",
            parse_mode='Markdown'
        )

async def handle_admin_input(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if not is_admin(user_id):
        return

    # تحديث رقم شام كاش
    if context.user_data.get('awaiting_sham_update'):
        new_number = update.message.text
        update_setting('sham_cash_number', new_number)
        await update.message.reply_text(f"✅ تم تحديث رقم شام كاش إلى: `{new_number}`", parse_mode='Markdown')
        context.user_data['awaiting_sham_update'] = False
        return

    # إرسال رسالة لمستخدم (نظام الدعم)
    target_user = context.user_data.get('chatting_with')
    if target_user:
        try:
            msg_text = update.message.text
            # حفظ الرسالة في السجل
            conn = sqlite3.connect('bot_database.db')
            c = conn.cursor()
            c.execute("INSERT INTO support_messages (user_id, admin_id, message_text, sender, timestamp) VALUES (?, ?, ?, ?, ?)",
                      (target_user, user_id, msg_text, 'admin', datetime.now()))
            conn.commit()
            conn.close()
            
            # إرسال الرسالة للمستخدم
            await context.bot.send_message(chat_id=target_user, text=f"📨 رسالة من الدعم:\n{msg_text}")
            await update.message.reply_text("✅ تم إرسال الرسالة للمستخدم.")
        except Exception as e:
            await update.message.reply_text(f"❌ فشل الإرسال: {str(e)}")
            # ربما قام المستخدم بحظر البوت

async def handle_user_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    # هنا يمكن معالجة رسائل المستخدمين العادية (مثل إرسال الإيصال)
    # وتخزينها ليراها المشرفون لاحقاً
    user_id = update.effective_user.id
    text = update.message.text
    
    conn = sqlite3.connect('bot_database.db')
    c = conn.cursor()
    # مثال بسيط: تخزين الرسالة كرسالة دعم من المستخدم
    c.execute("INSERT INTO support_messages (user_id, admin_id, message_text, sender, timestamp) VALUES (?, NULL, ?, ?, ?)",
              (user_id, text, 'user', datetime.now()))
    conn.commit()
    conn.close()
    
    await update.message.reply_text("📩 تم استلام رسالتك وسيتم الرد عليها من قبل المشرفين قريباً.")

# --- إضافة منتجات (مثال مبسط) ---
async def add_product_flow(update: Update, context: ContextTypes.DEFAULT_TYPE):
    # يمكن تطوير هذا ليكون حالة (ConversationHandler) لجمع الاسم والسعر والوصف
    await update.message.reply_text("-feature تحت الإنشاء: يرجى استخدام لوحة التحكم لإضافة المنتجات عبر الخطوات التفاعلية-")

async def error_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    logger.warning(f'Update {update} caused error {context.error}')

def main():
    init_db()
    
    application = Application.builder().token(BOT_TOKEN).build()
    
    # أوامر المشرفين
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CallbackQueryHandler(admin_menu_callback, pattern="^admin_|^trans_|^prod_|^set_|^chat_with_"))
    
    # معالجة النصوص (للتحديثات والمحادثات)
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_admin_input))
    
    # معالجة أخطاء
    application.add_error_handler(error_handler)
    
    logger.info("Bot is starting with full Admin capabilities...")
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main()
