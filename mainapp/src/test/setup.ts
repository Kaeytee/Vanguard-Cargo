import '@testing-library/jest-dom'
import React from 'react'
import { vi } from 'vitest'

// Mock window.matchMedia with proper event listener support
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock additional window properties that framer-motion might need
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

Object.defineProperty(window, 'requestAnimationFrame', {
  writable: true,
  value: vi.fn((callback: Function) => {
    callback(0);
    return 0;
  }),
});

Object.defineProperty(window, 'cancelAnimationFrame', {
  writable: true,
  value: vi.fn(),
});

// Mock IntersectionObserver
(window as any).IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver
(window as any).ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock framer-motion completely to avoid all issues
vi.mock('framer-motion', () => {
  const createMotionComponent = (tag: string) => {
    return React.forwardRef<any, any>((props: any, ref) => {
      const {
        initial,
        animate,
        exit,
        variants,
        transition,
        whileHover,
        whileFocus,
        whileTap,
        whileInView,
        viewport,
        onAnimationComplete,
        onAnimationStart,
        layout,
        layoutId,
        style,
        onHoverStart,
        onHoverEnd,
        ...cleanProps
      } = props;
      
      return React.createElement(tag, { ...cleanProps, ref });
    });
  };

const MockMotion = {
    div: createMotionComponent('div'),
    section: createMotionComponent('section'),
    form: createMotionComponent('form'),
    input: createMotionComponent('input'),
    button: createMotionComponent('button'),
    span: createMotionComponent('span'),
    h1: createMotionComponent('h1'),
    h2: createMotionComponent('h2'),
    h3: createMotionComponent('h3'),
    p: createMotionComponent('p'),
    a: createMotionComponent('a'),
    img: createMotionComponent('img'),
    li: createMotionComponent('li'),
    ul: createMotionComponent('ul'),
    nav: createMotionComponent('nav'),
    label: createMotionComponent('label'),
};

  return {
    motion: MockMotion,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, {}, children),
    useMotionValue: vi.fn(() => ({ get: vi.fn(() => 0), set: vi.fn() })),
    useTransform: vi.fn(() => ({ get: vi.fn(() => 0), set: vi.fn() })),
    useSpring: vi.fn(() => ({ get: vi.fn(() => 0), set: vi.fn() })),
    animate: vi.fn(() => Promise.resolve()),
    useAnimation: vi.fn(() => ({
      start: vi.fn(() => Promise.resolve()),
      stop: vi.fn(),
      set: vi.fn(),
    })),
    useReducedMotion: vi.fn(() => false),
    LazyMotion: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, {}, children),
    domAnimation: {},
    m: MockMotion,
  };
})

// Mock AnimateInView component with better support for props
vi.mock('../components/ui/animate-in-view', () => ({
  default: React.forwardRef<HTMLDivElement, any>(({ children, className, ...props }, ref) => 
    React.createElement('div', { className: className || '', 'data-testid': 'animate-in-view', ref, ...props }, children)
  ),
}))

// Also mock the path as it might be imported from different locations
vi.mock('../../components/ui/animate-in-view', () => ({
  default: React.forwardRef<HTMLDivElement, any>(({ children, className, ...props }, ref) => 
    React.createElement('div', { className: className || '', 'data-testid': 'animate-in-view', ref, ...props }, children)
  ),
}))

// Mock react-router-dom
vi.mock('react-router-dom', () => {
  return {
    BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
    MemoryRouter: ({ children }: { children: React.ReactNode }) => children,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/test', state: null, search: '', hash: '', key: 'test' }),
    Link: React.forwardRef<HTMLAnchorElement, any>(({ children, to, ...props }, ref) => 
      React.createElement('a', { 
        href: to, 
        role: 'link',
        ref,
        ...props 
      }, children)
    ),
    NavLink: React.forwardRef<HTMLAnchorElement, any>(({ children, to, ...props }, ref) => 
      React.createElement('a', { 
        href: to, 
        role: 'link',
        ref,
        ...props 
      }, children)
    ),
  }
})

// Mock lucide-react icons with better error handling
vi.mock('lucide-react', () => {
  const MockIcon = React.forwardRef<any, any>((props: any, ref) => {
    const { className, children, ...otherProps } = props;
    return React.createElement('svg', { 
      className, 
      'data-testid': 'mock-icon', 
      ref,
      'aria-hidden': 'true',
      ...otherProps 
    }, children);
  });
  
  // Add display names for better debugging
  MockIcon.displayName = 'MockIcon';
  
  const iconComponents = {
    Eye: MockIcon,
    EyeOff: MockIcon,
    Mail: MockIcon,
    Key: MockIcon,
    Lock: MockIcon,
    LockKeyhole: MockIcon,
    CheckCircle: MockIcon,
    ArrowLeft: MockIcon,
    Check: MockIcon,
    User: MockIcon,
    Phone: MockIcon,
    Shield: MockIcon,
    Menu: MockIcon,
    X: MockIcon,
    Home: MockIcon,
    Package: MockIcon,
    Truck: MockIcon,
    Calendar: MockIcon,
    Star: MockIcon,
    ChevronRight: MockIcon,
    BarChart: MockIcon,
    Users: MockIcon,
    Settings: MockIcon,
    LogOut: MockIcon,
    Bell: MockIcon,
    CloudUpload: MockIcon,
    AlertCircle: MockIcon,
  };
  
  return iconComponents;
})

// Mock react-phone-number-input
vi.mock('react-phone-number-input', () => {
  const MockPhoneInput = React.forwardRef<any, any>((props: any, ref) => {
    const { value, onChange, ...otherProps } = props;
    return React.createElement('input', {
      type: 'tel',
      value: value || '',
      onChange: (e: any) => {
        // PhoneInput onChange expects the phone value directly, not an event
        onChange?.(e.target.value);
      },
      'data-testid': 'phone-input',
      ref,
      ...otherProps
    });
  });
  return {
    default: MockPhoneInput,
    isValidPhoneNumber: vi.fn(() => {
      // Mock always returns true for testing
      return true
    }),
  }
})

// Mock CSS imports
vi.mock('react-phone-number-input/style.css', () => ({}))

// Mock other common imports
vi.mock('../lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}))

// Mock specific image imports used in components
// The paths must match exactly how they are imported in the components
vi.mock('../images/register-bg.jpg', () => ({ default: 'mock-register-bg.jpg' }))
vi.mock('../images/delivery-man.png', () => ({ default: 'mock-delivery-man.png' }))
vi.mock('../images/deliveryparcel.jpg', () => ({ default: 'mock-deliveryparcel.jpg' }))
vi.mock('../images/forgot.jpg', () => ({ default: 'mock-forgot.jpg' }))

// Also mock the paths as used from different component locations
vi.mock('../../images/register-bg.jpg', () => ({ default: 'mock-register-bg.jpg' }))
vi.mock('../../images/delivery-man.png', () => ({ default: 'mock-delivery-man.png' }))
vi.mock('../../images/deliveryparcel.jpg', () => ({ default: 'mock-deliveryparcel.jpg' }))
vi.mock('../../images/forgot.jpg', () => ({ default: 'mock-forgot.jpg' }))

// Mock localStorage with proper implementation
const localStorageMock = {
  store: new Map<string, string>(),
  getItem: vi.fn((key: string) => localStorageMock.store.get(key) || null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageMock.store.set(key, value)
  }),
  removeItem: vi.fn((key: string) => {
    localStorageMock.store.delete(key)
  }),
  clear: vi.fn(() => {
    localStorageMock.store.clear()
  }),
}

Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: localStorageMock,
})