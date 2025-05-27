export async function loginService({ email, password }) {
  const resp = await fetch(`${import.meta.env.VITE_4GEEKS_API_URL}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.detail || 'Login failed');
  return data;
}

export async function getUserMe(token) {
  const resp = await fetch(`${import.meta.env.VITE_4GEEKS_API_URL}/auth/user/me`, {
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!resp.ok) throw new Error('No se pudo obtener el usuario');
  return await resp.json();
}

export function githubLogin() {
  const baseUrl = import.meta.env.VITE_4GEEKS_API_URL;
  const callbackUrl = window.location.origin + "/session/signin";
  const githubUrl = `${baseUrl}/auth/github?url=${encodeURIComponent(callbackUrl)}`;
  window.location.href = githubUrl;
} 