import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, TextField, Button, List, ListItem, ListItemText, CircularProgress, IconButton } from '@mui/material';
import { Send as SendIcon, Attachment as AttachmentIcon } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
    role: 'user' | 'assistant';
    content: string;
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
    const [loading, setLoading] = useState(false);
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

    const handleNewChat = async () => {
        if (!newMessage.trim()) return;

        setLoading(true);
        try {
            const res = await axios.post<Chat>(`${API_BASE_URL}/ai/chat`, {
                title: newMessage.substring(0, 30),
                message: newMessage
            });
            setChats([res.data, ...chats]);
            setSelectedChat(res.data);
            setNewMessage('');
        } catch (err) {
            console.error('Error creating new chat:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        if (selectedChat) {
            formData.append('chatId', selectedChat._id);
        }

        try {
            const res = await axios.post<Chat>(`${API_BASE_URL}/ai/chat/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (selectedChat) {
                setSelectedChat(res.data);
                setChats(chats.map(c => c._id === res.data._id ? res.data : c));
            } else {
                setChats([res.data, ...chats]);
                setSelectedChat(res.data);
            }
        } catch (err) {
            console.error('Error uploading file:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedChat) return;

        setLoading(true);
        try {
            const res = await axios.post<Chat>(`${API_BASE_URL}/ai/chat/${selectedChat._id}`, {
                message: newMessage
            });
            setSelectedChat(res.data);
            setNewMessage('');
            // Update the chat in the list
            setChats(chats.map(c => c._id === res.data._id ? res.data : c));
        } catch (err) {
            console.error('Error sending message:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', height: 'calc(100vh - 120px)' }}>
            <Paper sx={{ width: '30%', p: 2, overflowY: 'auto' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Chat History</Typography>
                <List>
                    {chats.map(chat => (
                        <ListItem button key={chat._id} onClick={() => handleSelectChat(chat)} selected={selectedChat?._id === chat._id}>
                            <ListItemText primary={chat.title} />
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
                                    {msg.role === 'assistant' ? (
                                        <Box sx={{ whiteSpace: 'pre-wrap' }}>
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                                        </Box>
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
                <Box sx={{ display: 'flex' }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (selectedChat ? handleSendMessage() : handleNewChat())}
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
                        onClick={selectedChat ? handleSendMessage : handleNewChat}
                        disabled={loading}
                        sx={{ ml: 1 }}
                    >
                        {loading ? <CircularProgress size={24} /> : <SendIcon />}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default AIAssistant;
