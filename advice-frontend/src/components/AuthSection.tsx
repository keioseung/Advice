'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, User, Users, Lock, Eye, EyeOff, Sparkles } from 'lucide-react'

interface AuthSectionProps {
  onLogin: (user: any) => void
}

export default function AuthSection({ onLogin }: AuthSectionProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [userType, setUserType] = useState<'father' | 'child'>('father')
  const [formData, setFormData] = useState({
    user_id: '',
    password: '',
    name: '',
    father_id: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register'
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          user_type: userType
        }),
      })

      if (response.ok) {
        const data = await response.json()
        onLogin(data)
      } else {
        const errorData = await response.json()
        setError(errorData.detail || '로그인에 실패했습니다.')
      }
    } catch (err) {
      setError('서버 연결에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <motion.div
      className="max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="glass-effect rounded-3xl p-8 love-border">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-block mb-4"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center mx-auto">
              {userType === 'father' ? (
                <User className="w-8 h-8 text-white" />
              ) : (
                <Users className="w-8 h-8 text-white" />
              )}
            </div>
          </motion.div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {isLogin ? '따뜻한 마음으로 로그인' : '가족과 함께 시작하기'}
          </h2>
          <p className="text-gray-600">
            {isLogin 
              ? '아버지의 사랑이 담긴 특별한 공간에 오신 것을 환영합니다 💝'
              : '자녀를 위한 특별한 선물을 준비해보세요 🌟'
            }
          </p>
        </div>

        {/* User Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <Sparkles className="w-4 h-4 inline mr-2" />
            나는...
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setUserType('father')}
              className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                userType === 'father'
                  ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-warm'
                  : 'border-gray-200 bg-white/50 text-gray-600 hover:border-primary-200'
              }`}
            >
              <User className="w-5 h-5 mx-auto mb-2" />
              <span className="text-sm font-medium">아버지</span>
            </button>
            <button
              type="button"
              onClick={() => setUserType('child')}
              className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                userType === 'child'
                  ? 'border-secondary-500 bg-secondary-50 text-secondary-700 shadow-warm'
                  : 'border-gray-200 bg-white/50 text-gray-600 hover:border-secondary-200'
              }`}
            >
              <Users className="w-5 h-5 mx-auto mb-2" />
              <span className="text-sm font-medium">자녀</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {userType === 'father' ? '아버지 ID' : '자녀 ID'}
            </label>
            <input
              type="text"
              value={formData.user_id}
              onChange={(e) => handleInputChange('user_id', e.target.value)}
              placeholder={userType === 'father' ? '아버지 ID를 입력하세요' : '자녀 ID를 입력하세요'}
              className="input-field"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="w-4 h-4 inline mr-2" />
              비밀번호
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="input-field pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Register Only Fields */}
          {!isLogin && (
            <>
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Heart className="w-4 h-4 inline mr-2" />
                  {userType === 'father' ? '아버지 이름' : '자녀 이름'}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder={userType === 'father' ? '아버지 이름을 입력하세요' : '자녀 이름을 입력하세요'}
                  className="input-field"
                  required
                />
              </div>

              {/* Father ID for Child */}
              {userType === 'child' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    아버지 ID
                  </label>
                  <input
                    type="text"
                    value={formData.father_id}
                    onChange={(e) => handleInputChange('father_id', e.target.value)}
                    placeholder="아버지 ID를 입력하세요"
                    className="input-field"
                    required
                  />
                </div>
              )}
            </>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              className="bg-love-50 border border-love-200 text-love-700 px-4 py-3 rounded-2xl text-sm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {error}
            </motion.div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full touch-optimized disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {isLogin ? '로그인 중...' : '가입 중...'}
              </div>
            ) : (
              <span className="flex items-center justify-center">
                <Heart className="w-5 h-5 mr-2" />
                {isLogin ? '따뜻한 마음으로 로그인' : '가족과 함께 시작하기'}
              </span>
            )}
          </button>
        </form>

        {/* Toggle Login/Register */}
        <div className="text-center mt-6">
          <button
            onClick={() => {
              setIsLogin(!isLogin)
              setError('')
              setFormData({ user_id: '', password: '', name: '', father_id: '' })
            }}
            className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
          >
            {isLogin ? '처음이신가요? 가입하기' : '이미 계정이 있으신가요? 로그인하기'}
          </button>
        </div>
      </div>
    </motion.div>
  )
} 