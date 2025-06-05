import { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Link, Stack, Alert, CircularProgress } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useNavigate } from 'react-router-dom';
import { loginService, githubLogin } from '../services/authService';
import useGlobalReducer from '../hooks/useGlobalReducer';
import { useFetchAndSetUser } from '../hooks/useFetchAndSetUser';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [githubLoading, setGithubLoading] = useState(false);
    const navigate = useNavigate();
    const { dispatch } = useGlobalReducer();
    const fetchAndSetUser = useFetchAndSetUser();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await loginService({ email, password });
            localStorage.setItem('token', data.token);
            localStorage.setItem('expires_at', data.expires_at);

            // Usar el hook para obtener y setear el usuario
            const ok = await fetchAndSetUser(data.token);
            if (ok) navigate('/courses');
            // Si no, el hook ya hace logout y redirige
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    const handleGithubLogin = () => {
        setGithubLoading(true);
        githubLogin();
        setTimeout(() => setGithubLoading(false), 2000);
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                bgcolor: '#23283b',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
            }}
        >
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Paper
                    elevation={3}
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        borderRadius: 3,
                        overflow: 'hidden',
                        minWidth: { xs: 320, md: 600 },
                        maxWidth: 700,
                        width: '100%',
                    }}
                >
                    {/* Logo */}
                    <Box
                        sx={{
                            bgcolor: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            px: { xs: 4, md: 6 },
                            py: { xs: 3, md: 6 },
                            minWidth: { md: 220 },
                        }}
                    >
                        <Typography variant="h3" sx={{ fontWeight: 700, fontSize: { xs: 32, md: 40 } }}>
                            4Geek
                            <Box component="span" sx={{ color: '#0097CF' }}>s</Box>
                        </Typography>
                    </Box>
                    {/* Form */}
                    <Box
                        component="form"
                        onSubmit={handleLogin}
                        sx={{
                            bgcolor: '#fafbfc',
                            p: { xs: 3, md: 4 },
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            minWidth: { xs: 220, md: 320 },
                            width: '100%',
                        }}
                    >
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                        <TextField
                            label="Email"
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            size="small"
                            autoComplete="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                        <TextField
                            label="Password"
                            type="password"
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            size="small"
                            autoComplete="current-password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                type="submit"
                                disabled={loading || githubLoading}
                            >
                                {loading ? 'Signing in...' : 'Sign in'}
                            </Button>
                            <Typography sx={{ mx: 1, color: 'text.secondary' }}>or</Typography>
                            <Button
                                variant="outlined"
                                startIcon={githubLoading ? <CircularProgress size={18} /> : <GitHubIcon />}
                                sx={{ bgcolor: '#f5f5f5', boxShadow: 1, minWidth: 120 }}
                                fullWidth
                                onClick={handleGithubLogin}
                                disabled={githubLoading || loading}
                            >
                                {githubLoading ? 'Redirecting...' : 'With Github'}
                            </Button>
                        </Stack>
                        <Link
                            href={`${import.meta.env.VITE_4GEEKS_API_URL}/auth/password/reset`}
                            underline="hover"
                            sx={{ mt: 2, fontSize: 14, alignSelf: 'flex-start', color: '#1976d2' }}
                            target="_blank"
                            rel="noopener"
                        >
                            Forgot password?
                        </Link>
                    </Box>
                </Paper>
            </Box>
            {/* Footer */}
            <Box
                component="footer"
                sx={{
                    py: 2,
                    textAlign: 'center',
                    color: '#fff',
                    opacity: 0.7,
                    fontSize: 15,
                    letterSpacing: 0.2,
                }}
            >
                Made with <Box component="span" sx={{ color: '#e25555', fontWeight: 700 }}>♥</Box> by{' '}
                <Link
                    href="https://4geeksacademy.com/es/inicio"
                    target="_blank"
                    rel="noopener"
                    sx={{ color: '#fff', textDecoration: 'underline', fontWeight: 500 }}
                >
                    4Geeks Academy Spain
                </Link>
            </Box>
        </Box>
    );
}
