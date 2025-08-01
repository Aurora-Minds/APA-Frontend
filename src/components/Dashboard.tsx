import React, { useState, useEffect, useMemo } from 'react';
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
import { useTimer } from '../context/TimerContext';
import { useNotifications } from '../context/NotificationContext';
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
import Tooltip from '@mui/material/Tooltip';
import ListItemButton from '@mui/material/ListItemButton';
import DateTimePickerMenu from './DateTimePickerMenu';
import PriorityMenu, { Priority } from './PriorityMenu';
import FlagIcon from '@mui/icons-material/Flag';
import { PriorityMenuButton } from './PriorityMenu';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import { useColorMode } from '../theme/ColorModeContext';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AuroraJellyfish from '../AuroraJellyfish.png';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import WaterBg from '../assets/water-bg.jpg';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import LeaderboardBg from '../assets/leaderboard-bg.jpg';
import QuickAddJellyfish from '../assets/quickadd-jellyfish.jpg';
import SubjectIcon from '@mui/icons-material/Subject';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import { notificationService } from '../services/notificationService';
import ManageSubjectsDialog from './ManageSubjectsDialog';


interface Task {
    _id: string;
    title: string;
    description: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high' | 'none';
    status: 'pending' | 'in-progress' | 'completed';
    subject: string;
    taskType?: 'lab' | 'assignment' | 'project';
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

interface LeaderboardUser {
    _id: string;
    name: string;
    xp: number;
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
    </Box>
  </Paper>
);

// Motivational quotes array
const motivationalQuotes = [
  'Every accomplishment starts with the decision to try.',
  'Success is the sum of small efforts, repeated day in and day out.',
  'The secret of getting ahead is getting started.',
  "Don't watch the clock; do what it does. Keep going.",
  'The future depends on what you do today.',
  'Great things are done by a series of small things brought together.',
  "You don't have to be great to start, but you have to start to be great.",
  'Push yourself, because no one else is going to do it for you.',
  'Dream big and dare to fail.',
  "Believe you can and you're halfway there."
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

// Leaderboard component
const Leaderboard: React.FC<{ users: LeaderboardUser[], currentUserName: string }> = ({ users, currentUserName }) => {
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
        width: '300px',
        height: '700px',
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
        boxShadow: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        color: '#fff',
        p: 2,
        border: 'none',
        backdropFilter: 'blur(18px)',
        overflowX: 'hidden',
      }}
    >
              <Box sx={{ position: 'relative', zIndex: 2, width: '100%', overflowX: 'hidden' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, textAlign: 'center', letterSpacing: 1 }}>Leaderboard</Typography>
          <Box sx={{ 
            width: '100%',
          }}>
            {withLevel.map((u, i) => (
              <Box key={u._id} sx={{ display: 'flex', alignItems: 'center', mb: 1.5, p: 1.2, borderRadius: 2, background: u.name === currentUserName ? 'rgba(33,150,243,0.18)' : 'transparent', fontWeight: u.name === currentUserName ? 700 : 500, boxShadow: u.name === currentUserName ? '0 2px 8px #2196f355' : 'none' }}>
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
    const [quickAddReported, setQuickAddReported] = useState('');
    const [quickAddAssignee, setQuickAddAssignee] = useState('');
    const [quickAddTaskType, setQuickAddTaskType] = useState<'lab' | 'assignment' | 'project' | null>(null);
    const [quickAddSubject, setQuickAddSubject] = useState('');
    const [quickAddDate, setQuickAddDate] = useState('');
    const [quickAddTime, setQuickAddTime] = useState('');
    const [quickAddPriority, setQuickAddPriority] = useState<Priority | null>(null);
    const [subjectMenuOpen, setSubjectMenuOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editTask, setEditTask] = useState<Task | null>(null);
    const [editForm, setEditForm] = useState({ title: '', description: '', dueDate: '', priority: 'medium', status: 'pending', subject: '' });
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [subjectAnchorEl, setSubjectAnchorEl] = useState<null | HTMLElement>(null);
    const [reportedAnchorEl, setQuickAddReportedAnchorEl] = useState<null | HTMLElement>(null);
    const [assigneeAnchorEl, setQuickAddAssigneeAnchorEl] = useState<null | HTMLElement>(null);
    const [avatarMenuAnchor, setAvatarMenuAnchor] = useState<null | HTMLElement>(null);
    const { user, logout, refreshUser } = useAuth();
    const { 
      timer, 
      timerDuration, 
      isRunning, 
      focusTaskId,
      startTimer, 
      pauseTimer, 
      resetTimer, 
      setTimerDuration, 
      setFocusTaskId
    } = useTimer();
    const { addNotification } = useNotifications();
    
    const [focusHistory, setFocusHistory] = useState<{ taskId: string, seconds: number, date: string }[]>([]);
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
    const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardUser[]>([]);
    const [leaderboardAnchorEl, setLeaderboardAnchorEl] = useState<null | HTMLElement>(null);
    const [manageSubjectsOpen, setManageSubjectsOpen] = useState(false);

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
        fetchLeaderboard();
    }, []);

    // Monitor tasks for due date notifications
    useEffect(() => {
        const checkTaskDueDates = async () => {
            // Check frontend tasks
            tasks.forEach(task => {
                notificationService.checkTaskDueDate(task, addNotification);
            });
            
            // Also check backend for any missed notifications
            await notificationService.checkBackendNotifications(addNotification);
        };

        // Check immediately when tasks change
        checkTaskDueDates();

        // Set up interval to check every 30 seconds for more responsive notifications
        const interval = setInterval(checkTaskDueDates, 30000);

        return () => clearInterval(interval);
    }, [tasks, addNotification]);

    // Monitor user level up
    useEffect(() => {
        if (user) {
            // Get auth token from localStorage
            const token = localStorage.getItem('token');
            notificationService.setCurrentUser(user._id, token || undefined);
            // Check level up whenever user data changes
            notificationService.checkLevelUp(user, addNotification);
        }
    }, [user?.xp, addNotification]); // Changed dependency to user?.xp to trigger on XP changes



    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                setSubjectLoading(true);
                const res = await axios.get(`${API_BASE_URL}/users/me/subjects`);
                const userSubjects = (res.data as { subjects: string[] }).subjects || [];
                
                // Always include professional subjects alongside user's existing subjects
                const professionalSubjects = [
                    'Project Management',
                    'Client Communication',
                    'Research & Analysis',
                    'Content Creation',
                    'Data Analysis',
                    'Strategic Planning',
                    'Team Collaboration',
                    'Financial Planning',
                    'Marketing Strategy',
                    'Product Development',
                    'Customer Support',
                    'Quality Assurance',
                    'Business Development',
                    'Operations Management',
                    'Human Resources',
                    'Legal & Compliance',
                    'Technology & IT',
                    'Sales & Revenue',
                    'Risk Management',
                    'Innovation & R&D'
                ];
                
                // Combine user subjects with professional subjects, removing duplicates
                const highSchoolSubjects = ['English', 'Math', 'Science', 'History'];
                const filteredUserSubjects = userSubjects.filter(subject => !highSchoolSubjects.includes(subject));
                const allSubjects = [...filteredUserSubjects, ...professionalSubjects].filter((subject, index, array) => 
                    array.indexOf(subject) === index
                );
                setSubjects(allSubjects);
            } catch (err) {
                setSubjectError('Failed to load subjects');
                // Fallback to professional subjects if API fails
                const fallbackSubjects = [
                    'Project Management',
                    'Client Communication',
                    'Research & Analysis',
                    'Content Creation',
                    'Data Analysis',
                    'Strategic Planning',
                    'Team Collaboration',
                    'Financial Planning',
                    'Marketing Strategy',
                    'Product Development'
                ];
                setSubjects(fallbackSubjects);
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
        } catch (err: any) {
            console.error('Error fetching tasks:', err);
        }
    };

    const fetchLeaderboard = async () => {
        try {
            const res = await axios.get<LeaderboardUser[]>(`${API_BASE_URL}/leaderboard`);
            setLeaderboardUsers(res.data);
        } catch (err: any) {
            console.error('Error fetching leaderboard:', err);
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
                // Award XP based on priority: None=5, Low=10, Medium=15, High=20
                // The backend will handle XP calculation based on priority
                refreshUser();
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
        if (!quickAddTaskType) {
            alert('Please select a task type (Lab, Assignment, or Project).');
            return;
        }
        let dueDate = quickAddDate;
        if (!dueDate) {
            const today = new Date();
            dueDate = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
        }
        
        // Add time to the due date if it's set
        if (quickAddTime) {
            dueDate = new Date(`${dueDate}T${quickAddTime}:00`).toISOString();
        } else {
            dueDate = new Date(dueDate).toISOString();
        }
        
        const dataToSend = {
            title: quickAddTitle,
            subject: quickAddSubject,
            description: quickAddDescription,
            taskType: quickAddTaskType,
            reported: quickAddReported,
            assignee: quickAddAssignee,
            dueDate,
            priority: quickAddPriority || 'medium', // Default to medium if null
            status: 'pending',
        };
        
        console.log('Data being sent to backend:', dataToSend);
        try {
            const response = await axios.post<Task>(`${API_BASE_URL}/tasks`, dataToSend);
            const newTask = response.data;
            
            // Check for immediate notification after creating the task
            console.log('New task created, checking for notification:', newTask);
            console.log('Task due date:', newTask.dueDate);
            console.log('Current time:', new Date());
            
            // Add new task to notification service and check immediately
            notificationService.addNewTask(newTask._id);
            notificationService.checkTaskDueDate(newTask, addNotification);
            
            // Test notification to ensure the system is working
            addNotification({
              type: 'task_due',
              title: 'Task Created!',
              message: `Task "${newTask.title}" was created successfully`,
              taskId: newTask._id,
            });
            
            // Award XP based on priority: None=5, Low=10, Medium=15, High=20
            // The backend will handle XP calculation based on priority
            refreshUser();
            setQuickAddTitle('');
            setQuickAddSubject('');
            setQuickAddDescription('');
            setQuickAddReported('');
            setQuickAddAssignee('');
            setQuickAddDate('');
            setQuickAddTime('');
            setQuickAddPriority(null);
            setQuickAddTaskType(null);
            fetchTasks();
        } catch (err: any) {
            console.error('Full error object:', err);
            console.error('Error response data:', err.response?.data);
            console.error('Error response status:', err.response?.status);
            
            if (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'errors' in err.response.data && Array.isArray(err.response.data.errors)) {
                const messages = err.response.data.errors.map((e: any) => e.msg).join('\n');
                alert('Validation error(s):\n' + messages);
                console.error('Validation errors:', err.response.data.errors);
            } else {
                alert('Error creating task. Check console for details.');
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
            if (isCompleting) {
                refreshUser();
                // Add notification for task completion
                notificationService.addTaskCompletedNotification(task, addNotification);
            }
        } catch (err: any) {
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
        } catch (err: any) {
            console.error('Error editing task:', err);
        }
    };

    // Quick add chip handlers
    const setToday = () => {
        const today = new Date();
        const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
        setQuickAddDate(todayStr);
    };
    const setTomorrow = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.getFullYear() + '-' + String(tomorrow.getMonth() + 1).padStart(2, '0') + '-' + String(tomorrow.getDate()).padStart(2, '0');
        setQuickAddDate(tomorrowStr);
    };
    const handleCustomDate = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuickAddDate(e.target.value);
    };
    const handleTime = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuickAddTime(e.target.value);
    };

    // Filter and sort tasks
    const today = new Date();
    const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
    const priorityOrder = { high: 0, medium: 1, low: 2, none: 3 };
    
    const todaysTasks = tasks
        .filter(task => {
            if (!task.dueDate || task.status === 'completed') return false;
            // Extract just the date part from the due date
            let taskDateStr;
            if (task.dueDate.includes('T')) {
                // New format: "2025-07-23T11:00:00.000Z" -> extract "2025-07-23"
                taskDateStr = task.dueDate.split('T')[0];
            } else {
                // Old format: "2025-07-23"
                taskDateStr = task.dueDate;
            }
            return taskDateStr === todayStr;
        })
        .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    
    const upcomingTasks = tasks
        .filter(task => {
            if (!task.dueDate || task.status === 'completed') return false;
            // Extract just the date part from the due date
            let taskDateStr;
            if (task.dueDate.includes('T')) {
                // New format: "2025-07-23T11:00:00.000Z" -> extract "2025-07-23"
                taskDateStr = task.dueDate.split('T')[0];
            } else {
                // Old format: "2025-07-23"
                taskDateStr = task.dueDate;
            }
            // Include today's tasks in upcoming as well (so they appear in both sections)
            return taskDateStr >= todayStr;
        })
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

    const handleReportedClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setQuickAddReported(''); // Clear selected value
        setQuickAddReportedAnchorEl(event.currentTarget);
    };
    const handleReportedSelect = (reported: string) => {
        setQuickAddReported(reported);
        setQuickAddReportedAnchorEl(null);
    };
    const handleReportedClose = () => {
        setQuickAddReportedAnchorEl(null);
    };

    const handleAssigneeClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setQuickAddAssignee(''); // Clear selected value
        setQuickAddAssigneeAnchorEl(event.currentTarget);
    };
    const handleAssigneeSelect = (assignee: string) => {
        setQuickAddAssignee(assignee);
        setQuickAddAssigneeAnchorEl(null);
    };
    const handleAssigneeClose = () => {
        setQuickAddAssigneeAnchorEl(null);
    };

    const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
        setAvatarMenuAnchor(event.currentTarget);
    };
    const handleAvatarMenuClose = () => {
        setAvatarMenuAnchor(null);
    };
    
    const handleLogout = () => {
        setAvatarMenuAnchor(null);
        logout();
    };

    const handleStart = () => startTimer();
    const handlePause = () => pauseTimer();
    const handleReset = () => resetTimer();
    const handleFocusTaskChange = (e: any) => { setFocusTaskId(e.target.value); };
    const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.max(1, parseInt(e.target.value) || 1); // minimum 1 minute
        setTimerDuration(value);
    };
    const focusTask = tasks.find(t => t._id === focusTaskId);
    const minutes = Math.floor(timer / 60).toString().padStart(2, '0');
    const seconds = (timer % 60).toString().padStart(2, '0');

    // Memoize the combined tasks to prevent unnecessary updates
    const allTasks = useMemo(() => [...todaysTasks, ...upcomingTasks], [todaysTasks, upcomingTasks]);

    // Handle timer completion and task completion
    useEffect(() => {
        if (timer === 0 && focusTaskId) {
            const completeTask = async () => {
                try {
                    // Automatically complete the focused task
                    const focusedTask = allTasks.find(t => t._id === focusTaskId);
                    if (focusedTask && focusedTask.status !== 'completed') {
                        await axios.put(`${API_BASE_URL}/tasks/${focusTaskId}`, { 
                            ...focusedTask, 
                            status: 'completed' 
                        });
                        fetchTasks(); // Refresh tasks to show the completed status
                        refreshUser(); // Refresh user to get updated XP
                    }
                } catch (err) {
                    console.error('Error completing task:', err);
                }
            };
            completeTask();
        }
    }, [timer, focusTaskId, allTasks, API_BASE_URL]);

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
        const date = new Date(dueDate);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
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
        localStorage.setItem('pomodoroDuration', value.toString());
    };

    const handlePomodoroTaskChange = (taskId: string) => {
      setFocusTaskId(taskId);
    };

    const handleLeaderboardClick = (event: React.MouseEvent<HTMLElement>) => {
      setLeaderboardAnchorEl(event.currentTarget);
    };

    const handleLeaderboardClose = () => {
      setLeaderboardAnchorEl(null);
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
        <Box sx={{ 
            minHeight: '100vh', 
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Main Content */}
            <Box sx={{ position: 'relative', zIndex: 1, background: 'transparent', p: 4 }}>
                {/* XP Bar */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', width: '100%', mb: 0 }}>
                    <XPBar xp={user?.xp || 0} />
                </Box>
                
                            {/* Welcome and Focus Timer Panel Row */}
            <Grid container spacing={3} sx={{ mb: 3, alignItems: 'stretch', maxWidth: '100%' }}>
                <Grid item xs={12} md={5} sx={{ display: 'flex', alignItems: 'stretch' }}>
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
                        tasks={allTasks}
                        xp={user?.xp || 0}
                        onDurationChange={handlePomodoroDurationChange}
                        selectedTaskId={focusTaskId || ''}
                        onTaskChange={handlePomodoroTaskChange}
                        fullHeight
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Leaderboard users={leaderboardUsers} currentUserName={user?.name || ''} />
                    
                    {/* Email Reminders Widget */}
                    <Paper
                        sx={{
                            p: 2,
                            background: 'rgba(255,255,255,0.06)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 3,
                            height: 'fit-content'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <NotificationsIcon sx={{ mr: 1, color: '#4318ff' }} />
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#fff' }}>
                                Email Reminders
                            </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                            Stay on top of your tasks with email notifications
                        </Typography>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => navigate('/email-settings')}
                            sx={{
                                color: '#4318ff',
                                borderColor: '#4318ff',
                                '&:hover': {
                                    borderColor: '#fff',
                                    color: '#fff'
                                }
                            }}
                        >
                            Configure
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </Box>

            {/* Quick Add Task */}
            <Box sx={{ p: 3 }}>
                <Paper
                    sx={{
                        width: '1230px',
                        minHeight: 280,
                        mx: 0,
                        mb: -3,
                        p: 3,
                        borderRadius: 5,
                        boxShadow: '0 8px 32px 0 rgba(31,38,135,0.18)',
                        position: 'relative',
                        overflow: 'hidden',
                        background: 'none',
                        color: '#fff',
                        border: '1.5px solid rgba(255,255,255,0.12)',
                        backdropFilter: 'blur(12px)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                    }}
                >
                    {/* Background image */}
                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: `url(${QuickAddJellyfish})`,
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
                            borderRadius: 5,
                            pointerEvents: 'none',
                        }}
                    />
                    <Box sx={{ position: 'relative', zIndex: 3 }}>
                        <Typography
                            sx={{
                                fontWeight: 600,
                                opacity: 0.9,
                                fontSize: 18,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                color: '#fff',
                                mb: 2,
                                textAlign: 'left',
                                justifyContent: 'flex-start',
                                pl: 1,
                            }}
                        >
                            Add your task
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                            <TextField
                                inputRef={quickAddInputRef}
                                placeholder="Task Title"
                                variant="outlined"
                                size="small"
                                sx={{
                                    width: '40%',
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'rgba(255,255,255,0.25)',
                                        borderRadius: 2,
                                        '& fieldset': {
                                            border: 'none',
                                        },
                                        '&:hover fieldset': {
                                            border: 'none',
                                        },
                                        '&.Mui-focused fieldset': {
                                            border: 'none',
                                        },
                                        '& input': {
                                            color: '#fff',
                                            fontSize: 18,
                                            '&::placeholder': {
                                                color: '#e3f2fd',
                                                opacity: 1,
                                            },
                                        },
                                    },
                                }}
                                value={quickAddTitle}
                                onChange={e => setQuickAddTitle(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleQuickAdd(); }}
                            />
                            <TextField
                                placeholder="Description"
                                variant="outlined"
                                size="small"
                                sx={{
                                    width: '40%',
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'rgba(255,255,255,0.25)',
                                        borderRadius: 2,
                                        '& fieldset': {
                                            border: 'none',
                                        },
                                        '&:hover fieldset': {
                                            border: 'none',
                                        },
                                        '&.Mui-focused fieldset': {
                                            border: 'none',
                                        },
                                        '& input': {
                                            color: '#fff',
                                            fontSize: 18,
                                            '&::placeholder': {
                                                color: '#e3f2fd',
                                                opacity: 1,
                                            },
                                        },
                                    },
                                }}
                                value={quickAddDescription}
                                onChange={e => setQuickAddDescription(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleQuickAdd(); }}
                            />
                        </Box>
                        {/* Lab, Assignment, and Project buttons - First Row */}
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    console.log('Lab button clicked, current type:', quickAddTaskType);
                                    setQuickAddTaskType('lab');
                                }}
                                sx={{
                                    fontWeight: 600,
                                    color: '#fff',
                                    borderColor: quickAddTaskType === 'lab' ? '#90caf9' : '#90caf9',
                                    bgcolor: quickAddTaskType === 'lab' ? 'rgba(144, 202, 249, 0.3)' : 'rgba(255,255,255,0.06)',
                                    boxShadow: quickAddTaskType === 'lab' ? '0 0 8px rgba(144, 202, 249, 0.5)' : 'none',
                                    textTransform: 'none',
                                    '&:hover': { bgcolor: '#1565c0', borderColor: '#fff' },
                                    width: 160,
                                    height: 45,
                                    fontSize: 12,
                                }}
                            >
                                Lab
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    console.log('Assignment button clicked, current type:', quickAddTaskType);
                                    setQuickAddTaskType('assignment');
                                }}
                                sx={{
                                    fontWeight: 600,
                                    color: '#fff',
                                    borderColor: quickAddTaskType === 'assignment' ? '#90caf9' : '#90caf9',
                                    bgcolor: quickAddTaskType === 'assignment' ? 'rgba(144, 202, 249, 0.3)' : 'rgba(255,255,255,0.06)',
                                    boxShadow: quickAddTaskType === 'assignment' ? '0 0 8px rgba(144, 202, 249, 0.5)' : 'none',
                                    textTransform: 'none',
                                    '&:hover': { bgcolor: '#1565c0', borderColor: '#fff' },
                                    width: 160,
                                    height: 45,
                                    fontSize: 12,
                                }}
                            >
                                Assignment
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    console.log('Project button clicked, current type:', quickAddTaskType);
                                    setQuickAddTaskType('project');
                                }}
                                sx={{
                                    fontWeight: 600,
                                    color: '#fff',
                                    borderColor: quickAddTaskType === 'project' ? '#90caf9' : '#90caf9',
                                    bgcolor: quickAddTaskType === 'project' ? 'rgba(144, 202, 249, 0.3)' : 'rgba(255,255,255,0.06)',
                                    boxShadow: quickAddTaskType === 'project' ? '0 0 8px rgba(144, 202, 249, 0.5)' : 'none',
                                    textTransform: 'none',
                                    '&:hover': { bgcolor: '#1565c0', borderColor: '#fff' },
                                    width: 160,
                                    height: 45,
                                    fontSize: 12,
                                }}
                            >
                                Project
                            </Button>
                        </Box>
                        
                        {/* Course, Priority, and Due Date & Time buttons - Second Row */}
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <Button
                                variant="outlined"
                                onClick={handleSubjectClick}
                                sx={{
                                    fontWeight: 600,
                                    color: '#fff',
                                    borderColor: '#90caf9',
                                    bgcolor: 'rgba(255,255,255,0.06)',
                                    boxShadow: 'none',
                                    textTransform: 'none',
                                    '&:hover': { bgcolor: '#1565c0', borderColor: '#fff' },
                                    width: 160,
                                    height: 45,
                                    fontSize: 12,
                                }}
                            >
                                {quickAddSubject || 'Course'}
                                <KeyboardArrowDownIcon sx={{ ml: 0.5 }} />
                            </Button>
                            <PriorityMenuButton
                                value={quickAddPriority}
                                onClick={e => setPriorityAnchorEl(e.currentTarget)}
                                sx={{ 
                                    width: 160,
                                    height: 45,
                                    fontSize: 12,
                                }}
                            />
                            <DateTimePickerMenu
                                value={quickAddDate + (quickAddTime ? 'T' + quickAddTime : '')}
                                onChange={(value) => {
                                    if (value) {
                                        try {
                                            const date = new Date(value);
                                            if (!isNaN(date.getTime())) {
                                                setQuickAddDate(date.toISOString().split('T')[0]);
                                                setQuickAddTime(date.toTimeString().slice(0, 5));
                                            }
                                        } catch (error) {
                                            console.log('Invalid date value:', value);
                                        }
                                    }
                                }}
                                sx={{ 
                                    width: 160,
                                    height: 45,
                                    fontSize: 12,
                                    '& .MuiButton-root': {
                                        width: '100%',
                                        height: '100%',
                                        fontSize: 12,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        padding: '6px 8px',
                                    }
                                }}
                            />
                        </Box>
                        
                        {/* Create Task button - Third Row */}
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <Button
                                variant="contained"
                                onClick={() => {
                                    console.log('Create Task clicked with values:', {
                                        title: quickAddTitle,
                                        subject: quickAddSubject,
                                        taskType: quickAddTaskType,
                                        priority: quickAddPriority
                                    });
                                    handleQuickAdd();
                                }}
                                disabled={!quickAddTitle.trim() || !quickAddSubject.trim() || !quickAddTaskType}
                                sx={{
                                    fontWeight: 700,
                                    color: '#fff',
                                    bgcolor: '#2196f3',
                                    borderColor: '#2196f3',
                                    boxShadow: '0 2px 8px #2196f355',
                                    textTransform: 'none',
                                    '&:hover': { bgcolor: '#1976d2' },
                                    '&:disabled': { 
                                        bgcolor: 'rgba(255,255,255,0.1)', 
                                        color: 'rgba(255,255,255,0.5)',
                                        borderColor: 'rgba(255,255,255,0.2)'
                                    },
                                    width: 160,
                                    height: 45,
                                    fontSize: 12,
                                }}
                            >
                                Create Task
                            </Button>
                        </Box>
                    </Box>
                    <PriorityMenu
                        anchorEl={priorityAnchorEl}
                        open={Boolean(priorityAnchorEl)}
                        onClose={() => setPriorityAnchorEl(null)}
                        value={quickAddPriority}
                        onChange={(p: Priority) => setQuickAddPriority(p)}
                    />
                    <Menu
                        anchorEl={subjectAnchorEl}
                        open={Boolean(subjectAnchorEl)}
                        onClose={handleSubjectClose}
                    >
                        {subjects.map((subject) => (
                            <MenuItem key={subject} onClick={() => handleSubjectSelect(subject)}>
                                {subject}
                            </MenuItem>
                        ))}
                        <Divider />
                        <MenuItem onClick={() => setManageSubjectsOpen(true)}>
                            <AddIcon sx={{ mr: 1 }} />
                            Manage Subjects
                        </MenuItem>
                    </Menu>

                    <ManageSubjectsDialog
                        open={manageSubjectsOpen}
                        onClose={() => setManageSubjectsOpen(false)}
                        subjects={subjects}
                        onAddSubject={handleAddSubject}
                        onDeleteSubject={handleDeleteSubject}
                        isSubjectInUse={isSubjectInUse}
                    />

                </Paper>
            </Box>

            {/* Today's Tasks */}
            <Box sx={{ position: 'relative', zIndex: 1, p: 3, background: 'transparent' }}>
                <Paper
                    sx={{
                        width: '1230px',
                        minHeight: 200,
                        mx: 0,
                        mb: -6,
                        p: 3,
                        borderRadius: 5,
                        boxShadow: '0 8px 32px 0 rgba(31,38,135,0.18)',
                        position: 'relative',
                        overflow: 'hidden',
                        background: 'none',
                        color: '#fff',
                        border: '1.5px solid rgba(255,255,255,0.12)',
                        backdropFilter: 'blur(12px)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                    }}
                >
                    {/* Glassy Overlay */}
                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            bgcolor: 'rgba(17,25,40,0.55)',
                            zIndex: 2,
                            borderRadius: 5,
                            pointerEvents: 'none',
                        }}
                    />
                    <Box sx={{ position: 'relative', zIndex: 3 }}>
                        <Typography
                            sx={{
                                fontWeight: 600,
                                opacity: 0.9,
                                fontSize: 18,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                color: '#fff',
                                mb: 2,
                                textAlign: 'left',
                                justifyContent: 'flex-start',
                                pl: 0,
                            }}
                        >
                            Today's tasks
                        </Typography>
                        
                        {/* Column Headers */}
                        {todaysTasks.length > 0 && (
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                mb: 2, 
                                p: 2, 
                                borderRadius: 2, 
                                bgcolor: 'rgba(255,255,255,0.12)',
                                borderBottom: '1px solid rgba(255,255,255,0.2)'
                            }}>
                                <Typography sx={{ 
                                    fontWeight: 600, 
                                    color: '#e3f2fd', 
                                    width: '20%',
                                    fontSize: 14
                                }}>
                                    Course
                                </Typography>
                                <Typography sx={{ 
                                    fontWeight: 600, 
                                    color: '#e3f2fd', 
                                    flexGrow: 1,
                                    fontSize: 14,
                                    pl: 6
                                }}>
                                    Task Name
                                </Typography>
                                <Typography sx={{ 
                                    fontWeight: 600, 
                                    color: '#e3f2fd', 
                                    width: '12%',
                                    fontSize: 14
                                }}>
                                    Category
                                </Typography>
                                <Typography sx={{ 
                                    fontWeight: 600, 
                                    color: '#e3f2fd', 
                                    width: '12%',
                                    textAlign: 'center',
                                    fontSize: 14
                                }}>
                                    Due Date
                                </Typography>
                            </Box>
                        )}
                        
                        {todaysTasks.length === 0 ? (
                            <Typography sx={{ color: '#e3f2fd', opacity: 0.8, pl: 0 }}>No tasks for today.</Typography>
                        ) : (
                            todaysTasks.map(task => (
                                <Box key={task._id} sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    mb: 1, 
                                    p: 2, 
                                    borderRadius: 2, 
                                    bgcolor: 'rgba(255,255,255,0.08)',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' } 
                                }}>
                                    {/* Course Column */}
                                    <Box sx={{ width: '20%', display: 'flex', alignItems: 'center' }}>
                                        <Chip
                                            label={task.subject || 'No Subject'}
                                            size="small"
                                            sx={{
                                                bgcolor: subjectColors[task.subject] || subjectColors.Default,
                                                color: '#fff',
                                                fontWeight: 700,
                                                borderRadius: 1,
                                            }}
                                        />
                                    </Box>
                                    
                                    {/* Task Name Column */}
                                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                                        <Checkbox checked={task.status === 'completed'} onChange={() => handleComplete(task)} sx={{ color: getCheckboxColor(task.priority), mr: 1 }} />
                                        <Box>
                                            <Typography sx={{ 
                                                fontWeight: 500, 
                                                textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                                                color: '#fff'
                                            }}>{task.title}</Typography>
                                            {task.description && <Typography sx={{ color: '#e3f2fd', fontSize: 13, opacity: 0.8 }}>{task.description}</Typography>}
                                        </Box>
                                    </Box>
                                    
                                    {/* Category Column */}
                                    <Box sx={{ width: '12%', display: 'flex', alignItems: 'center' }}>
                                        <Typography sx={{ 
                                            color: '#e3f2fd', 
                                            fontWeight: 500,
                                            textTransform: 'capitalize',
                                            fontSize: 14
                                        }}>
                                            {task.taskType || 'N/A'}
                                        </Typography>
                                    </Box>
                                    
                                    {/* Due Date Column */}
                                    <Box sx={{ width: '12%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                        <Typography sx={{ color: '#e3f2fd', fontWeight: 500, fontSize: 13, textAlign: 'center' }}>{getTaskDate(task.dueDate)}</Typography>
                                        {task.dueDate && task.dueDate.includes('T') && (
                                            <Typography sx={{ color: '#e3f2fd', fontWeight: 400, fontSize: 11, opacity: 0.8, textAlign: 'center' }}>
                                                {getTaskTime(task.dueDate)}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            ))
                        )}
                    </Box>
                </Paper>
            </Box>

            {/* Upcoming Tasks */}
            <Box sx={{ position: 'relative', zIndex: 1, p: 3, background: 'transparent' }}>
                <Paper
                    sx={{
                        width: '1230px',
                        minHeight: 200,
                        mx: 0,
                        my: 3,
                        p: 3,
                        borderRadius: 5,
                        boxShadow: '0 8px 32px 0 rgba(31,38,135,0.18)',
                        position: 'relative',
                        overflow: 'hidden',
                        background: 'none',
                        color: '#fff',
                        border: '1.5px solid rgba(255,255,255,0.12)',
                        backdropFilter: 'blur(12px)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                    }}
                >
                    {/* Glassy Overlay */}
                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            bgcolor: 'rgba(17,25,40,0.55)',
                            zIndex: 2,
                            borderRadius: 5,
                            pointerEvents: 'none',
                        }}
                    />
                    <Box sx={{ position: 'relative', zIndex: 3 }}>
                        <Typography
                            sx={{
                                fontWeight: 600,
                                opacity: 0.9,
                                fontSize: 18,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                color: '#fff',
                                mb: 2,
                                textAlign: 'left',
                                justifyContent: 'flex-start',
                                pl: 0,
                            }}
                        >
                            Upcoming tasks
                        </Typography>
                        
                        {/* Column Headers */}
                        {upcomingTasks.length > 0 && (
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                mb: 2, 
                                p: 2, 
                                borderRadius: 2, 
                                bgcolor: 'rgba(255,255,255,0.12)',
                                borderBottom: '1px solid rgba(255,255,255,0.2)'
                            }}>
                                <Typography sx={{ 
                                    fontWeight: 600, 
                                    color: '#e3f2fd', 
                                    width: '20%',
                                    fontSize: 14
                                }}>
                                    Course
                                </Typography>
                                <Typography sx={{ 
                                    fontWeight: 600, 
                                    color: '#e3f2fd', 
                                    flexGrow: 1,
                                    fontSize: 14,
                                    pl: 6
                                }}>
                                    Task Name
                                </Typography>
                                <Typography sx={{ 
                                    fontWeight: 600, 
                                    color: '#e3f2fd', 
                                    width: '12%',
                                    fontSize: 14
                                }}>
                                    Category
                                </Typography>
                                <Typography sx={{ 
                                    fontWeight: 600, 
                                    color: '#e3f2fd', 
                                    width: '12%',
                                    textAlign: 'center',
                                    fontSize: 14
                                }}>
                                    Due Date
                                </Typography>
                            </Box>
                        )}
                        
                        {upcomingTasks.length === 0 ? (
                            <Typography sx={{ color: '#e3f2fd', opacity: 0.8, pl: 0 }}>No upcoming tasks.</Typography>
                        ) : (
                            upcomingTasks.map(task => (
                                <Box key={task._id} sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    mb: 1, 
                                    p: 2, 
                                    borderRadius: 2, 
                                    bgcolor: 'rgba(255,255,255,0.08)',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' } 
                                }}>
                                    {/* Course Column */}
                                    <Box sx={{ width: '20%', display: 'flex', alignItems: 'center' }}>
                                        <Chip
                                            label={task.subject || 'No Subject'}
                                            size="small"
                                            sx={{
                                                bgcolor: subjectColors[task.subject] || subjectColors.Default,
                                                color: '#fff',
                                                fontWeight: 700,
                                                borderRadius: 1,
                                            }}
                                        />
                                    </Box>
                                    
                                    {/* Task Name Column */}
                                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                                        <Checkbox checked={task.status === 'completed'} onChange={() => handleComplete(task)} sx={{ color: getCheckboxColor(task.priority), mr: 1 }} />
                                        <Box>
                                            <Typography sx={{ 
                                                fontWeight: 500, 
                                                textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                                                color: '#fff'
                                            }}>{task.title}</Typography>
                                            {task.description && <Typography sx={{ color: '#e3f2fd', fontSize: 13, opacity: 0.8 }}>{task.description}</Typography>}
                                        </Box>
                                    </Box>
                                    
                                    {/* Category Column */}
                                    <Box sx={{ width: '12%', display: 'flex', alignItems: 'center' }}>
                                        <Typography sx={{ 
                                            color: '#e3f2fd', 
                                            fontWeight: 500,
                                            textTransform: 'capitalize',
                                            fontSize: 14
                                        }}>
                                            {task.taskType || 'N/A'}
                                        </Typography>
                                    </Box>
                                    
                                    {/* Due Date Column */}
                                    <Box sx={{ width: '12%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                        <Typography sx={{ color: '#e3f2fd', fontWeight: 500, fontSize: 13, textAlign: 'center' }}>{getTaskDate(task.dueDate)}</Typography>
                                        {task.dueDate && task.dueDate.includes('T') && (
                                            <Typography sx={{ color: '#e3f2fd', fontWeight: 400, fontSize: 11, opacity: 0.8, textAlign: 'center' }}>
                                                {getTaskTime(task.dueDate)}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            ))
                        )}
                    </Box>
                </Paper>
            </Box>

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

            

            {/* Floating Leaderboard Icon */}
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    zIndex: 1000,
                }}
            >
                <IconButton
                    onClick={handleLeaderboardClick}
                    sx={{
                        width: 56,
                        height: 56,
                        backgroundColor: 'rgba(33, 150, 243, 0.9)',
                        backdropFilter: 'blur(10px)',
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 8px 32px rgba(33, 150, 243, 0.3)',
                        color: '#fff',
                        '&:hover': {
                            backgroundColor: 'rgba(33, 150, 243, 1)',
                            transform: 'scale(1.05)',
                            boxShadow: '0 12px 40px rgba(33, 150, 243, 0.4)',
                        },
                        transition: 'all 0.3s ease',
                    }}
                >
                    <LeaderboardIcon sx={{ fontSize: 28 }} />
                </IconButton>
            </Box>

            {/* Floating Leaderboard Card */}
            <Menu
                anchorEl={leaderboardAnchorEl}
                open={Boolean(leaderboardAnchorEl)}
                onClose={handleLeaderboardClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                PaperProps={{
                    sx: {
                        width: 280,
                        height: 400,
                        bgcolor: 'transparent !important',
                        boxShadow: 'none !important',
                        overflow: 'visible',
                        mt: -47,
                        pt: 0,
                        border: 'none',
                        outline: 'none',
                        '& .MuiMenu-paper': {
                            bgcolor: 'transparent !important',
                            boxShadow: 'none !important',
                            border: 'none',
                            outline: 'none',
                        },
                        '& .MuiMenu-list': {
                            bgcolor: 'transparent !important',
                            p: 0,
                            border: 'none',
                            outline: 'none',
                        },
                        '& .MuiPaper-root': {
                            bgcolor: 'transparent !important',
                            boxShadow: 'none !important',
                            border: 'none',
                            outline: 'none',
                        }
                    }
                }}
            >
                <Box
                    sx={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        borderRadius: 3,
                        overflow: 'hidden',
                        background: 'rgba(17,25,40,0.85)',
                        backdropFilter: 'blur(15px)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                        display: 'flex',
                        alignItems: 'stretch',
                    }}
                >
                    <Leaderboard users={leaderboardUsers} currentUserName={user?.name || ''} />
                </Box>
            </Menu>
        </Box>
    );
};

export default Dashboard;
