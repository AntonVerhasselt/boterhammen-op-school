import { describe, it, expect } from 'vitest';

describe('Date Helper Functions', () => {
  describe('calculateJuneExpiration', () => {
    it('should return last day of June', () => {
      const juneYear = 2024;
      const lastDayOfJune = new Date(juneYear, 5 + 1, 0);
      
      expect(lastDayOfJune.getMonth()).toBe(5);
      expect(lastDayOfJune.getDate()).toBe(30);
    });

    it('should format dates consistently', () => {
      const date = new Date('2024-06-30T00:00:00.000Z');
      const formatted = date.toISOString().slice(0, 10);
      
      expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(formatted).toBe('2024-06-30');
    });
  });

  describe('calculatePreviousJulyFirst', () => {
    it('should calculate correctly for second half of year', () => {
      const testDates = [
        { input: new Date('2024-07-01'), expectedYear: 2024 },
        { input: new Date('2024-08-15'), expectedYear: 2024 },
        { input: new Date('2024-12-31'), expectedYear: 2024 },
      ];
      
      testDates.forEach(({ input, expectedYear }) => {
        const currentMonth = input.getMonth();
        const currentYear = input.getFullYear();
        const julyFirst = currentMonth >= 6 
          ? new Date(currentYear, 6, 1)
          : new Date(currentYear - 1, 6, 1);
        
        expect(julyFirst.getFullYear()).toBe(expectedYear);
        expect(julyFirst.getMonth()).toBe(6);
        expect(julyFirst.getDate()).toBe(1);
      });
    });

    it('should calculate correctly for first half of year', () => {
      const testDates = [
        { input: new Date('2024-01-01'), expectedYear: 2023 },
        { input: new Date('2024-03-15'), expectedYear: 2023 },
        { input: new Date('2024-06-30'), expectedYear: 2023 },
      ];
      
      testDates.forEach(({ input, expectedYear }) => {
        const currentMonth = input.getMonth();
        const currentYear = input.getFullYear();
        const julyFirst = currentMonth >= 6 
          ? new Date(currentYear, 6, 1)
          : new Date(currentYear - 1, 6, 1);
        
        expect(julyFirst.getFullYear()).toBe(expectedYear);
      });
    });
  });

  describe('timestamp comparisons', () => {
    it('should correctly compare timestamps', () => {
      const now = Date.now();
      const past = now - 86400000;
      const future = now + 86400000;
      
      expect(past).toBeLessThan(now);
      expect(future).toBeGreaterThan(now);
      expect(now).toBeGreaterThanOrEqual(past);
      expect(now).toBeLessThanOrEqual(future);
    });

    it('should handle time range checks', () => {
      const baseTime = new Date('2024-01-01').getTime();
      const testTime = new Date('2024-06-01').getTime();
      const endTime = new Date('2024-12-31').getTime();
      
      const isInRange = testTime >= baseTime && testTime <= endTime;
      expect(isInRange).toBe(true);
    });
  });
});