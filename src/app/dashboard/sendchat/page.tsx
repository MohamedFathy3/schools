"use client";
import { useState, FormEvent } from 'react';
import Layout from '@/components/Layout';
import { FiSend, FiMessageSquare, FiCheck } from 'react-icons/fi';

export default function MessageForm() {
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const API_URL = '/api'; 

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!message) return;

    setIsLoading(true);
    
    try {
      console.log('🔄 Attempting to send message...', { message });
      
      const response = await fetch(`${API_URL}/admin/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          recipients: 'all'
        })
      });

      console.log('📡 API Response:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });

      const data = await response.json();
      console.log('📊 Response data:', data);

      if (response.ok && data.result === "Success") {
        setToastMessage(data.message || 'Message sent successfully!');
        setShowToast(true);
        setMessage('');
        
        setTimeout(() => setShowToast(false), 3000);
      } else {
        const errorMsg = data.message || data.error || 'Failed to send message';
        setToastMessage(errorMsg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (error) {
      console.error('❌ Sending error:', error);
      setToastMessage('Connection error with server');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
              <FiMessageSquare className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Send Message to Employees
            </h1>
            <p className="text-gray-600">Send a message to all employees in the system</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Message Text *
              </label>
              <textarea
                value={message}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 transition-all duration-200 resize-none hover:border-gray-400 min-h-[120px]"
                placeholder="Write your message for employees here..."
                required
                minLength={5}
                rows={4}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Minimum 5 characters</span>
                <span>{message.length} characters</span>
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading || !message || message.length < 5}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center gap-2">
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <FiSend className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </span>
            </button>
          </form>
        </div>

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed top-4 right-4 bg-white border border-green-200 text-gray-900 p-4 rounded-lg shadow-lg animate-in slide-in-from-right duration-300 z-50 max-w-sm">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <FiCheck className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-green-600">
                  Success!
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {toastMessage}
                </div>
              </div>
              <button 
                onClick={() => setShowToast(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}