import React from 'react';
import { Menu, MenuItem, ListItemIcon, ListItemText, IconButton, Button } from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
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
  value: Priority | null;
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
  value: Priority | null;
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  sx?: any;
}

export const PriorityMenuButton: React.FC<PriorityMenuButtonProps> = ({ value, onClick, sx }) => {
  const theme = useTheme();
  const color = value === 'high' ? '#e57373' : value === 'medium' ? '#ffd54f' : value === 'low' ? '#64b5f6' : '#bdbdbd';
  
  // Show "Priority" only when value is null/undefined, otherwise show the actual value
  const displayText = !value ? 'Priority' : value.charAt(0).toUpperCase() + value.slice(1);
  
  // Show flag only when a value is explicitly selected (including 'none')
  const showFlag = value !== null && value !== undefined;
  
  return (
    <Button
      variant="outlined"
      startIcon={showFlag ? <FlagIcon sx={{ color }} /> : undefined}
      endIcon={<KeyboardArrowDownIcon sx={{ color: '#fff' }} />}
      onClick={onClick}
      sx={{
        minWidth: 110,
        height: 40,
        fontWeight: 600,
        color: '#fff',
        borderColor: '#90caf9',
        bgcolor: 'rgba(255,255,255,0.06)',
        boxShadow: 'none',
        textTransform: 'none',
        '&:hover': { bgcolor: '#1565c0', borderColor: '#fff' },
        ...sx,
      }}
    >
      {displayText}
    </Button>
  );
};

export default PriorityMenu; 