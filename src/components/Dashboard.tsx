import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    Theme,
    Divider,
    Switch,
    ListItemIcon,
    Avatar,
    Menu
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { SelectChangeEvent } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ListAltIcon from '@mui/icons-material/ListAlt';
import TimerIcon from '@mui/icons-material/Timer';
import AddIcon from '@mui/icons-material/Add';
import Checkbox from '@mui/material/Checkbox';
import InputAdornment from '@mui/material/InputAdornment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CircularProgress from '@mui/material/CircularProgress';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router-dom';
import Chip from '@mui/material/Chip';
import AccountSettings from './AccountSettings';
import Tooltip from '@mui/material/Tooltip';
import ListItemButton from '@mui/material/ListItemButton';
import DateTimePickerMenu from './DateTimePickerMenu';
import PriorityMenu, { Priority } from './PriorityMenu';
import FlagIcon from '@mui/icons-material/Flag';
import { PriorityMenuButton } from './PriorityMenu';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import BrightnessAutoIcon from '@mui/icons-material/BrightnessAuto';
import { useColorMode } from '../theme/ColorModeContext';
import AuroraJellyfish from '../AuroraJellyfish.png';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import WaterBg from '../assets/water-bg.jpg';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import LeaderboardBg from '../assets/leaderboard-bg.jpg';

interface Task {
    _id: string;
    title: string;
    description: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'in-progress' | 'completed';
    subject: string;
}

type Status = 'pending' | 'in-progress' | 'completed';

interface FormData {
    title: string;
    description: string;
    dueDate: string;
    priority: Priority;
    status: Status;
    subject: string;
}

const StyledGrid = styled(Grid)(({ theme }: { theme: Theme }) => ({
    // Add any custom styles here if needed
}));

const subjects = ['English', 'Math', 'Science', 'History'];
const priorityColors = { low: '#81c784', medium: '#ffd54f', high: '#e57373' };
const statusColors = { pending: '#90caf9', 'in-progress': '#fff176', completed: '#a5d6a7' };

// Add subject color map for chips
const subjectColors: Record<string, string> = {
    English: '#1976d2',
    Math: '#43a047',
    Science: '#fbc02d',
    History: '#8d6e63',
    Default: '#7e57c2',
};

// Add WelcomeCard component inside Dashboard.tsx for now
const WelcomeCard: React.FC<{ userName?: string; quote: string; fullHeight?: boolean; fullWidth?: boolean; onAddTaskClick?: () => void }> = ({ userName, quote, fullHeight, fullWidth, onAddTaskClick }) => (
  <Paper
    sx={{
      position: 'relative',
      height: fullHeight ? '100%' : 240,
      minHeight: fullHeight ? '100%' : 240,
      borderRadius: 3,
      overflow: 'hidden',
      background: 'none',
      boxShadow: '0 8px 32px 0 rgba(31,38,135,0.18)',
      display: 'flex',
      alignItems: 'flex-end',
      minWidth: 0,
      width: '100%',
      border: '1.5px solid rgba(255,255,255,0.18)',
      backdropFilter: 'blur(18px)',
    }}
  >
    {/* Background image */}
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url(${AuroraJellyfish})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: 1,
      }}
    />
    {/* Glassy Overlay */}
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        bgcolor: 'rgba(17,25,40,0.55)',
        zIndex: 2,
        borderRadius: 3,
      }}
    />
    {/* Content */}
    <Box sx={{ position: 'relative', zIndex: 3, p: 4, color: '#fff', width: '100%' }}>
      <Typography variant="subtitle1" sx={{ opacity: 0.85 }}>Welcome back,</Typography>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>{userName || 'User'}</Typography>
      <Typography sx={{ opacity: 0.85 }}>Glad to see you again!<br/>{quote}</Typography>
      <Box sx={{ mt: 3 }}>
        <Typography
          sx={{ fontWeight: 600, opacity: 0.9, fontSize: 16, display: 'flex', alignItems: 'center', gap: 1, color: '#fff', cursor: 'pointer', textDecoration: 'none', '&:hover': { color: '#90caf9' } }}
          onClick={onAddTaskClick}
          tabIndex={0}
          role="button"
        >
          Add your first task <span style={{ fontSize: 20, marginLeft: 4 }}>→</span>
        </Typography>
      </Box>
    </Box>
  </Paper>
);

// Motivational quotes array
const motivationalQuotes = [
  'Every accomplishment starts with the decision to try.',
  'Success is the sum of small efforts, repeated day in and day out.',
  'The secret of getting ahead is getting started.',
  'Don’t watch the clock; do what it does. Keep going.',
  'The future depends on what you do today.',
  'Great things are done by a series of small things brought together.',
  'You don’t have to be great to start, but you have to start to be great.',
  'Push yourself, because no one else is going to do it for you.',
  'Dream big and dare to fail.',
  'Believe you can and you’re halfway there.'
];

// Add a list of timer-related quotes at the top of the file:
const pomodoroQuotes = [
  'Stay focused and keep moving forward.',
  'Every minute counts. Make it count.',
  'Small steps lead to big results.',
  'Start now, not later.',
  'Progress, not perfection.',
  'One task at a time.',
  'Keep your eyes on the goal.',
  'Breaks help you recharge.',
  'Consistency beats intensity.',
  'You are closer than you think.'
];

