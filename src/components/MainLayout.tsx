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
import SettingsIcon from '@mui/icons-material/Settings';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import BrightnessAutoIcon from '@mui/icons-material/BrightnessAuto';
import { useColorMode } from '../theme/ColorModeContext';
import { useAuth } from '../context/AuthContext';
import NotificationIcon from './NotificationIcon';

import MenuIcon from '@mui/icons-material/Menu';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = React.useState(true);
  const theme = useTheme();
  const mainBg = theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, #0f1535 0%, #1b254b 100%)'
    : '#f4f7fe';
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { userPref, setTheme } = useColorMode();
  const [avatarMenuAnchor, setAvatarMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [themeMenuAnchor, setThemeMenuAnchor] = React.useState<null | HTMLElement>(null);

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
    // Keep the theme menu open so user can easily change themes
  };
  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => setAvatarMenuAnchor(event.currentTarget);
  const handleAvatarMenuClose = () => {
    setAvatarMenuAnchor(null);
  }
  const handleThemeMenuClick = (event: React.MouseEvent<HTMLElement>) => setThemeMenuAnchor(event.currentTarget);
  const handleThemeMenuClose = () => {
    setThemeMenuAnchor(null);
  }
  const handleSettings = () => {
    setAvatarMenuAnchor(null);
    navigate('/settings');
  };
  const handleLogout = () => { setAvatarMenuAnchor(null); logout(); };

  return (
    <Box sx={{ minHeight: '100vh', width: '100%', background: mainBg, display: 'flex', overflow: 'hidden' }}>
      <Sidebar isOpen={isSidebarOpen} />
      <Box sx={{ flex: 1, p: 0, minWidth: 0 }}>
        {/* Top bar: Breadcrumb/title and right icons in a single row */}
        <Box sx={{ px: 4, pt: 4, pb: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => setSidebarOpen(!isSidebarOpen)}>
              <MenuIcon />
            </IconButton>
            <Breadcrumbs separator="/" aria-label="breadcrumb" sx={{ color: theme.palette.text.secondary, fontSize: 15 }}>
              <HomeIcon sx={{ fontSize: 18, mb: '-2px' }} />
              <span>{title}</span>
            </Breadcrumbs>
            <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
              {title}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {/* Theme Settings Icon with Glassy Circle */}
            <IconButton 
              onClick={handleThemeMenuClick} 
              sx={{ 
                color: theme.palette.text.primary,
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                }
              }}
            >
              <SettingsIcon sx={{ width: 20, height: 20 }} />
            </IconButton>
            
            {/* Notification Icon */}
            <Box sx={{ mr: 1 }}>
              <NotificationIcon />
            </Box>
            
            {/* Separator Line */}
            <Box 
              sx={{ 
                width: 2, 
                height: 32, 
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                mx: -2,
                borderRadius: 1
              }} 
            />
            
            {/* Account Icon and Username Combined Button */}
            <IconButton 
              onClick={handleAvatarClick}
              sx={{ 
                color: theme.palette.text.primary,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 0,
                py: 1,
                borderRadius: 2,
                backgroundColor: 'transparent',
                '&:hover': {
                  backgroundColor: 'transparent',
                }
              }}
            >
              {/* Account Icon with Glassy Circle */}
              <Box
                sx={{ 
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AccountCircleIcon sx={{ width: 20, height: 20 }} />
              </Box>
              
              {/* Username */}
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 500,
                  color: theme.palette.text.primary,
                  display: { xs: 'none', sm: 'block' }, // Hide on mobile, show on larger screens
                }}
              >
                {user?.name || 'User'}
              </Typography>
            </IconButton>
            
            {/* Theme Menu */}
            <Menu 
              anchorEl={themeMenuAnchor} 
              open={Boolean(themeMenuAnchor)} 
              onClose={handleThemeMenuClose}
              PaperProps={{
                sx: {
                  bgcolor: theme.palette.background.paper,
                  color: theme.palette.text.primary,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  boxShadow: theme.shadows[8],
                  mt: 1,
                  '& .MuiMenuItem-root': {
                    color: theme.palette.text.primary,
                    minHeight: 48,
                    px: 2,
                    '&:hover': {
                      bgcolor: theme.palette.action.hover,
                    },
                    '&.Mui-selected': {
                      bgcolor: theme.palette.action.selected,
                      '&:hover': {
                        bgcolor: theme.palette.action.selected,
                      },
                    },
                  },
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.text.primary,
                    minWidth: 40,
                  },
                }
              }}
            >
              <MenuItem onClick={() => handleThemeChange('system')} selected={userPref === 'system'}>
                <ListItemIcon><BrightnessAutoIcon fontSize="small" /></ListItemIcon>
                Device
              </MenuItem>
              <MenuItem onClick={() => handleThemeChange('dark')} selected={userPref === 'dark'}>
                <ListItemIcon><Brightness4Icon fontSize="small" /></ListItemIcon>
                Dark
              </MenuItem>
              <MenuItem onClick={() => handleThemeChange('light')} selected={userPref === 'light'}>
                <ListItemIcon><Brightness7Icon fontSize="small" /></ListItemIcon>
                Light
              </MenuItem>
            </Menu>
            
            {/* Account Menu */}
            <Menu 
              anchorEl={avatarMenuAnchor} 
              open={Boolean(avatarMenuAnchor)} 
              onClose={handleAvatarMenuClose}
              PaperProps={{
                sx: {
                  bgcolor: theme.palette.background.paper,
                  color: theme.palette.text.primary,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  boxShadow: theme.shadows[8],
                  mt: 1,
                  '& .MuiMenuItem-root': {
                    color: theme.palette.text.primary,
                    minHeight: 48,
                    px: 2,
                    '&:hover': {
                      bgcolor: theme.palette.action.hover,
                    },
                  },
                }
              }}
            >
              <MenuItem onClick={handleSettings}>Account Settings</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        </Box>
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;
