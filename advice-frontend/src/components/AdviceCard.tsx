'use client'

import { motion } from 'framer-motion'
import { Star, Calendar, User, Image, Video } from 'lucide-react'

interface AdviceCardProps {
  advice: any
  onClick: () => void
  userType: 'father' | 'child'
  onToggleFavorite?: () => void
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

export default function AdviceCard({ advice, onClick, userType, onToggleFavorite }: AdviceCardProps) {
  return (
    <motion.div
      className="glass-effect rounded-2xl p-6 cursor-pointer card-hover"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            {getCategoryEmoji(advice.category)} {getCategoryName(advice.category)}
          </span>
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <User className="w-4 h-4" />
            {advice.target_age}세에게
          </span>
        </div>
        
        {userType === 'child' && onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite()
            }}
            className="text-2xl hover:scale-110 transition-transform"
          >
            {advice.is_favorite ? '⭐' : '☆'}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-700 leading-relaxed line-clamp-3">
          {advice.content}
        </p>
        
        {/* Media Display */}
        {advice.media_url && (
          <div className="mt-4">
            {advice.media_type === 'image' ? (
              <div className="relative rounded-lg overflow-hidden">
                <img 
                  src={advice.media_url} 
                  alt="첨부 이미지"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                  <Image className="w-3 h-3" />
                  이미지
                </div>
              </div>
            ) : advice.media_type === 'video' ? (
              <div className="relative rounded-lg overflow-hidden">
                <video 
                  src={advice.media_url}
                  className="w-full h-48 object-cover"
                  controls
                />
                <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                  <Video className="w-3 h-3" />
                  영상
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {advice.date}
        </div>
        
        <div className="flex items-center gap-2">
          {userType === 'child' && advice.is_favorite && (
            <div className="flex items-center gap-1 text-yellow-600">
              <Star className="w-4 h-4" />
              <span>즐겨찾기</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
} 