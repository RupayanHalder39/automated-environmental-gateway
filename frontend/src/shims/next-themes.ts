import * as React from "react";

type ThemeState = {
  theme: string;
  resolvedTheme: string;
  systemTheme: string;
  setTheme: (value: string) => void;
};

export function useTheme(): ThemeState {
  const [theme, setTheme] = React.useState("light");
  return {
    theme,
    resolvedTheme: theme,
    systemTheme: "light",
    setTheme,
  };
}
