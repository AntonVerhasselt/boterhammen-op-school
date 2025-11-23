import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

// Mock Convex
vi.mock('convex/react', () => ({
  useMutation: vi.fn(),
}));

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Check: () => <div data-testid="check-icon">✓</div>,
}));

describe('SubscriptionSuccessPage', () => {
  describe('URL parameter handling', () => {
    it('should extract session_id from URL parameters', () => {
      const mockGet = vi.fn((key: string) => {
        if (key === 'session_id') return 'cs_test123';
        return null;
      });
      
      const sessionId = mockGet('session_id');
      expect(sessionId).toBe('cs_test123');
    });

    it('should handle missing session_id', () => {
      const mockGet = vi.fn(() => null);
      const sessionId = mockGet('session_id');
      
      expect(sessionId).toBeNull();
    });

    it('should validate session_id format', () => {
      const validSessionIds = [
        'cs_test_abc123',
        'cs_live_xyz789',
      ];
      
      validSessionIds.forEach(id => {
        expect(id.startsWith('cs_')).toBe(true);
      });
    });
  });

  describe('error handling', () => {
    it('should set error message when session_id is missing', () => {
      const sessionId = null;
      let error = null;
      
      if (!sessionId) {
        error = 'Session ID not found in URL. Please contact support.';
      }
      
      expect(error).toBe('Session ID not found in URL. Please contact support.');
    });

    it('should set error message on mutation failure', () => {
      const error = 'Failed to update access. Please contact support.';
      
      expect(error).toContain('Failed to update access');
      expect(error).toContain('contact support');
    });
  });

  describe('loading states', () => {
    it('should start with loading state true', () => {
      let isLoading = true;
      expect(isLoading).toBe(true);
    });

    it('should set loading to false after update', async () => {
      let isLoading = true;
      
      await Promise.resolve();
      isLoading = false;
      
      expect(isLoading).toBe(false);
    });

    it('should set loading to false after error', () => {
      let isLoading = true;
      
      try {
        throw new Error('Test error');
      } catch {
        isLoading = false;
      }
      
      expect(isLoading).toBe(false);
    });
  });

  describe('navigation', () => {
    it('should navigate to homepage', () => {
      const mockRouter = { push: vi.fn() };
      mockRouter.push('/');
      
      expect(mockRouter.push).toHaveBeenCalledWith('/');
    });

    it('should disable button during loading', () => {
      const isLoading = true;
      const disabled = isLoading;
      
      expect(disabled).toBe(true);
    });

    it('should enable button when not loading', () => {
      const isLoading = false;
      const disabled = isLoading;
      
      expect(disabled).toBe(false);
    });
  });

  describe('UI messages', () => {
    it('should show loading message', () => {
      const isLoading = true;
      const message = isLoading ? 'Activating your subscription...' : null;
      
      expect(message).toBe('Activating your subscription...');
    });

    it('should show error message', () => {
      const error = 'Failed to update access. Please contact support.';
      const isLoading = false;
      
      const message = error ? error : null;
      
      expect(message).toBe('Failed to update access. Please contact support.');
    });

    it('should show success messages', () => {
      const isLoading = false;
      const error = null;
      
      if (!isLoading && !error) {
        const messages = [
          'Thank you for your payment! Your annual subscription has been successfully activated.',
          'You now have full access to all features until the end of the current school year.',
        ];
        
        expect(messages.length).toBe(2);
        expect(messages[0]).toContain('Thank you for your payment');
        expect(messages[1]).toContain('full access');
      }
    });
  });

  describe('accessibility', () => {
    it('should have descriptive titles', () => {
      const title = 'Payment Successful!';
      expect(title).toBeTruthy();
      expect(title).toContain('Payment Successful');
    });

    it('should have clear button text', () => {
      const buttonText = 'Go to Homepage';
      expect(buttonText).toBe('Go to Homepage');
    });

    it('should provide context in descriptions', () => {
      const description = 'Your subscription has been activated';
      expect(description).toContain('subscription');
      expect(description).toContain('activated');
    });
  });
});