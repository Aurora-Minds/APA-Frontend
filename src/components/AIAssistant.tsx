import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, TextField, Button, List, ListItem, ListItemText, CircularProgress, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Chip } from '@mui/material';
import { Send as SendIcon, Attachment as AttachmentIcon, Add as AddIcon, Delete as DeleteIcon, Close as CloseIcon } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    attachment?: {
        filename: string;
    };
}

interface Chat {
    _id: string;
    title: string;
    messages: Message[];
}

const AIAssistant: React.FC = () => {
    const [chats, setChats] = useState<Chat[]>([]);
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [attachedFile, setAttachedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [chatToDelete, setChatToDelete] = useState<Chat | null>(null);
    const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);
    const { user } = useAuth();
    const chatHistoryRef = useRef<HTMLDivElement>(null);

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.auroraminds.xyz/api';

    useEffect(() => {
        fetchChats();
    }, []);

    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [selectedChat]);

    const fetchChats = async () => {
        try {
            const res = await axios.get<Chat[]>(`${API_BASE_URL}/ai/chat/history`);
            setChats(res.data);
        } catch (err) {
            console.error('Error fetching chats:', err);
        }
    };

    const handleSelectChat = (chat: Chat) => {
        setSelectedChat(chat);
    };

    const handleStartNewChat = () => {
        setSelectedChat(null);
        setNewMessage('');
        setAttachedFile(null);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setAttachedFile(file);
        }
    };

    const handleRemoveAttachment = () => {
        setAttachedFile(null);
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() && !attachedFile) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('message', newMessage);
        if (attachedFile) {
            formData.append('file', attachedFile);
        }

        try {
            if (selectedChat) {
                const res = await axios.post<Chat>(`${API_BASE_URL}/ai/chat/${selectedChat._id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                setSelectedChat(res.data);
                setChats(chats.map(c => c._id === res.data._id ? res.data : c));
            } else {
                const res = await axios.post<Chat>(`${API_BASE_URL}/ai/chat`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                setChats([res.data, ...chats]);
                setSelectedChat(res.data);
            }
            setNewMessage('');
            setAttachedFile(null);
        } catch (err) {
            console.error('Error sending message:', err);
        } finally {
            setLoading(false);
        }
    };

    const openDeleteDialog = (chat: Chat) => {
        setChatToDelete(chat);
        setDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setChatToDelete(null);
        setDeleteDialogOpen(false);
    };

    const handleDeleteChat = async () => {
        if (!chatToDelete) return;

        try {
            await axios.delete(`${API_BASE_URL}/ai/chat/${chatToDelete._id}`);
            setChats(chats.filter(c => c._id !== chatToDelete._id));
            if (selectedChat?._id === chatToDelete._id) {
                setSelectedChat(null);
            }
            closeDeleteDialog();
        } catch (err) {
            console.error('Error deleting chat:', err);
        }
    };

    const markdownComponents = {
        p: (props: any) => <Typography {...props} paragraph />,
        strong: (props: any) => <Typography component="strong" sx={{ fontWeight: 'bold' }} {...props} />,
        li: (props: any) => <ListItem sx={{ display: 'list-item', pl: 2 }}><ListItemText primary={props.children} /></ListItem>,
        ul: (props: any) => <List sx={{ listStyleType: 'disc', pl: 4 }} {...props} />,
        ol: (props: any) => <List sx={{ listStyleType: 'decimal', pl: 4 }} {...props} />,
    };

    return (
        <Box sx={{ display: 'flex', height: 'calc(100vh - 120px)' }}>
            <Paper sx={{ width: '30%', p: 2, overflowY: 'auto' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Chat History</Typography>
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={handleStartNewChat}
                    >
                        New Chat
                    </Button>
                </Box>
                <List>
                    {chats.map(chat => (
                        <ListItem 
                            button 
                            key={chat._id} 
                            onClick={() => handleSelectChat(chat)} 
                            selected={selectedChat?._id === chat._id}
                            onMouseEnter={() => setHoveredChatId(chat._id)}
                            onMouseLeave={() => setHoveredChatId(null)}
                        >
                            <ListItemText 
                                primary={chat.title} 
                                sx={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}
                            />
                            {hoveredChatId === chat._id && (
                                <IconButton edge="end" aria-label="delete" onClick={(e) => { e.stopPropagation(); openDeleteDialog(chat); }}>
                                    <DeleteIcon />
                                </IconButton>
                            )}
                        </ListItem>
                    ))}
                </List>
            </Paper>
            <Box sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
                <Paper ref={chatHistoryRef} sx={{ flex: 1, p: 2, overflowY: 'auto', mb: 2 }}>
                    {selectedChat ? (
                        selectedChat.messages.map((msg, index) => (
                            <Box key={index} sx={{ mb: 2, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    {msg.role}
                                </Typography>
                                <Paper sx={{ p: 1.5, display: 'inline-block', bgcolor: msg.role === 'user' ? 'primary.main' : 'background.paper', color: msg.role === 'user' ? 'primary.contrastText' : 'text.primary' }}>
                                    {msg.attachment && (
                                        <Chip
                                            icon={<AttachmentIcon />}
                                            label={msg.attachment.filename}
                                            sx={{ mb: 1 }}
                                        />
                                    )}
                                    {msg.role === 'assistant' ? (
                                        <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                                    ) : (
                                        <Typography>{msg.content}</Typography>
                                    )}
                                </Paper>
                            </Box>
                        ))
                    ) : (
                        <Typography>Select a chat or start a new one.</Typography>
                    )}
                </Paper>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    {attachedFile && (
                        <Box sx={{ mb: 1 }}>
                            <Chip
                                icon={<AttachmentIcon />}
                                label={attachedFile.name}
                                onDelete={handleRemoveAttachment}
                                deleteIcon={<CloseIcon />}
                            />
                        </Box>
                    )}
                    <Box sx={{ display: 'flex' }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <input
                            type="file"
                            accept=".pdf"
                            style={{ display: 'none' }}
                            id="file-upload"
                            onChange={handleFileUpload}
                        />
                        <label htmlFor="file-upload">
                            <IconButton component="span" color="primary" disabled={loading}>
                                <AttachmentIcon />
                            </IconButton>
                        </label>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSendMessage}
                            disabled={loading}
                            sx={{ ml: 1 }}
                        >
                            {loading ? <CircularProgress size={24} /> : <SendIcon />}
                        </Button>
                    </Box>
                </Box>
            </Box>
            <Dialog
                open={deleteDialogOpen}
                onClose={closeDeleteDialog}
            >
                <DialogTitle>Delete Chat</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this chat? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDeleteDialog}>Cancel</Button>
                    <Button onClick={handleDeleteChat} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AIAssistant;
