'use client';

import React, { useEffect, useState, useRef } from 'react';
import Cookies from 'js-cookie';
import Layout from '@/components/Layoutteacher';

interface Message {
  id: number;
  sender_id: number;
  sender_type: 'teacher' | 'admin';
  body: string;
  created_at: string;
  sender_name: string;
  sender_avatar_url?: string;
}

interface ChatProps {
  teacherId?: number;
  adminId: number | string;
}

const ChatPage: React.FC<ChatProps> = ({ teacherId, adminId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const API_URL = '/api';

  const token = Cookies.get('teacher_token');
  const currentTeacherId = teacherId || parseInt(Cookies.get('teacher_id') || '0', 10);
  const currentAdminId = parseInt(String(adminId), 10);

  const fetchMessages = async () => {
    console.log('Fetching messages...');
    if (!token) {
      console.warn('Missing token');
      return;
    }

    try {
      setLoadingMessages(true);

      const res = await fetch(
        `${API_URL}/chat/messages?receiver_id=${currentAdminId}&receiver_type=admin`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      console.log('Fetch response:', data);

      if (res.ok && data.status === 200) {
        setMessages(data.data || []);
      } else {
        console.error('Failed to fetch messages:', data);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoadingMessages(false);
      scrollToBottom();
    }
  };

  const sendMessage = async () => {
    console.log('Trying to send message...');
    if (!token || !currentTeacherId || !newMessage.trim()) {
      console.warn('Token or teacher ID or message is missing');
      return;
    }

    const payload = {
      receiver_id: currentAdminId,
      receiver_type: 'admin',
      body: newMessage.trim(),
    };

    try {
      setSending(true);
      console.log('Sending payload:', payload);

      const res = await fetch(`${API_URL}/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log('Send response:', data);

      if (res.ok && data.status === 200) {
        const newMsg: Message = {
          id: data.data?.id ?? Date.now(),
          sender_id: currentTeacherId,
          sender_type: 'teacher',
          body: newMessage.trim(),
          created_at: new Date().toISOString(),
          sender_name: 'أنا',
          sender_avatar_url: '/images/user.png',
        };
        setMessages((prev) => [...prev, newMsg]);
        setNewMessage('');
        scrollToBottom();
      } else {
        console.error('Send failed:', data.message || 'Unknown error');
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto h-[90vh] flex flex-col rounded-2xl shadow-xl overflow-hidden bg-white border border-gray-200">
        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 bg-white">
          <div className="relative">
            <img
              src="/images/admin-avatar.png"
              alt="Admin"
              className="w-12 h-12 rounded-full border-2 border-gray-100 shadow-sm"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800">المدير</h2>
            <span className="text-sm text-green-600 font-medium">متصل الآن</span>
          </div>
          <div className="flex space-x-2">
            <button className="p-2 rounded-full hover:bg-gray-50 transition-colors border border-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>
            <button className="p-2 rounded-full hover:bg-gray-50 transition-colors border border-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          {loadingMessages ? (
            <div className="flex justify-center items-center h-20">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
              </div>
              <span className="ml-2 text-gray-500">جاري تحميل الرسائل...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-600">لا توجد رسائل بعد</h3>
              <p className="text-gray-500 mt-1">ابدأ محادثة جديدة مع المدير</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender_type === 'teacher';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMine && (
                    <img
                      src={msg.sender_avatar_url || '/images/admin-avatar.png'}
                      alt={msg.sender_name}
                      className="w-10 h-10 rounded-full flex-shrink-0 border border-gray-200"
                    />
                  )}
                  <div className={`max-w-[75%] ${isMine ? 'order-first' : ''}`}>
                    {!isMine && (
                      <div className="text-sm text-gray-600 mb-1 font-medium">{msg.sender_name}</div>
                    )}
                    <div
                      className={`px-4 py-3 rounded-2xl text-sm leading-6 shadow-sm ${
                        isMine
                          ? 'bg-blue-500 text-white rounded-br-none'
                          : 'bg-gray-50 text-gray-800 rounded-bl-none border border-gray-100'
                      }`}
                    >
                      {msg.body}
                    </div>
                    <div className={`text-xs text-gray-400 mt-1 ${isMine ? 'text-right' : 'text-left'}`}>
                      {formatTime(msg.created_at)}
                    </div>
                  </div>
                  {isMine && (
                    <img
                      src="/images/user.png"
                      alt="أنا"
                      className="w-10 h-10 rounded-full flex-shrink-0 border border-gray-200"
                    />
                  )}
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="flex items-center px-6 py-4 gap-3 bg-white border-t border-gray-100">
          <button className="p-3 rounded-full hover:bg-gray-50 transition-colors border border-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="اكتب رسالة..."
              className="w-full bg-gray-50 border-0 text-gray-800 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all border border-gray-200"
              disabled={sending}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={sending || !newMessage.trim()}
            className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {sending ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </Layout>
  );
};

function formatTime(createdAt: string): string {
  const date = new Date(createdAt);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'م' : 'ص';
  const h12 = hours % 12 || 12;
  const mins = minutes < 10 ? `0${minutes}` : minutes;
  return `${h12}:${mins} ${ampm}`;
}

export default ChatPage;