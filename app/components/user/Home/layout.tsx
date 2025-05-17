import { ThemeProvider } from "@emotion/react";
import { Box, CssBaseline } from "@mui/material";
import React, { ReactNode } from "react";
import theme from "../../theme";
import SideNav from "./side-nav";
import Footer from "./footer";

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [open, setOpen] = React.useState(true);

    const handleDrawerToggle = () => {
        setOpen(!open);
    };

    return (
        <>
        <ThemeProvider theme={theme}>
            <Box sx={{ display: 'flex' , minHeight: '100vh', flexDirection: 'column'}}>
                <CssBaseline />
                <SideNav  />
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                    }}
                >
                    {children}
                </Box>
                <Footer />
            </Box>
        </ThemeProvider>
        </>
    );
};

export default Layout;
