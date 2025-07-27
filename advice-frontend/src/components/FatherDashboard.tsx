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
  BarChart3
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
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [ageDistribution, setAgeDistribution] = useState<any>(null)

  // 실제 API에서 조언 데이터 가져오기
  useEffect(() => {
    const fetchAdvices = async () => {
      try {
        const token = localStorage.getItem('token')
        console.log('Fetching advices - Token:', token ? 'Present' : 'Missing') // 디버깅용 로그
        if (!token) {
          console.log('No token found, skipping fetch') // 디버깅용 로그
          return
        }

        console.log('Making API call to:', `${process.env.NEXT_PUBLIC_API_URL}/advices`) // 디버깅용 로그
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/advices`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        console.log('Response status:', response.status) // 디버깅용 로그

        if (response.ok) {
          const data = await response.json()
          console.log('Fetched advices:', data) // 디버깅용 로그
          console.log('Number of advices:', data.length) // 디버깅용 로그
          setAdvices(data)
        } else {
          console.error('조언을 가져오는데 실패했습니다:', response.status)
          const errorText = await response.text()
          console.error('Error response:', errorText) // 디버깅용 로그
        }
      } catch (error) {
        console.error('조언을 가져오는 중 오류 발생:', error)
      }
    }

    fetchAdvices()
  }, [])

  const handleAddAdvice = async (newAdvice: any) => {
    console.log('FatherDashboard handleAddAdvice called with:', newAdvice) // 디버깅용 로그
    try {
      const token = localStorage.getItem('token')
      console.log('Token from localStorage:', token ? 'Present' : 'Missing') // 디버깅용 로그
      if (!token) {
        console.log('No token found, returning early') // 디버깅용 로그
        return
      }

      // 미디어 파일이 있는 경우 먼저 업로드
      let mediaUrl = newAdvice.media_url
      if (newAdvice.mediaFile) {
        const formData = new FormData()
        formData.append('file', newAdvice.mediaFile)
        
        const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload-media`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        })
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          mediaUrl = uploadData.url
          
          // 강력한 세미콜론 제거
          if (mediaUrl) {
            console.log('Original mediaUrl:', uploadData.url)
            
            // 앞뒤 공백 제거
            mediaUrl = mediaUrl.trim()
            
            // 끝에 있는 세미콜론 제거 (여러 개일 수도 있음)
            while (mediaUrl.endsWith(';')) {
              mediaUrl = mediaUrl.slice(0, -1)
            }
            
            // 슬래시 정리 (4개가 되지 않도록)
            if (mediaUrl.includes('/advice-media/')) {
              // 먼저 모든 슬래시를 1개로 정리
              mediaUrl = mediaUrl.replace('/advice-media//', '/advice-media/')
              // 그 다음 2개로 변경
              mediaUrl = mediaUrl.replace('/advice-media/', '/advice-media//')
              console.log('Fixed URL to proper double slash format:', mediaUrl)
            }
            
            // 다시 공백 제거
            mediaUrl = mediaUrl.trim()
            
            console.log('Cleaned mediaUrl:', mediaUrl)
            console.log('Still ends with semicolon:', mediaUrl.endsWith(';'))
            console.log('Has double slash:', mediaUrl.includes('/advice-media//'))
            
            // URL이 유효한지 확인
            if (!mediaUrl.startsWith('http')) {
              console.error('Invalid media URL:', mediaUrl)
              alert('이미지 업로드에 실패했습니다. 다시 시도해주세요.')
              return
            }
          }
        } else {
          console.error('Media upload failed:', uploadResponse.status)
          alert('이미지 업로드에 실패했습니다. 다시 시도해주세요.')
          return
        }
      }

      const adviceData = {
        category: newAdvice.category,
        target_age: newAdvice.target_age,
        content: newAdvice.content,
        media_url: mediaUrl,
        media_type: newAdvice.mediaType,
        unlock_type: newAdvice.unlockType,
        password: newAdvice.password
      }
      
      console.log('Sending advice data:', adviceData)  // 디버깅용 로그
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL)  // 디버깅용 로그
      console.log('Token:', token ? 'Present' : 'Missing')  // 디버깅용 로그
      
      // 조언 생성
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/advices`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(adviceData)
      })
      
      console.log('Response status:', response.status)  // 디버깅용 로그
      console.log('Response headers:', response.headers)  // 디버깅용 로그

      if (response.ok) {
        const createdAdvice = await response.json()
        setAdvices([createdAdvice, ...advices])
        // 성공 메시지
        alert('조언이 성공적으로 저장되었습니다! 💝')
      } else {
        const errorData = await response.json()
        console.error('조언 생성에 실패했습니다:', response.status, errorData)
        alert(`조언 생성에 실패했습니다: ${errorData.detail || '알 수 없는 오류'}`)
      }
    } catch (error) {
      console.error('조언 생성 중 오류 발생:', error)
      alert('조언 생성 중 오류가 발생했습니다. 다시 시도해주세요.')
    }
  }

  const handleAdviceClick = (advice: any) => {
    setSelectedAdvice(advice)
    setShowModal(true)
  }

  const handleEditAdvice = (advice: any) => {
    // 수정 모달을 위한 상태 추가 필요
    console.log('Edit advice:', advice)
    // TODO: 수정 폼 모달 구현
  }

  const handleDeleteAdvice = async (adviceId: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/advices/${adviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        // 목록에서 삭제된 조언 제거
        setAdvices(advices.filter(advice => advice.id !== adviceId))
        setShowModal(false)
        alert('조언이 성공적으로 삭제되었습니다.')
      } else {
        const errorData = await response.json()
        alert(`삭제에 실패했습니다: ${errorData.detail || '알 수 없는 오류'}`)
      }
    } catch (error) {
      console.error('조언 삭제 중 오류 발생:', error)
      alert('조언 삭제 중 오류가 발생했습니다. 다시 시도해주세요.')
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

  const filteredAdvices = advices.filter(advice => {
    if (filter === 'all') return true
    return advice.category === filter
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">
            안녕하세요, {user.name}님! 👨‍👦
          </h2>
          <p className="text-white/80">
            {childName ? `${childName}을(를) 위한 특별한 조언을 작성해보세요` : '아이를 위한 특별한 조언을 작성해보세요'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleShowStats}
            className="btn-secondary flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            통계 보기
          </button>
          <button
            onClick={onLogout}
            className="btn-secondary flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            로그아웃
          </button>
        </div>
      </div>

      {/* Name Input Section */}
      {showNameInput && (
        <motion.div 
          className="glass-effect rounded-2xl p-6 bg-gradient-to-r from-blue-100 to-purple-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              가족 정보를 입력해주세요 💝
            </h3>
            <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-gray-700 font-medium">
                  <User className="w-4 h-4" />
                  아버지 이름
                </label>
                <input
                  type="text"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  placeholder="아버지 이름"
                  className="input-field w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-gray-700 font-medium">
                  <Users className="w-4 h-4" />
                  자녀 이름
                </label>
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="자녀 이름"
                  className="input-field w-full"
                />
              </div>
            </div>
            <button
              onClick={() => setShowNameInput(false)}
              disabled={!fatherName.trim() || !childName.trim()}
              className="btn-primary mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              확인
            </button>
          </div>
        </motion.div>
      )}

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
                { key: 'career', label: '진로', icon: BookOpen }
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
          onEdit={handleEditAdvice}
          onDelete={handleDeleteAdvice}
        />
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
                {childName ? `${childName}을(를) 위해 준비한 메시지들의 연령별 분포를 확인해보세요!` : '아이를 위해 준비한 메시지들의 연령별 분포를 확인해보세요!'}
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
                <div className="glass-effect rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold text-gray-800">
                    {Math.min(...Object.values(ageDistribution.age_distribution).map(v => Number(v)))}
                  </div>
                  <div className="text-sm text-gray-600">최소 메시지 수</div>
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
                        {Number(count)}개
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