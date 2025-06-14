import React from 'react'
import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import type { RenderOptions } from '@testing-library/react'
import { vi } from 'vitest'

// Mock user for testing
export const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user' as const
}

// Mock auth context values
export const mockAuthContext = {
  user: mockUser,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  loading: false,
  error: null
}

// Minimal wrapper that doesn't interfere with mocks
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid="test-wrapper">{children}</div>
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Mock form data for testing
export const mockFormData = {
  clientName: 'John Doe',
  clientEmail: 'john@example.com',
  clientPhone: '+1234567890',
  clientAddress: '123 Main St',
  clientCity: 'New York',
  clientState: 'NY',
  clientZip: '10001',
  clientCountry: 'USA',
  originCountry: 'Ghana',
  originCity: 'Accra',
  packageType: 'box',
  packageCategory: 'standard',
  packageDescription: 'Test package',
  freightType: 'air'
}

// Test helper functions
export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 0))

export const createMockEvent = (name: string, value: string) => ({
  target: { name, value }
}) as React.ChangeEvent<HTMLInputElement>

export const createMockSelectEvent = (name: string, value: string) => ({
  target: { name, value }
}) as React.ChangeEvent<HTMLSelectElement>

export const createMockTextareaEvent = (name: string, value: string) => ({
  target: { name, value }
}) as React.ChangeEvent<HTMLTextAreaElement>