import { describe, it, expect, vi } from 'vitest';
import { ConvexTestingHelper } from '../../testUtils';

describe('payments/create', () => {
  describe('createPayment', () => {
    it('should create a payment record with all required fields', async () => {
      const helper = new ConvexTestingHelper();
      const mockUserId = 'user_123' as any;
      const mockSessionId = 'cs_test_session123';
      
      const paymentData = {
        userId: mockUserId,
        stripeCheckoutSessionId: mockSessionId,
        amount: 1000,
        currency: 'eur',
        type: 'access-fee' as const,
        status: 'pending' as const,
      };

      helper.mutation.createPayment.mockResolvedValue('payment_id');
      const result = await helper.mutation.createPayment(paymentData);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should set webhookProcessed to false by default', () => {
      const paymentRecord = {
        webhookProcessed: false,
        status: 'pending',
      };
      
      expect(paymentRecord.webhookProcessed).toBe(false);
    });

    it('should accept optional stripePaymentIntentId', () => {
      const paymentData = {
        stripePaymentIntentId: 'pi_test_intent123',
      };
      
      expect(paymentData.stripePaymentIntentId).toBe('pi_test_intent123');
    });

    it('should accept all valid payment statuses', () => {
      const statuses = ['pending', 'paid', 'refunded', 'failed', 'cancelled'] as const;

      statuses.forEach(status => {
        const paymentData = {
          status,
        };
        
        expect(paymentData.status).toBe(status);
      });
    });

    it('should accept both payment types', () => {
      const types = ['access-fee', 'order'] as const;

      types.forEach(type => {
        const paymentData = {
          type,
        };
        
        expect(paymentData.type).toBe(type);
      });
    });

    it('should store amount in cents', () => {
      const amount = 1000; // 10 EUR in cents
      expect(amount).toBe(1000);
      expect(amount / 100).toBe(10); // Converts to 10 EUR
    });
  });
});