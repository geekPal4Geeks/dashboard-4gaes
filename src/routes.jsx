import { lazy, Suspense } from 'react'
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from 'react-router-dom'
import { CircularProgress, Box } from '@mui/material'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
const Layout = lazy(() => import('./pages/Layout'))
const Home = lazy(() => import('./pages/Home'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Login = lazy(() => import('./pages/Login'))
const GithubCallback = lazy(() => import('./pages/GithubCallback'))
const Curses = lazy(() => import('./pages/Curses'))
const Mentorships = lazy(() => import('./pages/Mentorships'))
const CoursesManagement = lazy(() => import('./pages/CoursesManagement'))
const CohortDetail = lazy(() => import('./pages/CohortDetail'))
const StudentSkillReview = lazy(() => import('./pages/StudentSkillReview'))

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
      <Route
        path="/session/signin"
        element={<LazyRoute Component={GithubCallback} />}
      />
      {/* Resto de la app con layout */}
      <Route element={<LazyRoute Component={Layout} />}>
        <Route path="/courses" element={<LazyRoute Component={Curses} />} />
        <Route
          path="/cohort/:cohortId"
          element={<LazyRoute Component={CohortDetail} />}
        />
        <Route
          path="/cohort/:cohortId/skill-review"
          element={<LazyRoute Component={StudentSkillReview} />}
        />
        <Route
          path="/mentorships"
          element={<LazyRoute Component={Mentorships} />}
        />
        <Route
          path="/courses-management"
          element={
            <ProtectedRoute
              allowedRoles={['academy_coordinator', 'country_manager']}
            >
              <LazyRoute Component={CoursesManagement} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<LazyRoute Component={NotFound} />} />
      </Route>
    </>
  )
)
