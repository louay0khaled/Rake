/**
 * Mock Database Layer for Synchronization
 * يعمل كطبقة وسيطة لمزامنة البيانات بين بوت تيليجرام والموقع
 * باستخدام localStorage كمخزن مؤقت (في بيئة المتصفح)
 * ملاحظة: في الإنتاج الحقيقي مع مستخدمين متعددين، يفضل استخدام Firebase/Supabase
 */

export interface DepositRequest {
  id: string;
  userId: string;
  amount: number;
  proofImage?: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: number;
  bonusApplied?: boolean;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  shamCashNumber?: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: number;
}

export interface UserBalance {
  userId: string;
  balance: number;
  lastUpdated: number;
}

const DB_KEYS = {
  DEPOSITS: 'mock_db_deposits',
  WITHDRAWALS: 'mock_db_withdrawals',
  BALANCES: 'mock_db_balances',
  SHAM_CASH: 'sham_cash_number'
};

// --- دوال المساعدة ---

function getFromDB<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
}

function saveToDB<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
  // إطلاق حدث لتحديث الواجهات الأخرى المفتوحة
  window.dispatchEvent(new Event('storage'));
}

// --- إدارة الودائع (الشحن) ---

export function addDepositRequest(request: DepositRequest): void {
  const deposits = getFromDB<DepositRequest[]>(DB_KEYS.DEPOSITS, []);
  deposits.push(request);
  saveToDB(DB_KEYS.DEPOSITS, deposits);
  console.log(`[MockDB] Deposit request added: ${request.id}`);
}

export function getPendingDeposits(): DepositRequest[] {
  const deposits = getFromDB<DepositRequest[]>(DB_KEYS.DEPOSITS, []);
  return deposits.filter(d => d.status === 'pending');
}

export function approveDeposit(requestId: string, applyBonus: boolean = false): boolean {
  const deposits = getFromDB<DepositRequest[]>(DB_KEYS.DEPOSITS, []);
  const index = deposits.findIndex(d => d.id === requestId);
  
  if (index === -1) return false;

  const request = deposits[index];
  request.status = 'approved';
  request.bonusApplied = applyBonus;

  // حساب المبلغ النهائي
  const finalAmount = applyBonus ? request.amount * 2 : request.amount;

  // تحديث رصيد المستخدم
  updateUserBalance(request.userId, finalAmount);

  saveToDB(DB_KEYS.DEPOSITS, deposits);
  console.log(`[MockDB] Deposit approved: ${requestId}, Amount: ${finalAmount}`);
  return true;
}

export function rejectDeposit(requestId: string): boolean {
  const deposits = getFromDB<DepositRequest[]>(DB_KEYS.DEPOSITS, []);
  const index = deposits.findIndex(d => d.id === requestId);
  
  if (index === -1) return false;

  deposits[index].status = 'rejected';
  saveToDB(DB_KEYS.DEPOSITS, deposits);
  return true;
}

// --- إدارة السحوبات ---

export function addWithdrawalRequest(request: WithdrawalRequest): void {
  const withdrawals = getFromDB<WithdrawalRequest[]>(DB_KEYS.WITHDRAWALS, []);
  withdrawals.push(request);
  saveToDB(DB_KEYS.WITHDRAWALS, withdrawals);
}

export function getPendingWithdrawals(): WithdrawalRequest[] {
  const withdrawals = getFromDB<WithdrawalRequest[]>(DB_KEYS.WITHDRAWALS, []);
  return withdrawals.filter(w => w.status === 'pending');
}

export function approveWithdrawal(requestId: string): boolean {
  const withdrawals = getFromDB<WithdrawalRequest[]>(DB_KEYS.WITHDRAWALS, []);
  const index = withdrawals.findIndex(w => w.id === requestId);
  
  if (index === -1) return false;

  const request = withdrawals[index];
  request.status = 'approved';
  
  // خصم المبلغ من الرصيد (اختياري، عادة يخصم فور طلب السحب)
  // هنا نفترض أنه خصم مسبقاً، فقط نغير الحالة
  
  saveToDB(DB_KEYS.WITHDRAWALS, withdrawals);
  return true;
}

export function rejectWithdrawal(requestId: string): boolean {
  const withdrawals = getFromDB<WithdrawalRequest[]>(DB_KEYS.WITHDRAWALS, []);
  const index = withdrawals.findIndex(w => w.id === requestId);
  
  if (index === -1) return false;

  const request = withdrawals[index];
  request.status = 'rejected';
  
  // إعادة المبلغ للرصيد في حال الرفض
  updateUserBalance(request.userId, request.amount, true); // true = إضافة (استرداد)
  
  saveToDB(DB_KEYS.WITHDRAWALS, withdrawals);
  return true;
}

// --- إدارة الأرصدة ---

export function updateUserBalance(userId: string, amount: number, isAddition: boolean = true): void {
  const balances = getFromDB<Record<string, UserBalance>>(DB_KEYS.BALANCES, {});
  
  if (!balances[userId]) {
    balances[userId] = { userId, balance: 0, lastUpdated: Date.now() };
  }

  if (isAddition) {
    balances[userId].balance += amount;
  } else {
    balances[userId].balance = Math.max(0, balances[userId].balance - amount);
  }
  
  balances[userId].lastUpdated = Date.now();
  saveToDB(DB_KEYS.BALANCES, balances);
}

export function getUserBalance(userId: string): number {
  const balances = getFromDB<Record<string, UserBalance>>(DB_KEYS.BALANCES, {});
  return balances[userId]?.balance || 0;
}

// --- إعدادات النظام ---

export function setShamCashNumber(number: string): void {
  saveToDB(DB_KEYS.SHAM_CASH, number);
}

export function getShamCashNumber(): string {
  return getFromDB<string>(DB_KEYS.SHAM_CASH, '0912345678'); // رقم افتراضي
}

// --- مزامنة تلقائية عند فتح الصفحة ---
export function syncDataOnLoad(): void {
  // هذه الدالة تستدعى عند تحميل التطبيق لضمان جلب أحدث البيانات
  console.log('[MockDB] Data synced on load');
}
