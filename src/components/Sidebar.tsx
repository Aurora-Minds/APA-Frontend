import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography,
    Box, Divider, useTheme
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TimerIcon from '@mui/icons-material/Timer';
import ScienceIcon from '@mui/icons-material/Science';
import PersonIcon from '@mui/icons-material/Person';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import NotificationsIcon from '@mui/icons-material/Notifications';

const Sidebar: React.FC = () => {
    const location = useLocation();
    const theme = useTheme();

    const mainMenu = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Tasks', icon: <AssignmentIcon />, path: '/tasks' },
        { text: 'Focus Timer', icon: <TimerIcon />, path: '/focus-timer' },
        { text: 'Lab Assistant', icon: <ScienceIcon />, path: '/lab-assistant' },
        { text: 'Focus Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
        { text: 'Email Settings', icon: <NotificationsIcon />, path: '/email-settings' },
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
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                    borderTopRightRadius: 24,
                    borderBottomRightRadius: 24,
                    margin: 0,
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '2px 0 24px 0 rgba(44,48,74,0.18)', // subtle right shadow
                    background: 'none', // transparent
                    backdropFilter: 'none',
                },
            }}
        >
            <Box sx={{
                p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', height: 'auto', my: 2, position: 'relative'
            }}>
                <img src="/aurora-minds-logo.png" alt="Aurora Minds Logo" style={{ width: 90, height: 90, marginBottom: 16, borderRadius: 18, objectFit: 'cover', boxShadow: '0 4px 24px 0 rgba(0,0,0,0.2)' }} />
                <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 1, color: theme.palette.text.primary }}>
                    Aurora Minds
                </Typography>
            </Box>
            <Divider sx={{ mx: 2, borderColor: 'rgba(255,255,255,0.12)', my: 1 }} />
            <List sx={{ p: 1 }}>
                {mainMenu.map((item) => (
                    <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                        <ListItemButton
                            component={Link}
                            to={item.path}
                            selected={location.pathname === item.path}
                            sx={{
                                borderRadius: 3,
                                px: 2,
                                py: 1.2,
                                color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                                background: location.pathname === item.path ? 'rgba(76,110,245,0.12)' : 'none',
                                '&.Mui-selected': {
                                    background: 'rgba(76,110,245,0.18)',
                                    color: 'primary.main',
                                },
                                '&:hover': {
                                    background: 'rgba(76,110,245,0.10)',
                                    color: 'primary.main',
                                },
                                transition: 'all 0.2s',
                            }}
                        >
                            <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} sx={{ color: 'inherit' }} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Box sx={{ flexGrow: 1 }} />
        </Drawer>
    );
};

export default Sidebar; 