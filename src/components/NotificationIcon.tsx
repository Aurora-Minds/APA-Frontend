import React, { useState } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  useTheme,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNotifications, Notification } from '../context/NotificationContext';

const NotificationIcon: React.FC = () => {
  const theme = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    handleClose();
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'task_due':
        return '⏰';
      case 'task_completed':
        return '✅';
      case 'level_up':
        return '🎉';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'task_due':
        return theme.palette.warning.main;
      case 'task_completed':
        return theme.palette.success.main;
      case 'level_up':
        return theme.palette.primary.main;
      default:
        return theme.palette.text.primary;
    }
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
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
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <NotificationsIcon 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: 20
            }} 
          />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 350,
            maxHeight: 400,
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(6, 11, 40, 0.94)' : '#ffffff',
            color: theme.palette.text.primary,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)',
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              {unreadCount} unread
            </Typography>
          )}
        </Box>

        {notifications.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', width: '100%' }}>
              No notifications
            </Typography>
          </MenuItem>
        ) : (
          <>
            {notifications.map((notification) => (
              <MenuItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  p: 2,
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  backgroundColor: notification.read ? 'transparent' : 'rgba(255, 255, 255, 0.05)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
                  <Typography sx={{ fontSize: 16, mr: 1 }}>
                    {getNotificationIcon(notification.type)}
                  </Typography>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      fontWeight: notification.read ? 400 : 600,
                      color: getNotificationColor(notification.type),
                      flex: 1
                    }}
                  >
                    {notification.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {formatTimeAgo(notification.timestamp)}
                  </Typography>
                </Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    width: '100%',
                    lineHeight: 1.4
                  }}
                >
                  {notification.message}
                </Typography>
              </MenuItem>
            ))}
            
            <Divider sx={{ my: 1 }} />
            
            <Box sx={{ p: 1, display: 'flex', gap: 1 }}>
              <Button
                size="small"
                onClick={markAllAsRead}
                sx={{ 
                  flex: 1,
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  }
                }}
              >
                Mark all read
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationIcon; 