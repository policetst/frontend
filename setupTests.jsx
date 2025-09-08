import { expect, it, describe, vi } from 'vitest';
import '@testing-library/jest-dom';
// Mocks globales si son necesarios
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(() => null),
    removeItem: vi.fn(() => null)
  },
  writable: true
});