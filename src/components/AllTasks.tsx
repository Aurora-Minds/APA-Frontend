import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box, Checkbox, IconButton, CircularProgress, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '@mui/material/styles';
import DateTimePickerMenu from './DateTimePickerMenu';
import PriorityMenu, { Priority, PriorityMenuButton } from './PriorityMenu';
import Chip from '@mui/material/Chip';

interface Task {
    _id: string;
    title: string;
    description: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'in-progress' | 'completed';
    subject: string;
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
    const due = new Date(dueDate);
    if (isNaN(due.getTime())) return '';
    const todayLocal = new Date();
    todayLocal.setUTCHours(0, 0, 0, 0);
    const tomorrowUtc = new Date(todayLocal);
    tomorrowUtc.setUTCDate(todayLocal.getUTCDate() + 1);
    const dueDayUtc = new Date(Date.UTC(due.getUTCFullYear(), due.getUTCMonth(), due.getUTCDate()));
    if (dueDayUtc.getTime() === tomorrowUtc.getTime()) return 'Tomorrow';
    return due.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
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
    const theme = useTheme();
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editTask, setEditTask] = useState<Task | null>(null);
    const [editForm, setEditForm] = useState({ title: '', description: '', dueDate: '', priority: 'medium', status: 'pending', subject: '' });
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
            await axios.put(`${API_BASE_URL}/tasks/${task._id}`, {
                ...task,
                status: task.status === 'completed' ? 'pending' : 'completed',
            });
            fetchTasks();
            refreshUser();
        } catch (err) {
            console.error('Error updating task:', err);
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
            <Paper sx={{ p: 2, mb: 3, borderRadius: 3, boxShadow: 1, background: 'linear-gradient(90deg, #b2d8fd 0%, #e0eafc 100%)', color: '#111' }}>
                {notCompleted.length === 0 ? (
                    <Typography>No pending or in-progress tasks.</Typography>
                ) : (
                    notCompleted.map(task => (
                        <Box key={task._id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, p: 1, borderRadius: 2, '&:hover': { bgcolor: '#f0f4fa' } }}>
                            <Chip label={task.subject || 'No Subject'} size="small"
                                sx={{ bgcolor: subjectColors[task.subject] || subjectColors.Default, color: '#fff', fontWeight: 700, mr: 1, minWidth: 70, borderRadius: 1 }} />
                            <Checkbox checked={task.status === 'completed'} onChange={() => handleComplete(task)} sx={{ color: getCheckboxColor(task.priority) }} />
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography sx={{ fontWeight: 500 }}>{task.title}</Typography>
                            </Box>
                            <Typography sx={{ minWidth: 80, textAlign: 'right', color: '#222', fontWeight: 500 }}>{getTaskTime(task.dueDate)}</Typography>
                            <IconButton onClick={() => openEditDialog(task)} sx={{ color: '#222' }}><EditIcon /></IconButton>
                            <IconButton onClick={() => handleDelete(task._id)} disabled={deletingId === task._id} sx={{ color: '#222' }}>
                                {deletingId === task._id ? <CircularProgress size={20} /> : <DeleteIcon />}
                            </IconButton>
                        </Box>
                    ))
                )}
            </Paper>

            <Typography variant="h6" sx={{ mb: 1 }}>Completed</Typography>
            <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 1, background: 'linear-gradient(90deg, #b2d8fd 0%, #e0eafc 100%)', color: '#111' }}>
                {completed.length === 0 ? (
                    <Typography>No completed tasks.</Typography>
                ) : (
                    completed.map(task => (
                        <Box key={task._id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, p: 1, borderRadius: 2, '&:hover': { bgcolor: '#f0f4fa' } }}>
                            <Chip label={task.subject || 'No Subject'} size="small"
                                sx={{ bgcolor: subjectColors[task.subject] || subjectColors.Default, color: '#fff', fontWeight: 700, mr: 1, minWidth: 70, borderRadius: 1 }} />
                            <Checkbox checked={task.status === 'completed'} onChange={() => handleComplete(task)} sx={{ color: getCheckboxColor(task.priority) }} />
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography sx={{ fontWeight: 500, textDecoration: 'line-through' }}>{task.title}</Typography>
                            </Box>
                            <Typography sx={{ minWidth: 80, textAlign: 'right', color: '#222', fontWeight: 500 }}>{getTaskDate(task.dueDate)}</Typography>
                            <IconButton onClick={() => openEditDialog(task)} sx={{ color: '#222' }}><EditIcon /></IconButton>
                            <IconButton onClick={() => handleDelete(task._id)} disabled={deletingId === task._id} sx={{ color: '#222' }}>
                                {deletingId === task._id ? <CircularProgress size={20} /> : <DeleteIcon />}
                            </IconButton>
                        </Box>
                    ))
                )}
            </Paper>

            <Dialog open={editDialogOpen} onClose={closeEditDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Task</DialogTitle>
                <DialogContent sx={{ pb: 0 }}>
                    <TextField margin="dense" label="Title" name="title" value={editForm.title} onChange={handleEditChange} fullWidth />
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
