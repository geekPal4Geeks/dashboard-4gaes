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
        <Route element={<LazyRoute Component={Layout} />}>
            <Route path="/" element={<LazyRoute Component={Home} />} />
            <Route path="*" element={<LazyRoute Component={NotFound} />} />
        </Route>
    )
)
