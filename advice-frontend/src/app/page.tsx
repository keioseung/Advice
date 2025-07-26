'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Sparkles, Users, BookOpen, MessageCircle, Star } from 'lucide-react'
import AuthSection from '@/components/AuthSection'
import FatherDashboard from '@/components/FatherDashboard'
import ChildDashboard from '@/components/ChildDashboard'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 확인
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const handleLogin = (userData: any) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  if (loading) {
    return (
      <div className="min-h-screen warm-bg flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="heartbeat mb-4">
            <Heart className="w-16 h-16 text-primary-500 mx-auto" />
          </div>
          <p className="text-gray-600 font-medium">따뜻한 마음을 담아 로딩 중...</p>
        </motion.div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="min-h-screen warm-bg family-emoji-bg">
        <div className="mobile-optimized py-6">
          {user.user_type === 'father' ? (
            <FatherDashboard user={user} onLogout={handleLogout} />
          ) : (
            <ChildDashboard user={user} onLogout={handleLogout} />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen warm-bg family-emoji-bg">
      <div className="mobile-optimized py-6">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6">
            <motion.div
              className="inline-block mb-4"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Heart className="w-16 h-16 text-love-500 mx-auto" />
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary-500 via-secondary-500 to-love-500 bg-clip-text text-transparent mb-4">
              애비의 조언
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 font-medium">
              아버지의 따뜻한 마음이 담긴 특별한 선물 💝
            </p>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          className="grid md:grid-cols-3 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.div
            className="glass-effect rounded-3xl p-6 text-center love-border"
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">따뜻한 조언</h3>
            <p className="text-gray-600 text-sm">
              아버지가 자녀를 위해 준비한 특별한 메시지들
            </p>
          </motion.div>

          <motion.div
            className="glass-effect rounded-3xl p-6 text-center love-border"
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="w-12 h-12 bg-gradient-to-r from-secondary-500 to-love-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">가족 연결</h3>
            <p className="text-gray-600 text-sm">
              세대를 넘어선 아버지와 자녀의 소통 공간
            </p>
          </motion.div>

          <motion.div
            className="glass-effect rounded-3xl p-6 text-center love-border"
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="w-12 h-12 bg-gradient-to-r from-love-500 to-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">성장 동반</h3>
            <p className="text-gray-600 text-sm">
              나이에 맞는 조언으로 함께하는 성장 여정
            </p>
          </motion.div>
        </motion.div>

        {/* Auth Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <AuthSection onLogin={handleLogin} />
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center mt-16 pt-8 border-t border-white/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary-500" />
            <span className="text-sm text-gray-500">따뜻한 마음으로 만든 특별한 선물</span>
            <Star className="w-4 h-4 text-secondary-500" />
          </div>
          <p className="text-xs text-gray-400">
            아버지의 사랑이 담긴 디지털 조언 앱 💕
          </p>
        </motion.div>
      </div>
    </div>
  )
} 