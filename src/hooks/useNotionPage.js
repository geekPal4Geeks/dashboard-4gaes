import { useState, useEffect } from 'react'
import { getNotionPage } from '../services/notionService'

const useNotionPage = (pageId, token) => {
  const [recordMap, setRecordMap] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!pageId) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getNotionPage(pageId, token)
        setRecordMap(data.recordMap || data)
      } catch (err) {
        console.error('Error fetching Notion page:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [pageId, token])

  return { recordMap, loading, error }
}

export default useNotionPage
