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
  Eye,
  EyeOff
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
        author: user.user_id
      },
      {
        id: 2,
        category: 'love',
        target_age: 25,
        content: '진정한 사랑은 상대방을 있는 그대로 받아들이는 것이야. 너를 변화시키려 하는 사람보다는, 너의 성장을 응원해주는 사람을 만나길 바란다.',
        date: '2024-02-20',
        is_read: true,
        is_favorite: true,
        author: user.user_id
      },
      {
        id: 3,
        category: 'career',
        target_age: 22,
        content: '첫 직장은 완벽할 필요 없어. 중요한 건 그곳에서 무엇을 배우고, 어떤 사람이 될 것인가야. 실수를 두려워하지 말고, 항상 배우려는 자세를 가져.',
        date: '2024-03-10',
        is_read: false,
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
      is_read: false,
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
    if (filter === 'read') return advice.is_read
    if (filter === 'unread') return !advice.is_read
    return advice.category === filter
  })

  const stats = {
    total: advices.length,
    read: advices.filter(a => a.is_read).length,
    unread: advices.filter(a => !a.is_read).length
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">
            안녕하세요, {user.name}님! 👨‍👦
          </h2>
          <p className="text-white/80">
            아이를 위한 특별한 조언을 작성해보세요
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

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <motion.div 
          className="glass-effect rounded-2xl p-6 text-center"
          whileHover={{ scale: 1.05 }}
        >
          <MessageSquare className="w-8 h-8 text-primary-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
          <div className="text-sm text-gray-600">총 조언 수</div>
        </motion.div>
        
        <motion.div 
          className="glass-effect rounded-2xl p-6 text-center"
          whileHover={{ scale: 1.05 }}
        >
          <Eye className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{stats.read}</div>
          <div className="text-sm text-gray-600">읽힌 조언</div>
        </motion.div>
        
        <motion.div 
          className="glass-effect rounded-2xl p-6 text-center"
          whileHover={{ scale: 1.05 }}
        >
          <EyeOff className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{stats.unread}</div>
          <div className="text-sm text-gray-600">안 읽힌 조언</div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Advice Form */}
        <div className="lg:col-span-1">
          <AdviceForm onAddAdvice={handleAddAdvice} />
        </div>

        {/* Advice List */}
        <div className="lg:col-span-2">
          <div className="glass-effect rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                작성한 조언들
              </h3>
              <Filter className="w-5 h-5 text-gray-500" />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {[
                { key: 'all', label: '전체', icon: MessageSquare },
                { key: 'life', label: '인생 조언', icon: Heart },
                { key: 'love', label: '사랑', icon: Heart },
                { key: 'career', label: '진로', icon: BookOpen },
                { key: 'read', label: '읽힌 조언', icon: Eye },
                { key: 'unread', label: '안 읽힌 조언', icon: EyeOff }
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

            {/* Advice Cards */}
            <div className="space-y-4">
              {filteredAdvices.map((advice) => (
                <AdviceCard
                  key={advice.id}
                  advice={advice}
                  onClick={() => handleAdviceClick(advice)}
                  userType="father"
                />
              ))}
            </div>
          </div>
        </div>
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