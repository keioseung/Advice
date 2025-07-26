'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  LogOut, 
  Plus, 
  MessageSquare, 
  Heart, 
  BookOpen, 
  Star,
  Filter,
  User,
  Users,
  Sparkles,
  Gift
} from 'lucide-react'
import AdviceForm from './AdviceForm'
import AdviceCard from './AdviceCard'
import AdviceModal from './AdviceModal'

interface FatherDashboardProps {
  user: any
  onLogout: () => void
}

export default function FatherDashboard({ user, onLogout }: FatherDashboardProps) {
  const [advices, setAdvices] = useState<any[]>([])
  const [filter, setFilter] = useState('all')
  const [selectedAdvice, setSelectedAdvice] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [fatherName, setFatherName] = useState('')
  const [childName, setChildName] = useState('')
  const [showNameInput, setShowNameInput] = useState(true)

  // 샘플 데이터
  useEffect(() => {
    const sampleAdvices = [
      {
        id: 1,
        category: 'life',
        target_age: 20,
        content: '인생은 마라톤이야. 너무 서두르지 말고, 자신만의 페이스를 찾아가렴. 남과 비교하지 말고, 어제의 너보다 나은 오늘의 네가 되기 위해 노력해.',
        date: '2024-01-15',
        is_favorite: false,
        author: user.user_id
      },
      {
        id: 2,
        category: 'love',
        target_age: 25,
        content: '진정한 사랑은 상대방을 있는 그대로 받아들이는 것이야. 너를 변화시키려 하는 사람보다는, 너의 성장을 응원해주는 사람을 만나길 바란다.',
        date: '2024-02-20',
        is_favorite: true,
        author: user.user_id
      },
      {
        id: 3,
        category: 'career',
        target_age: 22,
        content: '첫 직장은 완벽할 필요 없어. 중요한 건 그곳에서 무엇을 배우고, 어떤 사람이 될 것인가야. 실수를 두려워하지 말고, 항상 배우려는 자세를 가져.',
        date: '2024-03-10',
        is_favorite: false,
        author: user.user_id
      }
    ]
    setAdvices(sampleAdvices)
  }, [user.user_id])

  const handleAddAdvice = (newAdvice: any) => {
    const advice = {
      ...newAdvice,
      id: Date.now(),
      date: new Date().toLocaleDateString('ko-KR'),
      is_favorite: false,
      author: user.user_id
    }
    setAdvices([advice, ...advices])
  }

  const handleAdviceClick = (advice: any) => {
    setSelectedAdvice(advice)
    setShowModal(true)
  }

  const filteredAdvices = advices.filter(advice => {
    if (filter === 'all') return true
    return advice.category === filter
  })

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
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent mb-2">
            안녕하세요, {user.name}님! 👨‍👦
          </h2>
          <p className="text-lg text-gray-600 font-medium">
            {childName ? `${childName}을(를) 위한 특별한 선물을 준비해보세요 💝` : '아이를 위한 특별한 선물을 준비해보세요 💝'}
          </p>
        </div>
        <button
          onClick={onLogout}
          className="btn-secondary flex items-center gap-2 touch-optimized"
        >
          <LogOut className="w-4 h-4" />
          로그아웃
        </button>
      </motion.div>

      {/* Name Input Section */}
      {showNameInput && (
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
              <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center mx-auto">
                <Gift className="w-10 h-10 text-white" />
              </div>
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              가족 정보를 입력해주세요 💝
            </h3>
            <p className="text-gray-600 mb-8">
              자녀를 위한 특별한 선물을 준비하기 위해 가족 정보를 알려주세요
            </p>
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-gray-700 font-medium">
                  <User className="w-5 h-5 text-primary-500" />
                  아버지 이름
                </label>
                <input
                  type="text"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  placeholder="아버지 이름"
                  className="input-field"
                />
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-gray-700 font-medium">
                  <Users className="w-5 h-5 text-secondary-500" />
                  자녀 이름
                </label>
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="자녀 이름"
                  className="input-field"
                />
              </div>
            </div>
            <button
              onClick={() => setShowNameInput(false)}
              disabled={!fatherName.trim() || !childName.trim()}
              className="btn-primary mt-8 disabled:opacity-50 disabled:cursor-not-allowed touch-optimized"
            >
              <Heart className="w-5 h-5 mr-2" />
              가족과 함께 시작하기
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Advice Form */}
        <motion.div 
          className="lg:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <AdviceForm onAddAdvice={handleAddAdvice} />
        </motion.div>

        {/* Advice List */}
        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="glass-effect rounded-3xl p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  작성한 선물들 🎁
                </h3>
                <p className="text-gray-600">
                  {childName ? `${childName}을(를) 위해 준비한 특별한 메시지들` : '자녀를 위해 준비한 특별한 메시지들'}
                </p>
              </div>
              <Filter className="w-6 h-6 text-gray-500" />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-3 mb-8 flex-wrap">
              {[
                { key: 'all', label: '전체', icon: MessageSquare, emoji: '💝' },
                { key: 'life', label: '인생 조언', icon: Heart, emoji: '💡' },
                { key: 'love', label: '사랑', icon: Heart, emoji: '💕' },
                { key: 'career', label: '진로', icon: BookOpen, emoji: '💼' }
              ].map(({ key, label, icon: Icon, emoji }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-medium transition-all duration-300 touch-optimized ${
                    filter === key
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-warm-lg'
                      : 'bg-white/50 text-gray-600 hover:bg-white/70 hover:shadow-warm'
                  }`}
                >
                  <span className="text-lg">{emoji}</span>
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Advice Cards */}
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
                    userType="father"
                  />
                </motion.div>
              ))}
              
              {filteredAdvices.length === 0 && (
                <motion.div 
                  className="text-center py-16"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="w-20 h-20 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-10 h-10 text-primary-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    아직 준비한 선물이 없어요
                  </h3>
                  <p className="text-gray-600">
                    {childName ? `${childName}을(를) 위한 첫 번째 선물을 준비해보세요!` : '자녀를 위한 첫 번째 선물을 준비해보세요!'}
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal */}
      {showModal && selectedAdvice && (
        <AdviceModal
          advice={selectedAdvice}
          onClose={() => setShowModal(false)}
          userType="father"
        />
      )}
    </div>
  )
} 