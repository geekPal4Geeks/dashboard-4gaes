import { useState } from 'react'
import { Box, Typography, Chip, Button, Tooltip, IconButton, Paper, Modal } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import GitHubIcon from '@mui/icons-material/GitHub'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import StudentDetailModal from './StudentDetailModal'
import { parseCohortData, parseCurrentModuleLabel } from '../utils/studentHelpers'
import { getTeamSlackId } from '../utils/cohortHelpers'

// Modal principal con toda la info
function StudentInfoBox({ open, onClose, student, cohortInfo }) {
  const [copied, setCopied] = useState(false)
  if (!student) return null
  // Slack ID del estudiante
  const slackId = student?.properties?.['Slack ID']?.rich_text?.[0]?.text?.content
  // Nombre completo
  const fullName = student?.properties?.['Student']?.title?.[0]?.plain_text || 'Sin nombre'
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
  // Determinar si la cohorte está finalizada
  const isFinished = cohortInfo?.properties?.['Status']?.select?.name === 'Finished'
  const isPrework = cohortInfo?.properties?.['Status']?.select?.name === 'Prework'
  // Prework Advisor
  const preworkAdvisor = student?.properties?.['Prework Advisor']?.select?.name
  const preworkAdvisorSlackId = preworkAdvisor ? getTeamSlackId(preworkAdvisor) : null
  // Educational Status
  const educationalStatus = student?.properties?.['Educational Status']?.select?.name
  const isGraduated = educationalStatus === 'Graduated'
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ maxWidth: 800, minWidth: 400, bgcolor: 'background.paper', m: '40px auto', p: 4, borderRadius: 3, outline: 'none' }}>
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
            {/* Email y github */}
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
            {/* Slack debajo del email */}
            {slackId && (
              <Tooltip title="Abrir Slack">
                <Button
                  variant="text"
                  size="small"
                  sx={{ color: '#1976d2', textTransform: 'none', p: 0, minWidth: 0, fontSize: 16, display: 'flex', alignItems: 'center', gap: 0.5 }}
                  onClick={() => window.open(`slack://user?team=T0BFXMWMV&id=${slackId}`, '_blank')}
                  startIcon={<i className="fab fa-slack" style={{ fontSize: 18, color: '#1976d2' }} />}
                >
                  Slack
                </Button>
              </Tooltip>
            )}
          </Box>
        </Box>
        {/* Línea de PM, Mentor y TAs */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { sm: 'center' }, mt: 2 }}>
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
                clickable={!!pmSlackId}
                component={pmSlackId ? 'a' : undefined}
                href={pmSlackId ? `slack://user?team=T0BFXMWMV&id=${pmSlackId}` : undefined}
                target={pmSlackId ? '_blank' : undefined}
                rel={pmSlackId ? 'noopener noreferrer' : undefined}
                sx={{ fontWeight: 500, fontSize: '0.9rem', mb: 1, px: 1, py: 0.5, bgcolor: '#e3f2fd', color: '#1976d2' }}
              />
            </Box>
          )}
          {/* Prework Advisor solo si la cohorte está en prework */}
          {preworkAdvisor && isPrework && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', fontSize: '0.7rem', mb: 0.5 }}>
                <FiberManualRecordIcon sx={{ color: '#e8f5e9', fontSize: 16, mr: 0.5 }} /> Prework Advisor
              </Typography>
              <Chip
                label={
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {preworkAdvisor}
                    {preworkAdvisorSlackId && <i className="fab fa-slack" style={{ fontSize: 16, color: '#43a047', marginLeft: 4 }} />}
                  </span>
                }
                clickable={!!preworkAdvisorSlackId}
                component={preworkAdvisorSlackId ? 'a' : undefined}
                href={preworkAdvisorSlackId ? `slack://user?team=T0BFXMWMV&id=${preworkAdvisorSlackId}` : undefined}
                target={preworkAdvisorSlackId ? '_blank' : undefined}
                rel={preworkAdvisorSlackId ? 'noopener noreferrer' : undefined}
                sx={{ fontWeight: 500, fontSize: '0.9rem', mb: 1, px: 1, py: 0.5, bgcolor: '#e8f5e9', color: '#43a047' }}
              />  
            </Box>
          )}
          {/* Mentores */}
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
          {/* TAs */}
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
        {/* Información adicional del estudiante */}
        {student?.properties?.['Synced?']?.checkbox ? (
          <Box sx={{ mt: 3, mb: 2, p: 2, background: 'rgba(0,0,0,0.03)', borderRadius: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '1rem', mb: 1 }}>
              Información adicional del estudiante
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ¿Por qué hace este curso?
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {student?.properties?.['Why do this course?']?.rich_text?.[0]?.text?.content || 'Se desconoce'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Área de estudios*
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {student?.properties?.['Studies area']?.select?.name || 'Se desconoce'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Experiencia o conocimientos en programación*
            </Typography>
            <Typography variant="body2">
              {student?.properties?.['Programming Experience or Knowledge']?.rich_text?.[0]?.text?.content || 'Se desconoce'}
            </Typography>
            <Typography sx={{ marginTop: 2, fontSize: '11px' }} variant="body2" color="gray">
              * Previo al ingreso
            </Typography>
          </Box>
        ) : (
          <Box sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              El alumno no ha completado aún la encuesta de información personal.
            </Typography>
          </Box>
        )}
        {/* Modal de detalle */}
        <StudentDetailModal open={false} onClose={() => {}} student={student} />
      </Box>
    </Modal>
  )
}

// Trigger que muestra solo la cabecera y abre el modal
export function StudentInfoBoxTrigger({ student, cohortInfo }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  if (!student) return null
  // Slack ID del estudiante
  const slackId = student?.properties?.['Slack ID']?.rich_text?.[0]?.text?.content
  // Nombre completo
  const fullName = student?.properties?.['Student']?.title?.[0]?.plain_text || 'Sin nombre'
  // Módulo actual
  const currentModuleArr = student?.properties?.['Cohort current module']?.rollup?.array
  const currentModuleLabel = parseCurrentModuleLabel(currentModuleArr)
  // Cohorte
  const cohortName = student?.properties?.['Cohort name for Zapier']?.formula?.string
  // GitHub
  const github = student?.properties?.['Github profile']?.url
  // Determinar si la cohorte está finalizada
  const isFinished = cohortInfo?.properties?.['Status']?.select?.name === 'Finished'
  // Educational Status
  const educationalStatus = student?.properties?.['Educational Status']?.select?.name
  const isGraduated = educationalStatus === 'Graduated'
  return (
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
        {/* Github a la izquierda del email */}
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
      {/* Botones a la derecha */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
        <Tooltip title="Ver detalle del alumno">
          <IconButton color="primary" onClick={() => setOpen(true)}>
            <AddIcon />
          </IconButton>
        </Tooltip>
        {slackId && (
          <Tooltip title="Contactar en Slack">
            <IconButton color="info" onClick={() => window.open(`slack://user?team=T0BFXMWMV&id=${slackId}`, '_blank')}>
              <i className="fab fa-slack" style={{ fontSize: 20, color: '#1976d2' }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <StudentInfoBox open={open} onClose={() => setOpen(false)} student={student} cohortInfo={cohortInfo} />
    </Box>
  )
} 