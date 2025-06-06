import React, { useState } from 'react';
import { Button, Popover, Box, TextField, IconButton } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useTheme } from '@mui/material/styles';

interface DateTimePickerMenuProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  sx?: any;
}

const DateTimePickerMenu: React.FC<DateTimePickerMenuProps> = ({ label = 'Due Date & Time', value, onChange, sx }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [date, setDate] = useState(value ? value.split('T')[0] : '');
  const [time, setTime] = useState(value && value.includes('T') ? value.split('T')[1].slice(0,5) : '');
  const theme = useTheme();

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
    if (e.target.value && time) {
      onChange(`${e.target.value}T${time}`);
    } else if (e.target.value) {
      onChange(e.target.value);
    }
  };
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTime(e.target.value);
    if (date && e.target.value) {
      onChange(`${date}T${e.target.value}`);
    }
  };
  return (
    <>
      <Button
        variant="outlined"
        startIcon={<CalendarTodayIcon />}
        onClick={handleOpen}
        sx={{
          minWidth: 150,
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
        {value ? (date + (time ? ' ' + time : '')) : label}
      </Button>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Date"
            type="date"
            value={date}
            onChange={handleDateChange}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Time"
            type="time"
            value={time}
            onChange={handleTimeChange}
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      </Popover>
    </>
  );
};

export default DateTimePickerMenu; 