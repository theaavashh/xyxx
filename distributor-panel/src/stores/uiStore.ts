import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { UIState, Notification } from '@/types';

interface UIStore extends UIState {
  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => void;
  removeNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  setLoading: (key: string, isLoading: boolean) => void;
  setError: (key: string, error: string | null) => void;
  clearError: (key: string) => void;
  clearAllErrors: () => void;
}

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        sidebarOpen: true,
        theme: 'light',
        notifications: [],
        loading: {},
        errors: {},

        // Sidebar actions
        toggleSidebar: () => {
          set((state) => ({ sidebarOpen: !state.sidebarOpen }), false, 'toggleSidebar');
        },

        setSidebarOpen: (open) => {
          set({ sidebarOpen: open }, false, 'setSidebarOpen');
        },

        // Theme actions
        setTheme: (theme) => {
          set({ theme }, false, 'setTheme');
          // Apply theme to document
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        },

        // Notification actions
        addNotification: (notification) => {
          const newNotification: Notification = {
            ...notification,
            id: Date.now().toString(),
            isRead: false,
            createdAt: new Date().toISOString(),
          };

          set((state) => ({
            notifications: [newNotification, ...state.notifications].slice(0, 50) // Keep only last 50
          }), false, 'addNotification');

          // Auto-remove notification after expiry
          if (newNotification.expiresAt) {
            const expiryTime = new Date(newNotification.expiresAt).getTime();
            const currentTime = new Date().getTime();
            const timeUntilExpiry = expiryTime - currentTime;

            if (timeUntilExpiry > 0) {
              setTimeout(() => {
                get().removeNotification(newNotification.id);
              }, timeUntilExpiry);
            }
          }

          // Show browser notification if permission granted
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(newNotification.title, {
              body: newNotification.message,
              icon: '/favicon.ico',
            });
          }
        },

        removeNotification: (id) => {
          set((state) => ({
            notifications: state.notifications.filter(n => n.id !== id)
          }), false, 'removeNotification');
        },

        markNotificationAsRead: (id) => {
          set((state) => ({
            notifications: state.notifications.map(n =>
              n.id === id ? { ...n, isRead: true } : n
            )
          }), false, 'markNotificationAsRead');
        },

        clearNotifications: () => {
          set({ notifications: [] }, false, 'clearNotifications');
        },

        // Loading state actions
        setLoading: (key, isLoading) => {
          set((state) => ({
            loading: { ...state.loading, [key]: isLoading }
          }), false, 'setLoading');
        },

        // Error state actions
        setError: (key, error) => {
          set((state) => ({
            errors: { ...state.errors, [key]: error }
          }), false, 'setError');

          // Auto-clear error after 5 seconds
          if (error) {
            setTimeout(() => {
              get().clearError(key);
            }, 5000);
          }
        },

        clearError: (key) => {
          set((state) => {
            const newErrors = { ...state.errors };
            delete newErrors[key];
            return { errors: newErrors };
          }, false, 'clearError');
        },

        clearAllErrors: () => {
          set({ errors: {} }, false, 'clearAllErrors');
        },
      }),
      {
        name: 'distributor-ui-storage',
        partialize: (state) => ({
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
        }),
      }
    )
  )
);

// Selectors for commonly used computed values
export const useUISelectors = {
  unreadCount: () => {
    const { notifications } = useUIStore.getState();
    return notifications.filter(n => !n.isRead).length;
  },

  highPriorityCount: () => {
    const { notifications } = useUIStore.getState();
    return notifications.filter(n => !n.isRead && n.priority === 'high').length;
  },

  hasNotifications: () => {
    const { notifications } = useUIStore.getState();
    return notifications.length > 0;
  },

  isLoading: (key: string) => {
    const { loading } = useUIStore.getState();
    return loading[key] || false;
  },

  hasErrors: () => {
    const { errors } = useUIStore.getState();
    return Object.keys(errors).length > 0;
  },

  getError: (key: string) => {
    const { errors } = useUIStore.getState();
    return errors[key] || null;
  }
};

// Request notification permission on mount
if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}