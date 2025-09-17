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

  const API_URL = 'https://professionalacademyedu.com/api';

  const token = Cookies.get('teacher_token');
  const currentTeacherId = teacherId || parseInt(Cookies.get('teacher_id') || '0', 10);
  const currentAdminId = parseInt(String(adminId), 10); // تحويل adminId إلى رقم صحيح

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
      receiver_id: currentAdminId, // استخدم الرقم هنا أيضاً
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
      <div className="max-w-3xl mx-auto h-[90vh] flex flex-col border border-gray-700 rounded-md shadow-md overflow-hidden bg-[#1e1e1e] text-white">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700 bg-[#2a2a2a]">
          <img
            src="/images/admin-avatar.png"
            alt="Admin"
            className="w-10 h-10 rounded-full border border-gray-600"
          />
          <div>
            <h2 className="text-lg font-bold text-white">المدير</h2>
            <span className="text-sm text-green-400">متصل الآن</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#1e1e1e]">
          {loadingMessages ? (
            <div className="text-center text-gray-400">جاري تحميل الرسائل...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500">لا توجد رسائل بعد</div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender_type === 'teacher';
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMine && (
                    <img
                      src={msg.sender_avatar_url || '/images/admin-avatar.png'}
                      alt={msg.sender_name}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <div className="max-w-[70%]">
                    {!isMine && (
                      <div className="text-xs text-gray-400 mb-1">{msg.sender_name}</div>
                    )}
                    <div
                      className={`px-4 py-2 rounded-xl text-sm leading-6 ${
                        isMine
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-gray-700 text-gray-200 rounded-bl-none'
                      }`}
                    >
                      {msg.body}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1 text-right">
                      {formatTime(msg.created_at)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="flex border-t border-gray-700 px-4 py-3 gap-2 bg-[#2a2a2a]">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') sendMessage();
            }}
            placeholder="اكتب رسالة..."
            className="flex-1 bg-[#1e1e1e] border border-gray-600 text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={sending}
          />
          <button
            onClick={sendMessage}
            disabled={sending || !newMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm disabled:opacity-50"
          >
            إرسال
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
