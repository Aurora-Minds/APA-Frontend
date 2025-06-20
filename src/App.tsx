import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import AllTasks from './components/AllTasks';
import MainLayout from './components/MainLayout';
import { ColorModeProvider, useColorMode } from './theme/ColorModeContext';
import FocusTimer from './components/FocusTimer';
import { CircularProgress, Box, ThemeProvider, createTheme, CssBaseline } from '@mui/material';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  const { mode } = useColorMode();
  const theme = createTheme({
    palette: {
      mode,
      ...(mode === 'light' 
        ? {
            // palette for light mode
            primary: { main: '#1976d2' },
            background: { default: '#f4f7fe', paper: '#ffffff' },
          }
        : {
            // palette for dark mode
            primary: { main: '#90caf9' },
            background: { default: '#121212', paper: '#1e1e1e' },
          }),
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route 
          path="/tasks" 
          element={
            <PrivateRoute>
              <MainLayout>
                <AllTasks />
              </MainLayout>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/focus-timer" 
          element={
            <PrivateRoute>
              <MainLayout>
                <FocusTimer />
              </MainLayout>
            </PrivateRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </ThemeProvider>
  );
};

export default function AppWithProviders() {
  return (
    <Router>
      <AuthProvider>
        <ColorModeProvider>
          <App />
        </ColorModeProvider>
      </AuthProvider>
    </Router>
  );
}
