import type {
  ComponentType,
  Key,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  Ref,
  RefObject,
} from 'react';
import React, {
  cloneElement,
  createContext,
  createRef,
  Fragment,
  useCallback,
  useContext,
  useDebugValue,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

// use '' instead of null, stop context looking up
const keyCtx = createContext<Key>('');
const methodCtx = createContext<PortalMethods | ''>('');

export const usePortalCtxKeyInternalUseOnly = () => useContext(keyCtx);
export const usePortalCtxMethodsInternalUseOnly = () => useContext(methodCtx) || null;

export const CtxResetInternalUseOnly = ({ children }: PropsWithChildren<{}>) => (
  <keyCtx.Provider value={''}>
    <methodCtx.Provider value={''}>{children}</methodCtx.Provider>
  </keyCtx.Provider>
);

export function createPortalUtil(keyGenerator: () => Key) {
  const methodsRef = createRef<PortalMethods>();
  const openPortal: OpenPortalType = function (content: any, props?: any) {
    const key = keyGenerator();

    function Content(newProps: any) {
      const p = { ...(props as object), ...newProps };

      if (typeof content === 'function') {
        const C = content;

        return <C {...p} key={key} />;
      }

      return cloneElement(content, p);
    }

    methodsRef.current?.openPortal({ key, content: <Content key={key} /> });

    return {
      close: (force?: boolean) => methodsRef.current?.closePortal({ key, force }),
      update: (p: any) =>
        methodsRef.current?.setPortals((prev) =>
          prev.map((el) => {
            const [k, content] = el;

            if (k === key) {
              return [key, cloneElement(content, p)];
            }

            return el;
          }),
        ),
    };
  };

  const openPopConfirm: OpenPopConfirmType = function (el: any, content: any, props?: any) {
    const ref = Object.freeze({ current: el }) as RefObject<unknown>;

    return openPortal(content, { ...props, ref });
  };

  return {
    contextHolder: <PortalsHolder methodsRef={methodsRef} />,
    methods: {
      openPortal,
      openPopConfirm,
    },
  };
}

export type OpenPortalType = {
  (content: JSX.Element): OpenPortalResult<any>;
  <P>(content: ComponentType<P>, props?: Partial<P>): OpenPortalResult<P>;
};

export type OpenPopConfirmType = {
  <E extends HTMLElement>(reference: E, content: JSX.Element): OpenPopConfirmResult<any>;
  <E extends HTMLElement, P>(
    reference: E,
    content: ComponentType<P>,
    props?: Partial<P>,
  ): OpenPopConfirmResult<P>;
};
export type OpenPopConfirmResult<P = any> = OpenPortalResult<P>;

export type OpenPortalResult<P = any> = {
  close: (force?: boolean) => void;
  update: (props: Partial<P>) => void;
};

export type PortalMethods = Exclude<ReturnType<typeof usePortals>[number], any[]>;

function PortalsHolder({ methodsRef }: { methodsRef: Ref<PortalMethods> }) {
  const [data, methods] = usePortals();
  const content = useMemo(
    () =>
      data.map(
        ([key, el]) =>
          (
            <keyCtx.Provider key={key} value={key}>
              <methodCtx.Provider value={methods}>
                {!el || el.key ? el : (cloneElement(el, { key }) as ReactNode)}
              </methodCtx.Provider>
            </keyCtx.Provider>
          ) as ReactElement,
      ),
    [data, methods],
  );

  useImperativeHandle(methodsRef, () => methods, [methods]);

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <Fragment>{content}</Fragment>;
}

function usePortals() {
  const [portals, setPortals] = useState<[Key, ReactElement][]>([]);
  useDebugValue(portals);

  const [customCloseHandles, setCustomCloseHandles] = useState<
    [Key, (() => any) | undefined | null][]
  >([]);

  const closeHandlesRef = useRef(customCloseHandles);
  useLayoutEffect(() => {
    closeHandlesRef.current = customCloseHandles;
  }, [customCloseHandles]);

  const openPortal = useCallback(
    ({ key, content }: { key: Key; content: ReactElement }) =>
      setPortals((prev) => [...prev.filter((el) => el[0] !== key), [key, content]]),
    [],
  );

  const closePortal = useCallback(({ key, force }: { key: Key; force?: boolean }) => {
    const fn = closeHandlesRef.current.find((el) => el[0] === key)?.[1];

    if (!force && fn) {
      fn();
    } else {
      setPortals((prev) => prev.filter(([k]) => k !== key));
    }
    setCustomCloseHandles((prev) => [...prev.filter((el) => el[0] !== key)]);
  }, []);

  const setCustomCloseMethod = useCallback(
    ({ key, fn }: { key: Key; fn: (() => any) | null | undefined }) => {
      setCustomCloseHandles((prev) => [...prev.filter((el) => el[0] !== key), [key, fn]]);
    },
    [],
  );

  const methods = useMemo(
    () => ({
      openPortal,
      closePortal,
      setCustomCloseMethod,

      // be careful
      setPortals,
    }),
    [openPortal, closePortal, setCustomCloseMethod],
  );

  return [portals, methods] as const;
}
