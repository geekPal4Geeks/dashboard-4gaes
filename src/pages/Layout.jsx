import { Box, Container } from '@mui/material'
import { Outlet, useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'
import ScrollToTop from "../components/ScrollToTop"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { useUserInfo } from '../hooks/useUserInfo'

// Base component that maintains the navbar and footer throughout the page and the scroll to top functionality.
const Layout = () => {
    useUserInfo();
    const location = useLocation();
    const isDocumentation = location.pathname.includes("documentation");

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <ScrollToTop>
                <Navbar />
                {isDocumentation ? (
                    <Box component="main" sx={{ flexGrow: 1, minHeight: '100vh', p: 0 }}>
                        <Outlet />
                    </Box>
                ) : (
                    <Container
                        component="main"
                        maxWidth="lg"
                        sx={{
                            flexGrow: 1,
                            py: 3,
                        }}
                    >
                        <Outlet />
                    </Container>
                )}
                {!isDocumentation && <Footer />}
            </ScrollToTop>
        </Box>
    )
}

Layout.propTypes = {
    children: PropTypes.node,
}

export default Layout