import { NotionRenderer as ReactNotionRenderer } from 'react-notion-x'
import { CircularProgress, Alert, Box, Checkbox } from '@mui/material'
import useNotionPage from '../hooks/useNotionPage'
import { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'

// Estilos CSS necesarios para react-notion-x
import 'react-notion-x/src/styles.css'

// Componente Checkbox local interactivo
function LocalCheckbox({ block, ...props }) {
  const [checked, setChecked] = useState(block?.format?.checked || false)
  return (
    <Checkbox
      checked={checked}
      onChange={() => setChecked((val) => !val)}
      color="primary"
      sx={{ pointerEvents: 'auto' }}
    />
  )
}

const getCurrentDomain = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return ''
}

function LocalLink({ href, children, ...props }) {
  let isInternal = false
  let isPageIdLink = false
  let pageId = null

  if (href) {
    // Detectar si es un pageId directo en la raíz
    const match = href.match(/^\/([a-f0-9]{32})$/i)
    if (match) {
      isPageIdLink = true
      pageId = match[1]
      isInternal = true
    } else if (href.startsWith('/')) {
      isInternal = true
    } else {
      try {
        const url = new URL(href, window.location.origin)
        const match2 = url.pathname.match(/^\/([a-f0-9]{32})$/i)
        if (match2) {
          isPageIdLink = true
          pageId = match2[1]
        }
        isInternal = url.host === window.location.host
      } catch {
        isInternal = false
      }
    }
  }

  if (isPageIdLink && pageId) {
    return (
      <RouterLink to={`/documentation/${pageId}`} {...props}>
        {children}
      </RouterLink>
    )
  } else if (isInternal && href && !href.startsWith('#')) {
    return (
      <RouterLink to={href} {...props}>
        {children}
      </RouterLink>
    )
  } else {
    // Externo o ancla
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    )
  }
}

export default function NotionRenderer({ pageId, token }) {
  const { recordMap, loading, error } = useNotionPage(pageId, token)

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        Error al cargar el contenido: {error}
      </Alert>
    )
  }

  if (!recordMap) {
    return (
      <Alert severity="info" sx={{ my: 2 }}>
        No hay contenido para mostrar
      </Alert>
    )
  }

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100%',
        px: { xs: 2, md: 4 },
        '& .notion': {
          fontFamily: 'inherit',
          fontSize: '16px',
          width: '100%',
          maxWidth: '100%',
        },
        '& .notion-page': {
          padding: 0,
          boxShadow: 'none',
          maxWidth: '100%',
          width: '100%',
        },
      }}
    >
      <ReactNotionRenderer
        recordMap={recordMap}
        fullPage={false}
        darkMode={false}
        disableHeader={true}
        components={{
          Checkbox: LocalCheckbox,
          a: LocalLink,
        }}
      />
    </Box>
  )
}
