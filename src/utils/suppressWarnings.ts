// Suppress Ant Design compatibility warnings
if (typeof window !== 'undefined') {
  const originalConsoleWarn = console.warn;
  console.warn = (...args) => {
    // Suppress Ant Design React 19 compatibility warnings
    if (
      args[0]?.includes?.('antd v5 support React is 16 ~ 18') ||
      args[0]?.includes?.('antd: compatible') ||
      args[0]?.includes?.('React 19')
    ) {
      return;
    }
    originalConsoleWarn.apply(console, args);
  };
}

export {};
