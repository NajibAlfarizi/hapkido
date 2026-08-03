"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import ConfirmationDialog, { ConfirmOptions } from '@/components/ui/ConfirmationDialog';
import GlobalLoading from '@/components/ui/GlobalLoading';

interface UiContextType {
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  isLoading: boolean;
  loadingMessage: string;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  executeAction: <T>(actionFn: () => Promise<T>, loadingMessage?: string) => Promise<T | undefined>;
}

const UiContext = createContext<UiContextType | undefined>(undefined);

export function UiProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Memuat data...');

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions | null;
    resolver: ((value: boolean) => void) | null;
  }>({
    isOpen: false,
    options: null,
    resolver: null,
  });

  const showLoading = useCallback((message: string = 'Memuat data...') => {
    setLoadingMessage(message);
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        options,
        resolver: resolve,
      });
    });
  }, []);

  const executeAction = useCallback(
    async <T,>(actionFn: () => Promise<T>, message: string = 'Memproses...'): Promise<T | undefined> => {
      if (isLoading) return; // Prevent double execution
      showLoading(message);
      try {
        return await actionFn();
      } finally {
        hideLoading();
      }
    },
    [isLoading, showLoading, hideLoading]
  );

  const handleConfirm = useCallback(() => {
    if (confirmState.resolver) {
      confirmState.resolver(true);
    }
    setConfirmState({ isOpen: false, options: null, resolver: null });
  }, [confirmState.resolver]);

  const handleCancel = useCallback(() => {
    if (confirmState.resolver) {
      confirmState.resolver(false);
    }
    setConfirmState({ isOpen: false, options: null, resolver: null });
  }, [confirmState.resolver]);

  return (
    <UiContext.Provider
      value={{
        showLoading,
        hideLoading,
        isLoading,
        loadingMessage,
        confirm,
        executeAction,
      }}
    >
      {children}
      <ConfirmationDialog
        isOpen={confirmState.isOpen}
        options={confirmState.options}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
      <GlobalLoading isLoading={isLoading} message={loadingMessage} />
    </UiContext.Provider>
  );
}

export function useUi() {
  const context = useContext(UiContext);
  if (!context) {
    throw new Error('useUi must be used within a UiProvider');
  }
  return context;
}

export function useLoading() {
  const { showLoading, hideLoading, isLoading, loadingMessage, executeAction } = useUi();
  return { showLoading, hideLoading, isLoading, loadingMessage, executeAction };
}

export function useConfirm() {
  const { confirm } = useUi();
  return confirm;
}
