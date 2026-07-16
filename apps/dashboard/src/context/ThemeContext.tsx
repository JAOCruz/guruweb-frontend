import React, { createContext, useContext, useState, useEffect } from "react";

type HeadingFont = "space" | "oswald";

interface ThemeContextType {
  headingFont: HeadingFont;
  setHeadingFont: (font: HeadingFont) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const FONT_MAP = {
  space: '"Space Grotesk", sans-serif',
  oswald: '"Oswald", sans-serif',
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [headingFont, setHeadingFontState] = useState<HeadingFont>("space");

  const applyFont = (font: HeadingFont) => {
    const root = document.documentElement;
    root.style.setProperty("--font-heading", FONT_MAP[font]);
  };

  useEffect(() => {
    const savedFont = localStorage.getItem("guru-heading-font") as HeadingFont | null;
    const initialFont = savedFont || "space";

    setHeadingFontState(initialFont);
    applyFont(initialFont);

    document.documentElement.classList.remove("dark");
  }, []);

  const setHeadingFont = (font: HeadingFont) => {
    setHeadingFontState(font);
    localStorage.setItem("guru-heading-font", font);
    applyFont(font);
  };

  return (
    <ThemeContext.Provider value={{ headingFont, setHeadingFont }}>
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
