'use client'
import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { toast, ToastContainer } from 'react-toastify'
import Layout from '@/components/Layoutteacher'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'

interface NewChoice {
  choice_text: string
  is_correct: boolean
}

interface Choice extends NewChoice {
  id: number
}

interface Question {
  question_text: string
  choices: Choice[]
}

interface ApiQuestion extends Question {
  id: number
}

export default function AddQuestionsPage() {
  const { courseId, examId } = useParams() as { courseId: string, examId: string }
  const [questions, setQuestions] = useState<Question[]>([])
  const [existingQuestions, setExistingQuestions] = useState<ApiQuestion[] | null>(null)
  const [questionText, setQuestionText] = useState('')
  const [choices, setChoices] = useState<NewChoice[]>([
    { choice_text: '', is_correct: false },
    { choice_text: '', is_correct: false },
    { choice_text: '', is_correct: false },
    { choice_text: '', is_correct: false },
  ])
  const [loading, setLoading] = useState(false)

  const API_URL = '/api'
  const router = useRouter()

  // جلب الأسئلة الموجودة من API
  const fetchExistingQuestions = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/exams/${examId}`)
      const data = await res.json()

      if (res.ok && data.status === 200) {
        setExistingQuestions(data.message.questions || [])
        toast.success('تم تحميل الأسئلة الموجودة بنجاح')
      } else {
        toast.error('فشل في جلب الأسئلة الموجودة')
      }
    } catch {
      toast.error('حدث خطأ أثناء جلب الأسئلة الموجودة')
    } finally {
      setLoading(false)
    }
  }

  const handleAddQuestion = () => {
    if (!questionText.trim()) {
      toast.error('من فضلك أدخل نص السؤال')
      return
    }

    if (choices.some(choice => !choice.choice_text.trim())) {
      toast.error('كل الاختيارات مطلوبة')
      return
    }

    if (!choices.some(choice => choice.is_correct)) {
      toast.error('اختر إجابة صحيحة واحدة على الأقل')
      return
    }

    const newQuestion: Question = {
      question_text: questionText,
      choices: choices as Choice[],
    }

    setQuestions(prev => [...prev, newQuestion])
    setQuestionText('')
    setChoices([
      { choice_text: '', is_correct: false },
      { choice_text: '', is_correct: false },
      { choice_text: '', is_correct: false },
      { choice_text: '', is_correct: false },
    ])
    
    toast.success('تم إضافة السؤال بنجاح ✅')
  }

  const handleSubmitAll = async () => {
    if (questions.length === 0) {
      toast.error('أضف سؤال واحد على الأقل')
      return
    }

    const token = Cookies.get('teacher_token')
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }

    try {
      setLoading(true)
      for (const question of questions) {
        const res = await fetch(`${API_URL}/exams/${examId}/questions`, {
          method: 'POST',
          headers,
          body: JSON.stringify(question),
        })

        const data = await res.json()

        if (!res.ok) {
          toast.error(data.message || 'فشل في إضافة أحد الأسئلة')
          return
        }
      }

      toast.success('تم حفظ كل الأسئلة بنجاح 🎉')
      setQuestions([])
      fetchExistingQuestions()
    } catch (err) {
      toast.error('حدث خطأ أثناء الإرسال')
    } finally {
      setLoading(false)
    }
  }

  // اجمالي عدد الاسئلة (المضافة + الموجودة)
  const totalQuestionsCount = (existingQuestions?.length || 0) + questions.length
  const reachedLimit = totalQuestionsCount >= 10

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 text-gray-800 py-8 px-4 md:px-8">
        <ToastContainer 
          position="top-left"
          autoClose={4000}
          theme="light"
          rtl={true}
        />
        
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-3 text-gray-800">
              إضافة أسئلة للامتحان
            </h1>
            <p className="text-gray-600">رقم الامتحان: #{examId}</p>
            <div className="w-20 h-1 bg-blue-500 mx-auto mt-4 rounded-full"></div>
          </div>

          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="mb-6 bg-white hover:bg-gray-50 px-5 py-3 rounded-xl text-gray-700 font-medium flex items-center gap-2 border border-gray-300 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <span>←</span>
            رجوع
          </button>

          {/* Existing Questions Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">الأسئلة الحالية</h2>
              {!reachedLimit && (
                <button
                  onClick={fetchExistingQuestions}
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 px-5 py-2 rounded-lg text-white font-medium flex items-center gap-2 transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? 'جاري التحميل...' : 'عرض الأسئلة الموجودة'}
                </button>
              )}
            </div>

            {existingQuestions && (
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    {existingQuestions.length} سؤال
                  </span>
                </div>
                
                <div className="space-y-4">
                  {existingQuestions.map((q, i) => (
                    <div key={q.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors duration-300">
                      <div className="flex items-start gap-3 mb-3">
                        <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {i + 1}
                        </span>
                        <p className="font-semibold text-gray-800 leading-relaxed">{q.question_text}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {q.choices.map((c, j) => (
                          <div
                            key={c.id}
                            className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                              c.is_correct 
                                ? 'bg-green-50 border-green-400 text-green-800 shadow-sm' 
                                : 'bg-white border-gray-200 text-gray-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{c.choice_text}</span>
                              {c.is_correct && (
                                <span className="bg-green-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">
                                  ✓
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Add New Question Section */}
          {!reachedLimit && (
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 mb-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h2 className="text-xl font-semibold text-gray-800">إضافة سؤال جديد</h2>
              </div>

              {/* Question Input */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-3">نص السؤال</label>
                <textarea
                  placeholder="اكتب نص السؤال هنا..."
                  className="w-full p-4 rounded-xl bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                  rows={3}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                />
              </div>

              {/* Choices */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-4">الاختيارات</label>
                <div className="space-y-4">
                  {choices.map((choice, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-300 hover:border-blue-400 transition-all duration-300">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder={`الاختيار ${index + 1}`}
                          className="w-full p-3 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                          value={choice.choice_text}
                          onChange={(e) => {
                            const newChoices = [...choices]
                            newChoices[index].choice_text = e.target.value
                            setChoices(newChoices)
                          }}
                        />
                      </div>
                      <label className="flex items-center gap-3 cursor-pointer bg-white px-4 py-3 rounded-lg border border-gray-300 hover:border-green-500 transition-colors duration-300">
                        <input
                          type="radio"
                          name="correct"
                          checked={choice.is_correct}
                          onChange={() => {
                            const updatedChoices = choices.map((c, i) => ({
                              ...c,
                              is_correct: i === index,
                            }))
                            setChoices(updatedChoices)
                          }}
                          className="w-5 h-5 text-green-500 focus:ring-green-400"
                        />
                        <span className="text-green-600 font-medium">الإجابة الصحيحة</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleAddQuestion}
                className="w-full bg-green-500 hover:bg-green-600 px-6 py-4 rounded-xl text-white font-semibold flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              >
                <span className="text-lg">+</span>
                إضافة السؤال إلى القائمة
              </button>
            </div>
          )}

          {/* Added Questions Preview */}
          {questions.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h2 className="text-xl font-semibold text-gray-800">الأسئلة المُضافة</h2>
                </div>
                <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-medium">
                  {questions.length}/10 سؤال
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {questions.map((q, i) => (
                  <div key={i} className="bg-gray-50 p-5 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors duration-300">
                    <div className="flex items-start gap-3 mb-4">
                      <span className="bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {i + 1}
                      </span>
                      <p className="font-semibold text-gray-800 text-lg leading-relaxed">{q.question_text}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.choices.map((c, j) => (
                        <div
                          key={j}
                          className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                            c.is_correct 
                              ? 'bg-green-50 border-green-400 text-green-800 shadow-sm' 
                              : 'bg-white border-gray-200 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{c.choice_text}</span>
                            {c.is_correct && (
                              <span className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
                                ✓
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSubmitAll}
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 py-4 rounded-xl font-semibold text-white text-lg flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <span className="text-xl">💾</span>
                    حفظ كل الأسئلة
                  </>
                )}
              </button>
            </div>
          )}

          {/* Limit Message */}
          {reachedLimit && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
              <div className="text-yellow-600 text-lg font-semibold mb-2">
                🎉 لقد وصلت إلى الحد الأقصى للأسئلة
              </div>
              <p className="text-yellow-700">
                يمكنك الآن حفظ الأسئلة أو العودة للصفحة السابقة
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}