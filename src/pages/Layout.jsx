import { Box, Container } from '@mui/material'
import { Outlet } from 'react-router-dom'
import PropTypes from 'prop-types'
import ScrollToTop from "../components/ScrollToTop"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"

// Base component that maintains the navbar and footer throughout the page and the scroll to top functionality.
const Layout = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
            }}
        >
            <ScrollToTop>
                <Navbar />
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
                <Footer />
            </ScrollToTop>
        </Box>
    )
}

Layout.propTypes = {
    children: PropTypes.node,
}

export default Layout