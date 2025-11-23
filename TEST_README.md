# Test Suite Documentation

## Overview
This test suite provides comprehensive coverage for the Stripe payment integration features added to the boterhammen-op-school project.

## Test Files Created

### Configuration Files
- `vitest.config.ts` - Vitest configuration with React support
- `vitest.setup.ts` - Global test setup and mocks

### Test Files
1. **lib/__tests__/stripe-connection.test.ts** (5 tests)
   - Stripe client initialization
   - Environment variable validation
   - API key format validation

2. **convex/__tests__/payments/create.test.ts** (6 tests)
   - Payment record creation
   - Field validation
   - Status and type handling

3. **convex/__tests__/users/update.test.ts** (18 tests)
   - User access expiration calculations
   - Webhook processing logic
   - Date boundary conditions

4. **convex/__tests__/stripe/checkCustomer.test.ts** (9 tests)
   - Customer creation logic
   - User data validation
   - Email format validation

5. **convex/__tests__/stripe/payAccessFee.test.ts** (21 tests)
   - Checkout session configuration
   - Payment intent extraction
   - URL construction

6. **app/__tests__/onboarding/subscription/success.test.tsx** (20 tests)
   - React component behavior
   - URL parameter handling
   - Loading and error states

7. **convex/__tests__/integration/payment-flow.test.ts** (9 tests)
   - End-to-end flow scenarios
   - Webhook processing
   - Edge cases

8. **convex/__tests__/utils/date-helpers.test.ts** (9 tests)
   - Date calculation logic
   - Timestamp comparisons

## Installation

```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitest/ui @vitest/coverage-v8
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Test Coverage

The test suite covers:
- ✅ Environment validation
- ✅ Stripe API integration
- ✅ Payment flow (creation, success, failure)
- ✅ User access management
- ✅ Date calculations
- ✅ Webhook processing
- ✅ React component rendering
- ✅ Error handling
- ✅ Edge cases

## Notes

- Tests are designed to run without a live Convex backend
- Mock implementations are provided for Convex functions
- For full integration testing, consider using the `convex-test` package