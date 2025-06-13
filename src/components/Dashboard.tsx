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

const Dashboard: React.FC = () => {
    // Define the API_BASE_URL using the environment variable
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';

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
    const [timerDuration, setTimerDuration] = useState(25); // in minutes, editable
    const [timer, setTimer] = useState(25 * 60); // 25 minutes in seconds
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

    const navigate = useNavigate();
    const theme = useTheme();
    const mainBg = theme.palette.mode === 'dark' ? '#18191c' : '#f7f8fa';

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
        if (!quickAddTitle.trim()) return;
        let dueDate = quickAddDate;
        if (!dueDate) {
            const today = new Date();
            dueDate = today.toISOString().split('T')[0];
        }
        if (quickAddTime) {
            dueDate += 'T' + quickAddTime;
        }
        try {
            await axios.post(`${API_BASE_URL}/tasks`, {
                title: quickAddTitle,
                subject: quickAddSubject,
                description: quickAddDescription,
                dueDate,
                priority: quickAddPriority,
                status: 'pending',
            });
            setQuickAddTitle('');
            setQuickAddSubject('');
            setQuickAddDescription('');
            setQuickAddDate('');
            setQuickAddTime('');
            setQuickAddPriority('medium');
            fetchTasks();
        } catch (err) {
            console.error('Error adding task:', err);
        }
    };

    // Task completion
    const handleComplete = async (task: Task) => {
        try {
            await axios.put(`${API_BASE_URL}/tasks/${task._id}`, { ...task, status: task.status === 'completed' ? 'pending' : 'completed' });
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

    return (
        <Grid container sx={{ minHeight: '100vh', bgcolor: mainBg }}>
            <Grid item xs sx={{ p: 4, pl: 8 }}>
                <Box sx={{ bgcolor: mainBg, minHeight: '100vh', width: '100%', p: 0 }}>
                    {/* Time and Greeting */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                        <Box>
                            <Typography variant="h3" fontWeight={600}>{timeString}</Typography>
                            <Typography variant="subtitle1">{dateString}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton onClick={handleAvatarClick} size="large">
                                <AccountCircleIcon sx={{ width: 48, height: 48 }} />
                            </IconButton>
                            <Menu anchorEl={avatarMenuAnchor} open={Boolean(avatarMenuAnchor)} onClose={handleAvatarMenuClose}>
                                <MenuItem disabled sx={{ fontWeight: 600, opacity: 1, pointerEvents: 'none' }}>{user?.name || 'User'}</MenuItem>
                                <Divider />
                                <MenuItem onClick={handleAccountSettings}>Account Settings</MenuItem>
                                <MenuItem onClick={handleLogout}>Logout</MenuItem>
                            </Menu>
                        </Box>
                    </Box>
                    <Paper sx={{ p: 3, mb: 3, borderRadius: 3, background: 'linear-gradient(90deg, #b2d8fd 0%, #e0eafc 100%)', color: '#111' }}>
                        <Typography variant="h6" fontWeight={600}>{greeting.replace('.', '')}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</Typography>
                        <Typography>{taskText}</Typography>
                    </Paper>
                    {/* Quick Add Task */}
                    <Paper sx={{ p: 2, mb: 3, borderRadius: 3, boxShadow: 2, background: 'linear-gradient(90deg, #b2d8fd 0%, #e0eafc 100%)', color: '#111' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <input
                                    placeholder="Quick add task"
                                    style={{ border: 'none', outline: 'none', fontSize: 16, width: '100%' }}
                                    value={quickAddTitle}
                                    onChange={e => setQuickAddTitle(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') handleQuickAdd(); }}
                                />
                                <TextField
                                    placeholder="Description"
                                    size="small"
                                    value={quickAddDescription}
                                    onChange={e => setQuickAddDescription(e.target.value)}
                                    sx={{ bgcolor: 'white', borderRadius: 1 }}
                                />
                            </Box>
                            <IconButton color="primary" onClick={handleQuickAdd} sx={{ alignSelf: 'flex-start', mt: 0.5 }}>
                                <AddIcon />
                            </IconButton>
                        </Box>
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
                    </Paper>
                    {/* Today's Tasks */}
                    <Typography variant="h6" sx={{ mb: 1 }}>Today's tasks</Typography>
                    <Paper sx={{ p: 2, mb: 3, borderRadius: 3, boxShadow: 1, background: 'linear-gradient(90deg, #b2d8fd 0%, #e0eafc 100%)', color: '#111' }}>
                        {todaysTasks.length === 0 ? (
                            <Typography>No tasks for today.</Typography>
                        ) : (
                            todaysTasks.map(task => (
                                <Box key={task._id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, p: 1, borderRadius: 2, '&:hover': { bgcolor: '#f0f4fa' } }}>
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
                    <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 1, background: 'linear-gradient(90deg, #b2d8fd 0%, #e0eafc 100%)', color: '#111' }}>
                        {upcomingTasks.length === 0 ? (
                            <Typography>No upcoming tasks.</Typography>
                        ) : (
                            upcomingTasks.map(task => (
                                <Box key={task._id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, p: 1, borderRadius: 2, '&:hover': { bgcolor: '#f0f4fa' } }}>
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
                </Box>
            </Grid>
            <Grid item xs={12} sm={3} sx={{ width: 320, p: 4 }}>
                <Paper sx={{ p: 2, borderRadius: 3, background: 'linear-gradient(90deg, #b2d8fd 0%, #e0eafc 100%)', color: '#111', mt: 3 }}>
                    <Typography variant="h6">Focus timer</Typography>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            label="Duration (minutes)"
                            type="number"
                            size="small"
                            value={timerDuration}
                            onChange={handleDurationChange}
                            inputProps={{ min: 1, max: 120 }}
                            sx={{ mb: 2, bgcolor: 'white', color: '#1976d2', borderColor: '#1976d2', borderRadius: 1, '& .MuiInputBase-input': { color: '#1976d2' }, '& .MuiInputLabel-root': { color: '#1976d2' } }}
                            fullWidth
                        />
                        <Select
                            value={focusTaskId || ''}
                            onChange={handleFocusTaskChange}
                            displayEmpty
                            fullWidth
                            size="small"
                            sx={{ mb: 2, bgcolor: 'white', color: '#1976d2', borderColor: '#1976d2', borderRadius: 1, '& .MuiSelect-select': { color: '#1976d2' } }}
                        >
                            <MenuItem value="" disabled>Select a task</MenuItem>
                            {[...todaysTasks, ...upcomingTasks].map(task => (
                                <MenuItem key={task._id} value={task._id}>{task.title}</MenuItem>
                            ))}
                        </Select>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ position: 'relative', mb: 1, width: 120, height: 120 }}>
                                <CircularProgress
                                    variant="determinate"
                                    value={100 * (timer / (timerDuration * 60))}
                                    size={120}
                                    thickness={4}
                                    sx={{ color: '#90caf9', position: 'absolute', left: 0, top: 0 }}
                                />
                                <Typography
                                    align="center"
                                    variant="h2"
                                    sx={{
                                        fontWeight: 700,
                                        color: '#222',
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        margin: 0,
                                        padding: 0,
                                        minWidth: 0,
                                        minHeight: 0,
                                        lineHeight: 1,
                                    }}
                                >
                                    {minutes}:{seconds}
                                </Typography>
                            </Box>
                            {focusTask && <Typography align="center" sx={{ mb: 1, fontSize: 14, color: '#1976d2' }}>Focusing: {focusTask.title}</Typography>}
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
                            <Button
                                variant="contained"
                                onClick={handleStart}
                                disabled={isRunning || !focusTaskId}
                                sx={{
                                    bgcolor: isRunning || !focusTaskId
                                        ? 'rgba(255,255,255,0.4)'
                                        : 'white',
                                    color: isRunning || !focusTaskId ? '#90A4AE' : '#1976d2',
                                    borderColor: '#1976d2',
                                    boxShadow: 'none',
                                    '&.Mui-disabled': {
                                        bgcolor: 'rgba(255,255,255,0.4)',
                                        color: '#90A4AE',
                                    },
                                    '&:hover': {
                                        bgcolor: isRunning || !focusTaskId ? 'rgba(255,255,255,0.4)' : '#e3f2fd',
                                    },
                                }}
                            >
                                Start
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={handlePause}
                                disabled={!isRunning}
                                sx={{
                                    bgcolor: !isRunning ? 'rgba(255,255,255,0.4)' : 'white',
                                    color: !isRunning ? '#90A4AE' : '#1976d2',
                                    borderColor: '#1976d2',
                                    boxShadow: 'none',
                                    '&.Mui-disabled': {
                                        bgcolor: 'rgba(255,255,255,0.4)',
                                        color: '#90A4AE',
                                    },
                                    '&:hover': {
                                        bgcolor: !isRunning ? 'rgba(255,255,255,0.4)' : '#e3f2fd',
                                    },
                                }}
                            >
                                Pause
                            </Button>
                            <Button variant="text" onClick={handleReset} sx={{ color: '#1976d2' }}>Reset</Button>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Tooltip title="You earn 1 XP for each completed focus session (when the timer reaches zero)">
                            <Typography align="center" variant="subtitle2" sx={{ fontWeight: 600, letterSpacing: 1 }}>
                                XP: {xp}
                            </Typography>
                        </Tooltip>
                    </Box>
                </Paper>
                <AccountSettings open={accountDialogOpen} onClose={handleAccountDialogClose} />
            </Grid>
        </Grid>
    );
};

export default Dashboard;