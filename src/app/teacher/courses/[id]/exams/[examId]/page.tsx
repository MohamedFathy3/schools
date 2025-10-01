'use client'
import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
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

  const API_URL = '/api'; // بدل ما تستخدم https://back.professionalacademyedu.com/api مباشرة
const router = useRouter()

  // جلب الأسئلة الموجودة من API
  const fetchExistingQuestions = async () => {
    try {
      const res = await fetch(`${API_URL}/exams/${examId}`)
      const data = await res.json()

      if (res.ok && data.status === 200) {
        setExistingQuestions(data.message.questions || [])
      } else {
        toast.error('فشل في جلب الأسئلة الموجودة')
      }
    } catch {
      toast.error('حدث خطأ أثناء جلب الأسئلة الموجودة')
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
      // ممكن تعيد جلب الأسئلة الموجودة بعد الإضافة
      fetchExistingQuestions()
    } catch (err) {
      toast.error('حدث خطأ أثناء الإرسال')
    }
  }

  // اجمالي عدد الاسئلة (المضافة + الموجودة)
  const totalQuestionsCount = (existingQuestions?.length || 0) + questions.length
  const reachedLimit = totalQuestionsCount >= 10

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 text-white py-10 px-6 md:px-12">
        <ToastContainer />
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center border-b border-gray-700 pb-4">
            إضافة أسئلة للامتحان رقم #{examId}
          </h1>
<button
  onClick={() => router.back()}
  className="mb-6 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2"
>
  🔙 رجوع
</button>

          {/* زرار عرض الأسئلة الموجودة - يخفي لما نصل للحد */}
          {!reachedLimit && !existingQuestions && (
            <button
              onClick={fetchExistingQuestions}
              className="mb-6 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg text-white font-medium"
            >
              عرض الأسئلة الموجودة
            </button>
          )}

          {/* عرض الأسئلة الموجودة لو تم تحميلها */}
          {existingQuestions && (
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg mb-10">
              <h2 className="text-xl font-semibold mb-4">الأسئلة الموجودة ({existingQuestions.length})</h2>
              <ul className="space-y-4">
                {existingQuestions.map((q, i) => (
                  <li key={q.id} className="bg-gray-700 p-4 rounded-lg">
                    <p className="font-semibold mb-2">{i + 1}. {q.question_text}</p>
                    <ul className="grid grid-cols-2 gap-2 text-sm">
                      {q.choices.map((c, j) => (
                        <li
                          key={c.id}
                          className={`p-2 rounded-lg ${c.is_correct ? 'bg-green-700 text-white' : 'bg-gray-600'}`}
                        >
                          {c.choice_text} {c.is_correct && '✔️'}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* عرض نموذج إضافة سؤال جديد لو لم نصل للحد */}
          {!reachedLimit && (
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg mb-10">
              <h2 className="text-xl font-semibold mb-4">سؤال جديد</h2>

              <input
                type="text"
                placeholder="نص السؤال"
                className="w-full mb-5 p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
              />

              {choices.map((choice, index) => (
                <div key={index} className="flex items-center gap-3 mb-3">
                  <input
                    type="text"
                    placeholder={`الاختيار ${index + 1}`}
                    className="flex-1 p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none"
                    value={choice.choice_text}
                    onChange={(e) => {
                      const newChoices = [...choices]
                      newChoices[index].choice_text = e.target.value
                      setChoices(newChoices)
                    }}
                  />
                  <label className="flex items-center gap-2 text-sm">
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
                      className="form-radio text-green-500"
                    />
                    صحيحة
                  </label>
                </div>
              ))}

              <button
                onClick={handleAddQuestion}
                className="mt-6 bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg text-white font-medium"
              >
                ➕ إضافة السؤال
              </button>
            </div>
          )}

          {/* عرض الأسئلة المضافة */}
          {questions.length > 0 && (
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold mb-4">الأسئلة المُضافة ({questions.length}/10)</h2>

              <ul className="space-y-4 mb-6">
                {questions.map((q, i) => (
                  <li key={i} className="bg-gray-700 p-4 rounded-lg">
                    <p className="font-semibold mb-2">{i + 1}. {q.question_text}</p>
                    <ul className="grid grid-cols-2 gap-2 text-sm">
                      {q.choices.map((c, j) => (
                        <li
                          key={j}
                          className={`p-2 rounded-lg ${
                            c.is_correct ? 'bg-green-700 text-white' : 'bg-gray-600'
                          }`}
                        >
                          {c.choice_text} {c.is_correct && '✔️'}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>

              <button
                onClick={handleSubmitAll}
                className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold text-white text-lg"
              >
                💾 حفظ كل الأسئلة
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
