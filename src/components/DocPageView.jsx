import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Box, Alert, Typography } from '@mui/material'
import { DOC_CONTENT_BY_SLUG } from '../content/docs'

const markdownSx = {
  maxWidth: 900,
  mx: 'auto',
  color: 'text.primary',
  '& h1': {
    fontSize: { xs: '1.5rem', md: '1.75rem' },
    fontWeight: 700,
    mt: 0,
    mb: 2,
  },
  '& h2': {
    fontSize: '1.25rem',
    fontWeight: 600,
    mt: 3,
    mb: 1.5,
  },
  '& h3': { fontSize: '1.1rem', fontWeight: 600, mt: 2, mb: 1 },
  '& p': { mb: 1.5, lineHeight: 1.7 },
  '& ul, & ol': { pl: 2.5, mb: 2 },
  '& li': { mb: 0.75 },
  '& blockquote': {
    my: 2,
    pl: 2,
    borderLeft: 4,
    borderColor: 'divider',
    color: 'text.secondary',
  },
  '& a': { color: 'primary.main' },
  '& code': {
    fontFamily: 'ui-monospace, monospace',
    fontSize: '0.9em',
    bgcolor: 'action.hover',
    px: 0.5,
    borderRadius: 0.5,
  },
  '& pre': {
    p: 2,
    borderRadius: 1,
    overflow: 'auto',
    bgcolor: 'action.hover',
    fontSize: '0.85rem',
  },
  '& pre code': { bgcolor: 'transparent', p: 0 },
  '& table': {
    width: '100%',
    borderCollapse: 'collapse',
    my: 2,
  },
  '& th, & td': { border: 1, borderColor: 'divider', p: 1, textAlign: 'left' },
}

export default function DocPageView({ slug }) {
  const body = slug ? DOC_CONTENT_BY_SLUG[slug] : null

  if (!slug || !body) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        <Typography variant="body2">
          No hay documentación en la app para esta ruta. Revisa el menú o el
          slug en la URL.
        </Typography>
      </Alert>
    )
  }

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 2, flex: 1, minWidth: 0 }}>
      <Box className="doc-markdown" sx={markdownSx}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
      </Box>
    </Box>
  )
}
