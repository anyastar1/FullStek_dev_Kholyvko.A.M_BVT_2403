import { createTheme } from "@mui/material/styles";
import { ruRU } from "@mui/material/locale";

declare module "@mui/material/Chip" {
  interface ChipPropsColorOverrides {
    lost: true;
    found: true;
  }
}

declare module "@mui/material/styles" {
  interface Palette {
    lost: Palette["primary"];
    found: Palette["primary"];
  }
  interface PaletteOptions {
    lost?: PaletteOptions["primary"];
    found?: PaletteOptions["primary"];
  }
}

export const theme = createTheme(
  {
    palette: {
      mode: "light",
      primary: {
        main: "#3E5C46",
        light: "#5E7F63",
        dark: "#2A3F30",
        contrastText: "#FAF7F2",
      },
      secondary: {
        main: "#C77B3B",
        light: "#DA9A63",
        dark: "#9C5E28",
        contrastText: "#FFFFFF",
      },
      error: {
        main: "#C6432A",
      },
      lost: {
        main: "#E4572E",
        light: "#F0876A",
        dark: "#B8391A",
        contrastText: "#FFFFFF",
      },
      found: {
        main: "#2A9D8F",
        light: "#5CBBAF",
        dark: "#1F6E64",
        contrastText: "#FFFFFF",
      },
      background: {
        default: "#FAF7F2",
        paper: "#FFFFFF",
      },
      text: {
        primary: "#22201D",
        secondary: "#5B5850",
      },
      divider: "#E7E0D2",
    },
    shape: {
      borderRadius: 12,
    },
    typography: {
      fontFamily: '"Manrope", "Segoe UI", sans-serif',
      h1: { fontFamily: '"Fraunces", serif', fontWeight: 600, letterSpacing: "-0.01em" },
      h2: { fontFamily: '"Fraunces", serif', fontWeight: 600, letterSpacing: "-0.01em" },
      h3: { fontFamily: '"Fraunces", serif', fontWeight: 600 },
      h4: { fontFamily: '"Fraunces", serif', fontWeight: 600 },
      h5: { fontFamily: '"Fraunces", serif', fontWeight: 600 },
      h6: { fontFamily: '"Fraunces", serif', fontWeight: 600 },
      button: { fontWeight: 700, textTransform: "none" },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            paddingLeft: 20,
            paddingRight: 20,
          },
          sizeLarge: {
            paddingTop: 12,
            paddingBottom: 12,
            fontSize: "1rem",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: "#FAF7F2",
            color: "#22201D",
            boxShadow: "none",
            borderBottom: "1px solid #E7E0D2",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            border: "1px solid #E7E0D2",
            boxShadow: "none",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 700,
          },
        },
        variants: [
          {
            props: { color: "lost" },
            style: {
              backgroundColor: "#FBE7E0",
              color: "#9C3A22",
            },
          },
          {
            props: { color: "found" },
            style: {
              backgroundColor: "#DEEFEC",
              color: "#1F6E64",
            },
          },
        ],
      },
    },
  },
  ruRU
);
