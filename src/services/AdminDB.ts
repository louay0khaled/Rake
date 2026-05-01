/**
 * AdminDB - قاعدة البيانات المركزية الموحدة
 * تعمل كجسر بين واجهة الموقع وبوت تيليجرام
 * تستخدم localStorage كمخزن دائم، وتطلق أحداثاً عند أي تغيير
 */

const DB_KEYS = {
  USERS: 'sham_cash_users',
  PRODUCTS: 'sham_cash_products',
  REQUESTS: 'sham_cash_requests',
  SETTINGS: 'sham_cash_settings',
  CONVERSATIONS: 'sham_cash_conversations'
};

// هيكلية المستخدم الافتراضية
const createDefaultUser = (id: number, username?: string) => ({
  id,
  username: username || `User_${id}`,
  balance: 0,
  isBlocked: false,
  joinedAt: new Date().toISOString()
});

class AdminDB {
  // --- Users Management ---
  
  static getUsers(): any[] {
    const data = localStorage.getItem(DB_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  }

  static getUser(userId: number): any | null {
    const users = this.getUsers();
    let user = users.find(u => u.id === userId);
    
    if (!user) {
      // إنشاء مستخدم جديد إذا لم يكن موجوداً (للمشرفين أو المستخدمين الجدد)
      user = createDefaultUser(userId);
      this.saveUsers(users);
    }
    return user;
  }

  static saveUsers(users: any[]) {
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    window.dispatchEvent(new Event('db-users-updated'));
  }

  static updateBalance(userId: number, amount: number, type: 'credit' | 'debit'): boolean {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      // إنشاء المستخدم إذا لم يوجد
      const newUser = createDefaultUser(userId);
      newUser.balance = type === 'credit' ? amount : -amount;
      users.push(newUser);
      this.saveUsers(users);
      return true;
    }

    const user = users[userIndex];
    if (type === 'credit') {
      user.balance += parseFloat(amount.toString());
    } else {
      if (user.balance < amount) return false; // رصيد غير كافٍ
      user.balance -= parseFloat(amount.toString());
    }

    users[userIndex] = user;
    this.saveUsers(users);
    return true;
  }

  // --- Requests Management ---

  static getRequests(): any[] {
    const data = localStorage.getItem(DB_KEYS.REQUESTS);
    return data ? JSON.parse(data) : [];
  }

  static addRequest(request: any) {
    const requests = this.getRequests();
    requests.push({
      ...request,
      id: Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    localStorage.setItem(DB_KEYS.REQUESTS, JSON.stringify(requests));
    window.dispatchEvent(new Event('db-requests-updated'));
  }

  static updateRequestStatus(requestId: number, status: 'approved' | 'rejected', adminId?: number) {
    const requests = this.getRequests();
    const reqIndex = requests.findIndex(r => r.id === requestId);
    
    if (reqIndex === -1) return false;

    requests[reqIndex].status = status;
    requests[reqIndex].processedAt = new Date().toISOString();
    requests[reqIndex].processedBy = adminId;

    // إذا كان طلب شحن وتمت الموافقة، نقوم بتحديث الرصيد فوراً هنا
    if (requests[reqIndex].type === 'deposit' && status === 'approved') {
      const amount = parseFloat(requests[reqIndex].amount);
      // تطبيق المضاعفة إذا كانت موجودة
      const finalAmount = requests[reqIndex].bonusMultiplier ? amount * requests[reqIndex].bonusMultiplier : amount;
      
      this.updateBalance(requests[reqIndex].userId, finalAmount, 'credit');
    }

    // إذا كان طلب سحب وتمت الموافقة، نخصم الرصيد
    if (requests[reqIndex].type === 'withdraw' && status === 'approved') {
      const amount = parseFloat(requests[reqIndex].amount);
      const success = this.updateBalance(requests[reqIndex].userId, amount, 'debit');
      if (!success) {
        // إلغاء الموافقة إذا فشل الخصم (نادراً ما يحدث لكن للاحتياط)
        requests[reqIndex].status = 'failed';
        requests[reqIndex].error = 'Insufficient balance during processing';
      }
    }

    localStorage.setItem(DB_KEYS.REQUESTS, JSON.stringify(requests));
    window.dispatchEvent(new Event('db-requests-updated'));
    return true;
  }

  // --- Settings Management ---

  static getSetting(key: string, defaultValue: any = null): any {
    const settings = JSON.parse(localStorage.getItem(DB_KEYS.SETTINGS) || '{}');
    return settings[key] !== undefined ? settings[key] : defaultValue;
  }

  static setSetting(key: string, value: any) {
    const settings = JSON.parse(localStorage.getItem(DB_KEYS.SETTINGS) || '{}');
    settings[key] = value;
    localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(settings));
    window.dispatchEvent(new Event('db-settings-updated'));
  }

  // --- Conversations ---
  
  static getConversations(): any[] {
    const data = localStorage.getItem(DB_KEYS.CONVERSATIONS);
    return data ? JSON.parse(data) : [];
  }

  static addMessage(conversationId: string, senderId: number, text: string, isAdmin: boolean) {
    const conversations = this.getConversations();
    let conv = conversations.find(c => c.id === conversationId);
    
    if (!conv) {
      conv = {
        id: conversationId,
        userId: senderId,
        messages: [],
        lastUpdate: new Date().toISOString(),
        isOpen: true
      };
      conversations.push(conv);
    }

    conv.messages.push({
      senderId,
      text,
      isAdmin,
      timestamp: new Date().toISOString()
    });
    conv.lastUpdate = new Date().toISOString();

    localStorage.setItem(DB_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    window.dispatchEvent(new Event('db-conversations-updated'));
  }
}

export default AdminDB;
