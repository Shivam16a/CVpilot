// client/src/components/CVPilotAgent.jsx
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

export default function CVPilotAgent() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userName = storedUser.username || storedUser.name || 'Friend';

    const [isOpen, setIsOpen] = useState(false);

    // Initial welcome state generator
    const getInitialMessage = () => ([
        {
            sender: 'ai',
            text: `✨ **Hello ${userName}! 👋 Welcome to CVPilot!** 🚀\n\nI am your personal career & resume expert. How can I assist you with CVPilot features, resume building, or ATS optimization today? 😊`
        }
    ]);

    const [messages, setMessages] = useState(getInitialMessage());
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    // 🚀 CLOSE (X) HANDLER: Closes window AND clears chat memory
    const handleCloseChat = () => {
        setIsOpen(false);
        setMessages(getInitialMessage()); // Reset back to first welcome message
        setInput('');
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const res = await axios.post(
                'http://localhost:6050/api/ai/agent-chat',
                { message: userMsg },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                setMessages(prev => [...prev, { sender: 'ai', text: res.data.reply }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, {
                sender: 'ai',
                text: '🎯 I am the CVPilot AI Assistant. My role is specifically to answer questions related to CVPilot, resumes, and career development. Please ask a question related to these topics! 😊'
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 99999, fontFamily: 'sans-serif' }}>

            {/* FLOATING BUTTON */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                        color: '#ffffff',
                        border: '1px solid rgba(56, 189, 248, 0.5)',
                        borderRadius: '50px',
                        padding: '12px 22px',
                        fontWeight: '700',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 10px 25px rgba(2, 132, 199, 0.5)'
                    }}
                >
                    <span style={{ fontSize: '1.1rem' }}>✨</span>
                    <span>CVPilot AI Agent</span>
                </button>
            )}

            {/* CHAT WINDOW */}
            {isOpen && (
                <div
                    style={{
                        width: '380px',
                        height: '500px',
                        backgroundColor: '#0f172a',
                        borderRadius: '16px',
                        border: '1px solid #1e293b',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.8), 0 0 20px rgba(56, 189, 248, 0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        color: '#ffffff'
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            padding: '14px 18px',
                            backgroundColor: '#1e293b',
                            borderBottom: '1px solid #334155',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.2rem' }}>✨</span>
                            <div>
                                <div style={{ fontWeight: '700', fontSize: '0.92rem', color: '#f8fafc' }}>CVPilot Career Assistant</div>
                                <div style={{ fontSize: '0.7rem', color: '#38bdf8' }}>● Online & Ready</div>
                            </div>
                        </div>

                        {/* 🚀 CLICKING "X" CLEARS CHAT */}
                        <button
                            onClick={handleCloseChat}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#94a3b8',
                                fontSize: '1.2rem',
                                cursor: 'pointer',
                                padding: '0 4px'
                            }}
                            title="Close & Clear Chat"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Chat Messages Body */}
                    <div
                        style={{
                            flex: 1,
                            padding: '16px',
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '14px',
                            backgroundColor: '#090d16'
                        }}
                    >
                        {messages.map((m, idx) => (
                            <div
                                key={idx}
                                style={{
                                    alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                                    maxWidth: '85%'
                                }}
                            >
                                <div
                                    style={{
                                        padding: '12px 14px',
                                        borderRadius: m.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                                        backgroundColor: m.sender === 'user' ? '#0ea5e9' : '#1e293b',
                                        color: m.sender === 'user' ? '#0f172a' : '#f8fafc',
                                        fontSize: '0.85rem',
                                        lineHeight: '1.5',
                                        border: m.sender === 'user' ? 'none' : '1px solid #334155',
                                        fontWeight: m.sender === 'user' ? '600' : '400'
                                    }}
                                >
                                    {m.sender === 'ai' ? (
                                        <div className="ai-markdown-content">
                                            <ReactMarkdown>{m.text}</ReactMarkdown>
                                        </div>
                                    ) : (
                                        m.text
                                    )}
                                </div>
                                <div
                                    style={{
                                        fontSize: '0.65rem',
                                        color: '#64748b',
                                        marginTop: '4px',
                                        textAlign: m.sender === 'user' ? 'right' : 'left'
                                    }}
                                >
                                    {m.sender === 'user' ? 'You' : 'CVPilot AI'}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div style={{ alignSelf: 'flex-start', color: '#38bdf8', fontSize: '0.8rem', padding: '8px 12px', backgroundColor: '#1e293b', borderRadius: '12px' }}>
                                ⚡ Thinking...
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Footer */}
                    <div style={{ padding: '12px', backgroundColor: '#0f172a', borderTop: '1px solid #1e293b' }}>
                        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about resumes or CVPilot..."
                                style={{
                                    flex: 1,
                                    backgroundColor: '#1e293b',
                                    border: '1px solid #334155',
                                    color: '#ffffff',
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    fontSize: '0.82rem',
                                    outline: 'none'
                                }}
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                style={{
                                    backgroundColor: '#0ea5e9',
                                    color: '#0f172a',
                                    border: 'none',
                                    padding: '10px 16px',
                                    borderRadius: '8px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    opacity: (loading || !input.trim()) ? 0.6 : 1
                                }}
                            >
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}