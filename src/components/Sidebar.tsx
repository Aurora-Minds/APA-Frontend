import { Link, useLocation } from 'react-router-dom';
import { List, ListItemButton, ListItemIcon, ListItemText, Typography, Box, Avatar, IconButton, useTheme, Menu, MenuItem, ListItemIcon as MuiListItemIcon, Drawer, Divider } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListAltIcon from '@mui/icons-material/ListAlt';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import BrightnessAutoIcon from '@mui/icons-material/BrightnessAuto';
import SchoolIcon from '@mui/icons-material/School';
import React, { useContext, useState } from 'react';
import { ColorModeContext } from '../theme/ColorModeContext';
import { useTheme as useMuiTheme } from '@mui/material/styles';

const Sidebar = ({ dark }: { dark: boolean }) => {
  const location = useLocation();
  const theme = useMuiTheme();
  const colorMode = useContext(ColorModeContext);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleThemeChange = (mode: 'light' | 'dark' | 'system') => {
    colorMode.setTheme(mode);
    setAnchorEl(null);
  };
  const { mode, userPref, setTheme } = colorMode;
  const current = userPref;
  return (
    <Box sx={{
      width: 240,
      bgcolor: dark ? '#23242a' : '#fff',
      height: '100vh',
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      borderTopRightRadius: 32,
      borderBottomRightRadius: 32,
      boxShadow: 3,
      position: 'relative',
    }}>
      <IconButton
        sx={{ position: 'absolute', top: 12, right: 12 }}
        onClick={handleMenuOpen}
        color="inherit"
        aria-label="toggle theme"
      >
        {current === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleThemeChange('system')} selected={current === 'system'}>
          <MuiListItemIcon><BrightnessAutoIcon /></MuiListItemIcon>System
        </MenuItem>
        <MenuItem onClick={() => handleThemeChange('light')} selected={current === 'light'}>
          <MuiListItemIcon><Brightness7Icon /></MuiListItemIcon>Light
        </MenuItem>
        <MenuItem onClick={() => handleThemeChange('dark')} selected={current === 'dark'}>
          <MuiListItemIcon><Brightness4Icon /></MuiListItemIcon>Dark
        </MenuItem>
      </Menu>
      <img src="/aurora-minds-logo.png" alt="Aurora Minds Logo" style={{ width: 100, height: 100, marginBottom: 16, borderRadius: 16, objectFit: 'cover' }} />
      <Typography variant="h6" sx={{ mb: 4, fontWeight: 700, letterSpacing: 1 }}>Aurora Minds</Typography>
      <List sx={{ width: '100%' }}>
        <ListItemButton component={Link} to="/" selected={location.pathname === '/'} sx={{ borderRadius: 2, mb: 1, bgcolor: location.pathname === '/' ? 'rgba(0,0,0,0.1)' : undefined, '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}>
          <ListItemIcon><DashboardIcon sx={{ color: '#1976d2' }} /></ListItemIcon>
          <ListItemText primary={<Typography fontWeight={600}>Dashboard</Typography>} />
        </ListItemButton>
        <ListItemButton component={Link} to="/tasks" selected={location.pathname === '/tasks'} sx={{ borderRadius: 2, mb: 1, bgcolor: location.pathname === '/tasks' ? 'rgba(0,0,0,0.1)' : undefined, '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}>
          <ListItemIcon><ListAltIcon sx={{ color: '#1976d2' }} /></ListItemIcon>
          <ListItemText primary={<Typography fontWeight={600}>Tasks</Typography>} />
        </ListItemButton>
        <ListItemButton component={Link} to="/focus-timer" selected={location.pathname === '/focus-timer'} sx={{ borderRadius: 2, mb: 1, bgcolor: location.pathname === '/focus-timer' ? 'rgba(0,0,0,0.1)' : undefined, '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}>
          <ListItemIcon><SchoolIcon sx={{ color: '#1976d2' }} /></ListItemIcon>
          <ListItemText primary={<Typography fontWeight={600}>Focus Timer</Typography>} />
        </ListItemButton>
      </List>
      <Box sx={{ flexGrow: 1 }} />
    </Box>
  );
};

export default Sidebar; 