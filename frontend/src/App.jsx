// src/App.jsx
import { useState } from 'react'

const CHAPTERS = [
  {
    id: 1,
    title: 'Regularization',
    icon: '🛡️',
    desc: 'L1/L2, Dropout, Batch Normalization',
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
  const [copied, setCopied] = useState(false)

  const chapter = CHAPTERS.find(c => c.id === activeChapter)

  const handleCopy = () => {
    navigator.clipboard.writeText(chapter.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">

      {/* 헤더 */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-3">
        <span className="text-teal-400 text-xl">⚡</span>
        <h1 className="text-lg font-bold text-white">Week 5 — 딥러닝 핵심 개념</h1>
        <span className="ml-auto text-xs text-gray-500 font-mono">
          {activeChapter} / {CHAPTERS.length}
        </span>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* 사이드바 */}
        <aside className="w-56 bg-gray-900 border-r border-gray-800 p-3 flex flex-col gap-2">
          {CHAPTERS.map(ch => (
            <button
              key={ch.id}
              onClick={() => setActiveChapter(ch.id)}
              className={`text-left px-3 py-3 rounded-lg transition-all text-sm ${
                activeChapter === ch.id
                  ? 'bg-teal-500/20 border border-teal-500/40 text-teal-300'
                  : 'text-gray-400 hover:bg-gray-800 border border-transparent'
              }`}
            >
              <div className="font-mono text-xs text-gray-500 mb-1">
                CH {String(ch.id).padStart(2,'0')}
              </div>
              <div className="font-medium">{ch.icon} {ch.title}</div>
              <div className="text-xs text-gray-500 mt-1">{ch.desc}</div>
            </button>
          ))}
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto">

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
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-8">
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
              <pre className="p-5 overflow-x-auto text-sm font-mono text-green-300 leading-relaxed">
                {chapter.code}
              </pre>
            </div>

            {/* 이전/다음 버튼 */}
            <div className="flex justify-between">
              <button
                onClick={() => setActiveChapter(p => Math.max(1, p-1))}
                disabled={activeChapter === 1}
                className="px-5 py-2 bg-gray-800 rounded-lg text-sm text-gray-300
                         hover:bg-gray-700 disabled:opacity-30 transition"
              >
                ← 이전
              </button>
              <button
                onClick={() => setActiveChapter(p => Math.min(5, p+1))}
                disabled={activeChapter === 5}
                className="px-5 py-2 bg-teal-600 rounded-lg text-sm text-white
                         hover:bg-teal-500 disabled:opacity-30 transition"
              >
                다음 →
              </button>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}