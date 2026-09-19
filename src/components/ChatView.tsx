import { useState, useRef, useEffect } from 'react';
import { useQueefies } from '../hooks/useQueefies';
import { Send, ArrowLeft } from 'lucide-react';

export function ChatView() {
  const { state, dispatch, sendMessage } = useQueefies();
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeChat = state.activeChatId ? state.chats.get(state.activeChatId) : null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages.length]);

  if (!activeChat) {
    // Show list of chats
    return (
      <div style={{ padding: 16, color: '#fff' }}>
        <h2 style={{ color: '#e91e8c', marginBottom: 16 }}>Chats</h2>
        {state.chats.size === 0 && (
          <p style={{ color: '#aaa', textAlign: 'center', marginTop: 40 }}>No active chats yet.<br/>Send a bang request to start chatting! 💥</p>
        )}
        {Array.from(state.chats.values()).map((chat) => {
          const lastMsg = chat.messages[chat.messages.length - 1];
          return (
            <div
              key={chat.chatId}
              onClick={() => dispatch({ type: 'SET_ACTIVE_CHAT', payload: chat.chatId })}
              style={{ background: '#1a1a1a', borderRadius: 12, padding: 14, marginBottom: 10, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{chat.withDisplayName}</div>
                {lastMsg && <div style={{ color: '#aaa', fontSize: 13 }}>{lastMsg.text.slice(0, 40)}</div>}
              </div>
              {lastMsg && <div style={{ color: '#666', fontSize: 12 }}>{new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>}
            </div>
          );
        })}
      </div>
    );
  }

  function handleSend() {
    const t = text.trim();
    if (!t || !state.activeChatId) return;
    sendMessage(state.activeChatId, t);
    setText('');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', color: '#fff' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#111', borderBottom: '1px solid #222' }}>
        <button onClick={() => dispatch({ type: 'SET_ACTIVE_CHAT', payload: null })} style={{ background: 'none', border: 'none', color: '#e91e8c', cursor: 'pointer' }}>
          <ArrowLeft size={22} />
        </button>
        <span style={{ fontWeight: 700, fontSize: 16 }}>{activeChat.withDisplayName}</span>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {activeChat.messages.length === 0 && (
          <p style={{ color: '#aaa', textAlign: 'center', marginTop: 40 }}>Say hi! 👋</p>
        )}
        {activeChat.messages.map((msg, i) => {
          const isMe = msg.from === state.fingerprint;
          return (
            <div key={i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '75%', background: isMe ? '#e91e8c' : '#1a1a1a', borderRadius: 16, padding: '10px 14px', fontSize: 15 }}>
                {!isMe && <div style={{ fontSize: 11, color: '#aaa', marginBottom: 4 }}>{msg.displayName}</div>}
                <div>{msg.text}</div>
                <div style={{ fontSize: 10, color: isMe ? 'rgba(255,255,255,0.7)' : '#555', textAlign: 'right', marginTop: 4 }}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 16px', background: '#111', borderTop: '1px solid #222' }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          style={{ flex: 1, background: '#1a1a1a', color: '#fff', border: '1px solid #333', borderRadius: 24, padding: '10px 16px', fontSize: 15, outline: 'none' }}
        />
        <button onClick={handleSend} style={{ background: '#e91e8c', color: '#fff', border: 'none', borderRadius: '50%', width: 44, height: 44, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
