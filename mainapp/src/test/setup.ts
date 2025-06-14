import '@testing-library/jest-dom'
import React from 'react'
import { vi } from 'vitest'

// Mock window.matchMedia
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

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
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

// Mock framer-motion to avoid DOM prop warnings
vi.mock('framer-motion', () => {
  const createMotionComponent = (tag: string) => {
    // Return a forwardRef component that filters out motion props
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
        ...cleanProps
      } = props;
      
      return React.createElement(tag, { ...cleanProps, ref });
    });
  };

  return {
    motion: {
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
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  };
})

// Mock AnimateInView component
vi.mock('../components/ui/animate-in-view', () => ({
  default: ({ children, className }: { children: React.ReactNode; className?: string }) => 
    React.createElement('div', { className: className || '', 'data-testid': 'animate-in-view' }, children),
}))

// Mock react-router-dom
vi.mock('react-router-dom', () => {
  return {
    BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/test', state: null, search: '', hash: '', key: 'test' }),
    Link: ({ children }: { children: React.ReactNode }) => children,
    NavLink: ({ children }: { children: React.ReactNode }) => children,
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
      onChange: (e: any) => onChange?.(e.target.value),
      'data-testid': 'phone-input',
      ref,
      ...otherProps
    });
  });
  
  return {
    default: MockPhoneInput,
    isValidPhoneNumber: vi.fn().mockReturnValue(true),
  }
})

// Mock CSS imports
vi.mock('react-phone-number-input/style.css', () => ({}))

// Mock other common imports
vi.mock('../lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}))

// Mock specific image imports used in components
vi.mock('../../images/register-bg.jpg', () => ({ default: 'mock-register-bg.jpg' }))
vi.mock('../../images/delivery-man.png', () => ({ default: 'mock-delivery-man.png' }))
vi.mock('../../images/deliveryparcel.jpg', () => ({ default: 'mock-deliveryparcel.jpg' }))
vi.mock('../../images/forgot.jpg', () => ({ default: 'mock-forgot.jpg' }))

// Mock localStorage if not already defined
Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
})