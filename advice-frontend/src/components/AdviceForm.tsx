'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Send, Heart, BookOpen, DollarSign, Users, GraduationCap, Palette, Target, Image, Video, X, Lock, Calendar, Key } from 'lucide-react'

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
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null)
  const [unlockType, setUnlockType] = useState<'age' | 'password'>('age')
  const [password, setPassword] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')
    
    if (!isImage && !isVideo) {
      alert('이미지(.jpg, .png, .gif) 또는 영상(.mp4, .mov) 파일만 업로드 가능해요.')
      return
    }

    setMediaFile(file)
    setMediaType(isImage ? 'image' : 'video')
    
    // 미리보기 생성
    const reader = new FileReader()
    reader.onload = (e) => {
      setMediaPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeMedia = () => {
    setMediaFile(null)
    setMediaPreview(null)
    setMediaType(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!targetAge || !content.trim()) return

    const newAdvice = {
      category,
      target_age: parseInt(targetAge),
      content: content.trim(),
      mediaFile,
      mediaType,
      unlockType,
      password: unlockType === 'password' ? password : null
    }

    onAddAdvice(newAdvice)
    
    // 폼 초기화
    setTargetAge('')
    setContent('')
    setMediaFile(null)
    setMediaPreview(null)
    setMediaType(null)
    setPassword('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
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

        {/* Future Advice Settings */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            🔒 미래 조언 설정
          </label>
          <div className="space-y-4">
            {/* Unlock Type Selection */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUnlockType('age')}
                className={`p-3 rounded-xl text-sm transition-all duration-300 flex items-center gap-2 ${
                  unlockType === 'age'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white/50 text-gray-600 hover:bg-white/70'
                }`}
              >
                <Calendar className="w-4 h-4" />
                나이 기반 자동 해제
              </button>
              <button
                type="button"
                onClick={() => setUnlockType('password')}
                className={`p-3 rounded-xl text-sm transition-all duration-300 flex items-center gap-2 ${
                  unlockType === 'password'
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'bg-white/50 text-gray-600 hover:bg-white/70'
                }`}
              >
                <Key className="w-4 h-4" />
                패스워드 해제
              </button>
            </div>

            {/* Password Input */}
            {unlockType === 'password' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  해제 패스워드
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="예: 사랑해, love, 특별한단어"
                  required={unlockType === 'password'}
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 자녀가 기억하기 쉬운 특별한 단어나 문구를 입력하세요
                </p>
              </div>
            )}

            {/* Age-based unlock info */}
            {unlockType === 'age' && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-sm text-blue-700">
                  📅 {targetAge}세가 되면 자동으로 조언을 받을 수 있어요
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Media Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            사진/영상 첨부 (선택사항)
          </label>
          
          {!mediaPreview ? (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-500 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-2 text-gray-500 hover:text-primary-500"
              >
                <div className="flex gap-2">
                  <Image className="w-6 h-6" />
                  <Video className="w-6 h-6" />
                </div>
                <span className="text-sm">클릭하여 사진 또는 영상 업로드</span>
                <span className="text-xs">JPG, PNG, GIF, MP4, MOV 지원</span>
              </button>
            </div>
          ) : (
            <div className="relative">
              {mediaType === 'image' ? (
                <img 
                  src={mediaPreview} 
                  alt="미리보기" 
                  className="w-full h-48 object-cover rounded-xl"
                />
              ) : (
                <video 
                  src={mediaPreview} 
                  className="w-full h-48 object-cover rounded-xl"
                  controls
                />
              )}
              <button
                type="button"
                onClick={removeMedia}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                {mediaType === 'image' ? '📷 이미지' : '🎥 영상'}
              </div>
            </div>
          )}
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