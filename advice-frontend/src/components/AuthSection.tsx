'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Users, Lock, LogIn } from 'lucide-react'

interface AuthSectionProps {
  onLogin: (user: any) => void
}

export default function AuthSection({ onLogin }: AuthSectionProps) {
  const [userType, setUserType] = useState<'father' | 'child'>('father')
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [fatherId, setFatherId] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // 실제로는 서버에서 인증을 처리해야 합니다
    const user = {
      id: Date.now().toString(),
      user_id: userId,
      user_type: userType,
      name: userId,
      father_id: userType === 'child' ? fatherId : undefined
    }
    
    onLogin(user)
  }

  return (
    <motion.div 
      className="glass-effect rounded-3xl p-8 max-w-md mx-auto"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {/* User Type Selector */}
      <div className="flex gap-4 mb-8 justify-center">
        <button
          onClick={() => setUserType('father')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${
            userType === 'father'
              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
              : 'bg-white/50 text-gray-600 hover:bg-white/70'
          }`}
        >
          <User className="w-5 h-5" />
          아버지
        </button>
        <button
          onClick={() => setUserType('child')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${
            userType === 'child'
              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
              : 'bg-white/50 text-gray-600 hover:bg-white/70'
          }`}
        >
          <Users className="w-5 h-5" />
          자녀
        </button>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            사용자 ID
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="input-field pl-10"
              placeholder="사용자 ID를 입력하세요"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            비밀번호
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field pl-10"
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>
        </div>

        {userType === 'child' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              아버지 ID
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={fatherId}
                onChange={(e) => setFatherId(e.target.value)}
                className="input-field pl-10"
                placeholder="아버지의 ID를 입력하세요"
                required
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <LogIn className="w-5 h-5" />
          로그인
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          {userType === 'father' 
            ? '아이를 위한 특별한 조언을 작성해보세요'
            : '아버지가 준비한 특별한 메시지를 확인해보세요'
          }
        </p>
      </div>
    </motion.div>
  )
} 