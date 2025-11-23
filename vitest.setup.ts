import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables
process.env.NEXT_PUBLIC_APP_URL = 'https://test.example.com';
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key';