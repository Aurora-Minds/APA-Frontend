import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TimerProvider } from './context/TimerContext';
import { NotificationProvider } from './context/NotificationContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import AllTasks from './components/AllTasks';
import MainLayout from './components/MainLayout';
import { ColorModeProvider, useColorMode } from './theme/ColorModeContext';
import FocusTimer from './components/FocusTimer';
import AIAssistant from './components/AIAssistant';
import AuthCallback from './components/AuthCallback';
import Analytics from './components/Analytics';
import EmailSettings from './components/EmailSettings';
import Settings from './components/Settings';
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
      primary: { main: '#4318ff' },
      secondary: { main: '#0f1535' },
      info: { main: '#0075ff' },
      success: { main: '#01b574' },
      warning: { main: '#ffb547' },
      error: { main: '#e31a1a' },
      background: {
        default: mode === 'dark' ? '#0f1535' : '#f4f7fe',
        paper: mode === 'dark' ? 'rgba(6, 11, 40, 0.94)' : '#ffffff',
      },
      // Remove gradients and neutrals from palette for linter compliance
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth-callback" element={<AuthCallback />} />
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
        <Route 
          path="/lab-assistant" 
          element={
            <PrivateRoute>
              <MainLayout>
                <AIAssistant />
              </MainLayout>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <PrivateRoute>
              <MainLayout>
                <Settings />
              </MainLayout>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/analytics" 
          element={
            <PrivateRoute>
              <MainLayout>
                <Analytics />
              </MainLayout>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/email-settings" 
          element={
            <PrivateRoute>
              <MainLayout>
                <EmailSettings />
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
          <TimerProvider>
            <NotificationProvider>
              <App />
            </NotificationProvider>
          </TimerProvider>
        </ColorModeProvider>
      </AuthProvider>
    </Router>
  );
}
