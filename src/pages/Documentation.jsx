import EnhancedNotionViewer from '../components/EnhancedNotionViewer'
import { DOCUMENTATION_MENU } from '../config/documentationMenu'
import useGlobalReducer from '../hooks/useGlobalReducer'

export default function Documentation() {
  const { store } = useGlobalReducer()
  return (
    <EnhancedNotionViewer
      menuItems={DOCUMENTATION_MENU}
      token={store?.token}
    />
  )
}
