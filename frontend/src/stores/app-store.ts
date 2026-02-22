import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface Modal {
  id: string;
  isOpen: boolean;
  data?: unknown;
}

interface AppState {
  // Sidebar state
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;

  // Modal state
  modals: Modal[];

  // Global loading state
  isGlobalLoading: boolean;

  // 게시글 목록 URL (상세→목록 복귀용)
  lastListUrl: string | null;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSidebarCollapse: () => void;
  setSidebarCollapsed: (isCollapsed: boolean) => void;

  openModal: (id: string, data?: unknown) => void;
  closeModal: (id: string) => void;
  isModalOpen: (id: string) => boolean;
  getModalData: <T>(id: string) => T | undefined;

  setGlobalLoading: (isLoading: boolean) => void;

  setLastListUrl: (url: string | null) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      immer<AppState>((set, get) => ({
        // Initial state
        isSidebarOpen: true,
        isSidebarCollapsed: false,
        modals: [],
        isGlobalLoading: false,
        lastListUrl: null,

        // Sidebar actions
        toggleSidebar: () =>
          set((state) => {
            state.isSidebarOpen = !state.isSidebarOpen;
          }),

        setSidebarOpen: (isOpen: boolean) =>
          set((state) => {
            state.isSidebarOpen = isOpen;
          }),

        toggleSidebarCollapse: () =>
          set((state) => {
            state.isSidebarCollapsed = !state.isSidebarCollapsed;
          }),

        setSidebarCollapsed: (isCollapsed: boolean) =>
          set((state) => {
            state.isSidebarCollapsed = isCollapsed;
          }),

        // Modal actions
        openModal: (id: string, data?: unknown) =>
          set((state) => {
            const existingModal = state.modals.find((m) => m.id === id);
            if (existingModal) {
              existingModal.isOpen = true;
              existingModal.data = data;
            } else {
              state.modals.push({ id, isOpen: true, data });
            }
          }),

        closeModal: (id: string) =>
          set((state) => {
            const modal = state.modals.find((m) => m.id === id);
            if (modal) {
              modal.isOpen = false;
            }
          }),

        isModalOpen: (id: string) => {
          const modal = get().modals.find((m) => m.id === id);
          return modal?.isOpen ?? false;
        },

        getModalData: <T,>(id: string): T | undefined => {
          const modal = get().modals.find((m) => m.id === id);
          return modal?.data as T | undefined;
        },

        // Loading actions
        setGlobalLoading: (isLoading: boolean) =>
          set((state) => {
            state.isGlobalLoading = isLoading;
          }),

        // 게시글 목록 URL 저장/복원
        setLastListUrl: (url: string | null) =>
          set((state) => {
            state.lastListUrl = url;
          }),
      })),
      {
        name: 'app-storage',
        partialize: (state) => ({
          isSidebarOpen: state.isSidebarOpen,
          isSidebarCollapsed: state.isSidebarCollapsed,
          lastListUrl: state.lastListUrl,
        }),
      },
    ),
    {
      name: 'AppStore',
      // Disable devtools in production to prevent state exposure in Redux DevTools
      enabled: process.env.NODE_ENV !== 'production',
    },
  ),
);
