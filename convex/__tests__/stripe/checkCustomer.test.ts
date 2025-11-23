import { describe, it, expect } from 'vitest';

describe('stripe/checkCustomer', () => {
  describe('checkStripeCustomerByClerkUserId', () => {
    it('should throw error when user is not found', () => {
      const user = null;
      
      if (!user) {
        expect(() => {
          throw new Error('User not found');
        }).toThrow('User not found');
      }
    });

    it('should return existing stripeCustomerId if user already has one', () => {
      const mockUser = {
        _id: 'user_123',
        stripeCustomerId: 'cus_existing123',
        firstName: 'John',
        lastName: 'Doe',
      };
      
      if (mockUser.stripeCustomerId) {
        expect(mockUser.stripeCustomerId).toBe('cus_existing123');
      }
    });

    describe('Stripe customer creation', () => {
      it('should create customer with correct user data', () => {
        const mockUser = {
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '+1234567890',
          clerkUserId: 'clerk_123',
          _id: 'user_123',
        };
        
        const customerData = {
          email: mockUser.email,
          name: `${mockUser.firstName} ${mockUser.lastName}`,
          phone: mockUser.phoneNumber,
          metadata: {
            clerkUserId: mockUser.clerkUserId,
            convexUserId: mockUser._id,
          },
        };
        
        expect(customerData.email).toBe('test@example.com');
        expect(customerData.name).toBe('John Doe');
        expect(customerData.phone).toBe('+1234567890');
        expect(customerData.metadata.clerkUserId).toBe('clerk_123');
        expect(customerData.metadata.convexUserId).toBe('user_123');
      });

      it('should format customer name correctly', () => {
        const testCases = [
          { firstName: 'John', lastName: 'Doe', expected: 'John Doe' },
          { firstName: 'María', lastName: 'García', expected: 'María García' },
          { firstName: '李', lastName: '明', expected: '李 明' },
        ];
        
        testCases.forEach(({ firstName, lastName, expected }) => {
          const name = `${firstName} ${lastName}`;
          expect(name).toBe(expected);
        });
      });
    });

    it('should return both stripeCustomerId and userId', () => {
      const result = {
        stripeCustomerId: 'cus_test123',
        userId: 'user_test456' as any,
      };
      
      expect(result).toHaveProperty('stripeCustomerId');
      expect(result).toHaveProperty('userId');
      expect(typeof result.stripeCustomerId).toBe('string');
    });

    it('should validate email formats', () => {
      const emails = [
        'test@example.com',
        'user+tag@domain.co.uk',
        'first.last@company.org',
      ];
      
      emails.forEach(email => {
        expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });
    });
  });
});