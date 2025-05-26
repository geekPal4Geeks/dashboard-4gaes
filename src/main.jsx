import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from "react-router-dom"
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { router } from "./routes"
import { StoreProvider } from './hooks/useGlobalReducer'
import { theme } from './theme' // We should create this
import './index.css'

const App = () => {
  return (
    <React.StrictMode>
      <StoreProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <RouterProvider router={router} />
        </ThemeProvider>
      </StoreProvider>
    </React.StrictMode>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)