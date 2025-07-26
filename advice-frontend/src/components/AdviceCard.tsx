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
              <div className="relative rounded-lg overflow-hidden bg-gray-100">
                <img 
                  src={advice.media_url} 
                  alt="첨부 이미지"
                  className="w-full h-48 object-cover"
                  onLoad={(e) => {
                    console.log('Image loaded successfully:', advice.media_url)
                  }}
                  onError={(e) => {
                    console.error('Image failed to load:', advice.media_url)
                    // 이미지 로드 실패 시 기본 이미지 표시
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="w-full h-48 flex items-center justify-center bg-gray-200 rounded-lg">
                          <div class="text-center">
                            <div class="text-gray-500 mb-2">📷</div>
                            <div class="text-sm text-gray-600">이미지를 불러올 수 없습니다</div>
                            <div class="text-xs text-gray-400 mt-1">URL: ${advice.media_url}</div>
                          </div>
                        </div>
                      `;
                    }
                  }}
                />
                <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                  <Image className="w-3 h-3" />
                  이미지
                </div>
              </div>
            ) : advice.media_type === 'video' ? (
              <div className="relative rounded-lg overflow-hidden bg-gray-100">
                <video 
                  src={advice.media_url}
                  className="w-full h-48 object-cover"
                  controls
                  onLoadStart={() => {
                    console.log('Video loading started:', advice.media_url)
                  }}
                  onError={(e) => {
                    console.error('Video failed to load:', advice.media_url)
                    // 비디오 로드 실패 시 기본 메시지 표시
                    const target = e.target as HTMLVideoElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="w-full h-48 flex items-center justify-center bg-gray-200 rounded-lg">
                          <div class="text-center">
                            <div class="text-gray-500 mb-2">🎥</div>
                            <div class="text-sm text-gray-600">영상을 불러올 수 없습니다</div>
                            <div class="text-xs text-gray-400 mt-1">URL: ${advice.media_url}</div>
                          </div>
                        </div>
                      `;
                    }
                  }}
                />
                <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                  <Video className="w-3 h-3" />
                  영상
                </div>
              </div>
            ) : (
              // media_type이 없는 경우 기본 표시
              <div className="relative rounded-lg overflow-hidden bg-gray-100">
                <div className="w-full h-48 flex items-center justify-center bg-gray-200 rounded-lg">
                  <div className="text-center">
                    <div className="text-gray-500 mb-2">📎</div>
                    <div className="text-sm text-gray-600">첨부 파일</div>
                    <div className="text-xs text-gray-400 mt-1">URL: {advice.media_url}</div>
                  </div>
                </div>
              </div>
            )}
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