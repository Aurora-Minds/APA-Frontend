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
    Alert,
    Divider
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface AccountSettingsProps {
    open: boolean;
    onClose: () => void;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ open, onClose }) => {
    const { user, refreshUser } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess('');
        setError('');
        setLoading(true);

        try {
            const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.auroraminds.xyz/api';
            
            // Validate passwords match if changing password
            if (newPassword && newPassword !== confirmPassword) {
                setError('New passwords do not match');
                setLoading(false);
                return;
            }

            const updateData: any = { name, email };
            if (newPassword) {
                updateData.currentPassword = currentPassword;
                updateData.newPassword = newPassword;
            }

            await axios.put(`${API_BASE_URL}/users/me`, updateData);
            setSuccess('Account updated successfully!');
            
            // Clear password fields
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            
            // Refresh user data
            await refreshUser();
        } catch (err: any) {
            setError(err.response?.data?.msg || 'Error updating account');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSuccess('');
        setError('');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Account Settings</DialogTitle>
            <DialogContent>
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                
                <form onSubmit={handleSubmit}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Profile Information</Typography>
                        <TextField
                            label="Name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            fullWidth
                            margin="normal"
                            required
                        />
                        <TextField
                            label="Email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            fullWidth
                            margin="normal"
                            required
                        />
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Change Password</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Leave blank if you don't want to change your password
                        </Typography>
                        <TextField
                            label="Current Password"
                            type="password"
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="New Password"
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Confirm New Password"
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            fullWidth
                            margin="normal"
                        />
                    </Box>
                </form>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={handleClose}>Cancel</Button>
                <Button 
                    onClick={handleSubmit} 
                    variant="contained" 
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Save Changes'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AccountSettings; 