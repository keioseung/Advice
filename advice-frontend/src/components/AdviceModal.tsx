'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, User, Heart } from 'lucide-react'

interface AdviceModalProps {
  advice: any
  onClose: () => void
  userType: 'father' | 'child'
}

const getCategoryEmoji = (category: string) => {
  const emojis: { [key: string]: string } = {
    'life': '💡',
    'love': '💕',
    'career': '💼',
    'health': '🏃‍♂️',
    'money': '💰',
    'friendship': '👥',
    'study': '📚',
    'hobby': '🎨',
    'dream': '🌟'
  }
  return emojis[category] || '💝'
}

const getCategoryName = (category: string) => {
  const names: { [key: string]: string } = {
    'life': '인생 조언',
    'love': '사랑 이야기',
    'career': '진로/직업',
    'health': '건강',
    'money': '돈 관리',
    'friendship': '인간관계',
    'study': '공부/학습',
    'hobby': '취미/여가',
    'dream': '꿈과 목표'
  }
  return names[category] || category
}

export default function AdviceModal({ advice, onClose, userType }: AdviceModalProps) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="glass-effect rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {getCategoryEmoji(advice.category)} {getCategoryName(advice.category)}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {advice.target_age}세의 {userType === 'father' ? '우리 아이' : '나'}에게
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {advice.date}에 작성
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <Heart className="w-6 h-6 text-primary-500 mt-1 flex-shrink-0" />
              <div className="text-gray-700 leading-relaxed text-lg">
                {advice.content}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              {userType === 'father' 
                ? '아이에게 전하는 아버지의 마음'
                : '아버지가 전하는 특별한 메시지'
              }
            </div>
            
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              닫기
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
} 