"use client";
import { useState, FormEvent } from 'react';
import Layout from '@/components/Layout';

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
      console.log('🔄 محاولة إرسال الرسالة...', { message });
      
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

      console.log('📡 استجابة الـ API:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });

      const data = await response.json();
      console.log('📊 بيانات الاستجابة:', data);

      if (response.ok && data.result === "Success") {
        setToastMessage(data.message || 'تم إرسال الرسالة بنجاح!');
        setShowToast(true);
        setMessage('');
        
        setTimeout(() => setShowToast(false), 3000);
      } else {
        // عرض رسالة الخطأ من الـ API إن وجدت
        const errorMsg = data.message || data.error || 'فشل في إرسال الرسالة';
        setToastMessage(errorMsg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (error) {
      console.error('❌ خطأ في الإرسال:', error);
      setToastMessage('حدث خطأ في الاتصال بالخادم');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-700 hover:border-cyan-500/50 transition-all duration-300">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/25">
              <span className="text-2xl">📨</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              إرسال رسالة للموظفين
            </h1>
            <p className="text-gray-400">ارسل رسالة لجميع الموظفين في النظام</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="group">
              <label className="block text-sm font-medium text-gray-300 mb-2 text-right group-hover:text-cyan-400 transition-colors duration-200">
                نص الرسالة *
              </label>
              <textarea
                value={message}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-gray-400 transition-all duration-200 resize-none hover:border-gray-500"
                placeholder="اكتب رسالتك للموظفين هنا..."
                required
                minLength={5}
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {message.length} / الحد الأدنى 5 أحرف
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading || !message || message.length < 5}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border border-cyan-500/20 relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center gap-2">
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <span>إرسال الرسالة</span>
                    <span className="transform group-hover:scale-110 transition-transform duration-200">📨</span>
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </form>
        </div>

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed top-4 right-4 bg-gray-800 border border-cyan-500 text-white p-4 rounded-xl shadow-lg animate-in slide-in-from-right duration-300 z-50 max-w-sm">
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${
                toastMessage.includes('نجاح') || toastMessage.includes('Success') ? 'bg-green-500' : 'bg-green-500'
              }`}>
                {toastMessage.includes('نجاح') || toastMessage.includes('Success') ? '✓' : '!'}
              </div>
              <div className="flex-1">
                <div className={`font-semibold ${
                  toastMessage.includes('نجاح') || toastMessage.includes('Success') ? 'text-green-400' : 'text-green-400'
                }`}>
                  {toastMessage.includes('نجاح') || toastMessage.includes('Success') ? 'تم الإرسال بنجاح!' : ' تم الإرسال بنجاح! '}
                </div>
                <div className="text-sm text-gray-300 mt-1">
                  {toastMessage}
                </div>
              </div>
              <button 
                onClick={() => setShowToast(false)}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Background Pattern */}
        <div className="fixed inset-0 -z-10 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10"></div>
        </div>
      </div>
    </Layout>
  );
}