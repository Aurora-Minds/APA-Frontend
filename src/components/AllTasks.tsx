import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box, Checkbox, IconButton, CircularProgress, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, SelectChangeEvent } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '@mui/material/styles';
import DateTimePickerMenu from './DateTimePickerMenu';
import PriorityMenu, { Priority, PriorityMenuButton } from './PriorityMenu';
import Chip from '@mui/material/Chip';
import { notificationService } from '../services/notificationService';

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

const getCheckboxColor = (priority: string) => {
    switch (priority) {
        case 'high': return '#e57373';
        case 'medium': return '#ffd54f';
        case 'low': return '#64b5f6';
        default: return '#bdbdbd';
    }
};

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

const subjectColors: Record<string, string> = {
    English: '#1976d2',
    Math: '#43a047',
    Science: '#fbc02d',
    History: '#8d6e63',
    Default: '#7e57c2',
};

const AllTasks: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const { user, refreshUser } = useAuth();
    const { addNotification } = useNotifications();
    const theme = useTheme();
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editTask, setEditTask] = useState<Task | null>(null);
    const [editForm, setEditForm] = useState({ title: '', description: '', dueDate: '', priority: 'medium', status: 'pending', subject: '', taskType: 'lab' as 'lab' | 'assignment' | 'project' });
    const [editPriorityAnchorEl, setEditPriorityAnchorEl] = useState<null | HTMLElement>(null);
    const [subjects, setSubjects] = useState<string[]>([]);
    const [newSubject, setNewSubject] = useState('');
    const [subjectLoading, setSubjectLoading] = useState(false);
    const [subjectError, setSubjectError] = useState('');

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.auroraminds.xyz/api';

    useEffect(() => {
        fetchTasks();
        fetchSubjects();
    }, []);

    // Monitor tasks for due date notifications
    useEffect(() => {
        if (user) {
            notificationService.setCurrentUser(user._id);
        }
        
        const checkTaskDueDates = () => {
            tasks.forEach(task => {
                notificationService.checkTaskDueDate(task, addNotification);
            });
        };

        // Check immediately when tasks change
        checkTaskDueDates();

        // Set up interval to check every minute
        const interval = setInterval(checkTaskDueDates, 60000);

        return () => clearInterval(interval);
    }, [tasks, addNotification, user]);

    const fetchTasks = async () => {
        try {
            const res = await axios.get<Task[]>(`${API_BASE_URL}/tasks`);
            setTasks(res.data);
        } catch (err) {
            console.error('Error fetching tasks:', err);
        }
    };

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

    const handleComplete = async (task: Task) => {
        try {
            const isCompleting = task.status !== 'completed';
            await axios.put(`${API_BASE_URL}/tasks/${task._id}`, {
                status: isCompleting ? 'completed' : 'pending',
            });
            fetchTasks();
            refreshUser();
            if (isCompleting) {
                // Add notification for task completion
                notificationService.addTaskCompletedNotification(task, addNotification);
            }
        } catch (err: any) {
            console.error('Error updating task:', err);
            console.error('Error response:', err.response?.data);
            console.error('Task being updated:', task);
        }
    };

    const openEditDialog = (task: Task) => {
        setEditTask(task);
        setEditForm({
            title: task.title,
            description: task.description,
            dueDate: task.dueDate,
            priority: task.priority,
            status: task.status,
            subject: task.subject,
            taskType: task.taskType || 'lab',
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
            console.error('Error response:', err.response?.data);
            console.error('Edit form data:', editForm);
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

    const notCompleted = tasks.filter(task => task.status !== 'completed');
    const completed = tasks.filter(task => task.status === 'completed');

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>All Tasks</Typography>

            <Typography variant="h6" sx={{ mb: 1 }}>Not Completed</Typography>
            <Paper sx={{ p: 2, mb: 3, borderRadius: 3, boxShadow: 1, background: 'rgba(17,25,40,0.55)', color: '#fff' }}>
                {notCompleted.length > 0 && (
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 2, 
                        p: 2, 
                        borderRadius: 2, 
                        bgcolor: 'rgba(255,255,255,0.12)',
                        borderBottom: '1px solid rgba(255,255,255,0.2)'
                    }}>
                        <Typography sx={{ fontWeight: 600, color: '#e3f2fd', width: '20%', fontSize: 14 }}>Course</Typography>
                        <Typography sx={{ fontWeight: 600, color: '#e3f2fd', flexGrow: 1, fontSize: 14, pl: 6 }}>Task Name</Typography>
                        <Typography sx={{ fontWeight: 600, color: '#e3f2fd', width: '12%', fontSize: 14 }}>Category</Typography>
                        <Typography sx={{ fontWeight: 600, color: '#e3f2fd', width: '12%', textAlign: 'center', fontSize: 14 }}>Due Date</Typography>
                        <Box sx={{ width: 96, minWidth: 96 }} />
                    </Box>
                )}
                {notCompleted.length === 0 ? (
                    <Typography>No pending or in-progress tasks.</Typography>
                ) : (
                    notCompleted.map(task => (
                        <Box key={task._id} sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            mb: 1, 
                            p: 2, 
                            borderRadius: 2, 
                            bgcolor: 'rgba(255,255,255,0.08)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' } 
                        }}>
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
                            <Box sx={{ width: '12%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                <Typography sx={{ color: '#e3f2fd', fontWeight: 500, fontSize: 13, textAlign: 'center' }}>{getTaskDate(task.dueDate)}</Typography>
                                {task.dueDate && task.dueDate.includes('T') && (
                                    <Typography sx={{ color: '#e3f2fd', fontWeight: 400, fontSize: 11, opacity: 0.8, textAlign: 'center' }}>
                                        {getTaskTime(task.dueDate)}
                                    </Typography>
                                )}
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: 96, minWidth: 96 }}>
                                <IconButton onClick={() => openEditDialog(task)} sx={{ color: '#fff' }}><EditIcon /></IconButton>
                                <IconButton onClick={() => handleDelete(task._id)} disabled={deletingId === task._id} sx={{ color: '#fff' }}>
                                    {deletingId === task._id ? <CircularProgress size={20} /> : <DeleteIcon />}
                                </IconButton>
                            </Box>
                        </Box>
                    ))
                )}
            </Paper>

            <Typography variant="h6" sx={{ mb: 1 }}>Completed</Typography>
            <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 1, background: 'rgba(17,25,40,0.55)', color: '#fff' }}>
                {completed.length > 0 && (
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 2, 
                        p: 2, 
                        borderRadius: 2, 
                        bgcolor: 'rgba(255,255,255,0.12)',
                        borderBottom: '1px solid rgba(255,255,255,0.2)'
                    }}>
                        <Typography sx={{ fontWeight: 600, color: '#e3f2fd', width: '20%', fontSize: 14 }}>Course</Typography>
                        <Typography sx={{ fontWeight: 600, color: '#e3f2fd', flexGrow: 1, fontSize: 14, pl: 6 }}>Task Name</Typography>
                        <Typography sx={{ fontWeight: 600, color: '#e3f2fd', width: '12%', fontSize: 14 }}>Category</Typography>
                        <Typography sx={{ fontWeight: 600, color: '#e3f2fd', width: '12%', textAlign: 'center', fontSize: 14 }}>Due Date</Typography>
                        <Box sx={{ width: 96, minWidth: 96 }} />
                    </Box>
                )}
                {completed.length === 0 ? (
                    <Typography>No completed tasks.</Typography>
                ) : (
                    completed.map(task => (
                        <Box key={task._id} sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            mb: 1, 
                            p: 2, 
                            borderRadius: 2, 
                            bgcolor: 'rgba(255,255,255,0.08)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' } 
                        }}>
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
                            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                                <Checkbox checked={task.status === 'completed'} onChange={() => handleComplete(task)} sx={{ color: getCheckboxColor(task.priority), mr: 1 }} />
                                <Box>
                                    <Typography sx={{ 
                                        fontWeight: 500, 
                                        textDecoration: 'line-through',
                                        color: '#fff'
                                    }}>{task.title}</Typography>
                                    {task.description && <Typography sx={{ color: '#e3f2fd', fontSize: 13, opacity: 0.8 }}>{task.description}</Typography>}
                                </Box>
                            </Box>
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
                            <Box sx={{ width: '12%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                <Typography sx={{ color: '#e3f2fd', fontWeight: 500, fontSize: 13, textAlign: 'center' }}>{getTaskDate(task.dueDate)}</Typography>
                                {task.dueDate && task.dueDate.includes('T') && (
                                    <Typography sx={{ color: '#e3f2fd', fontWeight: 400, fontSize: 11, opacity: 0.8, textAlign: 'center' }}>
                                        {getTaskTime(task.dueDate)}
                                    </Typography>
                                )}
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: 96, minWidth: 96 }}>
                                <IconButton onClick={() => openEditDialog(task)} sx={{ color: '#fff' }}><EditIcon /></IconButton>
                                <IconButton onClick={() => handleDelete(task._id)} disabled={deletingId === task._id} sx={{ color: '#fff' }}>
                                    {deletingId === task._id ? <CircularProgress size={20} /> : <DeleteIcon />}
                                </IconButton>
                            </Box>
                        </Box>
                    ))
                )}
            </Paper>

            <Dialog open={editDialogOpen} onClose={closeEditDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Task</DialogTitle>
                <DialogContent sx={{ pb: 0 }}>
                    <TextField margin="dense" label="Title" name="title" value={editForm.title} onChange={handleEditChange} fullWidth />
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Task Type</Typography>
                        <Select
                            value={editForm.taskType}
                            onChange={(e: SelectChangeEvent<'lab' | 'assignment' | 'project'>) => setEditForm(f => ({ ...f, taskType: e.target.value as 'lab' | 'assignment' | 'project' }))}
                            fullWidth
                        >
                            <MenuItem value="lab">Lab</MenuItem>
                            <MenuItem value="assignment">Assignment</MenuItem>
                            <MenuItem value="project">Project</MenuItem>
                        </Select>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Subjects</Typography>
                        {subjects.map(subj => (
                            <Box key={subj} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <MenuItem onClick={() => setEditForm(f => ({ ...f, subject: subj }))} selected={editForm.subject === subj} sx={{ flex: 1 }}>{subj}</MenuItem>
                            </Box>
                        ))}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeEditDialog}>Cancel</Button>
                    <Button onClick={handleEditSave} variant="contained" color="primary">Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AllTasks;
