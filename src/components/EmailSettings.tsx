import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  TextField,
  Alert,
  Divider,
  Grid
} from '@mui/material';
import { Email, Notifications, Schedule } from '@mui/icons-material';
import axios from 'axios';

interface EmailPreferences {
  taskReminders: boolean;
  dailyDigest: boolean;
  weeklyReport: boolean;
  reminderTime: string;
}

const EmailSettings: React.FC = () => {
  const [preferences, setPreferences] = useState<EmailPreferences>({
    taskReminders: true,
    dailyDigest: false,
    weeklyReport: true,
    reminderTime: '09:00'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.auroraminds.xyz/api';

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/email-reminders/preferences`);
      setPreferences(response.data.preferences);
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Failed to load email preferences' });
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = (key: keyof EmailPreferences, value: boolean | string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const savePreferences = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      await axios.put(`${API_BASE_URL}/email-reminders/preferences`, preferences);
      setMessage({ type: 'success', text: 'Email preferences saved successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Failed to save email preferences' });
    } finally {
      setSaving(false);
    }
  };

  const sendTestEmail = async () => {
    setTesting(true);
    setMessage(null);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/email-reminders/test`);
      setMessage({ type: 'success', text: response.data.msg });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.msg || 'Failed to send test email' });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading email preferences...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Email Notifications
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Email sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Email Notification Settings</Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.taskReminders}
                    onChange={(e) => handlePreferenceChange('taskReminders', e.target.checked)}
                  />
                }
                label="Task Reminders"
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                Receive email reminders for tasks due within 24 hours
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.dailyDigest}
                    onChange={(e) => handlePreferenceChange('dailyDigest', e.target.checked)}
                  />
                }
                label="Daily Digest"
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                Get a daily summary of your focus sessions and upcoming tasks
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.weeklyReport}
                    onChange={(e) => handlePreferenceChange('weeklyReport', e.target.checked)}
                  />
                }
                label="Weekly Report"
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                Receive a comprehensive weekly productivity report
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center">
                <Schedule sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle1" sx={{ mr: 2 }}>
                  Reminder Time:
                </Typography>
                <TextField
                  type="time"
                  value={preferences.reminderTime}
                  onChange={(e) => handlePreferenceChange('reminderTime', e.target.value)}
                  size="small"
                  sx={{ width: 120 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mt: 1 }}>
                Time for daily digest emails (24-hour format)
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              onClick={savePreferences}
              disabled={saving}
              startIcon={<Notifications />}
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>
            
            <Button
              variant="outlined"
              onClick={sendTestEmail}
              disabled={testing}
              startIcon={<Email />}
            >
              {testing ? 'Sending...' : 'Send Test Email'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Email Notification Types
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              📧 Task Reminders
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You'll receive an email when a task is due within 24 hours. This helps you stay on top of deadlines and never miss important assignments.
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              📊 Daily Digest
            </Typography>
            <Typography variant="body2" color="text.secondary">
              A daily summary sent at your chosen time, including your focus sessions, completed tasks, and upcoming deadlines for the next 3 days.
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              📈 Weekly Report
            </Typography>
            <Typography variant="body2" color="text.secondary">
              A comprehensive weekly report sent every Sunday, showing your productivity trends, focus statistics, and personalized recommendations.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EmailSettings; 