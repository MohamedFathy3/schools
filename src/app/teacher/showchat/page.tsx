"use client";
import { useState, useEffect } from 'react';
import Layout from '@/components/Layoutteacher';
import { FiSearch, FiMessageSquare, FiCalendar, FiClock, FiChevronDown, FiChevronUp, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import Cookies from 'js-cookie'

// تعريف الأنواع
type Message = {
  id: number;
  message: string;
  created_at: string;
  updated_at: string;
};

type ApiResponse = {
  result: string;
  messages: Message[];
};

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [expandedMessage, setExpandedMessage] = useState<number | null>(null);
  const API_URL = '/api';



  const redmassafe = async (id: number) => {
  try {
    
    const response = await fetch(`${API_URL}/admin/messages/${id}/read`, {
  
    });
    const data: ApiResponse = await response.json();

    if (response.ok && data.result === "Success") {
      
    } else {
      console.error('Failed to fetch messages');
    }
  } catch (error) {
    console.error('Error fetching messages:', error);
  } finally {
    setIsLoading(false);
  }
};

  // جلب الرسائل من الـ API
  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/messages`);
      const data: ApiResponse = await response.json();

      if (response.ok && data.result === "Success") {
        setMessages(data.messages || []);
      } else {
        console.error('Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // تصفية وترتيب الرسائل
  const filteredAndSortedMessages = messages
    .filter((message: Message) => 
      message.message.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a: Message, b: Message) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      
      if (sortOrder === 'newest') {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });

  // تنسيق التاريخ
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

 

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        {/* Header */}
        <div className="max-w-6xl mx-auto animate-fadeIn">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <FiMessageSquare className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  الرسائل المرسلة
                </h1>
              
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 animate-slideUp">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">إجمالي الرسائل</p>
                  <p className="text-3xl font-bold text-white mt-2">{messages.length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <FiMessageSquare className="text-purple-400 text-xl" />
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-blue-500/50 transition-all duration-300 animate-slideUp" style={{animationDelay: '0.1s'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">آخر رسالة</p>
                  <p className="text-white mt-2">
                    {messages.length > 0 ? formatDate(messages[0].created_at) : 'لا توجد'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <FiCalendar className="text-blue-400 text-xl" />
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-green-500/50 transition-all duration-300 animate-slideUp" style={{animationDelay: '0.2s'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">تم التحديث</p>
                  <p className="text-white mt-2">الآن</p>
                </div>
                <button 
                  onClick={fetchMessages}
                  className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center hover:bg-green-500/30 transition-all duration-300 hover:scale-110"
                >
                  <FiRefreshCw className="text-green-400 text-xl" />
                </button>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 mb-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <FiSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="ابحث في الرسائل..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-700 border-2 border-gray-600 text-white p-4 rounded-xl pl-12 focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400 transition-all duration-300"
                />
              </div>

              {/* Sort */}
              <div className="flex gap-4">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                  className="bg-gray-700 border-2 border-gray-600 text-white p-4 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="newest">الأحدث أولاً</option>
                  <option value="oldest">الأقدم أولاً</option>
                </select>
              </div>
            </div>
          </div>

          {/* Messages List */}
          <div className="space-y-4 animate-fadeIn">
            {isLoading ? (
              // Loading Skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="bg-gray-800 rounded-2xl p-6 border border-gray-700 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                    </div>
                    <div className="h-8 bg-gray-700 rounded w-20"></div>
                  </div>
                </div>
              ))
            ) : filteredAndSortedMessages.length === 0 ? (
              // Empty State
              <div className="text-center py-16 bg-gray-800 rounded-2xl border border-gray-700">
                <FiMessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-400 mb-2">لا توجد رسائل</h3>
                <p className="text-gray-500">لم يتم إرسال أي رسائل بعد</p>
              </div>
            ) : (
              // Messages List
              filteredAndSortedMessages.map((message: Message, index: number) => (
                <div
                  key={message.id}
                  className="bg-gray-800 rounded-2xl border border-gray-700 hover:border-purple-500/30 transition-all duration-300 overflow-hidden animate-slideUp"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div 
                    className="p-6 cursor-pointer"
                   onClick={() => {
    setExpandedMessage(expandedMessage === message.id ? null : message.id);
    redmassafe(message.id);
  }}
>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-white text-lg font-medium mb-2 line-clamp-2">
                          {message.message}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-1">
                            <FiCalendar className="w-4 h-4" />
                            <span>{formatDate(message.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FiClock className="w-4 h-4" />
                            <span>{formatTime(message.created_at)}</span>
                          </div>
                          <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-lg text-xs">
                            ID: {message.id}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        
                        
                        {expandedMessage === message.id ? (
                          <FiChevronUp className="w-5 h-5 text-purple-400" />
                        ) : (
                          <FiChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Content */}
                  {expandedMessage === message.id && (
                    <div className="px-6 pb-6 border-t border-gray-700 pt-4 animate-slideDown">
                      <div className="bg-gray-750 rounded-xl p-4">
                        <h4 className="text-purple-400 font-medium mb-3">محتوى الرسالة:</h4>
                        <p className="text-white text-lg leading-relaxed">{message.message}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="bg-gray-750 rounded-xl p-4">
                          <h4 className="text-blue-400 font-medium mb-2">معلومات الإرسال:</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">تاريخ الإنشاء:</span>
                              <span className="text-white">{formatDate(message.created_at)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">آخر تحديث:</span>
                              <span className="text-white">{formatDate(message.updated_at)}</span>
                            </div>
                          </div>
                        </div>
                       
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* CSS Animations */}
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out;
          }
          .animate-slideUp {
            animation: slideUp 0.5s ease-out;
          }
          .animate-slideDown {
            animation: slideDown 0.3s ease-out;
          }
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}</style>
      </div>
    </Layout>
  );
}