import { create } from 'zustand';
import { api } from '@/lib/api';

interface CreditBalance {
  credits: number;
  freeInterviewsUsed: number;
  freeInterviewsRemaining: number;
}

interface CreditStore {
  credits: number;
  freeInterviewsUsed: number;
  freeInterviewsRemaining: number;
  loading: boolean;
  error: string | null;
  fetchCredits: () => Promise<void>;
  setCredits: (credits: number) => void;
}

export const useCreditStore = create<CreditStore>((set) => ({
  credits: 0,
  freeInterviewsUsed: 0,
  freeInterviewsRemaining: 4,
  loading: true,
  error: null,

  fetchCredits: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.get<CreditBalance>('/api/credits/balance');
      set({
        credits: response.data.credits,
        freeInterviewsUsed: response.data.freeInterviewsUsed,
        freeInterviewsRemaining: response.data.freeInterviewsRemaining,
        loading: false,
      });
    } catch (err) {
      console.error('Failed to fetch credits:', err);
      set({ error: 'Failed to load credits', loading: false });
    }
  },

  setCredits: (credits: number) => {
    set({ credits });
  },
}));

// useCreditBalance hook for backward compatibility
export function useCreditBalance() {
  const store = useCreditStore();
  
  return {
    credits: store.credits,
    freeInterviewsUsed: store.freeInterviewsUsed,
    freeInterviewsRemaining: store.freeInterviewsRemaining,
    loading: store.loading,
    error: store.error,
    refetch: store.fetchCredits,
  };
}
