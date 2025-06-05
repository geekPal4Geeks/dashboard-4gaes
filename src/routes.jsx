import { lazy, Suspense, Navigate, useLocation, useNavigate } from 'react'
import {
    createBrowserRouter,
    createRoutesFromElements,
    Route
} from "react-router-dom"
import { CircularProgress, Box } from '@mui/material'
import ProtectedRoute from './components/ProtectedRoute'
import React from 'react'

// Pages
const Layout = lazy(() => import('./pages/Layout'))
const Home = lazy(() => import('./pages/Home'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Login = lazy(() => import('./pages/Login'))
const GithubCallback = lazy(() => import('./pages/GithubCallback'))
const Curses = lazy(() => import('./pages/Curses'))
const Mentorships = lazy(() => import('./pages/Mentorships'))
const CoursesManagement = lazy(() => import('./pages/CoursesManagement'))
const Documentation = lazy(() => import('./pages/Documentation'))

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

function PageIdRedirect() {
  const match = window.location.pathname.match(/^\/([a-f0-9]{32})$/i);
  const pageId = match ? match[1] : null;
  if (pageId) {
    window.location.href = `/documentation/${pageId}`;
    return <LazyRoute Component={Documentation} />;
  }
  return <LazyRoute Component={NotFound} />;
}

export const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            {/* Login fuera del layout */}
            <Route path="/" element={<LazyRoute Component={Login} />} />
            <Route path="/session/signin" element={<LazyRoute Component={GithubCallback} />} />
            {/* Resto de la app con layout */}
            <Route element={<LazyRoute Component={Layout} />}>
                <Route path="/home" element={<LazyRoute Component={Home} />} />
                <Route path="/curses" element={<LazyRoute Component={Curses} />} />
                <Route path="/mentorships" element={<LazyRoute Component={Mentorships} />} />
                <Route path="/courses-management" element={
                  <ProtectedRoute allowedRoles={['academy_coordinator', 'country_manager']}>
                    <LazyRoute Component={CoursesManagement} />
                  </ProtectedRoute>
                } />
                <Route path="/documentation/:pageId?" element={<LazyRoute Component={Documentation} />} />
                {/* Redirección para pageId en la raíz */}
                <Route path="/:pageId" element={<PageIdRedirect />} />
                <Route path="*" element={<LazyRoute Component={NotFound} />} />
            </Route>
        </>
    )
)
