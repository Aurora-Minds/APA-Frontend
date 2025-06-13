import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import AccountSettings from './components/AccountSettings';
import AllTasks from './components/AllTasks';
import MainLayout from './components/MainLayout';
import { ColorModeProvider, useColorMode } from './theme/ColorModeContext';
import { useContext } from 'react';
import FocusTimer from './components/FocusTimer';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  const { mode } = useColorMode();
  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: process.env.REACT_APP_PRIMARY_COLOR || '#1976d2',
      },
      secondary: {
        main: process.env.REACT_APP_SECONDARY_COLOR || '#dc004e',
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
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
            <Route path="/tasks" element={<MainLayout><AllTasks /></MainLayout>} />
            <Route path="/focus-timer" element={<MainLayout><FocusTimer /></MainLayout>} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default function AppWithProvider() {
  return (
    <AuthProvider>
      <ColorModeProvider>
        <App />
      </ColorModeProvider>
    </AuthProvider>
  );
}
