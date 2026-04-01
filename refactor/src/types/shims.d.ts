// Temporary shims for environments where node_modules are unavailable.

declare namespace React {
  interface CSSProperties {
    [key: string]: string | number | undefined;
  }

  type ReactNode = unknown;
  interface RefObject<T> { current: T | null }
  interface MouseEvent<T = Element> {
    preventDefault(): void;
    currentTarget: T;
  }
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare module 'react' {
  export type ReactNode = React.ReactNode;
  export type CSSProperties = React.CSSProperties;
  export type MouseEvent<T = Element> = React.MouseEvent<T>;

  export const StrictMode: (props: { children?: unknown }) => unknown;
  export function useState<T>(initialState: T): [T, (value: T | ((prevState: T) => T)) => void];
  export function useState<T>(initializer: () => T): [T, (value: T | ((prevState: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: readonly unknown[]): void;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: readonly unknown[]): T;
  export function useRef<T = any>(initialValue?: any): { current: any };
}

declare module 'react/jsx-runtime' {
  export const Fragment: unknown;
  export function jsx(type: any, props: any, key?: any): unknown;
  export function jsxs(type: any, props: any, key?: any): unknown;
}

declare module 'react-dom/client' {
  export function createRoot(container: Element | DocumentFragment): {
    render(children: unknown): void;
  };
}

declare module 'react-router-dom';
declare module 'framer-motion';
declare module 'lucide-react';
declare module 'clsx' {
  export type ClassValue = any;
  export function clsx(...inputs: ClassValue[]): string;
}

declare module 'tailwind-merge' {
  export function twMerge(...classes: Array<string | undefined | null | false>): string;
}
