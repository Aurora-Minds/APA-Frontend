import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    CircularProgress,
    Alert,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Icon
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Import all icons used in rewardsData.js
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import SchoolIcon from '@mui/icons-material/School';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import BookIcon from '@mui/icons-material/Book';
import TheatersIcon from '@mui/icons-material/Theaters';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import HeadphonesIcon from '@mui/icons-material/Headphones';

const iconMap: { [key: string]: React.ElementType } = {
    SelfImprovement: SelfImprovementIcon,
    MusicNote: MusicNoteIcon,
    SportsEsports: SportsEsportsIcon,
    PlayCircle: PlayCircleIcon,
    School: SchoolIcon,
    Fastfood: FastfoodIcon,
    Book: BookIcon,
    Theaters: TheatersIcon,
    CardGiftcard: CardGiftcardIcon,
    Headphones: HeadphonesIcon,
};

interface Reward {
    id: string;
    name: string;
    description: string;
    level: number;
    logo: string;
    category: string;
    status: 'locked' | 'unlocked' | 'claimed';
}

interface ClaimedReward {
    _id: string;
    rewardId: string;
    code: string;
    claimedAt: string;
}

const Rewards: React.FC = () => {
    const { user } = useAuth();
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [userLevel, setUserLevel] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [claimingId, setClaimingId] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [claimedRewardInfo, setClaimedRewardInfo] = useState<ClaimedReward | null>(null);

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.auroraminds.xyz/api';

    useEffect(() => {
        fetchRewards();
    }, []);

    const fetchRewards = async () => {
        setLoading(true);
        try {
            const res = await axios.get<{ rewards: Reward[], userLevel: number }>(`${API_BASE_URL}/rewards`);
            setRewards(res.data.rewards);
            setUserLevel(res.data.userLevel);
        } catch (err) {
            setError('Failed to load rewards. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleClaimReward = async (rewardId: string) => {
        setClaimingId(rewardId);
        try {
            const res = await axios.post<ClaimedReward>(`${API_BASE_URL}/rewards/claim/${rewardId}`);
            setClaimedRewardInfo(res.data);
            setDialogOpen(true);
            // Refetch rewards to update status
            fetchRewards();
        } catch (err: any) {
            setError(err.response?.data?.msg || 'Failed to claim reward.');
        } finally {
            setClaimingId(null);
        }
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setClaimedRewardInfo(null);
    };

    // XP Bar component logic copied from Dashboard
    const renderXPBar = () => {
        const xp = user?.xp || 0;
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
            <Box sx={{ width: '100%', maxWidth: 420, mx: 'auto', mt: 2, mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
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

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Alert severity="error" sx={{ m: 4 }}>{error}</Alert>;
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>Rewards</Typography>
            {renderXPBar()}

            <Grid container spacing={4}>
                {rewards.map((reward) => (
                    <Grid item key={reward.id} xs={12} sm={6} md={4}>
                        <Card sx={{
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column',
                            borderRadius: 4,
                            opacity: reward.status === 'locked' ? 0.6 : 1,
                            boxShadow: reward.status === 'unlocked' ? '0 0 20px rgba(0, 128, 255, 0.5)' : 'none',
                            border: reward.status === 'unlocked' ? '1px solid #0075ff' : '1px solid transparent'
                        }}>
                            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Icon component={iconMap[reward.logo] || BookIcon} sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                                    <Box>
                                        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                                            {reward.name}
                                        </Typography>
                                        <Chip label={reward.category} size="small" />
                                    </Box>
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                                    {reward.description}
                                </Typography>
                                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Chip 
                                        icon={<LockIcon />}
                                        label={`Level ${reward.level}`}
                                        variant={reward.status !== 'locked' ? 'filled' : 'outlined'}
                                        color={reward.status !== 'locked' ? 'success' : 'default'}
                                    />
                                    <Button
                                        variant="contained"
                                        disabled={(reward.status === 'locked') || !!claimingId}
                                        onClick={() => handleClaimReward(reward.id)}
                                        startIcon={reward.status === 'claimed' ? <CheckCircleIcon /> : null}
                                    >
                                        {claimingId === reward.id 
                                            ? <CircularProgress size={24} /> 
                                            : reward.status === 'claimed' 
                                            ? 'View Code' 
                                            : 'Claim'}
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={dialogOpen} onClose={handleCloseDialog}>
                <DialogTitle>Reward Claimed!</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Congratulations! You have successfully claimed your reward. Here is your code:
                    </DialogContentText>
                    <Typography variant="h6" sx={{ mt: 2, fontWeight: 700, textAlign: 'center', p: 2, background: '#e0e0e0', color: '#1a1a1a', borderRadius: 2, fontFamily: 'monospace' }}>
                        {claimedRewardInfo?.code}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Close</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Rewards;