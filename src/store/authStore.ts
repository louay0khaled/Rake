// ======================================================
// Auth Store - Zustand State Management
// إدارة حالة المستخدم والمصادقة
// ======================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { notifyNewRegistration, notifyUserLogin } from "../services/telegram";
import { getUserBalance } from "../services/mockDB";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  walletBalance: number;
  loyaltyPoints: number;
  createdAt: string;
  totalPurchases: number;
  totalCharged: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // تسجيل المستخدمين المحليين (محاكاة قاعدة بيانات)
  registeredUsers: Record<string, { user: User; passwordHash: string }>;

  register: (
    name: string,
    email: string,
    password: string,
    phone?: string
  ) => Promise<{ success: boolean; message: string }>;

  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message: string }>;

  logout: () => void;

  updateWalletBalance: (amount: number) => void;
  addLoyaltyPoints: (points: number) => void;
  deductWalletBalance: (amount: number) => boolean;
  updateTotalCharged: (amount: number) => void;
}

// تشفير بسيط للكلمة السرية
function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16) + "_" + btoa(password.length.toString());
}

function generateUserId(): string {
  return "USR_" + Date.now().toString(36).toUpperCase() + "_" + Math.random().toString(36).substring(2, 7).toUpperCase();
}

function getCurrentTimestamp(): string {
  return new Date().toLocaleString("ar-SY", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    calendar: "gregory",
  });
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      registeredUsers: {},

      register: async (name, email, password, phone) => {
        set({ isLoading: true });

        const { registeredUsers } = get();

        // التحقق من عدم وجود الحساب مسبقاً
        if (registeredUsers[email.toLowerCase()]) {
          set({ isLoading: false });
          return { success: false, message: "البريد الإلكتروني مسجّل مسبقاً" };
        }

        // التحقق من صحة البيانات
        if (name.trim().length < 2) {
          set({ isLoading: false });
          return { success: false, message: "يجب أن يكون الاسم حرفين على الأقل" };
        }

        if (password.length < 6) {
          set({ isLoading: false });
          return { success: false, message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" };
        }

        await new Promise((r) => setTimeout(r, 800));

        const userId = generateUserId();
        const timestamp = getCurrentTimestamp();

        const newUser: User = {
          id: userId,
          name: name.trim(),
          email: email.toLowerCase().trim(),
          phone: phone?.trim(),
          walletBalance: 20, // 20 ليرة مكافأة الانضمام
          loyaltyPoints: 100,
          createdAt: timestamp,
          totalPurchases: 0,
          totalCharged: 0,
        };

        const passwordHash = hashPassword(password);

        set((state) => ({
          registeredUsers: {
            ...state.registeredUsers,
            [email.toLowerCase()]: { user: newUser, passwordHash },
          },
          user: newUser,
          isAuthenticated: true,
          isLoading: false,
        }));

        // إرسال إشعار لمشرفي النظام
        notifyNewRegistration({
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          userId: newUser.id,
          timestamp,
        }).catch(console.error);

        return { success: true, message: "تم إنشاء الحساب بنجاح! مرحباً بك في سوق الشام 🎉" };
      },

      login: async (email, password) => {
        set({ isLoading: true });

        await new Promise((r) => setTimeout(r, 600));

        const { registeredUsers } = get();
        const emailKey = email.toLowerCase().trim();
        const stored = registeredUsers[emailKey];

        if (!stored) {
          set({ isLoading: false });
          return { success: false, message: "البريد الإلكتروني غير مسجّل" };
        }

        const passwordHash = hashPassword(password);
        if (stored.passwordHash !== passwordHash) {
          set({ isLoading: false });
          return { success: false, message: "كلمة المرور غير صحيحة" };
        }

        const timestamp = getCurrentTimestamp();

        set({
          user: stored.user,
          isAuthenticated: true,
          isLoading: false,
        });

        // إرسال إشعار تسجيل الدخول
        notifyUserLogin({
          name: stored.user.name,
          email: stored.user.email,
          userId: stored.user.id,
          timestamp,
        }).catch(console.error);

        return { success: true, message: `مرحباً بعودتك ${stored.user.name}! 👋` };
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      updateWalletBalance: (amount) => {
        set((state) => {
          if (!state.user) return state;
          // الحصول على الرصيد المحدث من قاعدة البيانات المحلية لضمان المزامنة
          const dbBalance = getUserBalance(state.user.id);
          const newBalance = dbBalance > 0 ? dbBalance : state.user.walletBalance + amount;
          
          const updatedUser = {
            ...state.user,
            walletBalance: newBalance,
          };
          // تحديث في قاعدة البيانات المحلية أيضاً
          const updatedRegistered = { ...state.registeredUsers };
          if (updatedRegistered[state.user.email]) {
            updatedRegistered[state.user.email] = {
              ...updatedRegistered[state.user.email],
              user: updatedUser,
            };
          }
          return { user: updatedUser, registeredUsers: updatedRegistered };
        });
      },

      addLoyaltyPoints: (points) => {
        set((state) => {
          if (!state.user) return state;
          const updatedUser = {
            ...state.user,
            loyaltyPoints: state.user.loyaltyPoints + points,
          };
          const updatedRegistered = { ...state.registeredUsers };
          if (updatedRegistered[state.user.email]) {
            updatedRegistered[state.user.email] = {
              ...updatedRegistered[state.user.email],
              user: updatedUser,
            };
          }
          return { user: updatedUser, registeredUsers: updatedRegistered };
        });
      },

      deductWalletBalance: (amount) => {
        const { user } = get();
        if (!user || user.walletBalance < amount) return false;
        set((state) => {
          if (!state.user) return state;
          const updatedUser = {
            ...state.user,
            walletBalance: state.user.walletBalance - amount,
            totalPurchases: state.user.totalPurchases + 1,
          };
          const updatedRegistered = { ...state.registeredUsers };
          if (updatedRegistered[state.user.email]) {
            updatedRegistered[state.user.email] = {
              ...updatedRegistered[state.user.email],
              user: updatedUser,
            };
          }
          return { user: updatedUser, registeredUsers: updatedRegistered };
        });
        return true;
      },

      updateTotalCharged: (amount) => {
        set((state) => {
          if (!state.user) return state;
          const updatedUser = {
            ...state.user,
            totalCharged: state.user.totalCharged + amount,
          };
          const updatedRegistered = { ...state.registeredUsers };
          if (updatedRegistered[state.user.email]) {
            updatedRegistered[state.user.email] = {
              ...updatedRegistered[state.user.email],
              user: updatedUser,
            };
          }
          return { user: updatedUser, registeredUsers: updatedRegistered };
        });
      },
    }),
    {
      name: "souq-alsham-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        registeredUsers: state.registeredUsers,
      }),
    }
  )
);
