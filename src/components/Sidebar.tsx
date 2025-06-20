import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography,
    Box, Divider, useTheme, IconButton, Menu, MenuItem
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TasksIcon from '@mui/icons-material/Assignment';
import TimerIcon from '@mui/icons-material/Timer';
import SettingsIcon from '@mui/icons-material/Settings';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import BrightnessAutoIcon from '@mui/icons-material/BrightnessAuto';
import { useColorMode } from '../theme/ColorModeContext';

const Sidebar: React.FC = () => {
    const location = useLocation();
    const theme = useTheme();
    const { userPref, setTheme } = useColorMode();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleThemeChange = (newMode: 'light' | 'dark' | 'system') => {
        setTheme(newMode);
        handleMenuClose();
    };

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Tasks', icon: <TasksIcon />, path: '/tasks' },
        { text: 'Focus Timer', icon: <TimerIcon />, path: '/focus-timer' },
    ];

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: 280,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: 280,
                    boxSizing: 'border-box',
                    borderRight: 'none',
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 42, 0.9)' : 'rgba(248, 249, 250, 0.9)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
                },
            }}
        >
            <Box sx={{
                p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', height: 'auto', my: 2, position: 'relative'
            }}>
                <IconButton
                    onClick={handleMenuClick}
                    sx={{ position: 'absolute', top: -5, right: 0, color: 'text.secondary' }}
                >
                    <SettingsIcon />
                </IconButton>
                <img src="/aurora-minds-logo.png" alt="Aurora Minds Logo" style={{ width: 100, height: 100, marginBottom: 16, borderRadius: 16, objectFit: 'cover' }} />
                <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 1, color: theme.palette.text.primary }}>
                    Aurora Minds
                </Typography>
            </Box>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => handleThemeChange('system')} selected={userPref === 'system'}>
                    <ListItemIcon><BrightnessAutoIcon fontSize="small" /></ListItemIcon>
                    System
                </MenuItem>
                <MenuItem onClick={() => handleThemeChange('light')} selected={userPref === 'light'}>
                    <ListItemIcon><Brightness7Icon fontSize="small" /></ListItemIcon>
                    Light
                </MenuItem>
                <MenuItem onClick={() => handleThemeChange('dark')} selected={userPref === 'dark'}>
                    <ListItemIcon><Brightness4Icon fontSize="small" /></ListItemIcon>
                    Dark
                </MenuItem>
            </Menu>
            <Divider sx={{ mx: 2, borderColor: 'rgba(255, 255, 255, 0.12)' }} />
            <List sx={{ p: 2 }}>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                        <ListItemButton
                            component={Link}
                            to={item.path}
                            selected={location.pathname === item.path}
                            sx={{
                                borderRadius: 2,
                                '&.Mui-selected': {
                                    backgroundColor: theme.palette.action.selected,
                                    '&:hover': {
                                        backgroundColor: theme.palette.action.hover,
                                    },
                                },
                                '&:hover': {
                                    backgroundColor: theme.palette.action.hover,
                                },
                            }}
                        >
                            <ListItemIcon sx={{ color: theme.palette.text.secondary }}>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} sx={{ color: theme.palette.text.primary }} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Drawer>
    );
};

export default Sidebar; 