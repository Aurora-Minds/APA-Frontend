import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Alert
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface ManageSubjectsDialogProps {
    open: boolean;
    onClose: () => void;
    subjects: string[];
    onAddSubject: (subject: string) => Promise<void>;
    onDeleteSubject: (subject: string) => Promise<void>;
    isSubjectInUse: (subject: string) => boolean;
}

const ManageSubjectsDialog: React.FC<ManageSubjectsDialogProps> = ({ open, onClose, subjects, onAddSubject, onDeleteSubject, isSubjectInUse }) => {
    const [newSubject, setNewSubject] = useState('');
    const [error, setError] = useState('');

    const handleAddSubject = async () => {
        if (!newSubject.trim()) {
            setError('Subject name cannot be empty.');
            return;
        }
        try {
            await onAddSubject(newSubject);
            setNewSubject('');
            setError('');
        } catch (err: any) { 
            setError(err.message || 'Failed to add subject.');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Manage Subjects</DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TextField
                        label="New Subject"
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        fullWidth
                        variant="outlined"
                        size="small"
                    />
                    <IconButton color="primary" onClick={handleAddSubject} sx={{ ml: 1 }}>
                        <AddIcon />
                    </IconButton>
                </Box>
                <List>
                    {subjects.map(subject => (
                        <ListItem key={subject} secondaryAction={
                            <IconButton edge="end" aria-label="delete" onClick={() => onDeleteSubject(subject)} disabled={isSubjectInUse(subject)}>
                                <DeleteIcon />
                            </IconButton>
                        }>
                            <ListItemText primary={subject} />
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ManageSubjectsDialog;
