'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Users, Lock, LogIn, UserPlus, Mail } from 'lucide-react'

interface AuthSectionProps {
  onLogin: (user: any) => void
}

export default function AuthSection({ onLogin }: AuthSectionProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [userType, setUserType] = useState<'father' | 'child'>('father')
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [fatherId, setFatherId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (!isLogin && password !== confirmPassword) {
        setError('비밀번호가 일치하지 않습니다.')
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const endpoint = isLogin ? '/auth/login' : '/auth/register'
      
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          password: password,
          user_type: userType,
          name: name,
          father_id: userType === 'child' ? fatherId : undefined
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || '오류가 발생했습니다.')
      }

      // 로그인 성공 시 사용자 정보 저장
      const user = {
        id: Date.now().toString(),
        user_id: userId,
        user_type: userType,
        name: name,
        father_id: userType === 'child' ? fatherId : undefined,
        token: data.access_token
      }

      onLogin(user)
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setUserId('')
    setPassword('')
    setConfirmPassword('')
    setName('')
    setFatherId('')
    setError('')
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    resetForm()
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

      {/* Mode Toggle */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {isLogin ? '로그인' : '회원가입'}
        </h2>
        <button
          onClick={toggleMode}
          className="text-primary-600 hover:text-primary-700 text-sm underline"
        >
          {isLogin ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name (회원가입 시에만) */}
        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이름
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field pl-10"
                placeholder="이름을 입력하세요"
                required={!isLogin}
              />
            </div>
          </div>
        )}

        {/* User ID */}
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

        {/* Password */}
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

        {/* Confirm Password (회원가입 시에만) */}
        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호 확인
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field pl-10"
                placeholder="비밀번호를 다시 입력하세요"
                required={!isLogin}
              />
            </div>
          </div>
        )}

        {/* Father ID (자녀 모드일 때만) */}
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              {isLogin ? '로그인' : '회원가입'}
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          {isLogin 
            ? '아이를 위한 특별한 조언을 작성해보세요'
            : '아버지가 준비한 특별한 메시지를 확인해보세요'
          }
        </p>
      </div>
    </motion.div>
  )
} 