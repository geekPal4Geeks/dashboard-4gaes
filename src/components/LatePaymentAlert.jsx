import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'

const LatePaymentAlert = ({ student, isVisible = false }) => {
  const [isAlertShown, setIsAlertShown] = useState(false)

  // Verificar si el estudiante tiene pagos pendientes
  const isLate = student?.properties?.['Late payment']?.checkbox

  const showLatePaymentAlert = () => {
    // Evitar múltiples alerts
    if (isAlertShown) {
      return
    }

    setIsAlertShown(true)

    Swal.fire({
      title: '⚠️ ¡ATENCIÓN! ⚠️',
      html: `
        <div style="text-align: left; font-size: 16px;">
          <p style="margin-bottom: 15px; font-weight: bold; color: #d32f2f;">
            Este alumno tiene <strong>PAGOS PENDIENTES</strong>
          </p>
          <p style="margin-bottom: 10px;">
            <strong>INSTRUCCIONES IMPORTANTES:</strong>
          </p>
          <ul style="text-align: left; margin-left: 20px;">
            <li>❌ <strong>NO AVANCES</strong> con la sesión</li>
            <li>🔄 Deriva al estudiante al equipo de <strong>Administración</strong></li>
            <li>📞 Contacta al PM para su gestión</li>
            <li>⏸️ Pausa cualquier actividad académica</li>
          </ul>
          <p style="margin-top: 15px; font-style: italic; color: #666;">
            Esta alerta aparecerá siempre y cuando el alumno no actualice su situación con administración.
          </p>
        </div>
      `,
      icon: 'warning',
      iconColor: '#d32f2f',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#d32f2f',
      showCloseButton: true,
      allowOutsideClick: true,
      allowEscapeKey: true,
      backdrop: 'rgba(0,0,0,0.8)',
      customClass: {
        popup: 'swal2-late-payment',
        title: 'swal2-late-payment-title',
        htmlContainer: 'swal2-late-payment-content',
        closeButton: 'swal2-late-payment-close',
      },
      didOpen: () => {
        // Forzar el cierre si hay problemas de visualización
        const closeButton = document.querySelector('.swal2-close')
        if (closeButton) {
          closeButton.addEventListener('click', () => {
            setTimeout(() => {
              if (Swal.isVisible()) {
                Swal.close()
                // Force remove si persiste
                const swalContainer = document.querySelector('.swal2-container')
                if (swalContainer) {
                  swalContainer.remove()
                }
              }
              // Restaurar el scroll del body de forma más agresiva
              document.body.style.overflow = 'auto'
              document.body.style.overflowX = 'auto'
              document.body.style.overflowY = 'auto'
              document.body.style.paddingRight = ''
              document.body.style.position = ''
              document.body.style.top = ''
              document.body.style.width = ''

              // También restaurar el html
              document.documentElement.style.overflow = 'auto'
              document.documentElement.style.overflowX = 'auto'
              document.documentElement.style.overflowY = 'auto'

              // Forzar un reflow
              document.body.offsetHeight
            }, 100)
          })
        }
      },
    })
      .then((result) => {
        console.log('Alerta cerrada:', result)
        // Force close si el modal sigue visible
        setTimeout(() => {
          if (Swal.isVisible()) {
            console.log('Forzando cierre del modal...')
            Swal.close()
            const swalContainer = document.querySelector('.swal2-container')
            if (swalContainer) {
              swalContainer.remove()
            }
          }
          // Restaurar el scroll del body de forma más agresiva
          document.body.style.overflow = 'auto'
          document.body.style.overflowX = 'auto'
          document.body.style.overflowY = 'auto'
          document.body.style.paddingRight = ''
          document.body.style.position = ''
          document.body.style.top = ''
          document.body.style.width = ''

          // También restaurar el html
          document.documentElement.style.overflow = 'auto'
          document.documentElement.style.overflowX = 'auto'
          document.documentElement.style.overflowY = 'auto'

          // Forzar un reflow
          document.body.offsetHeight

          console.log('Scroll restaurado forzadamente')
        }, 200)
      })
      .catch((error) => {
        console.error('Error al mostrar la alerta:', error)
        setIsAlertShown(false)
      })
  }

  // Mostrar alerta cuando el estudiante esté cargado y tenga pagos pendientes
  useEffect(() => {
    if (student && isLate && !isAlertShown && isVisible) {
      // Pequeño delay para asegurar que la página esté completamente cargada
      const timer = setTimeout(() => {
        showLatePaymentAlert()
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [student, isLate, isAlertShown, isVisible])

  // Cleanup del scroll cuando el componente se desmonte
  useEffect(() => {
    return () => {
      // Restaurar el scroll cuando el componente se desmonte
      document.body.style.overflow = 'auto'
      document.body.style.overflowX = 'auto'
      document.body.style.overflowY = 'auto'
      document.body.style.paddingRight = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''

      document.documentElement.style.overflow = 'auto'
      document.documentElement.style.overflowX = 'auto'
      document.documentElement.style.overflowY = 'auto'
    }
  }, [])

  // Función para resetear el estado del alert (útil para cuando se busca un nuevo estudiante)
  const resetAlert = () => {
    setIsAlertShown(false)
  }

  // Exponer la función reset para uso externo
  useEffect(() => {
    if (window.resetLatePaymentAlert) {
      window.resetLatePaymentAlert = resetAlert
    } else {
      window.resetLatePaymentAlert = resetAlert
    }
  }, [])

  // El componente no renderiza nada visualmente, solo maneja la lógica del alert
  return null
}

export default LatePaymentAlert
