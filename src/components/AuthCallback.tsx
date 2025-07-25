import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth authentication failed:', error);
      navigate('/login?error=oauth_failed');
      return;
    }

    if (success === 'true' && token) {
      try {
        // Store the token
        localStorage.setItem('token', token);
        
        // Login with the token
        loginWithToken(token);
        
        // Redirect to dashboard
        navigate('/dashboard');
      } catch (err) {
        console.error('Error during OAuth login:', err);
        navigate('/login?error=oauth_failed');
      }
    } else {
      // Handle error
      console.error('OAuth authentication failed - missing token or success flag');
      navigate('/login?error=oauth_failed');
    }
  }, [searchParams, navigate, loginWithToken]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: 2
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" color="text.secondary">
        Completing authentication...
      </Typography>
    </Box>
  );
};

export default AuthCallback; 