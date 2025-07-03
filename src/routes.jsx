import { lazy, Suspense } from 'react'
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from 'react-router-dom'
import { CircularProgress, Box } from '@mui/material'
import ProtectedRoute from './components/ProtectedRoute'
import React from 'react'
import RequireAuth from './components/RequireAuth'

// Pages
const Layout = lazy(() => import('./pages/Layout'))
const Home = lazy(() => import('./pages/Home'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Login = lazy(() => import('./pages/Login'))
const GithubCallback = lazy(() => import('./pages/GithubCallback'))
const Courses = lazy(() => import('./pages/Courses'))
const Mentorships = lazy(() => import('./pages/Mentorships'))
const CoursesManagement = lazy(() => import('./pages/CoursesManagement'))
const Documentation = lazy(() => import('./pages/Documentation'))
const CohortDetail = lazy(() => import('./pages/CohortDetail'))
const StudentSkillReview = lazy(() => import('./pages/StudentSkillReview'))
const StudentDetail = lazy(() => import('./pages/StudentDetail'))
const Students = lazy(() => import('./pages/Students'))

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
  const match = window.location.pathname.match(/^\/([a-f0-9]{32})$/i)
  const pageId = match ? match[1] : null
  if (pageId) {
    window.location.href = `/documentation/${pageId}`
    return <LazyRoute Component={Documentation} />
  }
  return <LazyRoute Component={NotFound} />
}

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Login fuera del layout */}
      <Route path="/" element={<LazyRoute Component={Login} />} />
      <Route
        path="/session/signin"
        element={<LazyRoute Component={GithubCallback} />}
      />
      {/* Resto de la app con layout */}
      <Route element={<LazyRoute Component={Layout} />}>
        <Route
          path="/home"
          element={
            <RequireAuth>
              <LazyRoute Component={Home} />
            </RequireAuth>
          }
        />
        <Route
          path="/courses"
          element={
            <RequireAuth>
              <LazyRoute Component={Courses} />
            </RequireAuth>
          }
        />
        <Route
          path="/cohort/:cohortId"
          element={
            <RequireAuth>
              <LazyRoute Component={CohortDetail} />
            </RequireAuth>
          }
        />
        <Route
          path="/cohort/:cohortId/skill-review"
          element={
            <RequireAuth>
              <LazyRoute Component={StudentSkillReview} />
            </RequireAuth>
          }
        />
        <Route
          path="/mentorships"
          element={
            <RequireAuth>
              <LazyRoute Component={Mentorships} />
            </RequireAuth>
          }
        />
        <Route
          path="/courses-management"
          element={
            <RequireAuth>
              <ProtectedRoute
                allowedRoles={['academy_coordinator', 'country_manager']}
              >
                <LazyRoute Component={CoursesManagement} />
              </ProtectedRoute>
            </RequireAuth>
          }
        />
        <Route
          path="/documentation/:pageId?"
          element={
            <RequireAuth>
              <LazyRoute Component={Documentation} />
            </RequireAuth>
          }
        />
        <Route
          path="cohort/:cohortId/student/:studentId"
          element={
            <RequireAuth>
              <LazyRoute Component={StudentDetail} />
            </RequireAuth>
          }
        />
        <Route
          path="/students"
          element={
            <RequireAuth>
              <LazyRoute Component={Students} />
            </RequireAuth>
          }
        />
        {/* Redirección para pageId en la raíz */}
        <Route
          path="/:pageId"
          element={
            <RequireAuth>
              <PageIdRedirect />
            </RequireAuth>
          }
        />
        <Route
          path="*"
          element={
            <RequireAuth>
              <LazyRoute Component={NotFound} />
            </RequireAuth>
          }
        />
      </Route>
    </>
  )
)
