import { useState, useEffect } from 'react';
import { getNotionPage } from '../services/notionService';

export function useNotionPage(pageId, token) {
  const [recordMap, setRecordMap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pageId) return;

    const fetchNotionPage = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getNotionPage(pageId, token);
        setRecordMap(data.recordMap || data);
      } catch (err) {
        setError(err.message);
        setRecordMap(null);
      } finally {
        setLoading(false);
      }
    };

    fetchNotionPage();
  }, [pageId, token]);

  return { recordMap, loading, error };
} 