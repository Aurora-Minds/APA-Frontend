import React from 'react';
import { Menu, MenuItem, ListItemIcon, ListItemText, IconButton, Button } from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import { useTheme } from '@mui/material/styles';

export type Priority = 'high' | 'medium' | 'low' | 'none';

const priorityOptions: { value: Priority; label: string; color: string }[] = [
  { value: 'high', label: 'High', color: '#e57373' },
  { value: 'medium', label: 'Medium', color: '#ffd54f' },
  { value: 'low', label: 'Low', color: '#64b5f6' },
  { value: 'none', label: 'None', color: '#bdbdbd' },
];

interface PriorityMenuProps {
  anchorEl: null | HTMLElement;
  open: boolean;
  onClose: () => void;
  value: Priority;
  onChange: (priority: Priority) => void;
}

const PriorityMenu: React.FC<PriorityMenuProps> = ({ anchorEl, open, onClose, value, onChange }) => (
  <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
    {priorityOptions.map(option => (
      <MenuItem
        key={option.value}
        selected={value === option.value}
        onClick={() => { onChange(option.value); onClose(); }}
      >
        <ListItemIcon>
          <FlagIcon sx={{ color: option.color, opacity: option.value === 'none' ? 0.5 : 1 }} />
        </ListItemIcon>
        <ListItemText primary={option.label} />
      </MenuItem>
    ))}
  </Menu>
);

interface PriorityMenuButtonProps {
  value: Priority;
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  sx?: any;
}

export const PriorityMenuButton: React.FC<PriorityMenuButtonProps> = ({ value, onClick, sx }) => {
  const theme = useTheme();
  const color = value === 'high' ? '#e57373' : value === 'medium' ? '#ffd54f' : value === 'low' ? '#64b5f6' : '#bdbdbd';
  return (
    <Button
      variant="outlined"
      startIcon={<FlagIcon sx={{ color }} />}
      onClick={onClick}
      sx={{
        minWidth: 110,
        bgcolor: 'white',
        color: '#1976d2',
        borderColor: '#1976d2',
        fontWeight: 600,
        textTransform: 'none',
        boxShadow: 'none',
        '&:hover': { bgcolor: '#e3f2fd' },
        ...sx,
      }}
    >
      {value.charAt(0).toUpperCase() + value.slice(1)}
    </Button>
  );
};

export default PriorityMenu; 