// src/App.jsx
import { useState, useEffect } from 'react'

// ── API URL (Vercel 환경변수에서 가져옴) ──
const API_URL = import.meta.env.VITE_API_URL

const CHAPTERS = [
  {
    id: 1,
    title: 'Regularization',
    icon: '🛡️',
    desc: 'L1/L2, Dropout, Batch Normalization',
    locked: false,   // 무료
    content: `모델이 훈련 데이터에 너무 과도하게 맞춰져서 새로운 데이터에 대한 성능이 떨어지는 것을 막기 위한 기법들입니다.`,
    details: [
      'L1: 가중치의 절대값 합을 손실 함수에 추가 → 희소성',
      'L2: 가중치의 제곱 합을 손실 함수에 추가 → 가중치를 작게',
      'Dropout: 학습 시 무작위로 일부 뉴런을 꺼서 의존성 방지',
      'Batch Normalization: 각 층의 입력을 정규화하여 학습 안정화',
    ],
    code: `model = tf.keras.Sequential([
  layers.Dense(128, activation='relu',
    kernel_regularizer=tf.keras.regularizers.l2(0.01)),
  layers.Dropout(0.3),
  layers.BatchNormalization(),
  layers.Dense(10, activation='softmax')
])`,
  },
  {
    id: 2,
    title: 'Overfitting vs Underfitting',
    icon: '⚖️',
    desc: '모델 복잡도와 성능의 관계',
    locked: true,    // 결제 필요
    content: '모델의 복잡도와 데이터의 관계를 이해하고 최적의 균형을 찾는 것이 핵심입니다.',
    details: [
      'Underfitting: 모델이 너무 단순 → 데이터 패턴 학습 못함',
      'Overfitting: 모델이 너무 복잡 → 노이즈까지 학습',
      'Balanced: 복잡도가 적절 → 일반화 성능 우수',
    ],
    code: `# Overfitting 모델
model_overfit = tf.keras.Sequential([
  layers.Dense(1024, activation='relu'),
  layers.Dense(1024, activation='relu'),
  layers.Dense(1)
])

# Balanced 모델
model_balanced = tf.keras.Sequential([
  layers.Dense(64, activation='relu'),
  layers.Dense(1)
])`,
  },
  {
    id: 3,
    title: 'Data Augmentation',
    icon: '🖼️',
    desc: '데이터 부족 문제를 해결하는 증강 기법',
    locked: true,
    content: '데이터가 부족할 때 기존 이미지를 변형하여 데이터의 다양성을 늘리는 기법입니다.',
    details: [
      '회전(Rotation): 이미지를 무작위 각도로 회전',
      '뒤집기(Flip): 수평/수직으로 뒤집기',
      '확대/축소(Zoom): 이미지 크기 변형',
      '이동(Translation): 이미지 위치 변경',
    ],
    code: `data_augmentation = tf.keras.Sequential([
  layers.RandomFlip("horizontal_and_vertical"),
  layers.RandomRotation(0.2),
  layers.RandomZoom(0.2),
])`,
  },
  {
    id: 4,
    title: 'Transfer Learning',
    icon: '🧠',
    desc: '사전 학습된 모델을 활용하는 전이 학습',
    locked: true,
    content: '이미 대량의 데이터로 학습된 모델의 지식을 가져와 내가 가진 적은 데이터 문제에 활용합니다.',
    details: [
      'Feature Extraction: 기존 모델 가중치 고정(Freeze) → 분류기만 학습',
      'Fine-tuning: 일부 상위 층도 미세하게 같이 학습',
      'MobileNetV2: 경량화된 사전 학습 모델',
    ],
    code: `base_model = tf.keras.applications.MobileNetV2(
  input_shape=(160, 160, 3),
  include_top=False,
  weights='imagenet'
)
base_model.trainable = False  # Freeze!

model = tf.keras.Sequential([
  base_model,
  layers.GlobalAveragePooling2D(),
  layers.Dense(1, activation='sigmoid')
])`,
  },
  {
    id: 5,
    title: 'CNN 실습 (MNIST)',
    icon: '✍️',
    desc: '손글씨 인식 모델 직접 구현',
    locked: true,
    content: 'CNN은 이미지 처리에 특화된 딥러닝 구조로, Conv2D와 MaxPooling으로 특징을 추출합니다.',
    details: [
      'Conv2D: 이미지의 특징(Feature) 추출',
      'MaxPooling2D: 이미지 크기 줄이며 중요 특징 보존',
      'Flatten & Dense: 추출된 특징으로 최종 분류',
      'MNIST: 28×28 손글씨 숫자 이미지 데이터셋',
    ],
    code: `model = models.Sequential([
  layers.Conv2D(32, (3,3), activation='relu',
    input_shape=(28, 28, 1)),
  layers.MaxPooling2D((2, 2)),
  layers.Conv2D(64, (3,3), activation='relu'),
  layers.MaxPooling2D((2, 2)),
  layers.Conv2D(64, (3,3), activation='relu'),
  layers.Flatten(),
  layers.Dense(64, activation='relu'),
  layers.Dense(10, activation='softmax')
])`,
  },
]

