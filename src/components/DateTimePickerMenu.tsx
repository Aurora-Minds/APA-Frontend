import React, { useState } from 'react';
import { Button, Popover, Box, TextField, IconButton, Select, MenuItem, FormControl, InputLabel, Typography } from '@mui/material';
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
  const [time, setTime] = useState('');
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
  const theme = useTheme();

  // Initialize time and period from value
  React.useEffect(() => {
    if (value && value.includes('T')) {
      const timePart = value.split('T')[1].slice(0, 5);
      const [hours, minutes] = timePart.split(':');
      const hour24 = parseInt(hours);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      setTime(`${hour12.toString().padStart(2, '0')}:${minutes}`);
      setPeriod(hour24 >= 12 ? 'PM' : 'AM');
    }
  }, [value]);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
    updateValue(e.target.value, time, period);
  };
  
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newTime = e.target.value;
    
    // Only allow numbers and colon
    newTime = newTime.replace(/[^0-9:]/g, '');
    
    // Auto-insert colon after 2 digits
    if (newTime.length === 2 && !newTime.includes(':')) {
      newTime = newTime + ':';
    }
    
    // Limit to HH:MM format
    if (newTime.length <= 5) {
      setTime(newTime);
      updateValue(date, newTime, period);
    }
  };
  
  const handlePeriodChange = (e: any) => {
    const newPeriod = e.target.value as 'AM' | 'PM';
    setPeriod(newPeriod);
    updateValue(date, time, newPeriod);
  };

  const updateValue = (newDate: string, newTime: string, newPeriod: 'AM' | 'PM') => {
    if (newDate && newTime && newTime.includes(':')) {
      // Validate time format
      const timeRegex = /^([0-9]|0[0-9]|1[0-2]):[0-5][0-9]$/;
      if (timeRegex.test(newTime)) {
        // Convert 12-hour format to 24-hour format
        const [hours, minutes] = newTime.split(':');
        let hour24 = parseInt(hours);
        
        if (newPeriod === 'PM' && hour24 !== 12) {
          hour24 += 12;
        } else if (newPeriod === 'AM' && hour24 === 12) {
          hour24 = 0;
        }
        
        const time24 = `${hour24.toString().padStart(2, '0')}:${minutes}`;
        onChange(`${newDate}T${time24}`);
      } else {
        // Invalid time format, just update date
        onChange(newDate);
      }
    } else if (newDate) {
      onChange(newDate);
    }
  };

  // Format display value
  const getDisplayValue = () => {
    if (!date) return label;
    
    let displayTime = '';
    if (time) {
      displayTime = `${time} ${period}`;
    }
    
    return { date, time: displayTime };
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<CalendarTodayIcon />}
        onClick={handleOpen}
        sx={{
          minWidth: 150,
          height: 50,
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
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
          {date ? (
            <>
              <Typography variant="body2" sx={{ fontSize: '0.75rem', lineHeight: 1 }}>
                {date}
              </Typography>
              {time && (
                <Typography variant="body2" sx={{ fontSize: '0.75rem', lineHeight: 1 }}>
                  {time} {period}
                </Typography>
              )}
            </>
          ) : (
            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
              {label}
            </Typography>
          )}
        </Box>
      </Button>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 250 }}>
          <TextField
            label="Date"
            type="date"
            value={date}
            onChange={handleDateChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              label="Time"
              type="text"
              value={time}
              onChange={handleTimeChange}
              InputLabelProps={{ shrink: true }}
              placeholder="HH:MM"
              inputProps={{
                maxLength: 5,
              }}
              sx={{ flex: 1 }}
            />
            <FormControl sx={{ minWidth: 80 }}>
              <InputLabel>AM/PM</InputLabel>
              <Select
                value={period}
                label="AM/PM"
                onChange={handlePeriodChange}
                size="small"
              >
                <MenuItem value="AM">AM</MenuItem>
                <MenuItem value="PM">PM</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Popover>
    </>
  );
};

export default DateTimePickerMenu; 