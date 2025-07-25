'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  LogOut, 
  Heart, 
  Star, 
  Lock, 
  Filter,
  Sparkles
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
  const [currentAge] = useState(25) // 임시로 25세 설정

  // 샘플 데이터
  useEffect(() => {
    const sampleAdvices = [
      {
        id: 1,
        category: 'life',
        target_age: 20,
        content: '인생은 마라톤이야. 너무 서두르지 말고, 자신만의 페이스를 찾아가렴. 남과 비교하지 말고, 어제의 너보다 나은 오늘의 네가 되기 위해 노력해.',
        date: '2024-01-15',
        is_read: false,
        is_favorite: false,
        author: 'dad'
      },
      {
        id: 2,
        category: 'love',
        target_age: 25,
        content: '진정한 사랑은 상대방을 있는 그대로 받아들이는 것이야. 너를 변화시키려 하는 사람보다는, 너의 성장을 응원해주는 사람을 만나길 바란다.',
        date: '2024-02-20',
        is_read: true,
        is_favorite: true,
        author: 'dad'
      },
      {
        id: 3,
        category: 'career',
        target_age: 30,
        content: '30대가 되면 인생의 방향이 더욱 명확해질 거야. 지금까지의 경험을 바탕으로 자신만의 길을 찾아가길 바란다.',
        date: '2024-03-10',
        is_read: false,
        is_favorite: false,
        author: 'dad'
      }
    ]
    setAdvices(sampleAdvices)
  }, [])

  const handleAdviceClick = (advice: any) => {
    // 조언을 읽음으로 표시
    setAdvices(prev => prev.map(a => 
      a.id === advice.id ? { ...a, is_read: true } : a
    ))
    setSelectedAdvice(advice)
    setShowModal(true)
  }

  const handleToggleFavorite = (adviceId: number) => {
    setAdvices(prev => prev.map(a => 
      a.id === adviceId ? { ...a, is_favorite: !a.is_favorite } : a
    ))
  }

  const filteredAdvices = advices.filter(advice => {
    if (filter === 'available') return advice.target_age <= currentAge
    if (filter === 'future') return advice.target_age > currentAge
    if (filter === 'favorites') return advice.is_favorite
    return true
  })

  const availableAdvices = advices.filter(a => a.target_age <= currentAge)
  const futureAdvices = advices.filter(a => a.target_age > currentAge)
  const favoriteAdvices = advices.filter(a => a.is_favorite)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">
            안녕, {user.name}! 🌟
          </h2>
          <p className="text-white/80">
            아빠가 너를 위해 준비한 특별한 메시지들이 있어 ❤️
          </p>
        </div>
        <button
          onClick={onLogout}
          className="btn-secondary flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          로그아웃
        </button>
      </div>

      {/* Profile Card */}
      <motion.div 
        className="glass-effect rounded-2xl p-6 bg-gradient-to-r from-yellow-100 to-orange-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              {user.name}의 특별한 메시지
            </h3>
            <p className="text-gray-600">
              현재 {currentAge}세, {availableAdvices.length}개의 조언을 읽을 수 있어요!
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <motion.div 
          className="glass-effect rounded-2xl p-6 text-center"
          whileHover={{ scale: 1.05 }}
        >
          <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{availableAdvices.length}</div>
          <div className="text-sm text-gray-600">지금 읽을 수 있는 조언</div>
        </motion.div>
        
        <motion.div 
          className="glass-effect rounded-2xl p-6 text-center"
          whileHover={{ scale: 1.05 }}
        >
          <Lock className="w-8 h-8 text-gray-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{futureAdvices.length}</div>
          <div className="text-sm text-gray-600">미래의 조언</div>
        </motion.div>
        
        <motion.div 
          className="glass-effect rounded-2xl p-6 text-center"
          whileHover={{ scale: 1.05 }}
        >
          <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{favoriteAdvices.length}</div>
          <div className="text-sm text-gray-600">즐겨찾기</div>
        </motion.div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'available', label: '💝 지금 읽을 수 있는 조언', icon: Heart },
          { key: 'future', label: '🔒 미래의 조언', icon: Lock },
          { key: 'favorites', label: '⭐ 즐겨찾기', icon: Star }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all duration-300 ${
              filter === key
                ? 'bg-primary-500 text-white'
                : 'bg-white/50 text-gray-600 hover:bg-white/70'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Advice List */}
      <div className="glass-effect rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            {filter === 'available' && '💝 지금 읽을 수 있는 조언'}
            {filter === 'future' && '🔒 미래의 조언'}
            {filter === 'favorites' && '⭐ 즐겨찾기한 조언'}
          </h3>
          <Filter className="w-5 h-5 text-gray-500" />
        </div>

        <div className="space-y-4">
          {filteredAdvices.map((advice) => (
            <AdviceCard
              key={advice.id}
              advice={advice}
              onClick={() => handleAdviceClick(advice)}
              userType="child"
              onToggleFavorite={() => handleToggleFavorite(advice.id)}
            />
          ))}
          
          {filteredAdvices.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {filter === 'available' && '아직 읽을 수 있는 조언이 없어요 😊'}
              {filter === 'future' && '미래의 조언이 없어요 🌟'}
              {filter === 'favorites' && '즐겨찾기한 조언이 없어요 ⭐'}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedAdvice && (
        <AdviceModal
          advice={selectedAdvice}
          onClose={() => setShowModal(false)}
          userType="child"
        />
      )}
    </div>
  )
} 