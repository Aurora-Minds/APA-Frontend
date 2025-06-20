import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, IconButton, Slider, Drawer, Button } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SettingsIcon from '@mui/icons-material/Settings';
import axios from 'axios';

const defaultSettings = {
  focus: 25,
  shortBreak: 5,
  longBreak: 20,
  longBreakInterval: 2,
};

const FocusTimer: React.FC = () => {
  const [settings, setSettings] = useState(defaultSettings);
  const [timerType, setTimerType] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [isRunning, setIsRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(settings.focus * 60);
  const [showSettings, setShowSettings] = useState(false);
  const [intervalCount, setIntervalCount] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setSecondsLeft(settings.focus * 60);
  }, [settings.focus]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev > 0) return prev - 1;
          handleTimerEnd();
          return 0;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line
  }, [isRunning]);

  const handleTimerEnd = async () => {
    setIsRunning(false);
    const now = new Date();
    let sessionType = timerType;
    let sessionDuration = 0;
    if (timerType === 'focus') {
      setIntervalCount((c) => c + 1);
      sessionDuration = settings.focus * 60;
      if ((intervalCount + 1) % settings.longBreakInterval === 0) {
        setTimerType('longBreak');
        setSecondsLeft(settings.longBreak * 60);
      } else {
        setTimerType('shortBreak');
        setSecondsLeft(settings.shortBreak * 60);
      }
    } else if (timerType === 'shortBreak') {
      sessionDuration = settings.shortBreak * 60;
      setTimerType('focus');
      setSecondsLeft(settings.focus * 60);
    } else {
      sessionDuration = settings.longBreak * 60;
      setTimerType('focus');
      setSecondsLeft(settings.focus * 60);
    }
    // Save session to backend
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api'}/focus-sessions`,
        {
          type: sessionType,
          duration: sessionDuration,
          startedAt: new Date(now.getTime() - sessionDuration * 1000),
          endedAt: now,
        },
        {
          headers: { 'x-auth-token': token }
        }
      );
    } catch (err) {
      // Optionally handle error
      // console.error('Failed to save focus session', err);
    }
  };

  const handlePlayPause = () => {
    setIsRunning((prev) => !prev);
  };

  const handleSettingsOpen = () => setShowSettings(true);
  const handleSettingsClose = () => setShowSettings(false);

  const handleSliderChange = (name: string, value: number) => {
    setSettings((prev) => ({ ...prev, [name]: value }));
    if (name === timerType) setSecondsLeft(value * 60);
  };

  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
  const seconds = (secondsLeft % 60).toString().padStart(2, '0');

  return (
    <Box sx={{
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #6dd5fa 0%, #2980b9 100%)',
      borderRadius: 4,
      minHeight: '80vh',
      position: 'relative',
    }}>
      <Box sx={{ position: 'absolute', top: 24, right: 24 }}>
        <IconButton onClick={handleSettingsOpen}>
          <SettingsIcon sx={{ color: '#fff' }} />
        </IconButton>
      </Box>
      <Typography variant="h4" sx={{ color: '#fff', mt: 4, mb: 2, fontWeight: 700 }}>Time to focus</Typography>
      <Typography sx={{ color: '#e3f2fd', mb: 4 }}>Stay focused, accomplish more</Typography>
      <Box sx={{
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 3,
        mb: 4,
        position: 'relative',
      }}>
        <Typography variant="h2" sx={{ color: '#fff', fontWeight: 700 }}>{minutes}:{seconds}</Typography>
        <Typography sx={{ color: '#e3f2fd', mb: 2 }}>{timerType === 'focus' ? 'Focus' : timerType === 'shortBreak' ? 'Short Break' : 'Long Break'}</Typography>
        <IconButton onClick={handlePlayPause} sx={{ background: '#fff', color: '#2980b9', mt: 2, '&:hover': { background: '#e3f2fd' } }}>
          {isRunning ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>
      </Box>
      <Drawer anchor="right" open={showSettings} onClose={handleSettingsClose}>
        <Box sx={{ width: 400, p: 4, background: 'linear-gradient(135deg, #6dd5fa 0%, #2980b9 100%)', height: '100%' }}>
          <Typography variant="h5" sx={{ color: '#fff', mb: 3 }}>Focus Timer Settings</Typography>
          <Typography sx={{ color: '#fff', mb: 1 }}>Focus time: {settings.focus} min</Typography>
          <Slider min={1} max={60} value={settings.focus} onChange={(_, v) => handleSliderChange('focus', v as number)} sx={{ mb: 3 }} />
          <Typography sx={{ color: '#fff', mb: 1 }}>Short break: {settings.shortBreak} min</Typography>
          <Slider min={1} max={30} value={settings.shortBreak} onChange={(_, v) => handleSliderChange('shortBreak', v as number)} sx={{ mb: 3 }} />
          <Typography sx={{ color: '#fff', mb: 1 }}>Long break: {settings.longBreak} min</Typography>
          <Slider min={5} max={60} value={settings.longBreak} onChange={(_, v) => handleSliderChange('longBreak', v as number)} sx={{ mb: 3 }} />
          <Typography sx={{ color: '#fff', mb: 1 }}>Long break interval: {settings.longBreakInterval} intervals</Typography>
          <Slider min={1} max={8} value={settings.longBreakInterval} onChange={(_, v) => handleSliderChange('longBreakInterval', v as number)} sx={{ mb: 3 }} />
          <Button variant="contained" onClick={handleSettingsClose} sx={{ mt: 2, background: '#fff', color: '#2980b9', fontWeight: 700 }}>Done</Button>
        </Box>
      </Drawer>
    </Box>
  );
};

export default FocusTimer; 