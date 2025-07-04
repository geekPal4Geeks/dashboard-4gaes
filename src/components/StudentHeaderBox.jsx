import { useState } from 'react'
import { Box, Typography, Chip, Button, Tooltip, IconButton } from '@mui/material'
import GitHubIcon from '@mui/icons-material/GitHub'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import { parseCohortData, parseCurrentModuleLabel } from '../utils/studentHelpers'
import { getTeamSlackId } from '../utils/cohortHelpers'

export default function StudentHeaderBox({ student, cohortInfo }) {
  const [copied, setCopied] = useState(false)
  if (!student) return null
  // Slack ID del estudiante
  const slackId = student?.properties?.['Slack ID']?.rich_text?.[0]?.text?.content
  // Nombre completo
  const fullName = student?.properties?.['Student']?.title?.[0]?.plain_text || student?.properties?.['Student']?.title?.[0]?.text?.content || 'Sin nombre'
  // Módulo actual
  const currentModuleArr = student?.properties?.['Cohort current module']?.rollup?.array
  const currentModuleLabel = parseCurrentModuleLabel(currentModuleArr)
  // Cohorte
  const cohortName = student?.properties?.['Cohort name for Zapier']?.formula?.string
  // GitHub
  const github = student?.properties?.['Github profile']?.url
  // PM, Mentores, TAs
  let pm = null, pmSlackId = null, mentors = [], tas = []
  if (cohortInfo?.properties?.['Mentors in this cohort']?.formula?.string) {
    const parsed = parseCohortData(cohortInfo.properties['Mentors in this cohort'].formula.string)
    pm = cohortInfo?.properties?.['Program Manager']?.select?.name
    pmSlackId = pm ? getTeamSlackId(pm) : null
    mentors = parsed.mentors
    tas = parsed.tas
  }
  // Educational Status
  const educationalStatus = student?.properties?.['Educational Status']?.select?.name
  const isGraduated = educationalStatus === 'Graduated'
  // Determinar si la cohorte está finalizada
  const isFinished = cohortInfo?.properties?.['Status']?.select?.name === 'Finished'

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        <Typography sx={{ fontSize: '2.2em' }}>🎓</Typography>
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h4" fontWeight={700}>{fullName}</Typography>
            {isFinished ? (
              <Chip
                label={isGraduated ? 'Graduado' : 'No graduado - Confirmar con el PM'}
                size="small"
                sx={{
                  bgcolor: isGraduated ? '#e8f5e9' : '#fff3e0',
                  color: isGraduated ? '#388e3c' : '#ff9800',
                  fontWeight: 500,
                  fontSize: '0.8rem',
                  height: 24,
                }}
              />
            ) : (
              <>
                {currentModuleLabel && (
                  <Chip label={currentModuleLabel} size="small" sx={{ bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 500, fontSize: '0.8rem', height: 24 }} />
                )}
                {cohortName && (
                  <Chip label={cohortName} size="small" sx={{ bgcolor: '#f5f5f5', color: '#757575', fontWeight: 400, fontSize: '0.75rem', height: 22 }} />
                )}
              </>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, gap: 1 }}>
            {github && (
              <Tooltip title="Ver perfil de GitHub">
                <a href={github} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'none', wordBreak: 'break-all', fontSize: 15, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <GitHubIcon sx={{ fontSize: 18, mr: 0.5 }} />
                </a>
              </Tooltip>
            )}
            {student?.properties?.Email?.email && (
              <Tooltip title="Copiar correo">
                <Button
                  variant="text"
                  size="small"
                  sx={{ textTransform: 'none', p: 0, minWidth: 0, fontSize: 16, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}
                  onClick={() => {
                    navigator.clipboard.writeText(student.properties.Email.email)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 1200)
                  }}
                  title="Copiar correo"
                >
                  {student.properties.Email.email}
                  <ContentCopyIcon sx={{ fontSize: 16, ml: 0.5 }} />
                </Button>
              </Tooltip>
            )}
            {copied && (
              <Typography variant="caption" color="success.main" sx={{ ml: 1 }}>
                Copiado
              </Typography>
            )}
          </Box>
        </Box>
        {/* Botón de Slack a la derecha */}
        {slackId && (
          <Tooltip title="Contactar en Slack">
            <IconButton color="info" onClick={() => window.open(`slack://user?team=T0BFXMWMV&id=${slackId}`, '_blank')}>
              <i className="fab fa-slack" style={{ fontSize: 20, color: '#1976d2' }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      {/* Línea de PM, Mentor y TAs */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { sm: 'center' }, mt: 2 }}>
        {/* PM */}
        {pm && (
          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', fontSize: '0.7rem', mb: 0.5 }}>
              <FiberManualRecordIcon sx={{ color: '#e3f2fd', fontSize: 16, mr: 0.5 }} /> PM
            </Typography>
            <Chip
              label={
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {pm}
                  {pmSlackId && <i className="fab fa-slack" style={{ fontSize: 16, color: '#1976d2', marginLeft: 4 }} />}
                </span>
              }
              color="primary"
              clickable={!!pmSlackId}
              component={pmSlackId ? 'a' : undefined}
              href={pmSlackId ? `slack://user?team=T0BFXMWMV&id=${pmSlackId}` : undefined}
              target={pmSlackId ? '_blank' : undefined}
              rel={pmSlackId ? 'noopener noreferrer' : undefined}
              sx={{ fontWeight: 500, fontSize: '0.9rem', mb: 1, px: 1, py: 0.5, bgcolor: '#e3f2fd', color: '#1976d2' }}
            />
          </Box>
        )}
        {/* Mentor y TA solo si no está finished */}
        {!isFinished && mentors.length > 0 && mentors.map((m, i) => (
          <Box key={i}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', fontSize: '0.7rem', mb: 0.5 }}>
              <FiberManualRecordIcon sx={{ color: '#f3e5f5', fontSize: 16, mr: 0.5 }} /> Mentor
            </Typography>
            <Chip
              label={
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {m.firstName}
                  {m.slackId && <i className="fab fa-slack" style={{ fontSize: 16, color: '#7b1fa2', marginLeft: 4 }} />}
                </span>
              }
              clickable={!!m.slackId}
              component={m.slackId ? 'a' : undefined}
              href={m.slackId ? `slack://user?team=T0BFXMWMV&id=${m.slackId}` : undefined}
              target={m.slackId ? '_blank' : undefined}
              rel={m.slackId ? 'noopener noreferrer' : undefined}
              sx={{ fontWeight: 500, fontSize: '0.9rem', mb: 1, px: 1, py: 0.5, bgcolor: '#f3e5f5', color: '#7b1fa2' }}
            />
          </Box>
        ))}
        {!isFinished && tas.length > 0 && (
          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', fontSize: '0.7rem', mb: 0.5 }}>
              <FiberManualRecordIcon sx={{ color: '#ffebee', fontSize: 16, mr: 0.5 }} /> TA
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {tas.map((t, i) => (
                <Chip
                  key={i}
                  label={
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {t.firstName}
                      {t.slackId && <i className="fab fa-slack" style={{ fontSize: 16, color: '#d32f2f', marginLeft: 4 }} />}
                    </span>
                  }
                  clickable={!!t.slackId}
                  component={t.slackId ? 'a' : undefined}
                  href={t.slackId ? `slack://user?team=T0BFXMWMV&id=${t.slackId}` : undefined}
                  target={t.slackId ? '_blank' : undefined}
                  rel={t.slackId ? 'noopener noreferrer' : undefined}
                  sx={{ fontWeight: 500, fontSize: '0.9rem', mb: 1, px: 1, py: 0.5, bgcolor: '#ffebee', color: '#d32f2f' }}
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
} 