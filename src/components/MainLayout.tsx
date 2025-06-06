import React from 'react';
import Sidebar from './Sidebar';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();

  const mainBg = theme.palette.mode === 'dark' ? '#18191c' : '#f7f8fa';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: mainBg }}>
      <Sidebar dark={theme.palette.mode === 'dark'} />
      <Box sx={{ flex: 1, p: 0, minWidth: 0 }}>{children}</Box>
    </Box>
  );
};

export default MainLayout; 