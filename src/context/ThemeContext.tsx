import React, { createContext, useContext, useState, useEffect } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  headingFont: "space" | "barlow";
  darkBg: "solid" | "dots";
  toggleTheme: () => void;
  setHeadingFont: (font: "space" | "barlow") => void;
  setDarkBg: (bg: "solid" | "dots") => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>("light");
  const [headingFont, setHeadingFontState] = useState<"space" | "barlow">("space");
  const [darkBg, setDarkBgState] = useState<"solid" | "dots">("solid");

  const applyThemeClasses = (
    currentTheme: Theme,
    currentFont: "space" | "barlow",
    currentBg: "solid" | "dots"
  ) => {
    const root = document.documentElement;
    const body = document.body;

    root.classList.toggle("dark", currentTheme === "dark");
    root.classList.toggle("font-barlow", currentFont === "barlow");
    root.classList.toggle("font-space", currentFont === "space");
    root.classList.toggle("dark-bg-dots", currentTheme === "dark" && currentBg === "dots");

    if (currentTheme === "dark" && currentBg === "dots") {
      root.style.backgroundColor = "#0a0a0a";
      root.style.backgroundImage =
        "radial-gradient(circle, #d4af3722 1px, transparent 1px)";
      root.style.backgroundSize = "20px 20px";
      body.style.backgroundColor = "transparent";
    } else {
      root.style.backgroundColor = "";
      root.style.backgroundImage = "";
      root.style.backgroundSize = "";
      body.style.backgroundColor = "";
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("guru-theme") as Theme | null;
    const savedFont = localStorage.getItem("guru-heading-font") as "space" | "barlow" | null;
    const savedBg = localStorage.getItem("guru-dark-bg") as "solid" | "dots" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    const initialFont = savedFont || "space";
    const initialBg = savedBg || "solid";

    setTheme(initialTheme);
    setHeadingFontState(initialFont);
    setDarkBgState(initialBg);

    applyThemeClasses(initialTheme, initialFont, initialBg);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("guru-theme", next);
      applyThemeClasses(next, headingFont, darkBg);
      return next;
    });
  };

  const setHeadingFont = (font: "space" | "barlow") => {
    setHeadingFontState(font);
    localStorage.setItem("guru-heading-font", font);
    applyThemeClasses(theme, font, darkBg);
  };

  const setDarkBg = (bg: "solid" | "dots") => {
    setDarkBgState(bg);
    localStorage.setItem("guru-dark-bg", bg);
    applyThemeClasses(theme, headingFont, bg);
  };

  return (
    <ThemeContext.Provider value={{ theme, headingFont, darkBg, toggleTheme, setHeadingFont, setDarkBg }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
