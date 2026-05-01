import React, { useState } from "react";
import { X, Wallet, ArrowUpRight, ArrowDownLeft, Copy, CheckCircle, AlertCircle, MessageCircle } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { notifyWalletChargeRequest, notifyWithdrawalRequest } from "../services/telegram";
import toast from "react-hot-toast";

interface WalletModalProps {
  onClose: () => void;
}

const SHAM_CASH_NUMBER = "0991234567"; // رقم شام كاش للتحويل

const WalletModal: React.FC<WalletModalProps> = ({ onClose }) => {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<"overview" | "charge" | "withdraw">("overview");
  const [chargeAmount, setChargeAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [shamCashNumber, setShamCashNumber] = useState("");
  const [copied, setCopied] = useState(false);
  const [chargeLoading, setChargeLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  if (!user) return null;

  const canWithdraw = user.walletBalance >= 500;

  const copyNumber = () => {
    navigator.clipboard.writeText(SHAM_CASH_NUMBER);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("تم نسخ الرقم!");
  };

  const handleChargeRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(chargeAmount);
    if (!amount || amount < 100) {
      toast.error("الحد الأدنى للشحن هو 100 ليرة");
      return;
    }
    if (!transactionId.trim()) {
      toast.error("يرجى إدخال رقم عملية التحويل");
      return;
    }

    setChargeLoading(true);

    const timestamp = new Date().toLocaleString("ar-SY", {
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

    try {
      await notifyWalletChargeRequest({
        userId: user.id,
        userName: user.name,
        amount,
        transactionId: transactionId.trim(),
        timestamp,
      });

      toast.success(
        "تم إرسال طلب الشحن للمشرفين! سيتم تأكيده خلال دقائق ✅",
        { duration: 5000 }
      );
      setChargeAmount("");
      setTransactionId("");
      setTab("overview");
    } catch {
      toast.error("حدث خطأ، يرجى المحاولة مرة أخرى");
    } finally {
      setChargeLoading(false);
    }
  };

  const handleWithdrawRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);

    if (!canWithdraw) {
      toast.error("الرصيد يجب أن يكون 500 ليرة على الأقل للسحب");
      return;
    }
    if (!amount || amount < 500) {
      toast.error("الحد الأدنى للسحب هو 500 ليرة");
      return;
    }
    if (amount > user.walletBalance) {
      toast.error("الرصيد غير كافٍ");
      return;
    }
    if (!shamCashNumber.trim()) {
      toast.error("يرجى إدخال رقم شام كاش للاستلام");
      return;
    }

    setWithdrawLoading(true);

    const timestamp = new Date().toLocaleString("ar-SY", {
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

    try {
      await notifyWithdrawalRequest({
        userId: user.id,
        userName: user.name,
        amount,
        walletBalance: user.walletBalance,
        shamCashNumber: shamCashNumber.trim(),
        timestamp,
      });

      toast.success(
        "تم إرسال طلب السحب! سيتواصل معك المشرفون قريباً 💸",
        { duration: 6000 }
      );
      setWithdrawAmount("");
      setShamCashNumber("");
      setTab("overview");
    } catch {
      toast.error("حدث خطأ، يرجى المحاولة مرة أخرى");
    } finally {
      setWithdrawLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content animate-fade-in" style={{ maxWidth: "520px" }}>
        {/* رأس النافذة */}
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "rgba(201,168,76,0.2)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #8a6a1e, #c9a84c)" }}>
              <Wallet size={18} style={{ color: "#0a0a14" }} />
            </div>
            <div>
              <h2 className="font-bold gold-text font-cairo">المحفظة والمكافآت</h2>
              <p className="text-xs" style={{ color: "#a09880" }}>سوق الشام الإلكتروني</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-red-900/30" style={{ color: "#a09880" }}>
            <X size={18} />
          </button>
        </div>

        {/* بطاقة الرصيد */}
        <div className="p-5">
          <div className="wallet-card mb-5">
            <div className="relative z-10">
              <div className="text-xs font-medium opacity-70 mb-1 font-cairo">الرصيد المتاح</div>
              <div className="text-3xl font-bold font-cairo mb-3">
                {user.walletBalance.toLocaleString("ar-SY")}
                <span className="text-base mr-2 opacity-80">ل.س.ج</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs opacity-70">نقاط الولاء</div>
                  <div className="font-bold">⭐ {user.loyaltyPoints.toLocaleString("ar-SY")}</div>
                </div>
                <div>
                  <div className="text-xs opacity-70">إجمالي المشحون</div>
                  <div className="font-bold">{user.totalCharged.toLocaleString("ar-SY")} ل.س.ج</div>
                </div>
                <div>
                  <div className="text-xs opacity-70">عمليات الشراء</div>
                  <div className="font-bold">{user.totalPurchases}</div>
                </div>
              </div>
              {/* رقم المستخدم */}
              <div className="mt-3 pt-3 border-t border-black/20">
                <div className="text-xs opacity-70 font-cairo">معرّف الحساب</div>
                <div className="text-xs font-mono font-bold opacity-90">{user.id}</div>
              </div>
            </div>
          </div>

          {/* تبويبات */}
          <div className="flex gap-2 mb-5">
            {[
              { id: "overview", label: "نظرة عامة", icon: <Wallet size={13} /> },
              { id: "charge", label: "شحن الرصيد", icon: <ArrowUpRight size={13} /> },
              { id: "withdraw", label: "سحب الأرباح", icon: <ArrowDownLeft size={13} /> },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as typeof tab)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  tab === t.id ? "gold-btn" : "hover:bg-yellow-900/20"
                }`}
                style={tab !== t.id ? { color: "#a09880", border: "1px solid rgba(201,168,76,0.15)" } : {}}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* نظرة عامة */}
          {tab === "overview" && (
            <div className="space-y-3 animate-fade-in">
              <div className="p-4 rounded-2xl" style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.15)" }}>
                <div className="font-bold text-sm mb-3" style={{ color: "#f0d080" }}>🎁 نظام المكافآت</div>
                <div className="space-y-2 text-xs" style={{ color: "#a09880" }}>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={13} style={{ color: "#22c55e" }} />
                    <span>احصل على <strong style={{ color: "#f0d080" }}>20 ليرة</strong> مجاناً عند التسجيل</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={13} style={{ color: "#22c55e" }} />
                    <span>ضعف المبلغ المشحون كمكافأة من المشرفين</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={13} style={{ color: "#22c55e" }} />
                    <span>نقاط ولاء مع كل عملية شراء</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={13} style={{ color: "#22c55e" }} />
                    <span>إمكانية السحب عند بلوغ <strong style={{ color: "#f0d080" }}>500 ليرة</strong></span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setTab("charge")}
                  className="gold-btn py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                >
                  <ArrowUpRight size={15} />
                  شحن الرصيد
                </button>
                <button
                  onClick={() => setTab("withdraw")}
                  className="py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: canWithdraw ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${canWithdraw ? "rgba(34,197,94,0.4)" : "rgba(201,168,76,0.15)"}`,
                    color: canWithdraw ? "#22c55e" : "#a09880",
                  }}
                >
                  <ArrowDownLeft size={15} />
                  سحب الأرباح
                </button>
              </div>

              {!canWithdraw && (
                <div className="p-3 rounded-xl flex items-start gap-2" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <AlertCircle size={14} style={{ color: "#ef4444", flexShrink: 0, marginTop: 2 }} />
                  <div className="text-xs" style={{ color: "#fca5a5" }}>
                    تحتاج إلى <strong>{(500 - user.walletBalance).toFixed(0)} ليرة</strong> إضافية لفتح ميزة السحب
                    (الحد الأدنى: 500 ليرة)
                  </div>
                </div>
              )}
            </div>
          )}

          {/* شحن الرصيد */}
          {tab === "charge" && (
            <div className="animate-fade-in">
              {/* معلومات شام كاش */}
              <div className="p-4 rounded-2xl mb-4" style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.3)" }}>
                <div className="font-bold text-sm mb-2" style={{ color: "#f0d080" }}>
                  💳 طريقة الدفع - شام كاش
                </div>
                <div className="text-xs mb-3" style={{ color: "#a09880" }}>
                  حوّل المبلغ إلى رقم شام كاش التالي:
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(0,0,0,0.3)" }}>
                  <span className="font-bold text-lg" style={{ color: "#f0d080" }}>{SHAM_CASH_NUMBER}</span>
                  <button
                    onClick={copyNumber}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    style={{
                      background: copied ? "rgba(34,197,94,0.2)" : "rgba(201,168,76,0.2)",
                      color: copied ? "#22c55e" : "#c9a84c",
                    }}
                  >
                    {copied ? <CheckCircle size={12} /> : <Copy size={12} />}
                    {copied ? "تم النسخ" : "نسخ"}
                  </button>
                </div>
                <div className="text-xs mt-2" style={{ color: "#a09880" }}>
                  ⚡ بعد التحويل، أدخل رقم العملية أدناه وسيتم تأكيد الشحن خلال دقائق
                </div>
                <div className="text-xs mt-1" style={{ color: "#f0d080" }}>
                  🎁 سيحصل رصيدك على مكافأة إضافية تقديراً لثقتك بنا!
                </div>
              </div>

              <form onSubmit={handleChargeRequest} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "#a09880" }}>
                    المبلغ المراد شحنه (ل.س.ج)
                  </label>
                  <input
                    type="number"
                    value={chargeAmount}
                    onChange={(e) => setChargeAmount(e.target.value)}
                    placeholder="الحد الأدنى 100 ليرة"
                    min="100"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "#a09880" }}>
                    رقم عملية التحويل من شام كاش
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="مثال: TXN123456789"
                    className="input-field"
                    dir="ltr"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={chargeLoading}
                  className="gold-btn w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {chargeLoading ? (
                    <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> جارٍ الإرسال...</>
                  ) : (
                    "إرسال طلب الشحن ✅"
                  )}
                </button>
              </form>
            </div>
          )}

          {/* سحب الأرباح */}
          {tab === "withdraw" && (
            <div className="animate-fade-in">
              {!canWithdraw ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">🔒</div>
                  <div className="font-bold mb-2" style={{ color: "#f0d080" }}>ميزة السحب مقفلة</div>
                  <div className="text-sm" style={{ color: "#a09880" }}>
                    الرصيد الحالي: <strong style={{ color: "#f0d080" }}>{user.walletBalance.toFixed(0)} ل.س.ج</strong>
                  </div>
                  <div className="text-sm mt-1" style={{ color: "#a09880" }}>
                    يلزمك <strong style={{ color: "#ef4444" }}>{(500 - user.walletBalance).toFixed(0)} ل.س.ج</strong> إضافية
                  </div>
                  <div className="mt-4 p-3 rounded-xl" style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)" }}>
                    <div className="text-xs" style={{ color: "#a09880" }}>
                      الحد الأدنى للسحب: <strong style={{ color: "#f0d080" }}>500 ليرة سورية جديدة</strong>
                    </div>
                  </div>
                  <button
                    onClick={() => setTab("charge")}
                    className="gold-btn mt-4 px-6 py-2.5 rounded-xl font-bold text-sm"
                  >
                    شحن الرصيد الآن
                  </button>
                </div>
              ) : (
                <>
                  <div className="p-3 rounded-xl mb-4 flex items-center gap-2" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)" }}>
                    <MessageCircle size={16} style={{ color: "#22c55e" }} />
                    <div className="text-xs" style={{ color: "#86efac" }}>
                      رصيدك مؤهل للسحب! سيتواصل معك مشرفو النظام عبر تيليجرام لتأكيد العملية.
                    </div>
                  </div>

                  <form onSubmit={handleWithdrawRequest} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "#a09880" }}>
                        مبلغ السحب (ل.س.ج) - الحد الأدنى 500
                      </label>
                      <input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder={`الرصيد المتاح: ${user.walletBalance.toFixed(0)}`}
                        min="500"
                        max={user.walletBalance}
                        className="input-field"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "#a09880" }}>
                        رقم شام كاش للاستلام
                      </label>
                      <input
                        type="text"
                        value={shamCashNumber}
                        onChange={(e) => setShamCashNumber(e.target.value)}
                        placeholder="09xxxxxxxx"
                        className="input-field"
                        dir="ltr"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={withdrawLoading}
                      className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
                      style={{ background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.4)", color: "#22c55e" }}
                    >
                      {withdrawLoading ? (
                        <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> جارٍ الإرسال...</>
                      ) : (
                        <>
                          <MessageCircle size={15} />
                          إرسال طلب السحب للمشرفين 💸
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletModal;
