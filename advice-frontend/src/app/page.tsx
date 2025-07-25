'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, Star, User, Users } from 'lucide-react'
import AuthSection from '@/components/AuthSection'
import FatherDashboard from '@/components/FatherDashboard'
import ChildDashboard from '@/components/ChildDashboard'

export default function Home() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userType, setUserType] = useState<'father' | 'child'>('father')

  const handleLogin = (user: any) => {
    setCurrentUser(user)
    setUserType(user.user_type)
  }

  const handleLogout = () => {
    setCurrentUser(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.h1 
            className="text-4xl md:text-6xl font-bold text-white mb-4"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            👨‍👦 애비의 조언
          </motion.h1>
          <motion.p 
            className="text-xl text-white/90 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            미래의 나, 그리고 우리 아이를 위한 특별한 메시지
          </motion.p>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {!currentUser ? (
            <AuthSection onLogin={handleLogin} />
          ) : userType === 'father' ? (
            <FatherDashboard user={currentUser} onLogout={handleLogout} />
          ) : (
            <ChildDashboard user={currentUser} onLogout={handleLogout} />
          )}
        </motion.div>

        {/* Features Section */}
        {!currentUser && (
          <motion.div 
            className="mt-20 grid md:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="glass-effect rounded-2xl p-8 text-center">
              <Heart className="w-12 h-12 text-primary-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">사랑의 메시지</h3>
              <p className="text-gray-600">
                아버지의 마음을 담은 특별한 조언들을 미래의 아이에게 전달합니다
              </p>
            </div>
            
            <div className="glass-effect rounded-2xl p-8 text-center">
              <MessageCircle className="w-12 h-12 text-primary-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">시대별 조언</h3>
              <p className="text-gray-600">
                나이에 맞는 적절한 시점에 조언을 전달하여 더욱 의미있게 만듭니다
              </p>
            </div>
            
            <div className="glass-effect rounded-2xl p-8 text-center">
              <Star className="w-12 h-12 text-primary-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">소중한 추억</h3>
              <p className="text-gray-600">
                시간이 지나도 변하지 않는 아버지의 사랑과 지혜를 보관합니다
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
} 