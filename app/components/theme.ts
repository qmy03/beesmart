import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#99BC4D",  
      light: "#F5F8ED",  
      dark: "#0039cb",   
    },
    secondary: {
      main: "#919EABCC",
      light: "#919EAB3D",
    }
  },
  components: {
    MuiListItemText: {
      styleOverrides: {
        primary: {
          color: 'white', 
          fontSize: '14px',
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: 'white', 
          fontSize: '24px',
        },
      },
    },
    MuiTypography: {  // This will apply a default fontSize across all Typography variants
      styleOverrides: {
        root: {
          fontSize: '14px',
        },
      },
    },
    MuiButton: {  // Ensure buttons also follow the default font size
      styleOverrides: {
        root: {
          fontSize: '14px',
        },
      },
    },
  },
  typography: {
    fontSize: 14, // Đặt kích thước font mặc định là 14px
    body1: {
      fontSize: '14px', // Thiết lập kích thước cho body1 (có thể tùy chỉnh thêm nếu cần)
    },
    body2: {
      fontSize: '14px', // Thiết lập kích thước cho body2 (nếu sử dụng)
    },
    // Có thể thêm các kiểu khác nếu cần
  },
  
});

export default theme;
