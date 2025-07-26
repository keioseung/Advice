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
  const [fatherName, setFatherName] = useState('')
  const [showFatherNameInput, setShowFatherNameInput] = useState(true)
  const [unlockedAdvices, setUnlockedAdvices] = useState<string[]>([])
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [selectedFutureAdvice, setSelectedFutureAdvice] = useState<any>(null)
  const [password, setPassword] = useState('')

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
        author: 'dad',
        media_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
        media_type: 'image'
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
        author: 'dad',
        media_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        media_type: 'video'
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

  const handleFutureAdviceClick = (advice: any) => {
    setSelectedFutureAdvice(advice)
    setShowPasswordModal(true)
  }

  const handlePasswordSubmit = () => {
    // 간단한 패스워드 체크 (실제로는 더 복잡하게 구현)
    if (password === '사랑해' || password === 'love') {
      setUnlockedAdvices(prev => [...prev, selectedFutureAdvice.id])
      setShowPasswordModal(false)
      setPassword('')
      setSelectedFutureAdvice(null)
    } else {
      alert('패스워드가 틀렸어요. 다시 시도해보세요!')
    }
  }

  const filteredAdvices = advices.filter(advice => {
    if (filter === 'available') return advice.target_age <= currentAge || unlockedAdvices.includes(advice.id)
    if (filter === 'future') return advice.target_age > currentAge && !unlockedAdvices.includes(advice.id)
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
            {fatherName ? `${fatherName}님이 당신을 위해 남겨놓은 글귀예요 ❤️` : '아버지가 당신을 위해 준비한 특별한 메시지들이 있어요 ❤️'}
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

      {/* Father Name Input */}
      {showFatherNameInput && (
        <motion.div 
          className="glass-effect rounded-2xl p-6 bg-gradient-to-r from-blue-100 to-purple-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              아버지의 이름을 알려주세요 💝
            </h3>
            <div className="flex gap-3 justify-center items-center">
              <input
                type="text"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                placeholder="아버지 이름"
                className="input-field flex-1 max-w-xs"
              />
              <button
                onClick={() => setShowFatherNameInput(false)}
                disabled={!fatherName.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                확인
              </button>
            </div>
          </div>
        </motion.div>
      )}

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
          <div className="text-sm text-gray-600">지금 읽을 수 있는 글귀</div>
        </motion.div>
        
        <motion.div 
          className="glass-effect rounded-2xl p-6 text-center"
          whileHover={{ scale: 1.05 }}
        >
          <Lock className="w-8 h-8 text-gray-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{futureAdvices.length}</div>
          <div className="text-sm text-gray-600">미래의 글귀</div>
        </motion.div>
        
        <motion.div 
          className="glass-effect rounded-2xl p-6 text-center"
          whileHover={{ scale: 1.05 }}
        >
          <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{favoriteAdvices.length}</div>
          <div className="text-sm text-gray-600">마음에 든 글귀</div>
        </motion.div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'available', label: '💝 지금 읽을 수 있는 글귀', icon: Heart },
          { key: 'future', label: '🔒 미래의 글귀', icon: Lock },
          { key: 'favorites', label: '⭐ 마음에 든 글귀', icon: Star }
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
            {filter === 'available' && '💝 지금 읽을 수 있는 글귀'}
            {filter === 'future' && '🔒 미래의 글귀'}
            {filter === 'favorites' && '⭐ 마음에 든 글귀'}
          </h3>
          <Filter className="w-5 h-5 text-gray-500" />
        </div>

        <div className="space-y-4">
          {filteredAdvices.map((advice) => (
            <AdviceCard
              key={advice.id}
              advice={advice}
              onClick={() => {
                if (filter === 'future') {
                  handleFutureAdviceClick(advice)
                } else {
                  handleAdviceClick(advice)
                }
              }}
              userType="child"
              onToggleFavorite={() => handleToggleFavorite(advice.id)}
            />
          ))}
          
          {filteredAdvices.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {filter === 'available' && '아직 읽을 수 있는 글귀가 없어요 😊'}
              {filter === 'future' && '미래의 글귀가 없어요 🌟'}
              {filter === 'favorites' && '마음에 든 글귀가 없어요 ⭐'}
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

      {/* Password Modal */}
      {showPasswordModal && selectedFutureAdvice && (
        <motion.div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className="glass-effect rounded-2xl p-8 max-w-md w-full mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="text-center">
              <Lock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                🔒 미래의 글귀
              </h3>
              <p className="text-gray-600 mb-6">
                이 글귀는 {selectedFutureAdvice.target_age}세에 읽을 수 있어요.<br/>
                패스워드를 입력하면 지금 볼 수 있어요!
              </p>
              
              <div className="space-y-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="패스워드를 입력하세요"
                  className="input-field w-full"
                  onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                />
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowPasswordModal(false)
                      setPassword('')
                      setSelectedFutureAdvice(null)
                    }}
                    className="btn-secondary flex-1"
                  >
                    취소
                  </button>
                  <button
                    onClick={handlePasswordSubmit}
                    className="btn-primary flex-1"
                  >
                    해제하기
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 mt-4">
                  💡 힌트: 아버지가 가장 많이 하는 말
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
} 