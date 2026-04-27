import { NotionRenderer as ReactNotionRenderer } from 'react-notion-x'
import { uuidToId, getPageTitle } from 'notion-utils'
import { CircularProgress, Alert, Box, Checkbox, Typography } from '@mui/material'
import useNotionPage from '../hooks/useNotionPage'
import { useMemo, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import 'react-notion-x/src/styles.css'

function LocalCheckbox({ block, ...props }) {
  const [checked, setChecked] = useState(block?.format?.checked || false)
  return (
    <Checkbox
      checked={checked}
      onChange={() => setChecked((v) => !v)}
      color="primary"
      sx={{ pointerEvents: 'auto' }}
    />
  )
}

function LocalLink({ href, children, ...props }) {
  if (typeof href !== 'string' || href.trim() === '') {
    return <span {...props}>{children}</span>
  }
  const match = href.match(/^\/([a-f0-9]{32})$/i)
  if (match) {
    return (
      <RouterLink to={`/documentation/${match[1]}`} {...props}>
        {children}
      </RouterLink>
    )
  }
  if (href.startsWith('/') && !href.startsWith('//') && !href.startsWith('#')) {
    return (
      <RouterLink to={href} {...props}>
        {children}
      </RouterLink>
    )
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  )
}

const normalizeIdKey = (id) => {
  if (id == null) return ''
  return String(id).replace(/-/g, '').toLowerCase()
}

const resolveRootBlockId = (recordMap, pageId) => {
  if (!recordMap?.block || !pageId) return undefined
  if (recordMap.block[pageId]) return pageId
  const target = normalizeIdKey(pageId)
  for (const key of Object.keys(recordMap.block)) {
    if (normalizeIdKey(key) === target) return key
  }
  for (const key of Object.keys(recordMap.block)) {
    const bid = recordMap.block[key]?.value?.id
    if (bid && normalizeIdKey(bid) === target) return key
  }
  const asPage = Object.keys(recordMap.block).find(
    (k) => recordMap.block[k]?.value?.type === 'page'
  )
  if (asPage) return asPage
  return Object.keys(recordMap.block)[0]
}

const ensureBlockValueIds = (recordMap) => {
  if (!recordMap?.block) return recordMap
  const nextBlock = { ...recordMap.block }
  for (const [key, wrap] of Object.entries(nextBlock)) {
    if (!wrap?.value) continue
    if (typeof wrap.value.id === 'string' && wrap.value.id.trim() !== '') continue
    const safeKey = typeof key === 'string' ? key : String(key)
    if (!safeKey || safeKey === 'undefined' || safeKey === 'null') continue
    nextBlock[key] = {
      ...wrap,
      value: { ...wrap.value, id: safeKey },
    }
  }
  return { ...recordMap, block: nextBlock }
}

/**
 * Muestra Notion vía `recordMap` del backend. `pageId` = id de página Notion (32 hex).
 */
export default function NotionRenderer({ pageId, token }) {
  const mapPageUrl = (notionId) => {
    if (notionId == null || String(notionId).trim() === '') return '/documentation'
    return `/documentation/${uuidToId(String(notionId))}`
  }
  const { recordMap, loading, error } = useNotionPage(pageId, token)
  const safeRecordMap = useMemo(
    () => ensureBlockValueIds(recordMap),
    [recordMap]
  )
  const isEmptyMap =
    !safeRecordMap?.block || Object.keys(safeRecordMap.block).length === 0
  const rootBlockId = useMemo(
    () => resolveRootBlockId(safeRecordMap, pageId),
    [safeRecordMap, pageId]
  )
  const pageTitle = useMemo(
    () => (safeRecordMap ? getPageTitle(safeRecordMap) : null),
    [safeRecordMap]
  )

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
      <Alert severity="error" sx={{ my: 2, mx: 2 }}>
        No se pudo cargar la página de Notion: {error}
      </Alert>
    )
  }
  if (!safeRecordMap || isEmptyMap) {
    return (
      <Alert severity="info" sx={{ my: 2, mx: 2 }}>
        El servicio no devolvió contenido Notion para este id. Revisa /notion-page y
        el pageId.
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
        },
        '& .notion-page': { padding: 0, boxShadow: 'none', maxWidth: '100%' },
      }}
    >
      {pageTitle ? (
        <Typography
          component="h1"
          variant="h4"
          sx={{
            fontWeight: 700,
            mt: 0,
            mb: 2,
            color: 'text.primary',
          }}
        >
          {pageTitle}
        </Typography>
      ) : null}
      <ReactNotionRenderer
        recordMap={safeRecordMap}
        fullPage={false}
        darkMode={false}
        disableHeader
        blockId={rootBlockId}
        rootPageId={rootBlockId}
        mapPageUrl={mapPageUrl}
        mapImageUrl={(url) => url || ''}
        components={{ Checkbox: LocalCheckbox, a: LocalLink }}
      />
    </Box>
  )
}
