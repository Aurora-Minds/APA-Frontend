import React, { useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    TextField,
    Button,
    Alert
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Settings: React.FC = () => {
    const { user } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [password, setPassword] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handleGoogleCalendarIntegration = () => {
        // Redirect to backend endpoint to initiate Google OAuth flow
        window.location.href = `${process.env.REACT_APP_API_BASE_URL || 'https://api.auroraminds.xyz/api'}/auth/google`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess('');
        setError('');
        try {
            const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.auroraminds.xyz/api';
            await axios.put(`${API_BASE_URL}/users/me`, { name, password });
            setSuccess('Account updated successfully!');
            setPassword('');
        } catch (err: any) {
            setError(err.response?.data?.msg || 'Error updating account');
        }
    };

    return (
        <Container maxWidth="md">
            <Paper sx={{ p: 4, mt: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Settings
                </Typography>
                {success && <Alert severity="success">{success}</Alert>}
                {error && <Alert severity="error">{error}</Alert>}
                <form onSubmit={handleSubmit}>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            label="Name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            fullWidth
                        />
                    </Box>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            label="New Password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            fullWidth
                        />
                    </Box>
                    <Box sx={{ mt: 2 }}>
                        <Button type="submit" variant="contained">
                            Save Changes
                        </Button>
                    </Box>
                </form>
                <Box sx={{ mt: 4 }}>
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
