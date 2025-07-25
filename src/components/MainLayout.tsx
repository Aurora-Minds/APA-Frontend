import React from 'react';
import Sidebar from './Sidebar';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router-dom';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import HomeIcon from '@mui/icons-material/Home';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import BrightnessAutoIcon from '@mui/icons-material/BrightnessAuto';
import { useColorMode } from '../theme/ColorModeContext';
import { useAuth } from '../context/AuthContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  const mainBg = theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, #0f1535 0%, #1b254b 100%)'
    : '#f4f7fe';
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { userPref, setTheme } = useColorMode();
  const [avatarMenuAnchor, setAvatarMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [showThemeMenu, setShowThemeMenu] = React.useState(false);

  // Map pathnames to titles
  const pathMap: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/tasks': 'Tasks',
    '/focus-timer': 'Focus Timer',
    '/lab-assistant': 'Lab Assistant',
    '/analytics': 'Focus Analytics',
    '/email-settings': 'Email Settings',
    '/settings': 'Settings',
  };
  const title = pathMap[location.pathname] || 'Dashboard';

  const handleThemeChange = (newMode: 'light' | 'dark' | 'system') => {
    setTheme(newMode);
  };
  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => setAvatarMenuAnchor(event.currentTarget);
  const handleAvatarMenuClose = () => {
    setAvatarMenuAnchor(null);
    setShowThemeMenu(false);
  }
  const handleSettings = () => {
    setAvatarMenuAnchor(null);
    navigate('/settings');
  };
  const handleLogout = () => { setAvatarMenuAnchor(null); logout(); };

  const openThemeMenu = () => setShowThemeMenu(true);
  const closeThemeMenu = () => setShowThemeMenu(false);

  return (
    <Box sx={{ minHeight: '100vh', width: '100vw', background: mainBg, display: 'flex' }}>
      <Sidebar />
      <Box sx={{ flex: 1, p: 0, minWidth: 0 }}>
        {/* Top bar: Breadcrumb/title and right icons in a single row */}
        <Box sx={{ px: 4, pt: 4, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Breadcrumbs separator="/" aria-label="breadcrumb" sx={{ color: theme.palette.text.secondary, fontSize: 15 }}>
              <HomeIcon sx={{ fontSize: 18, mb: '-2px' }} />
              <span>{title}</span>
            </Breadcrumbs>
            <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
              {title}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={handleAvatarClick} sx={{ color: theme.palette.text.primary }}>
              <AccountCircleIcon sx={{ width: 32, height: 32 }} />
            </IconButton>
            <Menu anchorEl={avatarMenuAnchor} open={Boolean(avatarMenuAnchor)} onClose={handleAvatarMenuClose}>
              {!showThemeMenu ? (
                <div>
                  <MenuItem disabled sx={{ fontWeight: 600, opacity: 1, pointerEvents: 'none' }}>{user?.name || 'User'}</MenuItem>
                  <Divider />
                  <MenuItem onClick={handleSettings}>Settings</MenuItem>
                  <MenuItem onClick={openThemeMenu}>Appearance</MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </div>
              ) : (
                <div>
                  <MenuItem onClick={closeThemeMenu}>
                    <ArrowBackIcon sx={{ mr: 1 }} />
                    Appearance
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={() => handleThemeChange('system')} selected={userPref === 'system'}>
                    <ListItemIcon><BrightnessAutoIcon fontSize="small" /></ListItemIcon>
                    Device theme
                  </MenuItem>
                  <MenuItem onClick={() => handleThemeChange('dark')} selected={userPref === 'dark'}>
                    <ListItemIcon><Brightness4Icon fontSize="small" /></ListItemIcon>
                    Dark theme
                  </MenuItem>
                  <MenuItem onClick={() => handleThemeChange('light')} selected={userPref === 'light'}>
                    <ListItemIcon><Brightness7Icon fontSize="small" /></ListItemIcon>
                    Light theme
                  </MenuItem>
                </div>
              )}
            </Menu>
          </Box>
        </Box>
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout; 