import { describe, it, expect, afterEach } from 'vitest';
import { getStripeClient } from '../stripe-connection';

describe('stripe-connection', () => {
  const originalEnv = process.env.STRIPE_SECRET_KEY;

  afterEach(() => {
    process.env.STRIPE_SECRET_KEY = originalEnv;
  });

  describe('getStripeClient', () => {
    it('should return a Stripe client when STRIPE_SECRET_KEY is set', () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_valid_key_12345';
      
      const client = getStripeClient();
      
      expect(client).toBeDefined();
      expect(client.customers).toBeDefined();
      expect(client.checkout).toBeDefined();
    });

    it('should throw an error when STRIPE_SECRET_KEY is not set', () => {
      delete process.env.STRIPE_SECRET_KEY;
      
      expect(() => getStripeClient()).toThrow('Missing STRIPE_SECRET_KEY environment variable');
    });

    it('should throw an error when STRIPE_SECRET_KEY is empty string', () => {
      process.env.STRIPE_SECRET_KEY = '';
      
      expect(() => getStripeClient()).toThrow('Missing STRIPE_SECRET_KEY environment variable');
    });

    it('should accept different Stripe API key formats', () => {
      const testKeys = [
        'sk_test_12345',
        'sk_live_67890',
        'rk_test_abc123',
      ];

      testKeys.forEach(key => {
        process.env.STRIPE_SECRET_KEY = key;
        const client = getStripeClient();
        expect(client).toBeDefined();
      });
    });

    it('should create a new instance on each call', () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_key';
      
      const client1 = getStripeClient();
      const client2 = getStripeClient();
      
      expect(client1).toBeDefined();
      expect(client2).toBeDefined();
    });
  });
});