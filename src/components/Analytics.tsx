import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert
} from '@mui/material';
import {
  TrendingUp,
  AccessTime,
  CheckCircle,
  EmojiEvents,
  Psychology,
  Schedule
} from '@mui/icons-material';
import axios from 'axios';

interface FocusSummary {
  period: string;
  summary: {
    totalSessions: number;
    totalTime: number;
    totalHours: number;
    avgSessionLength: number;
    productivityScore: number;
    consistencyScore: number;
  };
  dailyBreakdown: Array<{
    date: string;
    sessions: number;
    time: number;
  }>;
}

interface ProductivityInsights {
  insights: {
    totalFocusTime: number;
    completedTasks: number;
    totalTasks: number;
    completionRate: number;
    avgDailyFocus: number;
  };
  bestHours: Array<{
    hour: number;
    sessions: number;
    totalTime: number;
  }>;
  topSubjects: Array<{
    subject: string;
    sessions: number;
    totalTime: number;
  }>;
  recommendations: Array<{
    type: string;
    title: string;
    message: string;
    priority: string;
  }>;
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  totalFocusTime: number;
}

const Analytics: React.FC = () => {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week');
  const [focusSummary, setFocusSummary] = useState<FocusSummary | null>(null);
  const [insights, setInsights] = useState<ProductivityInsights | null>(null);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.auroraminds.xyz/api';

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [summaryRes, insightsRes, streakRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/analytics/focus-summary?period=${period}`),
        axios.get(`${API_BASE_URL}/analytics/productivity-insights`),
        axios.get(`${API_BASE_URL}/analytics/streak`)
      ]);

      setFocusSummary(summaryRes.data as FocusSummary);
      setInsights(insightsRes.data as ProductivityInsights);
      setStreak(streakRes.data as StreakData);
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Analytics Dashboard
      </Typography>

      {/* Period Selector */}
      <Box sx={{ mb: 3 }}>
        <ToggleButtonGroup
          value={period}
          exclusive
          onChange={(_, newPeriod) => newPeriod && setPeriod(newPeriod)}
          sx={{ mb: 2 }}
        >
          <ToggleButton value="today">Today</ToggleButton>
          <ToggleButton value="week">This Week</ToggleButton>
          <ToggleButton value="month">This Month</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={3}>
        {/* Focus Summary Cards */}
        {focusSummary && (
          <>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <AccessTime sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">Total Sessions</Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {focusSummary.summary.totalSessions}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Schedule sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">Focus Time</Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {formatTime(focusSummary.summary.totalTime)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">Productivity</Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {focusSummary.summary.productivityScore}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <CheckCircle sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">Consistency</Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {focusSummary.summary.consistencyScore}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}

        {/* Streak Information */}
        {streak && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <EmojiEvents sx={{ mr: 1, color: 'warning.main' }} />
                  <Typography variant="h6">Focus Streak</Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 600, color: 'warning.main', mb: 1 }}>
                  {streak.currentStreak} days
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Longest streak: {streak.longestStreak} days
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total focus time: {formatTime(streak.totalFocusTime)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Best Study Hours */}
        {insights && insights.bestHours.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Best Study Hours
                </Typography>
                <List>
                  {insights.bestHours.map((hour, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemText
                        primary={`${hour.hour}:00 - ${hour.hour + 1}:00`}
                        secondary={`${hour.sessions} sessions, ${formatTime(hour.totalTime)}`}
                      />
                      <Chip 
                        label={`#${index + 1}`} 
                        color={index === 0 ? 'primary' : 'default'}
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Top Subjects */}
        {insights && insights.topSubjects.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Top Subjects
                </Typography>
                <List>
                  {insights.topSubjects.map((subject, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemText
                        primary={subject.subject}
                        secondary={`${subject.sessions} sessions, ${formatTime(subject.totalTime)}`}
                      />
                      <Chip 
                        label={`#${index + 1}`} 
                        color={index === 0 ? 'primary' : 'default'}
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Recommendations */}
        {insights && insights.recommendations.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Psychology sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Recommendations</Typography>
                </Box>
                <Grid container spacing={2}>
                  {insights.recommendations.map((rec, index) => (
                    <Grid item xs={12} md={4} key={index}>
                      <Alert 
                        severity={getPriorityColor(rec.priority) as any}
                        sx={{ height: '100%' }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {rec.title}
                        </Typography>
                        <Typography variant="body2">
                          {rec.message}
                        </Typography>
                      </Alert>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Analytics; 