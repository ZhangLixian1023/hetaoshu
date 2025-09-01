// 测试环境设置

// Mock window.location
const originalLocation = window.location;
Object.defineProperty(window, 'location', {
  value: {
    ...originalLocation,
    href: 'http://localhost:3000/',
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn()
  },
  writable: true
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: jest.fn(() => ({
    matches: false,
    addListener: jest.fn(),
    removeListener: jest.fn()
  })),
  writable: true
});

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  },
  writable: true
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  },
  writable: true
});

// Mock document.createRange for some React components
Object.defineProperty(document, 'createRange', {
  value: () => ({
    setStart: jest.fn(),
    setEnd: jest.fn(),
    commonAncestorContainer: {
      nodeName: 'BODY',
      ownerDocument: document
    },
    cloneContents: jest.fn(() => document.createElement('div'))
  })
});

// 全局错误处理
console.error = jest.fn().mockImplementation((error) => {
  if (error && error.includes && 
      (error.includes('Warning:') || 
       error.includes('React has detected a change in the order of Hooks'))) {
    return;
  }
  throw new Error(error);
});

console.warn = jest.fn();