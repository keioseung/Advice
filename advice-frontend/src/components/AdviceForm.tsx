'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Heart, BookOpen, DollarSign, Users, GraduationCap, Palette, Target } from 'lucide-react'

interface AdviceFormProps {
  onAddAdvice: (advice: any) => void
}

const categories = [
  { key: 'life', label: '💡 인생 조언', icon: Heart },
  { key: 'love', label: '💕 사랑 이야기', icon: Heart },
  { key: 'career', label: '💼 진로/직업', icon: BookOpen },
  { key: 'health', label: '🏃‍♂️ 건강', icon: Heart },
  { key: 'money', label: '💰 돈 관리', icon: DollarSign },
  { key: 'friendship', label: '👥 인간관계', icon: Users },
  { key: 'study', label: '📚 공부/학습', icon: GraduationCap },
  { key: 'hobby', label: '🎨 취미/여가', icon: Palette },
  { key: 'dream', label: '🌟 꿈과 목표', icon: Target }
]

export default function AdviceForm({ onAddAdvice }: AdviceFormProps) {
  const [category, setCategory] = useState('life')
  const [targetAge, setTargetAge] = useState('')
  const [content, setContent] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!targetAge || !content.trim()) return

    const newAdvice = {
      category,
      target_age: parseInt(targetAge),
      content: content.trim()
    }

    onAddAdvice(newAdvice)
    
    // 폼 초기화
    setTargetAge('')
    setContent('')
  }

  return (
    <motion.div 
      className="glass-effect rounded-2xl p-6"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <Heart className="w-6 h-6 text-primary-500" />
        새로운 조언 작성
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            카테고리
          </label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setCategory(key)}
                className={`p-3 rounded-xl text-sm transition-all duration-300 ${
                  category === key
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'bg-white/50 text-gray-600 hover:bg-white/70'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Target Age */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            몇 살 때 보여줄까요?
          </label>
          <input
            type="number"
            value={targetAge}
            onChange={(e) => setTargetAge(e.target.value)}
            className="input-field"
            placeholder="예: 20"
            min="0"
            max="100"
            required
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            조언 내용
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="input-field min-h-[120px] resize-none"
            placeholder="아이에게 전하고 싶은 마음을 적어보세요..."
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn-primary w-full flex items-center justify-center gap-2"
          disabled={!targetAge || !content.trim()}
        >
          <Send className="w-5 h-5" />
          조언 저장하기
        </button>
      </form>

      <div className="mt-6 p-4 bg-blue-50 rounded-xl">
        <p className="text-sm text-blue-700">
          💡 <strong>팁:</strong> 아이가 그 나이에 맞는 조언을 받을 수 있도록 
          구체적이고 따뜻한 마음을 담아 작성해보세요.
        </p>
      </div>
    </motion.div>
  )
} 