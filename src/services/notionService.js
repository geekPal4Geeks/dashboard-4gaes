export async function getNotionPage(pageId, token) {
  const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/notion-page`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ pageId })
  });

  if (!resp.ok) {
    const errorData = await resp.json();
    throw new Error(errorData.detail || 'Failed to fetch Notion page');
  }

  return await resp.json();
} 