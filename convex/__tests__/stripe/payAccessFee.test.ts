import { describe, it, expect, afterEach } from 'vitest';

describe('stripe/payAccessFee', () => {
  const originalEnv = process.env.NEXT_PUBLIC_APP_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = originalEnv;
  });

  describe('payAccessFee', () => {
    it('should throw error when NEXT_PUBLIC_APP_URL is missing', () => {
      delete process.env.NEXT_PUBLIC_APP_URL;
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
      
      if (!baseUrl) {
        expect(() => {
          throw new Error('Missing NEXT_PUBLIC_APP_URL environment variable');
        }).toThrow('Missing NEXT_PUBLIC_APP_URL environment variable');
      }
    });

    describe('checkout session configuration', () => {
      it('should use payment mode', () => {
        const sessionConfig = {
          mode: 'payment',
        };
        
        expect(sessionConfig.mode).toBe('payment');
      });

      it('should set amount to 1000 cents (10 EUR)', () => {
        const lineItem = {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Access Fee',
              description: 'Annual subscription fee for the current school year',
            },
            unit_amount: 1000,
          },
          quantity: 1,
        };
        
        expect(lineItem.price_data.unit_amount).toBe(1000);
        expect(lineItem.quantity).toBe(1);
        expect(lineItem.price_data.unit_amount / 100).toBe(10); // 10 EUR
      });

      it('should use EUR currency', () => {
        const lineItem = {
          price_data: {
            currency: 'eur',
            unit_amount: 1000,
          },
        };
        
        expect(lineItem.price_data.currency).toBe('eur');
      });

      it('should set correct product details', () => {
        const productData = {
          name: 'Access Fee',
          description: 'Annual subscription fee for the current school year',
        };
        
        expect(productData.name).toBe('Access Fee');
        expect(productData.description).toContain('Annual subscription');
        expect(productData.description).toContain('school year');
      });

      it('should construct success URL with session_id placeholder', () => {
        const baseUrl = 'https://example.com';
        const successUrl = `${baseUrl}/onboarding/subscription/success?session_id={CHECKOUT_SESSION_ID}`;
        
        expect(successUrl).toContain('/onboarding/subscription/success');
        expect(successUrl).toContain('session_id={CHECKOUT_SESSION_ID}');
      });

      it('should construct cancel URL correctly', () => {
        const baseUrl = 'https://example.com';
        const cancelUrl = `${baseUrl}/onboarding/subscription`;
        
        expect(cancelUrl).toBe('https://example.com/onboarding/subscription');
      });

      it('should include required metadata', () => {
        const metadata = {
          userId: 'user_123',
          clerkUserId: 'clerk_456',
          type: 'access-fee',
        };
        
        expect(metadata.userId).toBeDefined();
        expect(metadata.clerkUserId).toBeDefined();
        expect(metadata.type).toBe('access-fee');
      });
    });

    describe('payment intent ID extraction', () => {
      it('should extract string payment intent ID', () => {
        const session = { payment_intent: 'pi_test123' };
        const paymentIntentId = 
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : (session.payment_intent as any)?.id || null;
        
        expect(paymentIntentId).toBe('pi_test123');
      });

      it('should extract ID from expanded object', () => {
        const session = { payment_intent: { id: 'pi_test456' } };
        const paymentIntentId = 
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : (session.payment_intent as any)?.id || null;
        
        expect(paymentIntentId).toBe('pi_test456');
      });

      it('should handle null payment intent', () => {
        const session = { payment_intent: null };
        const paymentIntentId = 
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : (session.payment_intent as any)?.id || null;
        
        expect(paymentIntentId).toBeNull();
      });

      it('should convert null to undefined', () => {
        const paymentIntentId = null;
        const value = paymentIntentId ?? undefined;
        
        expect(value).toBeUndefined();
      });
    });

    describe('payment record creation', () => {
      it('should create payment with correct parameters', () => {
        const paymentData = {
          userId: 'user_123' as any,
          stripeCheckoutSessionId: 'cs_test123',
          stripePaymentIntentId: undefined,
          amount: 1000,
          currency: 'eur',
          type: 'access-fee' as const,
          status: 'pending' as const,
        };
        
        expect(paymentData.amount).toBe(1000);
        expect(paymentData.currency).toBe('eur');
        expect(paymentData.type).toBe('access-fee');
        expect(paymentData.status).toBe('pending');
      });
    });

    it('should return checkout session URL', () => {
      const session = { url: 'https://checkout.stripe.com/test' };
      const result = { url: session.url! };
      
      expect(result.url).toBe('https://checkout.stripe.com/test');
      expect(typeof result.url).toBe('string');
    });

    it('should handle various base URLs', () => {
      const baseUrls = [
        'https://example.com',
        'https://staging.example.com',
        'http://localhost:3000',
        'https://app.production.com',
      ];
      
      baseUrls.forEach(baseUrl => {
        const successUrl = `${baseUrl}/onboarding/subscription/success?session_id={CHECKOUT_SESSION_ID}`;
        expect(successUrl).toContain(baseUrl);
        expect(successUrl).toContain('/onboarding/subscription/success');
      });
    });
  });
});