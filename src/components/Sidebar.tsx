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
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

import MenuIcon from '@mui/icons-material/Menu';

interface SidebarProps {
    isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
    const location = useLocation();
    const theme = useTheme();

    const mainMenu = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Tasks', icon: <AssignmentIcon />, path: '/tasks' },
        { text: 'Focus Timer', icon: <TimerIcon />, path: '/focus-timer' },
        { text: 'Lab Assistant', icon: <ScienceIcon />, path: '/lab-assistant' },
        { text: 'Focus Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
        { text: 'Rewards', icon: <EmojiEventsIcon />, path: '/rewards' },
        { text: 'Notifications & Integrations', icon: <NotificationsIcon />, path: '/email-settings' },
    ];
    return (
        <Drawer
            variant="permanent"
            sx={{
                width: isOpen ? 280 : 80,
                flexShrink: 0,
                transition: theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                }),
                '& .MuiDrawer-paper': {
                    width: isOpen ? 280 : 80,
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
                    overflowX: 'hidden',
                    transition: theme.transitions.create('width', {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                },
            }}
        >
            <Box sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: 'auto',
                my: 2,
                position: 'relative',
            }}>
                <img
                    src="/aurora-minds-logo.png"
                    alt="Aurora Minds Logo"
                    style={{
                        width: isOpen ? 90 : 40,
                        height: isOpen ? 90 : 40,
                        marginBottom: isOpen ? 16 : 0,
                        borderRadius: isOpen ? 18 : 12,
                        objectFit: 'cover',
                        boxShadow: '0 4px 24px 0 rgba(0,0,0,0.2)',
                        transition: 'width 0.3s, height 0.3s, margin-bottom 0.3s, border-radius 0.3s',
                    }}
                />
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 700,
                        letterSpacing: 1,
                        color: theme.palette.text.primary,
                        whiteSpace: 'nowrap',
                        opacity: isOpen ? 1 : 0,
                        transition: 'opacity 0.2s, max-height 0.3s',
                        maxHeight: isOpen ? '100px' : '0',
                        overflow: 'hidden',
                    }}
                >
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
                                color: location.pathname === item.path ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.9)',
                                background: location.pathname === item.path ? 'rgba(255, 255, 255, 0.1)' : 'none',
                                backdropFilter: location.pathname === item.path ? 'blur(10px)' : 'none',
                                border: location.pathname === item.path ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
                                '&.Mui-selected': {
                                    background: 'rgba(255, 255, 255, 0.15)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    color: 'rgba(255, 255, 255, 1)',
                                },
                                '&:hover': {
                                    background: 'rgba(255, 255, 255, 0.08)',
                                    color: 'rgba(255, 255, 255, 1)',
                                },
                                transition: 'all 0.2s',
                                justifyContent: isOpen ? 'initial' : 'center',
                            }}
                        >
                            <ListItemIcon sx={{ color: 'inherit', minWidth: 36, justifyContent: 'center' }}>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} sx={{ color: 'inherit', opacity: isOpen ? 1 : 0, transition: 'opacity 0.3s', whiteSpace: 'nowrap' }} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Box sx={{ flexGrow: 1 }} />
        </Drawer>
    );
};

export default Sidebar; 