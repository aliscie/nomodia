import React, { ReactNode } from "react";
// import { useSelector } from "react-redux";
import { ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import {createTheme} from "@/compnents/createTheme";

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {

  const theme = createTheme(false);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

export default ThemeProvider;
