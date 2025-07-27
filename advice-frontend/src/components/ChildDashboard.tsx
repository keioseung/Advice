'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  LogOut, 
  Heart, 
  Star, 
  Lock, 
  Filter,
  Sparkles,
  Gift,
  Users,
  MessageCircle,
  Key,
  Calendar,
  BarChart3,
  Settings
} from 'lucide-react'
import AdviceCard from './AdviceCard'
import AdviceModal from './AdviceModal'

interface ChildDashboardProps {
  user: any
  onLogout: () => void
}

export default function ChildDashboard({ user, onLogout }: ChildDashboardProps) {
  const [advices, setAdvices] = useState<any[]>([])
  const [filter, setFilter] = useState('available')
  const [selectedAdvice, setSelectedAdvice] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [currentAge, setCurrentAge] = useState(25)
  const [fatherName, setFatherName] = useState('')
  const [showFatherNameInput, setShowFatherNameInput] = useState(true)
  const [unlockedAdvices, setUnlockedAdvices] = useState<string[]>([])
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [selectedFutureAdvice, setSelectedFutureAdvice] = useState<any>(null)
  const [password, setPassword] = useState('')
  const [showAgeModal, setShowAgeModal] = useState(false)
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [ageDistribution, setAgeDistribution] = useState<any>(null)
  const [newAge, setNewAge] = useState('')

  // 실제 API에서 조언 데이터 가져오기
  useEffect(() => {
    const fetchAdvices = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/advices`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          setAdvices(data)
        } else {
          console.error('조언을 가져오는데 실패했습니다:', response.status)
        }
      } catch (error) {
        console.error('조언을 가져오는 중 오류 발생:', error)
      }
    }

    fetchAdvices()
  }, [])

  // 사용자 정보와 통계 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        // 사용자 정보 가져오기
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (userResponse.ok) {
          const userData = await userResponse.json()
          if (userData.age) {
            setCurrentAge(userData.age)
          }
        }

        // 통계 가져오기
        const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setCurrentAge(statsData.current_age)
        }
      } catch (error) {
        console.error('사용자 정보를 가져오는 중 오류 발생:', error)
      }
    }

    fetchUserInfo()
  }, [])

  const handleAdviceClick = (advice: any) => {
    setSelectedAdvice(advice)
    setShowModal(true)
  }

  const handleToggleFavorite = (adviceId: number) => {
    setAdvices(prev => prev.map(a => 
      a.id === adviceId ? { ...a, is_favorite: !a.is_favorite } : a
    ))
  }

  const handleFutureAdviceClick = (advice: any) => {
    setSelectedFutureAdvice(advice)
    setShowPasswordModal(true)
  }

  const handlePasswordSubmit = () => {
    // 선택된 조언의 패스워드와 비교
    if (selectedFutureAdvice && selectedFutureAdvice.password && password === selectedFutureAdvice.password) {
      setUnlockedAdvices(prev => [...prev, selectedFutureAdvice.id])
      setShowPasswordModal(false)
      setPassword('')
      setSelectedFutureAdvice(null)
    } else {
      alert('패스워드가 틀렸어요. 다시 시도해보세요!')
    }
  }

  const handleAgeUpdate = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/age`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ age: parseInt(newAge) })
      })

      if (response.ok) {
        setCurrentAge(parseInt(newAge))
        setShowAgeModal(false)
        setNewAge('')
        alert('나이가 성공적으로 업데이트되었습니다!')
      } else {
        const error = await response.json()
        alert(error.detail || '나이 업데이트에 실패했습니다.')
      }
    } catch (error) {
      console.error('나이 업데이트 중 오류 발생:', error)
      alert('나이 업데이트 중 오류가 발생했습니다.')
    }
  }

  const handleShowStats = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stats/age-distribution`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAgeDistribution(data)
        setShowStatsModal(true)
      } else {
        console.error('통계를 가져오는데 실패했습니다:', response.status)
      }
    } catch (error) {
      console.error('통계를 가져오는 중 오류 발생:', error)
    }
  }

  // 패스워드로 잠긴 미래 조언은 숨기고, 해제된 조언만 보여주기
  const filteredAdvices = advices.filter(advice => {
    if (filter === 'available') {
      // 현재 나이에 읽을 수 있거나 해제된 조언만
      return advice.target_age <= currentAge || unlockedAdvices.includes(advice.id)
    }
    if (filter === 'future') {
      // 미래 조언 중에서 해제된 것만 보여주기
      return advice.target_age > currentAge && unlockedAdvices.includes(advice.id)
    }
    if (filter === 'password') {
      // 패스워드로 해제 가능한 미래 조언들
      return advice.target_age > currentAge && advice.unlock_type === 'password' && !unlockedAdvices.includes(advice.id)
    }
    if (filter === 'favorites') {
      // 즐겨찾기 중에서 현재 읽을 수 있거나 해제된 것만
      return advice.is_favorite && (advice.target_age <= currentAge || unlockedAdvices.includes(advice.id))
    }
    return true
  })

  // 미래 조언 중 패스워드로 해제 가능한 것들
  const passwordLockedAdvices = advices.filter(advice => 
    advice.target_age > currentAge && 
    advice.unlock_type === 'password' && 
    !unlockedAdvices.includes(advice.id)
  )

  const availableAdvices = advices.filter(a => a.target_age <= currentAge)
  const unlockedFutureAdvices = advices.filter(a => a.target_age > currentAge && unlockedAdvices.includes(a.id))
  const favoriteAdvices = advices.filter(a => a.is_favorite && (a.target_age <= currentAge || unlockedAdvices.includes(a.id)))

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-secondary-500 to-love-500 bg-clip-text text-transparent mb-2">
            안녕, {user.name}! 🌟
          </h2>
          <p className="text-lg text-gray-600 font-medium">
            {fatherName ? `${fatherName}님이 당신을 위해 준비한 특별한 선물이 있어요 💝` : '아버지가 당신을 위해 준비한 특별한 선물이 있어요 💝'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAgeModal(true)}
            className="btn-secondary flex items-center gap-2 touch-optimized"
          >
            <Calendar className="w-4 h-4" />
            나이 설정
          </button>
          <button
            onClick={handleShowStats}
            className="btn-secondary flex items-center gap-2 touch-optimized"
          >
            <BarChart3 className="w-4 h-4" />
            통계 보기
          </button>
          <button
            onClick={onLogout}
            className="btn-secondary flex items-center gap-2 touch-optimized"
          >
            <LogOut className="w-4 h-4" />
            로그아웃
          </button>
        </div>
      </motion.div>

      {/* Father Name Input */}
      {showFatherNameInput && (
        <motion.div 
          className="glass-effect rounded-3xl p-8 love-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="text-center">
            <motion.div
              className="inline-block mb-6"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-20 h-20 bg-gradient-to-r from-secondary-500 to-love-500 rounded-3xl flex items-center justify-center mx-auto">
                <Users className="w-10 h-10 text-white" />
              </div>
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              아버지의 이름을 알려주세요 💝
            </h3>
            <p className="text-gray-600 mb-8">
              아버지가 준비한 특별한 선물을 받기 위해 아버지의 이름을 알려주세요.<br/>
              로그인할 때 입력한 아버지 ID와 연결됩니다.
            </p>
            <div className="flex gap-4 justify-center items-center max-w-md mx-auto">
              <input
                type="text"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                placeholder="아버지 이름"
                className="input-field flex-1"
              />
              <button
                onClick={() => setShowFatherNameInput(false)}
                disabled={!fatherName.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed touch-optimized"
              >
                <Heart className="w-5 h-5 mr-2" />
                선물 받기
              </button>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              💡 아버지의 실제 이름을 입력해주세요 (예: 김철수)
            </div>
          </div>
        </motion.div>
      )}

      {/* Profile Card */}
      <motion.div 
        className="glass-effect rounded-3xl p-8 love-border"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="flex items-center gap-6">
          <motion.div 
            className="w-20 h-20 bg-gradient-to-r from-secondary-500 to-love-500 rounded-3xl flex items-center justify-center"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Gift className="w-10 h-10 text-white" />
          </motion.div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {user.name}의 특별한 선물 🎁
            </h3>
            <p className="text-gray-600 text-lg">
              현재 {currentAge}세, {availableAdvices.length}개의 선물을 받을 수 있어요!
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div 
        className="grid md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <motion.div 
          className="glass-effect rounded-3xl p-6 text-center love-border"
          whileHover={{ scale: 1.05, y: -5 }}
          transition={{ duration: 0.3 }}
        >
          <Heart className="w-10 h-10 text-love-500 mx-auto mb-3" />
          <div className="text-3xl font-bold text-gray-800 mb-1">{availableAdvices.length}</div>
          <div className="text-sm text-gray-600">지금 받을 수 있는 선물</div>
        </motion.div>
        
        <motion.div 
          className="glass-effect rounded-3xl p-6 text-center love-border"
          whileHover={{ scale: 1.05, y: -5 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Lock className="w-10 h-10 text-gray-500 mx-auto mb-3" />
          <div className="text-3xl font-bold text-gray-800 mb-1">{unlockedFutureAdvices.length}</div>
          <div className="text-sm text-gray-600">해제된 미래 선물</div>
        </motion.div>
        
        <motion.div 
          className="glass-effect rounded-3xl p-6 text-center love-border"
          whileHover={{ scale: 1.05, y: -5 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <Key className="w-10 h-10 text-purple-500 mx-auto mb-3" />
          <div className="text-3xl font-bold text-gray-800 mb-1">{passwordLockedAdvices.length}</div>
          <div className="text-sm text-gray-600">패스워드 해제 가능</div>
        </motion.div>
        
        <motion.div 
          className="glass-effect rounded-3xl p-6 text-center love-border"
          whileHover={{ scale: 1.05, y: -5 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Star className="w-10 h-10 text-warm-500 mx-auto mb-3" />
          <div className="text-3xl font-bold text-gray-800 mb-1">{favoriteAdvices.length}</div>
          <div className="text-sm text-gray-600">마음에 든 선물</div>
        </motion.div>
      </motion.div>

      {/* Filter Buttons */}
      <motion.div 
        className="flex gap-3 flex-wrap"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        {[
          { key: 'available', label: '💝 지금 받을 수 있는 선물', icon: Heart },
          { key: 'future', label: '🔓 해제된 미래 선물', icon: Lock },
          { key: 'password', label: '🔑 패스워드 해제', icon: Key },
          { key: 'favorites', label: '⭐ 마음에 든 선물', icon: Star }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-sm font-medium transition-all duration-300 touch-optimized ${
              filter === key
                ? 'bg-gradient-to-r from-secondary-500 to-love-500 text-white shadow-warm-lg'
                : 'bg-white/50 text-gray-600 hover:bg-white/70 hover:shadow-warm'
            }`}
          >
            <Icon className="w-5 h-5" />
            {label}
          </button>
        ))}
      </motion.div>

      {/* Advice List */}
      <motion.div 
        className="glass-effect rounded-3xl p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {filter === 'available' && '💝 지금 받을 수 있는 선물'}
              {filter === 'future' && '🔓 해제된 미래 선물'}
              {filter === 'password' && '🔑 패스워드로 해제 가능한 선물'}
              {filter === 'favorites' && '⭐ 마음에 든 선물'}
            </h3>
            <p className="text-gray-600">
              {fatherName ? `${fatherName}님이 준비한 특별한 메시지들` : '아버지가 준비한 특별한 메시지들'}
            </p>
          </div>
          <Filter className="w-6 h-6 text-gray-500" />
        </div>

        <div className="space-y-6">
          {filteredAdvices.map((advice, index) => (
            <motion.div
              key={advice.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <AdviceCard
                advice={advice}
                onClick={() => handleAdviceClick(advice)}
                userType="child"
                onToggleFavorite={() => handleToggleFavorite(advice.id)}
              />
            </motion.div>
          ))}
          
          {filteredAdvices.length === 0 && (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-20 h-20 bg-gradient-to-r from-secondary-100 to-love-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-secondary-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {filter === 'available' && '아직 받을 수 있는 선물이 없어요 😊'}
                {filter === 'future' && '해제된 미래 선물이 없어요 🔒'}
                {filter === 'password' && '패스워드로 해제 가능한 선물이 없어요 🔑'}
                {filter === 'favorites' && '마음에 든 선물이 없어요 ⭐'}
              </h3>
              <p className="text-gray-600">
                {filter === 'available' && '조금만 기다리면 아버지가 준비한 특별한 선물을 받을 수 있어요!'}
                {filter === 'future' && '패스워드를 입력하면 미래의 선물을 미리 받을 수 있어요!'}
                {filter === 'password' && '아버지가 설정한 패스워드를 입력하면 미래의 선물을 받을 수 있어요!'}
                {filter === 'favorites' && '마음에 드는 선물에 별표를 눌러보세요!'}
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Modal */}
      {showModal && selectedAdvice && (
        <AdviceModal
          advice={selectedAdvice}
          onClose={() => setShowModal(false)}
          userType="child"
        />
      )}

      {/* Password Modal */}
      {showPasswordModal && selectedFutureAdvice && (
        <motion.div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className="glass-effect rounded-3xl p-8 max-w-md w-full love-border"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="text-center">
              <motion.div
                className="inline-block mb-6"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-secondary-500 to-love-500 rounded-3xl flex items-center justify-center mx-auto">
                  <Lock className="w-8 h-8 text-white" />
                </div>
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                🔒 미래의 특별한 선물
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                이 선물은 {selectedFutureAdvice.target_age}세에 받을 수 있어요.<br/>
                패스워드를 입력하면 지금 받을 수 있어요!
              </p>
              
              <div className="space-y-6">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="패스워드를 입력하세요"
                  className="input-field text-center text-lg"
                  onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                />
                
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowPasswordModal(false)
                      setPassword('')
                      setSelectedFutureAdvice(null)
                    }}
                    className="btn-secondary flex-1 touch-optimized"
                  >
                    나중에 받기
                  </button>
                  <button
                    onClick={handlePasswordSubmit}
                    className="btn-primary flex-1 touch-optimized"
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    선물 받기
                  </button>
                </div>
                
                <div className="bg-warm-50 border border-warm-200 rounded-2xl p-4">
                  <p className="text-sm text-warm-700">
                    💡 힌트: 아버지가 가장 많이 하는 말
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Age Setting Modal */}
      {showAgeModal && (
        <motion.div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className="glass-effect rounded-3xl p-8 max-w-md w-full love-border"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="text-center">
              <motion.div
                className="inline-block mb-6"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-secondary-500 to-love-500 rounded-3xl flex items-center justify-center mx-auto">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                🎂 나이 설정
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                현재 나이를 설정하면<br/>
                받을 수 있는 선물이 정확히 표시됩니다!
              </p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    현재 나이
                  </label>
                  <input
                    type="number"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    placeholder={`현재 나이 (${currentAge}세)`}
                    className="input-field text-center text-lg"
                    min="0"
                    max="120"
                    onKeyPress={(e) => e.key === 'Enter' && handleAgeUpdate()}
                  />
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowAgeModal(false)
                      setNewAge('')
                    }}
                    className="btn-secondary flex-1 touch-optimized"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleAgeUpdate}
                    disabled={!newAge || parseInt(newAge) < 0 || parseInt(newAge) > 120}
                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed touch-optimized"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    나이 설정
                  </button>
                </div>
                
                <div className="bg-warm-50 border border-warm-200 rounded-2xl p-4">
                  <p className="text-sm text-warm-700">
                    💡 현재 나이: {currentAge}세
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Stats Modal */}
      {showStatsModal && ageDistribution && (
        <motion.div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className="glass-effect rounded-3xl p-8 max-w-4xl w-full love-border max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="text-center mb-8">
              <motion.div
                className="inline-block mb-6"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-secondary-500 to-love-500 rounded-3xl flex items-center justify-center mx-auto">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                📊 연령별 메시지 통계
              </h3>
              <p className="text-gray-600 text-lg">
                아버지가 준비한 메시지들의 연령별 분포를 확인해보세요!
              </p>
            </div>
            
            <div className="space-y-8">
              {/* 전체 통계 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-effect rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold text-gray-800">{ageDistribution.total_messages}</div>
                  <div className="text-sm text-gray-600">전체 메시지</div>
                </div>
                <div className="glass-effect rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold text-gray-800">{ageDistribution.current_age || '설정 안됨'}</div>
                  <div className="text-sm text-gray-600">현재 나이</div>
                </div>
                <div className="glass-effect rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold text-gray-800">
                    {Object.keys(ageDistribution.age_distribution).length}
                  </div>
                  <div className="text-sm text-gray-600">연령대 수</div>
                </div>
                <div className="glass-effect rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold text-gray-800">
                    {Math.max(...Object.values(ageDistribution.age_distribution).map(v => Number(v)))}
                  </div>
                  <div className="text-sm text-gray-600">최대 메시지 수</div>
                </div>
              </div>

              {/* 연령대별 통계 */}
              <div>
                <h4 className="text-xl font-bold text-gray-800 mb-4">연령대별 메시지 분포</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="glass-effect rounded-2xl p-4 text-center">
                    <div className="text-xl font-bold text-blue-600">{ageDistribution.age_ranges.childhood}</div>
                    <div className="text-sm text-gray-600">어린이 (0-12세)</div>
                  </div>
                  <div className="glass-effect rounded-2xl p-4 text-center">
                    <div className="text-xl font-bold text-green-600">{ageDistribution.age_ranges.teenage}</div>
                    <div className="text-sm text-gray-600">청소년 (13-19세)</div>
                  </div>
                  <div className="glass-effect rounded-2xl p-4 text-center">
                    <div className="text-xl font-bold text-purple-600">{ageDistribution.age_ranges.twenties}</div>
                    <div className="text-sm text-gray-600">20대</div>
                  </div>
                  <div className="glass-effect rounded-2xl p-4 text-center">
                    <div className="text-xl font-bold text-orange-600">{ageDistribution.age_ranges.thirties}</div>
                    <div className="text-sm text-gray-600">30대</div>
                  </div>
                  <div className="glass-effect rounded-2xl p-4 text-center">
                    <div className="text-xl font-bold text-red-600">{ageDistribution.age_ranges.forties}</div>
                    <div className="text-sm text-gray-600">40대</div>
                  </div>
                  <div className="glass-effect rounded-2xl p-4 text-center">
                    <div className="text-xl font-bold text-pink-600">{ageDistribution.age_ranges.fifties}</div>
                    <div className="text-sm text-gray-600">50대</div>
                  </div>
                  <div className="glass-effect rounded-2xl p-4 text-center">
                    <div className="text-xl font-bold text-indigo-600">{ageDistribution.age_ranges.sixties_plus}</div>
                    <div className="text-sm text-gray-600">60대 이상</div>
                  </div>
                </div>
              </div>

              {/* 상세 연령별 분포 */}
              <div>
                <h4 className="text-xl font-bold text-gray-800 mb-4">상세 연령별 분포</h4>
                <div className="space-y-3">
                  {Object.entries(ageDistribution.age_distribution).map(([age, count]) => (
                    <div key={age} className="flex items-center gap-4">
                      <div className="w-16 text-sm font-medium text-gray-700">
                        {age}세
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-gradient-to-r from-secondary-500 to-love-500 h-4 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${(Number(count) / Math.max(...Object.values(ageDistribution.age_distribution).map(v => Number(v)))) * 100}%` 
                          }}
                        />
                      </div>
                      <div className="w-12 text-sm font-bold text-gray-800">
                        {count}개
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <button
                onClick={() => setShowStatsModal(false)}
                className="btn-primary touch-optimized"
              >
                닫기
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
} 