// FocusTimerCard simplified
const FocusTimerCard: React.FC<{
  timer: number;
  timerDuration: number;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  tasks: Task[];
  xp: number;
  onDurationChange: (value: number) => void;
  selectedTaskId: string;
  onTaskChange: (taskId: string) => void;
  fullHeight?: boolean;
  fullWidth?: boolean;
}> = ({ timer, timerDuration, isRunning, onStart, onPause, onReset, tasks, xp, onDurationChange, selectedTaskId, onTaskChange, fullHeight, fullWidth }) => {
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [settingsTab, setSettingsTab] = React.useState(0);
  const [customDuration, setCustomDuration] = React.useState(timerDuration);
  const color = '#4e9cff';
  const selectedTask = tasks.find(t => t._id === selectedTaskId);
  const minutes = Math.floor(timer / 60).toString().padStart(2, '0');
  const seconds = (timer % 60).toString().padStart(2, '0');
  const progress = 1 - (timer / (timerDuration * 60));

  React.useEffect(() => {
    setCustomDuration(timerDuration);
  }, [timerDuration]);

  const quote = React.useMemo(() => {
    // Only use quotes that fit in a single line (<= 50 chars)
    const shortQuotes = pomodoroQuotes.filter(q => q.length <= 50);
    if (shortQuotes.length === 0) return '';
    return shortQuotes[Math.floor(Math.random() * shortQuotes.length)];
  }, []);

  return (
    <Paper
      sx={{
        position: 'relative',
        height: fullHeight ? '100%' : '100%',
        minHeight: fullHeight ? '100%' : 240,
        borderRadius: 3,
        overflow: 'hidden',
        backgroundImage: `url(${WaterBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        '&:before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          borderRadius: 3,
          background: 'rgba(17,25,40,0.55)',
          pointerEvents: 'none',
        },
        boxShadow: '0 8px 32px 0 rgba(31,38,135,0.18)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        minWidth: 0,
        width: '100%',
        color: '#fff',
        p: 4,
        backdropFilter: 'blur(18px)',
        border: '1.5px solid rgba(255,255,255,0.18)',
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 2, width: '100%', height: '100%' }}>
        {/* Pomodoro Timer Title */}
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff', mb: 1, alignSelf: 'flex-start', fontSize: 22, letterSpacing: 0.5 }}>
          Pomodoro Timer
        </Typography>
        {quote && (
          <Typography
            variant="subtitle2"
            sx={{
              color: '#b3b8d6',
              fontWeight: 400,
              fontSize: 15,
              mb: 2,
              mt: -0.5,
              letterSpacing: 0.1,
              alignSelf: 'flex-start',
              textAlign: 'left',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
            }}
          >
            {quote}
          </Typography>
        )}
        {/* Settings gear */}
        <IconButton onClick={() => setSettingsOpen(true)} sx={{ position: 'absolute', top: 16, right: 16, color: '#fff', opacity: 0.7, zIndex: 2 }}>
          <SettingsIcon />
        </IconButton>
        {/* Task name if selected */}
        {selectedTask && (
          <Typography variant="subtitle2" sx={{ color: color, fontWeight: 700, mb: 1, mt: 1 }}>
            {selectedTask.title}
          </Typography>
        )}
        {/* Timer */}
        <Box sx={{ position: 'relative', mb: 2, mt: 2, width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto' }}>
          {/* Custom SVG Circular Progress */}
          {(() => {
            const size = 180;
            const strokeWidth = 10;
            const radius = (size - strokeWidth) / 2;
            const circumference = 2 * Math.PI * radius;
            // progress is now 0 at start, 1 at end
            const offset = circumference * (1 - progress);
            return (
              <svg width={size} height={size} style={{ position: 'absolute', left: 0, top: 0, zIndex: 1 }}>
                {/* Base ring (grey) */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="#b0b6c3"
                  strokeWidth={strokeWidth}
                />
                {/* Progress ring (deep blue, clockwise from right) */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="#1565c0"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  style={{
                    transition: 'stroke-dashoffset 1s linear',
                    transform: 'rotate(-90deg)',
                    transformOrigin: '50% 50%',
                  }}
                />
              </svg>
            );
          })()}
          {/* Timer digits and FOCUS label */}
          <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 4 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                color: '#fff',
                letterSpacing: 1,
                fontSize: 48,
                textShadow: '0 2px 8px #000a',
                mb: 0.5,
              }}
            >
              {minutes}:{seconds}
            </Typography>
          </Box>
        </Box>
        {/* Start/Pause/Reset */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', width: '100%', mt: 2 }}>
          <Button
            onClick={isRunning ? onPause : onStart}
            variant="contained"
            sx={{
              bgcolor: isRunning ? color : color,
              color: '#fff',
              borderRadius: 6,
              px: 4,
              fontWeight: 700,
              fontSize: 18,
              boxShadow: 2,
              minWidth: 100,
              textTransform: 'none',
            }}
          >
            {isRunning ? 'Pause' : 'Start'}
          </Button>
          <Button
            onClick={onReset}
            variant="outlined"
            sx={{
              color: color,
              borderColor: color,
              borderRadius: 6,
              px: 4,
              fontWeight: 700,
              fontSize: 18,
              minWidth: 100,
              textTransform: 'none',
            }}
          >
            Reset
          </Button>
        </Box>
        {/* Settings Modal */}
        {settingsOpen && (
          <>
            {/* Local Backdrop */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(20,20,30,0.7)',
                borderRadius: 6,
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={() => setSettingsOpen(false)}
            />
            {/* Glassy Modal */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(40,40,60,0.95)',
                borderRadius: 6,
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                padding: 4,
                zIndex: 20,
                minWidth: fullWidth ? '100%' : 320,
                width: fullWidth ? '100%' : 340,
                minHeight: fullHeight ? '100%' : 320,
                height: fullHeight ? '100%' : 420,
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Back Icon */}
              <IconButton onClick={() => setSettingsOpen(false)} sx={{ position: 'absolute', top: 12, left: 12, color: '#90caf9', zIndex: 21 }}>
                <ArrowBackIosNewIcon fontSize="small" />
              </IconButton>
              <Tabs value={settingsTab} onChange={(_, v) => setSettingsTab(v)} centered sx={{ mb: 2, mt: 1 }}>
                <Tab label="Duration" />
                <Tab label="Select a Task" />
              </Tabs>
              {settingsTab === 0 && (
                <Box sx={{ mt: 2 }}>
                  <TextField
                    label="Duration (minutes)"
                    type="number"
                    value={customDuration}
                    onChange={e => {
                      const value = Math.max(1, Math.min(120, Number(e.target.value)));
                      setCustomDuration(value);
                      onDurationChange(value);
                    }}
                    inputProps={{ min: 1, max: 120 }}
                    fullWidth
                    sx={{ bgcolor: 'rgba(255,255,255,0.08)', borderRadius: 1, input: { color: '#fff' }, label: { color: '#90caf9' } }}
                  />
                  <Button
                    variant="contained"
                    sx={{ mt: 2, width: '100%' }}
                    onClick={() => setSettingsOpen(false)}
                  >
                    Save
                  </Button>
                </Box>
              )}
              {settingsTab === 1 && (
                <Box sx={{ mt: 2 }}>
                  <Select
                    value={selectedTaskId}
                    onChange={e => onTaskChange(e.target.value)}
                    displayEmpty
                    fullWidth
                    sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: '#fff', borderRadius: 1, '& .MuiSelect-select': { color: '#fff' } }}
                  >
                    <MenuItem value="" disabled>Select a task</MenuItem>
                    {tasks.map(task => (
                      <MenuItem key={task._id} value={task._id}>{task.title}</MenuItem>
                    ))}
                  </Select>
                  <Button
                    variant="contained"
                    sx={{ mt: 2, width: '100%' }}
                    onClick={() => setSettingsOpen(false)}
                    disabled={!selectedTaskId}
                  >
                    Save
                  </Button>
                </Box>
              )}
            </Box>
          </>
        )}
      </Box>
    </Paper>
  );
};

// XP Bar component
const XPBar: React.FC<{ xp: number }> = ({ xp }) => {
  // Calculate level and progress
  let level = 1;
  let xpForLevel = 100;
  let xpInLevel = xp;
  while (xpInLevel >= xpForLevel) {
    xpInLevel -= xpForLevel;
    level++;
    xpForLevel = 100 * level;
  }
  const percent = Math.min(100, (xpInLevel / xpForLevel) * 100);
  return (
    <Box sx={{ width: '100%', maxWidth: 420, mx: 'auto', mt: 3, mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ minWidth: 48, fontWeight: 700, color: '#2196f3', fontSize: 20 }}>Lv. {level}</Box>
      <Box sx={{ flex: 1, position: 'relative', height: 28, borderRadius: 14, background: 'linear-gradient(90deg, #232a3a 60%, #3a4256 100%)', boxShadow: '0 2px 8px #0006', border: '2.5px solid #b0b6c3', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${percent}%`,
            background: 'linear-gradient(90deg, #00c6fb 0%, #005bea 100%)',
            boxShadow: percent > 0 ? '0 0 16px 4px #2196f366' : 'none',
            borderRadius: percent === 100 ? '14px' : '14px 0 0 14px',
            transition: 'width 0.7s cubic-bezier(.4,1.4,.6,1)',
          }}
        />
        <Box sx={{ position: 'relative', width: '100%', textAlign: 'center', color: '#fff', fontWeight: 700, zIndex: 1, letterSpacing: 1, fontSize: 16 }}>
          {xpInLevel} / {xpForLevel} XP
        </Box>
      </Box>
    </Box>
  );
};

