import { vi } from 'vitest';

/**
 * Test utilities for Convex functions
 * This is a mock implementation - in a real setup, you'd use convex-test package
 */

export class ConvexTestingHelper {
  db = {
    insert: vi.fn().mockResolvedValue('mock_id'),
    get: vi.fn(),
    patch: vi.fn(),
    query: vi.fn(),
  };

  mutation = {
    createPayment: vi.fn(),
    updateUserStripeCustomerId: vi.fn(),
    updateUserAccess: vi.fn(),
    updateUserAccessViaWebhook: vi.fn(),
  };

  query = {
    getUserByClerkUserId: vi.fn(),
  };

  action = {
    checkStripeCustomerByClerkUserId: vi.fn(),
    payAccessFee: vi.fn(),
  };
}

export const mockConvexContext = {
  db: {
    insert: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    query: vi.fn().mockReturnValue({
      withIndex: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      first: vi.fn(),
      unique: vi.fn(),
      collect: vi.fn(),
    }),
  },
  auth: {
    getUserIdentity: vi.fn(),
  },
  runQuery: vi.fn(),
  runMutation: vi.fn(),
  runAction: vi.fn(),
};