import { useState, useEffect } from 'react'
import { getNotionPage, getCohortPageById } from '../services/notionService'

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
        const data = await getCohortPageById(pageId, token)
        setRecordMap(data)
      } catch (err) {
        console.error('Error fetching Notion page:', err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [pageId, token])

  return { recordMap, loading, error }
}

export default useNotionPage