export default function App() {
  const [activeChapter, setActiveChapter] = useState(1)
  const [copied, setCopied]               = useState(false)
  const [isLoggedIn, setIsLoggedIn]       = useState(false)
  const [isPaid, setIsPaid]               = useState(false)
  const [user, setUser]                   = useState(null)
  const [paymentLoading, setPaymentLoading] = useState(false)

  const chapter = CHAPTERS.find(c => c.id === activeChapter)

  // ── 앱 시작 시 로그인 상태 복원 ──
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.email) {
            setUser(data)
            setIsLoggedIn(true)
            setIsPaid(data.plan === 'paid')
          } else {
            localStorage.removeItem('token')
          }
        })
        .catch(() => localStorage.removeItem('token'))
    }
  }, [])

  // ── URL에서 token 처리 (Google OAuth 콜백) ──
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token  = params.get('token')
    if (token) {
      localStorage.setItem('token', token)
      // URL에서 token 파라미터 제거
      window.history.replaceState({}, '', window.location.pathname)
      fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setUser(data)
          setIsLoggedIn(true)
          setIsPaid(data.plan === 'paid')
        })
    }
  }, [])

  // ── Google 로그인 ──
  const handleLogin = async () => {
    try {
      const res  = await fetch(`${API_URL}/auth/google`)
      const data = await res.json()
      window.location.href = data.auth_url
    } catch {
      alert('로그인 중 오류가 발생했습니다.')
    }
  }

  // ── 로그아웃 ──
  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    setIsPaid(false)
    setUser(null)
    setActiveChapter(1)
  }

  // ── Polar.sh 결제 ──
  const handlePayment = async () => {
    setPaymentLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res   = await fetch(`${API_URL}/payment/checkout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      window.location.href = data.checkout_url
    } catch {
      alert('결제 페이지 이동 중 오류가 발생했습니다.')
      setPaymentLoading(false)
    }
  }

  // ── 코드 복사 ──
  const handleCopy = () => {
    navigator.clipboard.writeText(chapter.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── 챕터 클릭 처리 ──
  const handleChapterClick = (ch) => {
    if (ch.locked && !isPaid) return  // 잠금된 챕터 클릭 방지
    setActiveChapter(ch.id)
  }

  // ════════════════════════════════════════
  // 비로그인 → 랜딩 페이지
  // ════════════════════════════════════════
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center
                      justify-center text-white px-4">
        <div className="text-center max-w-lg">

          <div className="text-6xl mb-6">⚡</div>
          <h1 className="text-4xl font-bold mb-3">Week 5 딥러닝 강의</h1>
          <p className="text-gray-400 mb-2 text-lg">
            Regularization, Overfitting, CNN 등
          </p>
          <p className="text-gray-500 mb-8 text-sm">
            핵심 개념을 코드와 함께 인터랙티브하게 학습하세요
          </p>

          {/* 무료/유료 구분 */}
          <div className="flex justify-center gap-4 mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-3 text-sm">
              <div className="text-teal-400 font-semibold mb-1">무료</div>
              <div className="text-gray-400">CH 1 전체 열람</div>
            </div>
            <div className="bg-gray-900 border border-teal-500/30 rounded-xl px-5 py-3 text-sm">
              <div className="text-teal-400 font-semibold mb-1">$9 결제 후</div>
              <div className="text-gray-400">CH 1~5 전체 열람</div>
            </div>
          </div>

          {/* Google 로그인 버튼 */}
          <button
            onClick={handleLogin}
            className="flex items-center gap-3 mx-auto px-8 py-4
                       bg-white text-gray-800 rounded-xl font-semibold
                       text-lg hover:bg-gray-100 transition shadow-lg"
          >
            <img
              src="https://www.google.com/favicon.ico"
              className="w-5 h-5"
              alt="Google"
            />
            Google로 시작하기
          </button>

          <p className="text-gray-600 text-xs mt-4">
            로그인 시 CH 1 무료 체험 가능
          </p>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════
  // 로그인 후 → 강의 페이지
  // ════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">

      {/* 헤더 */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4
                         flex items-center gap-3">
        <span className="text-teal-400 text-xl">⚡</span>
        <h1 className="text-lg font-bold text-white">Week 5 — 딥러닝 핵심 개념</h1>

        {/* 결제 뱃지 */}
        {isPaid && (
          <span className="text-xs bg-teal-500/20 border border-teal-500/40
                           text-teal-300 px-2 py-1 rounded-full">
            ✓ 전체 이용 중
          </span>
        )}

        <div className="ml-auto flex items-center gap-3">
          {/* 진도 표시 */}
          <span className="text-xs text-gray-500 font-mono">
            {activeChapter} / {CHAPTERS.length}
          </span>

          {/* 유저 프로필 */}
          {user?.picture && (
            <img
              src={user.picture}
              className="w-7 h-7 rounded-full"
              alt={user.name}
            />
          )}
          <span className="text-sm text-gray-400">{user?.name}</span>

          {/* 로그아웃 */}
          <button
            onClick={handleLogout}
            className="text-xs text-gray-500 hover:text-gray-300
                       border border-gray-700 px-3 py-1 rounded-lg transition"
          >
            로그아웃
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* 사이드바 */}
        <aside className="w-56 bg-gray-900 border-r border-gray-800 p-3
                          flex flex-col gap-2">
          {CHAPTERS.map(ch => (
            <button
              key={ch.id}
              onClick={() => handleChapterClick(ch)}
              className={`text-left px-3 py-3 rounded-lg transition-all text-sm
                ${activeChapter === ch.id
                  ? 'bg-teal-500/20 border border-teal-500/40 text-teal-300'
                  : 'text-gray-400 hover:bg-gray-800 border border-transparent'}
                ${ch.locked && !isPaid ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <div className="font-mono text-xs text-gray-500 mb-1">
                CH {String(ch.id).padStart(2,'0')}
                {ch.locked && !isPaid && ' 🔒'}
              </div>
              <div className="font-medium">{ch.icon} {ch.title}</div>
              <div className="text-xs text-gray-500 mt-1">{ch.desc}</div>
            </button>
          ))}

          {/* 결제 버튼 (미결제 시만 표시) */}
          {!isPaid && (
            <div className="mt-auto pt-4 border-t border-gray-800">
              <div className="text-center mb-3">
                <div className="text-xl font-bold text-white">$9</div>
                <div className="text-xs text-gray-500">CH 2~5 전체 잠금 해제</div>
              </div>
              <button
                onClick={handlePayment}
                disabled={paymentLoading}
                className="w-full py-2.5 bg-teal-600 text-white rounded-lg
                           font-semibold hover:bg-teal-500 transition text-sm
                           disabled:opacity-50"
              >
                {paymentLoading ? '이동 중...' : '지금 구매하기 →'}
              </button>
            </div>
          )}
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto">

            {/* 잠금 화면 */}
            {chapter.locked && !isPaid ? (
              <div className="flex flex-col items-center justify-center
                              min-h-96 text-center">
                <div className="text-6xl mb-4">🔒</div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  이 챕터는 결제 후 이용 가능합니다
                </h2>
                <p className="text-gray-400 mb-6">
                  CH 2~5 전체를 $9에 이용하세요
                </p>
                <button
                  onClick={handlePayment}
                  disabled={paymentLoading}
                  className="px-8 py-3 bg-teal-600 text-white rounded-xl
                             font-semibold hover:bg-teal-500 transition
                             disabled:opacity-50"
                >
                  {paymentLoading ? '이동 중...' : '지금 구매하기 →'}
                </button>
              </div>
            ) : (
              <>
                {/* 챕터 헤더 */}
                <div className="mb-6">
                  <span className="text-xs font-mono text-teal-400 bg-teal-500/10
                                   border border-teal-500/20 px-3 py-1 rounded-full">
                    CH {String(chapter.id).padStart(2,'0')}
                  </span>
                  <h2 className="text-3xl font-bold text-white mt-3 mb-2">
                    {chapter.icon} {chapter.title}
                  </h2>
                  <p className="text-gray-400">{chapter.content}</p>
                </div>

                {/* 핵심 포인트 */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
                  <h3 className="text-sm font-semibold text-teal-400 mb-3">
                    핵심 포인트
                  </h3>
                  <ul className="space-y-2">
                    {chapter.details.map((d, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-300">
                        <span className="text-teal-500 mt-0.5">▸</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 코드 블록 */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl
                                overflow-hidden mb-8">
                  <div className="flex items-center justify-between px-4 py-2
                                  border-b border-gray-800 bg-gray-950">
                    <span className="text-xs font-mono text-gray-500">Python</span>
                    <button
                      onClick={handleCopy}
                      className="text-xs text-gray-400 hover:text-teal-400 transition"
                    >
                      {copied ? '✓ 복사됨' : '복사'}
                    </button>
                  </div>
                  <pre className="p-5 overflow-x-auto text-sm font-mono
                                  text-green-300 leading-relaxed">
                    {chapter.code}
                  </pre>
                </div>

                {/* 이전/다음 버튼 */}
                <div className="flex justify-between">
                  <button
                    onClick={() => setActiveChapter(p => Math.max(1, p-1))}
                    disabled={activeChapter === 1}
                    className="px-5 py-2 bg-gray-800 rounded-lg text-sm
                               text-gray-300 hover:bg-gray-700
                               disabled:opacity-30 transition"
                  >
                    ← 이전
                  </button>
                  <button
                    onClick={() => {
                      const next = activeChapter + 1
                      if (next > 5) return
                      const nextCh = CHAPTERS.find(c => c.id === next)
                      if (nextCh.locked && !isPaid) return
                      setActiveChapter(next)
                    }}
                    disabled={
                      activeChapter === 5 ||
                      (CHAPTERS.find(c => c.id === activeChapter + 1)?.locked && !isPaid)
                    }
                    className="px-5 py-2 bg-teal-600 rounded-lg text-sm
                               text-white hover:bg-teal-500
                               disabled:opacity-30 transition"
                  >
                    다음 →
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}