import { lazy, Suspense } from 'react'
import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
} from "react-router-dom"
import { CircularProgress, Box } from '@mui/material'

// Pages
const Layout = lazy(() => import('./pages/Layout'))
const Home = lazy(() => import('./pages/Home'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Login = lazy(() => import('./pages/Login'))
const GithubCallback = lazy(() => import('./pages/GithubCallback'))

// Loading component
const LoadingFallback = () => (
    <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
    >
        <CircularProgress />
    </Box>
)

// Route wrapper with Suspense
const LazyRoute = ({ Component }) => (
    <Suspense fallback={<LoadingFallback />}>
        <Component />
    </Suspense>
)

export const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            {/* Login fuera del layout */}
            <Route path="/" element={<LazyRoute Component={Login} />} />
            <Route path="/session/signin" element={<LazyRoute Component={GithubCallback} />} />
            {/* Resto de la app con layout */}
            <Route element={<LazyRoute Component={Layout} />}>
                <Route path="/home" element={<LazyRoute Component={Home} />} />
                <Route path="*" element={<LazyRoute Component={NotFound} />} />
            </Route>
        </>
    )
)
