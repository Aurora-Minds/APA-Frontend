import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Link,
    IconButton,
    InputAdornment,
    Checkbox,
    FormControlLabel,
    Divider
} from '@mui/material';
import { Visibility, VisibilityOff, Google as GoogleIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { Global } from '@emotion/react';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.msg || 'An error occurred');
        }
    };

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    return (
        <>
            <Global
                styles={`
                  input:-webkit-autofill,
                  input:-webkit-autofill:focus,
                  input:-webkit-autofill:hover,
                  input:-webkit-autofill:active {
                    -webkit-box-shadow: 0 0 0 1000px #ededed inset !important;
                    box-shadow: 0 0 0 1000px #ededed inset !important;
                    -webkit-text-fill-color: #111 !important;
                    caret-color: #111 !important;
                  }
                `}
            />
            <Box
                sx={{
                    minHeight: '100vh',
                    width: '100vw',
                    backgroundImage: `url('/left-background.jpg')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Paper
                    elevation={6}
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        borderRadius: 18,
                        border: '8px solid #fff',
                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                        maxWidth: 1100,
                        width: '100%',
                        minHeight: { xs: 'auto', md: 700 },
                        overflow: 'hidden',
                        bgcolor: 'transparent',
                    }}
                >
                    {/* Left Side (Quote, more transparent) */}
                    <Box
                        sx={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            p: { xs: 4, md: 6 },
                            borderTopLeftRadius: 18,
                            borderBottomLeftRadius: 18,
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, mt: 1 }}>
                            <Typography
                                variant="overline"
                                sx={{
                                    fontSize: 13,
                                    fontWeight: 500,
                                    letterSpacing: 2,
                                    color: 'rgba(255,255,255,0.85)',
                                    textTransform: 'uppercase',
                                    fontFamily: 'Montserrat, Roboto, Arial, sans-serif',
                                }}
                            >
                                A WISE QUOTE
                            </Typography>
                            <Box sx={{ width: 80, height: 1.5, bgcolor: 'rgba(255,255,255,0.5)', ml: 2, borderRadius: 1 }} />
                        </Box>
                        <Box>
                            <Typography
                                variant="h2"
                                sx={{
                                    fontWeight: 700,
                                    fontSize: 40,
                                    lineHeight: 1.1,
                                    color: '#fff',
                                    fontFamily: 'Montserrat, Roboto, Arial, sans-serif',
                                    mb: 2,
                                }}
                            >
                                Get<br />Everything<br />You Want
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    opacity: 1,
                                    fontSize: 15,
                                    color: 'rgba(255,255,255,0.85)',
                                    fontFamily: 'Montserrat, Roboto, Arial, sans-serif',
                                    mt: 2,
                                }}
                            >
                                You can get everything you want if you work hard, trust the process, and stick to the plan.
                            </Typography>
                        </Box>
                    </Box>
                    {/* Right Side (Login Form, solid white) */}
                    <Box
                        sx={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: { xs: 4, md: 6 },
                            bgcolor: '#fff',
                            borderTopRightRadius: 18,
                            borderBottomRightRadius: 18,
                        }}
                    >
                        <Box sx={{ width: '100%', maxWidth: 500, mx: 'auto' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                                <img src="/aurora-minds-logo.png" alt="Aurora Minds Logo" style={{ width: 220 }} />
                                <Typography
                                    sx={{
                                        fontSize: 16,
                                        color: '#111',
                                        fontWeight: 600,
                                        fontFamily: 'Montserrat, Roboto, Arial, sans-serif',
                                        ml: 2,
                                        mb: 0,
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    Turn Procrastination Into Progress
                                </Typography>
                            </Box>
                            <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 700, mb: 1, fontSize: 32, color: '#111' }}>
                                Welcome
                            </Typography>
                            <Typography align="center" sx={{ color: '#888', mb: 3, fontSize: 15, maxWidth: 500, mx: 'auto', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'clip', fontWeight: 400 }}>
                                Enter your email and password to access your account
                            </Typography>
                            {error && (
                                <Typography color="error" align="center" gutterBottom>
                                    {error}
                                </Typography>
                            )}
                            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                                <Box sx={{ mb: 1 }}>
                                    <Typography variant="subtitle2" sx={{ color: '#111', fontWeight: 600, mb: 0.5 }}>
                                        Email
                                    </Typography>
                                    <TextField
                                        margin="none"
                                        required
                                        fullWidth
                                        id="email"
                                        name="email"
                                        autoComplete="email"
                                        autoFocus
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        InputProps={{
                                            style: {
                                                background: '#ededed',
                                                borderRadius: 8,
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                                border: '1px solid #ccc',
                                                color: '#111',
                                                fontWeight: 500,
                                            },
                                        }}
                                        inputProps={{ style: { color: '#111' } }}
                                    />
                                </Box>
                                <Box sx={{ mb: 1.5 }}>
                                    <Typography variant="subtitle2" sx={{ color: '#111', fontWeight: 600, mb: 0.5 }}>
                                        Password
                                    </Typography>
                                    <TextField
                                        margin="none"
                                        required
                                        fullWidth
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        InputProps={{
                                            style: {
                                                background: '#ededed',
                                                borderRadius: 8,
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                                border: '1px solid #ccc',
                                                color: '#111',
                                                fontWeight: 500,
                                            },
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={handleClickShowPassword}
                                                        edge="end"
                                                    >
                                                        {showPassword ? <VisibilityOff sx={{ color: '#111' }} /> : <Visibility sx={{ color: '#111' }} />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                        inputProps={{ style: { color: '#111' } }}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                    <FormControlLabel
                                        control={<Checkbox checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} sx={{ color: '#111', '&.Mui-checked': { color: '#111' } }} />}
                                        label={<Typography variant="body2" sx={{ color: '#111', fontWeight: 500 }}>Remember me</Typography>}
                                    />
                                    <Link href="#" variant="body2" sx={{ fontWeight: 500, color: '#111', textDecoration: 'none', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                                        Forgot Password
                                    </Link>
                                </Box>
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    sx={{ mt: 3, mb: 2, bgcolor: '#111', color: '#fff', fontWeight: 600, borderRadius: 2, '&:hover': { bgcolor: '#333' } }}
                                >
                                    Sign In
                                </Button>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<GoogleIcon />}
                                    sx={{ mb: 2, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                                    disabled
                                >
                                    Sign In with Google
                                </Button>
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="body2" sx={{ color: '#888' }}>
                                        Don&apos;t have an account?{' '}
                                        <Link href="/register" variant="body2" sx={{ fontWeight: 600, color: '#111' }}>
                                            Sign Up
                                        </Link>
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </>
    );
};

export default Login; 