// Mock leaderboard data
const mockLeaderboard = [
  { id: '2', name: 'Blaze', xp: 95 },
  { id: '3', name: 'Celeste', xp: 80 },
  { id: '4', name: 'Dusk', xp: 60 },
  { id: '5', name: 'Echo', xp: 45 },
  { id: '6', name: 'Frost', xp: 30 },
  { id: '7', name: 'Gale', xp: 20 },
];

// Leaderboard component
const Leaderboard: React.FC<{ users: { id: string, name: string, xp: number }[], currentUserName: string }> = ({ users, currentUserName }) => {
  // Sort by XP descending
  const sorted = [...users].sort((a, b) => b.xp - a.xp);
  // Calculate level for each user
  const withLevel = sorted.map(u => {
    let level = 1, xpForLevel = 100, xpInLevel = u.xp;
    while (xpInLevel >= xpForLevel) {
      xpInLevel -= xpForLevel;
      level++;
      xpForLevel = 100 * level;
    }
    return { ...u, level, xpInLevel, xpForLevel };
  });
  return (
    <Paper
      sx={{
        position: 'relative',
        height: '100%',
        minHeight: 240,
        borderRadius: 3,
        overflow: 'hidden',
        backgroundImage: `url(${LeaderboardBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        '&:before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          borderRadius: 3,
          background: 'rgba(17,25,40,0.55)',
          pointerEvents: 'none',
        },
        boxShadow: '0 8px 32px 0 rgba(31,38,135,0.18)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        minWidth: 0,
        width: '100%',
        color: '#fff',
        p: 2,
        border: '1.5px solid rgba(255,255,255,0.18)',
        backdropFilter: 'blur(18px)',
        overflowX: 'hidden',
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 2, width: '100%', overflowX: 'hidden' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, textAlign: 'center', letterSpacing: 1 }}>Leaderboard</Typography>
        <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', width: '100%' }}>
          {withLevel.map((u, i) => (
            <Box key={u.id} sx={{ display: 'flex', alignItems: 'center', mb: 1.5, p: 1.2, borderRadius: 2, background: u.name === currentUserName ? 'rgba(33,150,243,0.18)' : 'transparent', fontWeight: u.name === currentUserName ? 700 : 500, boxShadow: u.name === currentUserName ? '0 2px 8px #2196f355' : 'none' }}>
              <Box sx={{ width: 28, minWidth: 28, textAlign: 'right', pl: 0.5, mr: 1, fontFamily: 'monospace', color: i === 0 ? '#ffd700' : '#90caf9', fontWeight: 700 }}>{i + 1}</Box>
              <Box sx={{ flex: 1, color: u.name === currentUserName ? '#90caf9' : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</Box>
              <Box sx={{ minWidth: 44, textAlign: 'right', color: '#4fc3f7', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Lv. {u.level}</Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
};

const Dashboard: React.FC = () => {
    // Define the API_BASE_URL using the environment variable
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.auroraminds.xyz/api';

    const [tasks, setTasks] = useState<Task[]>([]);
    const [open, setOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [formData, setFormData] = useState<FormData>({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        status: 'pending',
        subject: ''
    });
    const [quickAddTitle, setQuickAddTitle] = useState('');
    const [quickAddDescription, setQuickAddDescription] = useState('');
    const [quickAddSubject, setQuickAddSubject] = useState('');
    const [quickAddDate, setQuickAddDate] = useState('');
    const [quickAddTime, setQuickAddTime] = useState('');
    const [quickAddPriority, setQuickAddPriority] = useState<Priority>('medium');
    const [subjectMenuOpen, setSubjectMenuOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editTask, setEditTask] = useState<Task | null>(null);
    const [editForm, setEditForm] = useState({ title: '', description: '', dueDate: '', priority: 'medium', status: 'pending', subject: '' });
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [subjectAnchorEl, setSubjectAnchorEl] = useState<null | HTMLElement>(null);
    const [avatarMenuAnchor, setAvatarMenuAnchor] = useState<null | HTMLElement>(null);
    const { user, logout } = useAuth();
    const [accountDialogOpen, setAccountDialogOpen] = useState(false);
    const [focusTaskId, setFocusTaskId] = useState<string | null>(null);
    // Persist timer duration in localStorage
    const getInitialDuration = () => {
      const saved = localStorage.getItem('pomodoroDuration');
      return saved ? parseInt(saved, 10) : 25;
    };
    const [timerDuration, setTimerDuration] = useState(getInitialDuration()); // in minutes, editable
    const [timer, setTimer] = useState(getInitialDuration() * 60); // in seconds
    const [isRunning, setIsRunning] = useState(false);
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
    const [focusHistory, setFocusHistory] = useState<{ taskId: string, seconds: number, date: string }[]>([]);
    const [xp, setXp] = useState(0); // XP tracking
    const [currentTime, setCurrentTime] = useState(new Date());
    const [priorityAnchorEl, setPriorityAnchorEl] = useState<null | HTMLElement>(null);
    const [editPriorityAnchorEl, setEditPriorityAnchorEl] = useState<null | HTMLElement>(null);
    const [subjects, setSubjects] = useState<string[]>([]);
    const [newSubject, setNewSubject] = useState('');
    const [subjectLoading, setSubjectLoading] = useState(false);
    const [subjectError, setSubjectError] = useState('');
    const [themeAnchorEl, setThemeAnchorEl] = useState<null | HTMLElement>(null);
    const { userPref, setTheme } = useColorMode();
    // Track completed tasks in this session to prevent double XP
    const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());

    const navigate = useNavigate();
    const theme = useTheme();
    const mainBg = theme.palette.mode === 'dark' ? '#18191c' : '#f7f8fa';

    // Pick a random quote on mount
    const [quote, setQuote] = React.useState('');
    React.useEffect(() => {
      setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    }, []);

    useEffect(() => {
        fetchTasks();
    }, []);

    useEffect(() => {
        if (isRunning && timer > 0) {
            const id = setInterval(() => setTimer(t => t - 1), 1000);
            setIntervalId(id);
            return () => clearInterval(id);
        } else if (!isRunning && intervalId) {
            clearInterval(intervalId);
        } else if (timer === 0 && focusTaskId) {
            // Log focus session
            setFocusHistory(h => [...h, { taskId: focusTaskId, seconds: timerDuration * 60, date: new Date().toISOString() }]);
            setXp(xp => xp + 1); // 1 XP per completed session
            // Mark task as completed if not already
            const task = tasks.find(t => t._id === focusTaskId);
            if (task && task.status !== 'completed') {
              handleComplete(task);
            }
            setIsRunning(false);
        }
        // eslint-disable-next-line
    }, [isRunning, timer]);

    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                setSubjectLoading(true);
                const res = await axios.get(`${API_BASE_URL}/users/me/subjects`);
                setSubjects((res.data as { subjects: string[] }).subjects || []);
            } catch (err) {
                setSubjectError('Failed to load subjects');
            } finally {
                setSubjectLoading(false);
            }
        };
        fetchSubjects();
    }, [API_BASE_URL]); // Add API_BASE_URL to dependencies

    const fetchTasks = async () => {
        try {
            const res = await axios.get<Task[]>(`${API_BASE_URL}/tasks`);
            setTasks(res.data);
            // Reset completedTaskIds when tasks are refreshed
            setCompletedTaskIds(new Set(res.data.filter(t => t.status === 'completed').map(t => t._id)));
            // Recalculate XP: +1 for every task, +10 for every completed task
            const allTasks = res.data;
            const completedCount = allTasks.filter(t => t.status === 'completed').length;
            setXp(allTasks.length * 1 + completedCount * 10);
        } catch (err) {
            console.error('Error fetching tasks:', err);
        }
    };

    const handleOpen = (task?: Task) => {
        if (task) {
            setEditingTask(task);
            setFormData({
                title: task.title,
                description: task.description,
                dueDate: task.dueDate,
                priority: task.priority,
                status: task.status,
                subject: task.subject
            });
        } else {
            setEditingTask(null);
            setFormData({
                title: '',
                description: '',
                dueDate: '',
                priority: 'medium',
                status: 'pending',
                subject: ''
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingTask(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingTask) {
                await axios.put(`${API_BASE_URL}/tasks/${editingTask._id}`, formData);
            } else {
                await axios.post(`${API_BASE_URL}/tasks`, formData);
            }
            fetchTasks();
            handleClose();
        } catch (err) {
            console.error('Error saving task:', err);
        }
    };

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        try {
            await axios.delete(`${API_BASE_URL}/tasks/${id}`);
            fetchTasks();
        } catch (err) {
            console.error('Error deleting task:', err);
        } finally {
            setDeletingId(null);
        }
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
        const { name, value } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    // Quick add handler
    const handleQuickAdd = async () => {
        if (!quickAddTitle.trim()) {
            alert('Task title is required.');
            return;
        }
        if (!quickAddSubject.trim()) {
            alert('Task subject is required.');
            return;
        }
        let dueDate = quickAddDate;
        if (!dueDate) {
            const today = new Date();
            dueDate = today.toISOString().split('T')[0];
        }
        if (quickAddTime) {
            dueDate += 'T' + quickAddTime;
        }
        const dataToSend = {
            title: quickAddTitle,
            subject: quickAddSubject,
            description: quickAddDescription,
            dueDate,
            priority: quickAddPriority,
            status: 'pending',
        };
        try {
            await axios.post(`${API_BASE_URL}/tasks`, dataToSend);
            setQuickAddTitle('');
            setQuickAddSubject('');
            setQuickAddDescription('');
            setQuickAddDate('');
            setQuickAddTime('');
            setQuickAddPriority('medium');
            fetchTasks();
        } catch (err) {
            if (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'errors' in err.response.data && Array.isArray(err.response.data.errors)) {
                const messages = err.response.data.errors.map((e: any) => e.msg).join('\n');
                alert('Validation error(s):\n' + messages);
                console.error('Validation errors:', err.response.data.errors);
            }
            console.error('Error adding task:', err);
        }
    };

    // Task completion
    const handleComplete = async (task: Task) => {
        try {
            // Only award XP if marking as completed (not toggling back to pending)
            const isCompleting = task.status !== 'completed';
            await axios.put(`${API_BASE_URL}/tasks/${task._id}`, { ...task, status: isCompleting ? 'completed' : 'pending' });
            fetchTasks();
        } catch (err) {
            console.error('Error updating task:', err);
        }
    };

    // Task edit
    const openEditDialog = (task: Task) => {
        setEditTask(task);
        setEditForm({
            title: task.title,
            description: task.description,
            dueDate: task.dueDate.split('T')[0],
            priority: task.priority,
            status: task.status,
            subject: task.subject
        });
        setEditDialogOpen(true);
    };
    const closeEditDialog = () => {
        setEditDialogOpen(false);
        setEditTask(null);
    };
    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };
    const handleEditSave = async () => {
        if (!editTask) return;
        try {
            await axios.put(`${API_BASE_URL}/tasks/${editTask._id}`, editForm);
            fetchTasks();
            closeEditDialog();
        } catch (err) {
            console.error('Error editing task:', err);
        }
    };

    // Quick add chip handlers
    const setToday = () => {
        setQuickAddDate(new Date().toISOString().split('T')[0]);
    };
    const setTomorrow = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setQuickAddDate(tomorrow.toISOString().split('T')[0]);
    };
    const handleCustomDate = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuickAddDate(e.target.value);
    };
    const handleTime = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuickAddTime(e.target.value);
    };

    // Filter and sort tasks
    const todayStr = new Date().toISOString().split('T')[0];
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const todaysTasks = tasks
        .filter(task => task.dueDate && task.dueDate.split('T')[0] === todayStr && task.status !== 'completed')
        .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    const upcomingTasks = tasks
        .filter(task => task.dueDate && task.dueDate.split('T')[0] > todayStr && task.status !== 'completed')
        .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    // Subject dropdown handlers
    const handleSubjectClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setSubjectAnchorEl(event.currentTarget);
    };
    const handleSubjectSelect = (subj: string) => {
        setQuickAddSubject(subj);
        setSubjectAnchorEl(null);
    };
    const handleSubjectClose = () => {
        setSubjectAnchorEl(null);
    };

    const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
        setAvatarMenuAnchor(event.currentTarget);
    };
    const handleAvatarMenuClose = () => {
        setAvatarMenuAnchor(null);
    };
    const handleAccountSettings = () => {
        setAvatarMenuAnchor(null);
        setAccountDialogOpen(true);
    };
    const handleAccountDialogClose = () => {
        setAccountDialogOpen(false);
    };
    const handleLogout = () => {
        setAvatarMenuAnchor(null);
        logout();
    };

    const handleStart = () => setIsRunning(true);
    const handlePause = () => setIsRunning(false);
    const handleReset = () => { setIsRunning(false); setTimer(timerDuration * 60); };
    const handleFocusTaskChange = (e: any) => { setFocusTaskId(e.target.value); setTimer(timerDuration * 60); setIsRunning(false); };
    const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.max(1, parseInt(e.target.value) || 1); // minimum 1 minute
        setTimerDuration(value);
        setTimer(value * 60);
        setIsRunning(false);
    };
    const focusTask = tasks.find(t => t._id === focusTaskId);
    const minutes = Math.floor(timer / 60).toString().padStart(2, '0');
    const seconds = (timer % 60).toString().padStart(2, '0');

    // Greeting based on time
    const hour = currentTime.getHours();
    let greeting = 'Good Night.';
    if (hour >= 5 && hour < 12) greeting = 'Good Morning.';
    else if (hour >= 12 && hour < 17) greeting = 'Good Afternoon.';
    else if (hour >= 17 && hour < 21) greeting = 'Good Evening.';
    // Date/time formatting
    const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateString = currentTime.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
    // Dynamic task count
    const taskCount = todaysTasks.length;
    const taskText = taskCount === 0 ? 'You have no tasks due today.' : `You have ${taskCount} task${taskCount > 1 ? 's' : ''} due today.`;

    // Helper functions for formatting
    const getTaskTime = (dueDate: string) => {
        if (!dueDate) return '';
        const date = new Date(dueDate);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    const getTaskDate = (dueDate: string) => {
        if (!dueDate) return '';
        const due = new Date(dueDate);
        if (isNaN(due.getTime())) return '';
        // Use UTC for date comparison
        const todayLocal = new Date();
        todayLocal.setUTCHours(0, 0, 0, 0);
        const tomorrowUtc = new Date(todayLocal);
        tomorrowUtc.setUTCDate(todayLocal.getUTCDate() + 1);
        const dueDayUtc = new Date(Date.UTC(due.getUTCFullYear(), due.getUTCMonth(), due.getUTCDate()));
        if (dueDayUtc.getTime() === tomorrowUtc.getTime()) return 'Tomorrow';
        return due.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
    };

    // Helper to get checkbox color by priority
    const getCheckboxColor = (priority: string) => {
        switch (priority) {
            case 'high': return '#e57373'; // red
            case 'medium': return '#ffd54f'; // yellow
            case 'low': return '#64b5f6'; // blue
            default: return '#bdbdbd'; // grey
        }
    };

    const handleAddSubject = async () => {
        if (!newSubject.trim()) return;
        try {
            setSubjectLoading(true);
            const res = await axios.post(`${API_BASE_URL}/users/me/subjects`, { subject: newSubject.trim() });
            setSubjects((res.data as { subjects: string[] }).subjects);
            setNewSubject('');
            setSubjectError('');
        } catch (err: any) {
            setSubjectError(err.response?.data?.msg || 'Failed to add subject');
        } finally {
            setSubjectLoading(false);
        }
    };

    const handleDeleteSubject = async (subject: string) => {
        try {
            setSubjectLoading(true);
            const res = await axios.delete(`${API_BASE_URL}/users/me/subjects/${encodeURIComponent(subject)}`);
            setSubjects((res.data as { subjects: string[] }).subjects);
            setSubjectError('');
        } catch (err: any) {
            setSubjectError(err.response?.data?.msg || 'Failed to delete subject');
        } finally {
            setSubjectLoading(false);
        }
    };

    const isSubjectInUse = (subject: string) => tasks.some(task => task.subject === subject);

    const handleThemeMenuClick = (event: React.MouseEvent<HTMLElement>) => {
      setThemeAnchorEl(event.currentTarget);
    };
    const handleThemeMenuClose = () => {
      setThemeAnchorEl(null);
    };
    const handleThemeChange = (newMode: 'light' | 'dark' | 'system') => {
      setTheme(newMode);
      handleThemeMenuClose();
    };

    const handlePomodoroDurationChange = (value: number) => {
        setTimerDuration(value);
        setTimer(value * 60);
        setIsRunning(false);
        localStorage.setItem('pomodoroDuration', value.toString());
    };

    const handlePomodoroTaskChange = (taskId: string) => {
      setFocusTaskId(taskId);
    };

    // Ref for quick add input
    const quickAddInputRef = React.useRef<HTMLInputElement>(null);
    const scrollToQuickAdd = () => {
      if (quickAddInputRef.current) {
        quickAddInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        quickAddInputRef.current.focus();
      }
    };

    return (
        <Grid container sx={{ minHeight: '100vh', bgcolor: 'transparent', overflowX: 'hidden' }}>
            <Grid item xs sx={{ p: 4 }}>
                {/* XP Bar at the top right of the existing header */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', width: '100%', mb: 1, mt: -2, ml: -10 }}>
                  <XPBar xp={xp} />
                </Box>
                {/* Welcome and Focus Timer Panel Row */}
                <Grid container spacing={3} sx={{ mb: 3, alignItems: 'stretch', maxWidth: '100%' }}>
                  <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'stretch' }}>
                    <WelcomeCard userName={user?.name || 'User'} quote={quote} fullHeight fullWidth onAddTaskClick={scrollToQuickAdd} />
                  </Grid>
                  <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'stretch' }}>
                    <FocusTimerCard
                      timer={timer}
                      timerDuration={timerDuration}
                      isRunning={isRunning}
                      onStart={handleStart}
                      onPause={handlePause}
                      onReset={handleReset}
                      tasks={[...todaysTasks, ...upcomingTasks]}
                      xp={xp}
                      onDurationChange={handlePomodoroDurationChange}
                      selectedTaskId={focusTaskId || ''}
                      onTaskChange={handlePomodoroTaskChange}
                      fullHeight
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'stretch' }}>
                    <Leaderboard users={[{ id: '1', name: user?.name || 'Aphrodi', xp }, ...mockLeaderboard]} currentUserName={user?.name || ''} />
                  </Grid>
                </Grid>
                {/* Quick Add Task */}
                <Paper sx={{ p: 2, mb: 3, borderRadius: 3, boxShadow: 2, background: theme.palette.mode === 'dark' ? 'linear-gradient(135deg, rgba(6, 11, 40, 0.94) 19.41%, rgba(10, 14, 35, 0.49) 76.65%)' : '#fff', color: theme.palette.mode === 'dark' ? '#fff' : '#222' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <input
                                ref={quickAddInputRef}
                                placeholder="Quick add task"
                                style={{
                                    border: 'none',
                                    outline: 'none',
                                    fontSize: 16,
                                    width: '100%',
                                    background: 'transparent',
                                    color: 'inherit'
                                }}
                                value={quickAddTitle}
                                onChange={e => setQuickAddTitle(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleQuickAdd(); }}
                            />
                            <TextField
                                placeholder="Description"
                                size="small"
                                value={quickAddDescription}
                                onChange={e => setQuickAddDescription(e.target.value)}
                                sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'white', borderRadius: 1 }}
                            />
                        </Box>
                        <IconButton color="primary" onClick={handleQuickAdd} sx={{ alignSelf: 'flex-start', mt: 0.5 }}>
                            <AddIcon />
                        </IconButton>
                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                            <Button
                                variant="outlined"
                                onClick={handleSubjectClick}
                                sx={{
                                    fontWeight: 600,
                                    color: '#1976d2',
                                    borderColor: '#1976d2',
                                    bgcolor: 'white',
                                    boxShadow: 'none',
                                    textTransform: 'none',
                                    '&:hover': { bgcolor: '#e3f2fd' },
                                    minWidth: 150,
                                    mr: 1,
                                }}
                            >
                                {quickAddSubject || 'Subject'}
                            </Button>
                            <Menu anchorEl={subjectAnchorEl} open={Boolean(subjectAnchorEl)} onClose={handleSubjectClose}>
                                <Box sx={{ p: 2, minWidth: 220 }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Subjects</Typography>
                                    {subjects.map(subj => (
                                        <Box key={subj} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <MenuItem onClick={() => handleSubjectSelect(subj)} sx={{ flex: 1 }}>{subj}</MenuItem>
                                            <IconButton size="small" onClick={() => handleDeleteSubject(subj)} disabled={isSubjectInUse(subj)}>
                                                <DeleteIcon fontSize="small" color={isSubjectInUse(subj) ? 'disabled' : 'error'} />
                                            </IconButton>
                                        </Box>
                                    ))}
                                    <Box sx={{ display: 'flex', mt: 1 }}>
                                        <TextField
                                            size="small"
                                            placeholder="Add subject"
                                            value={newSubject}
                                            onChange={e => setNewSubject(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter') handleAddSubject(); }}
                                            sx={{ flex: 1, mr: 1 }}
                                            disabled={subjectLoading}
                                        />
                                        <Button onClick={handleAddSubject} disabled={subjectLoading || !newSubject.trim()} variant="contained">Add</Button>
                                    </Box>
                                    {subjectError && <Typography color="error" variant="caption">{subjectError}</Typography>}
                                </Box>
                            </Menu>
                            <DateTimePickerMenu
                                value={quickAddDate + (quickAddTime ? 'T' + quickAddTime : '')}
                                onChange={val => {
                                    const [d, t] = val.split('T');
                                    setQuickAddDate(d || '');
                                    setQuickAddTime(t || '');
                                }}
                            />
                            <PriorityMenuButton
                                value={quickAddPriority}
                                onClick={e => setPriorityAnchorEl(e.currentTarget)}
                            />
                            <PriorityMenu
                                anchorEl={priorityAnchorEl}
                                open={Boolean(priorityAnchorEl)}
                                onClose={() => setPriorityAnchorEl(null)}
                                value={quickAddPriority}
                                onChange={p => setQuickAddPriority(p as Priority)}
                            />
                        </Box>
                    </Box>
                </Paper>
                {/* Today's Tasks */}
                <Typography variant="h6" sx={{ mb: 1 }}>Today's tasks</Typography>
                <Paper sx={{ p: 2, mb: 3, borderRadius: 3, boxShadow: 1, background: theme.palette.mode === 'dark' ? 'linear-gradient(135deg, rgba(6, 11, 40, 0.94) 19.41%, rgba(10, 14, 35, 0.49) 76.65%)' : '#fff', color: theme.palette.mode === 'dark' ? '#fff' : '#222' }}>
                    {todaysTasks.length === 0 ? (
                        <Typography>No tasks for today.</Typography>
                    ) : (
                        todaysTasks.map(task => (
                            <Box key={task._id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, p: 1, borderRadius: 2, '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#f0f4fa' } }}>
                                <Chip
                                    label={task.subject || 'No Subject'}
                                    size="small"
                                    sx={{
                                        bgcolor: subjectColors[task.subject] || subjectColors.Default,
                                        color: '#fff',
                                        fontWeight: 700,
                                        mr: 1,
                                        minWidth: 70,
                                        borderRadius: 1,
                                    }}
                                />
                                <Checkbox checked={task.status === 'completed'} onChange={() => handleComplete(task)} sx={{ color: getCheckboxColor(task.priority) }} />
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography sx={{ fontWeight: 500, textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>{task.title}</Typography>
                                    {task.description && <Typography sx={{ color: '#888', fontSize: 13 }}>{task.description}</Typography>}
                                </Box>
                                <Typography sx={{ minWidth: 80, textAlign: 'right', color: '#222', fontWeight: 500 }}>{getTaskTime(task.dueDate)}</Typography>
                                <IconButton onClick={() => openEditDialog(task)}><EditIcon sx={{ color: '#222' }} /></IconButton>
                                <IconButton onClick={() => handleDelete(task._id)} disabled={deletingId === task._id}><DeleteIcon sx={{ color: '#222' }} /></IconButton>
                            </Box>
                        ))
                    )}
                </Paper>
                {/* Upcoming Tasks */}
                <Typography variant="h6" sx={{ mb: 1 }}>Upcoming tasks</Typography>
                <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 1, background: theme.palette.mode === 'dark' ? 'linear-gradient(135deg, rgba(6, 11, 40, 0.94) 19.41%, rgba(10, 14, 35, 0.49) 76.65%)' : '#fff', color: theme.palette.mode === 'dark' ? '#fff' : '#222' }}>
                    {upcomingTasks.length === 0 ? (
                        <Typography>No upcoming tasks.</Typography>
                    ) : (
                        upcomingTasks.map(task => (
                            <Box key={task._id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, p: 1, borderRadius: 2, '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#f0f4fa' } }}>
                                <Chip
                                    label={task.subject || 'No Subject'}
                                    size="small"
                                    sx={{
                                        bgcolor: subjectColors[task.subject] || subjectColors.Default,
                                        color: '#fff',
                                        fontWeight: 700,
                                        mr: 1,
                                        minWidth: 70,
                                        borderRadius: 1,
                                    }}
                                />
                                <Checkbox checked={task.status === 'completed'} onChange={() => handleComplete(task)} sx={{ color: getCheckboxColor(task.priority) }} />
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography sx={{ fontWeight: 500, textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>{task.title}</Typography>
                                    {task.description && <Typography sx={{ color: '#888', fontSize: 13 }}>{task.description}</Typography>}
                                </Box>
                                <Typography sx={{ minWidth: 80, textAlign: 'right', color: '#222', fontWeight: 500 }}>{getTaskDate(task.dueDate)}</Typography>
                                <IconButton onClick={() => openEditDialog(task)}><EditIcon sx={{ color: '#222' }} /></IconButton>
                                <IconButton onClick={() => handleDelete(task._id)} disabled={deletingId === task._id}><DeleteIcon sx={{ color: '#222' }} /></IconButton>
                            </Box>
                        ))
                    )}
                </Paper>
                {/* Edit Dialog */}
                <Dialog open={editDialogOpen} onClose={closeEditDialog} maxWidth="sm" fullWidth>
                    <DialogTitle>Edit Task</DialogTitle>
                    <DialogContent sx={{ pb: 0 }}>
                        <TextField
                            margin="dense"
                            label="Title"
                            name="title"
                            value={editForm.title}
                            onChange={handleEditChange}
                            fullWidth
                        />
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>Subjects</Typography>
                            {subjects.map(subj => (
                                <Box key={subj} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <MenuItem onClick={() => setEditForm(f => ({ ...f, subject: subj }))} selected={editForm.subject === subj} sx={{ flex: 1 }}>{subj}</MenuItem>
                                    <IconButton size="small" onClick={() => handleDeleteSubject(subj)} disabled={isSubjectInUse(subj)}>
                                        <DeleteIcon fontSize="small" color={isSubjectInUse(subj) ? 'disabled' : 'error'} />
                                    </IconButton>
                                </Box>
                            ))}
                            <Box sx={{ display: 'flex', mt: 1 }}>
                                <TextField
                                    size="small"
                                    placeholder="Add subject"
                                    value={newSubject}
                                    onChange={e => setNewSubject(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') handleAddSubject(); }}
                                    sx={{ flex: 1, mr: 1 }}
                                    disabled={subjectLoading}
                                />
                                <Button onClick={handleAddSubject} disabled={subjectLoading || !newSubject.trim()} variant="contained">Add</Button>
                            </Box>
                            {subjectError && <Typography color="error" variant="caption">{subjectError}</Typography>}
                        </Box>
                        <TextField
                            margin="dense"
                            label="Description"
                            name="description"
                            value={editForm.description}
                            onChange={handleEditChange}
                            fullWidth
                        />
                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                            <DateTimePickerMenu
                                value={editForm.dueDate}
                                onChange={val => setEditForm(f => ({ ...f, dueDate: val }))}
                                sx={{ flex: 1 }}
                            />
                            <PriorityMenuButton
                                value={editForm.priority as Priority}
                                onClick={e => setEditPriorityAnchorEl(e.currentTarget)}
                                sx={{ flex: 1 }}
                            />
                            <PriorityMenu
                                anchorEl={editPriorityAnchorEl}
                                open={Boolean(editPriorityAnchorEl)}
                                onClose={() => setEditPriorityAnchorEl(null)}
                                value={editForm.priority as Priority}
                                onChange={p => setEditForm(f => ({ ...f, priority: p }))}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ pb: 2, pr: 3 }}>
                        <Button onClick={closeEditDialog}>Cancel</Button>
                        <Button onClick={handleEditSave} variant="contained">Save</Button>
                    </DialogActions>
                </Dialog>
            </Grid>
        </Grid>
    );
};

export default Dashboard;