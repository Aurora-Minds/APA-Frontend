import React, { useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    TextField,
    Button,
    Alert,
    Divider
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Settings: React.FC = () => {
    const { user, refreshUser } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGoogleCalendarIntegration = async () => {
        try {
            const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.auroraminds.xyz/api';
            const res = await axios.get<{ url: string }>(`${API_BASE_URL}/auth/google`);
            window.location.href = res.data.url;
        } catch (err) {
            console.error('Error initiating Google Calendar integration:', err);
            setError('Could not initiate Google Calendar integration.');
        }
    };

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

    return (
        <Container maxWidth="md">
            <Paper sx={{ p: 4, mt: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Settings
                </Typography>
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

                    <Button 
                        type="submit"
                        variant="contained" 
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </form>

                <Divider sx={{ my: 4 }} />

                <Box>
                    <Typography variant="h5" gutterBottom>
                        Integrations
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={handleGoogleCalendarIntegration}
                    >
                        Integrate with Google Calendar
                    </Button>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        This feature will add the tasks you create to your Google Calendar, including details like due date and time.
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default Settings;