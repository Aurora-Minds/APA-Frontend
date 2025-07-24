import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

interface TimerContextType {
  timer: number;
  timerDuration: number;
  isRunning: boolean;
  focusTaskId: string | null;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  setTimerDuration: (duration: number) => void;
  setFocusTaskId: (taskId: string | null) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};

interface TimerProviderProps {
  children: React.ReactNode;
}

export const TimerProvider: React.FC<TimerProviderProps> = ({ children }) => {
  // Persist timer duration in localStorage
  const getInitialDuration = () => {
    const saved = localStorage.getItem('pomodoroDuration');
    return saved ? parseInt(saved, 10) : 25;
  };

  const [timerDuration, setTimerDurationState] = useState(getInitialDuration());
  const [timer, setTimer] = useState(getInitialDuration() * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [focusTaskId, setFocusTaskId] = useState<string | null>(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.auroraminds.xyz/api';

  // Timer effect
  useEffect(() => {
    if (isRunning && timer > 0) {
      const id = setInterval(() => setTimer(t => t - 1), 1000);
      setIntervalId(id);
      return () => clearInterval(id);
    } else if (!isRunning && intervalId) {
      clearInterval(intervalId);
    } else if (timer === 0) {
      // Always reset timer when it reaches 0
      setIsRunning(false);
      setTimer(timerDuration * 60);
      
      // If there's a focused task, log the session
      if (focusTaskId) {
        const logSession = async () => {
          try {
            await axios.post(`${API_BASE_URL}/focus-sessions`, {
              taskId: focusTaskId,
              duration: timerDuration * 60,
              startedAt: new Date(Date.now() - timerDuration * 60 * 1000).toISOString(),
              endedAt: new Date().toISOString(),
              status: 'completed',
            });
          } catch (err) {
            console.error('Error logging focus session:', err);
          }
        };
        logSession();
      }
    }
  }, [isRunning, timer, timerDuration, focusTaskId, API_BASE_URL]);

  const startTimer = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTimer(timerDuration * 60);
  }, [timerDuration]);

  const setTimerDuration = useCallback((duration: number) => {
    setTimerDurationState(duration);
    setTimer(duration * 60);
    setIsRunning(false);
    localStorage.setItem('pomodoroDuration', duration.toString());
  }, []);

  const setFocusTaskIdHandler = useCallback((taskId: string | null) => {
    setFocusTaskId(taskId);
    setTimer(timerDuration * 60);
    setIsRunning(false);
  }, [timerDuration]);

  const value: TimerContextType = {
    timer,
    timerDuration,
    isRunning,
    focusTaskId,
    startTimer,
    pauseTimer,
    resetTimer,
    setTimerDuration,
    setFocusTaskId: setFocusTaskIdHandler,
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
}; 