import { describe, it, expect, vi } from 'vitest'

// Mock all the dependencies first before importing Login
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ state: { from: '/app/dashboard' } }),
}))

vi.mock('../../../context/AuthProvider', () => ({
  useAuth: () => ({
    user: null,
    setUser: vi.fn(),
    loading: false,
    setLoading: vi.fn(),
    logout: vi.fn(),
  }),
}))

vi.mock('../../../lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}))

vi.mock('../../../components/ui/animate-in-view', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="animate-in-view">{children}</div>,
}))

vi.mock('../../../images/register-bg.jpg', () => ({ default: 'mock-bg.jpg' }))
vi.mock('../../../images/delivery-man.png', () => ({ default: 'mock-image.png' }))

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
    form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
    input: (props: any) => <input {...props} />,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('lucide-react', () => ({
  Eye: () => <svg data-testid="eye-icon" />,
  EyeOff: () => <svg data-testid="eye-off-icon" />,
  Mail: () => <svg data-testid="mail-icon" />,
}))

describe('Login Import Test', () => {
  it('can import Login component without errors', async () => {
    const Login = await import('../login')
    expect(Login.default).toBeDefined()
    expect(typeof Login.default).toBe('function')
  })

  it('Login component has correct export structure', async () => {
    const LoginModule = await import('../login')
      // Should have a default export
    expect(LoginModule.default).toBeDefined()
    
    // The default export should be a function (React component)
    expect(typeof LoginModule.default).toBe('function')
    
    // Component should have a name (for debugging)
    expect(LoginModule.default.name).toBeTruthy()
  })
})
