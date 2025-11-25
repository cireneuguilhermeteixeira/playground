import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";
import type {
  ReactNode,
  ButtonHTMLAttributes,
  HTMLAttributes,
} from "react";

// ----------------------
// Internal Context
// ----------------------
type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error(
      "Tabs subcomponents must be used inside <Tabs.Root>."
    );
  }
  return ctx;
}

// ----------------------
// Root
// ----------------------
type TabsRootProps = {
  defaultValue: string;
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

function TabsRoot({ defaultValue, children, ...rest }: TabsRootProps) {
  const [value, setValue] = useState(defaultValue);

  const ctx = useMemo(
    () => ({ value, setValue }),
    [value]
  );

  return (
    <TabsContext.Provider value={ctx}>
      <div {...rest}>{children}</div>
    </TabsContext.Provider>
  );
}

// ----------------------
// List (wrapper visual of buttons)
// ----------------------
type TabsListProps = {
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

function TabsList({ children, ...rest }: TabsListProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        borderBottom: "1px solid #ddd",
        marginBottom: 16,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

// ----------------------
// Trigger (each tab button)
// ----------------------
type TabsTriggerProps = {
  value: string;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

function TabsTrigger({ value, children, ...rest }: TabsTriggerProps) {
  const { value: activeValue, setValue } = useTabsContext();

  const isActive = activeValue === value;

  const handleClick = useCallback(() => {
    setValue(value);
  }, [setValue, value]);

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{
        padding: "8px 12px",
        border: "none",
        borderBottom: isActive ? "2px solid #0070f3" : "2px solid transparent",
        background: "transparent",
        cursor: "pointer",
        fontWeight: isActive ? 600 : 400,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

// ----------------------
// Content (content for each tab)
// ----------------------
type TabsContentProps = {
  value: string;
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

function TabsContent({ value, children, ...rest }: TabsContentProps) {
  const { value: activeValue } = useTabsContext();

  if (activeValue !== value) return null;

  return (
    <div {...rest}>
      {children}
    </div>
  );
}

// ----------------------
// Namespace export
// ----------------------
export const Tabs = {
  Root: TabsRoot,
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
};
