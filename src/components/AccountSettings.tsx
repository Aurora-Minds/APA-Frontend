import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Alert } from '@mui/material';
import axios from 'axios';

interface AccountSettingsProps {
  open: boolean;
  onClose: () => void;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ open, onClose }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    try {
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api'; // Fallback for developmen
      await axios.put(`${API_BASE_URL}/users/me`, { name, password });
      setSuccess('Account updated successfully!');
      setName('');
      setPassword('');
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Error updating account');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Account Settings</DialogTitle>
      <DialogContent>
        {success && <Alert severity="success">{success}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField label="Name" value={name} onChange={e => setName(e.target.value)} fullWidth sx={{ mt: 2 }} />
          <TextField label="New Password" type="password" value={password} onChange={e => setPassword(e.target.value)} fullWidth sx={{ mt: 2 }} />
          <DialogActions sx={{ px: 0, pb: 0, pt: 2 }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="contained">Save Changes</Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AccountSettings; 