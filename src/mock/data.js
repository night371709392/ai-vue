export const articleCategories = ['情绪调节', '睡眠', '关系']

export const articles = [
  {
    id: 101,
    category: '情绪调节',
    title: '识别焦虑的身体信号',
    summary: '了解常见身心反应，与情绪温和相处的小练习。',
    content:
      '焦虑并不只停留在脑海里，它也会通过身体说话：心跳加快、肩颈发紧、胃部不适……\n\n试着在感到不安时，先花一分钟扫描身体：从头顶到脚尖，哪里最紧？不必立刻消除，只是看见它。\n\n一个小练习：吸气 4 秒，屏息 2 秒，呼气 6 秒，重复 5 次。让身体知道——此刻是安全的。',
    status: true,
    updatedAt: '2026-05-10',
  },
  {
    id: 102,
    category: '睡眠',
    title: '睡前放松的五个步骤',
    summary: '用轻柔的节奏收尾一天，为身心按下慢放键。',
    content:
      '1. 调暗灯光，减少屏幕蓝光。\n2. 写下明天待办，把思绪「暂存」到纸上。\n3. 做 3 分钟伸展，释放肩颈。\n4. 喝一杯温水，感受温度。\n5. 用温和的呼吸，把注意力带回身体。',
    status: true,
    updatedAt: '2026-05-08',
  },
  {
    id: 103,
    category: '关系',
    title: '如何表达需求而不伤害关系',
    summary: '用「我」陈述代替指责，让沟通更被听见。',
    content:
      '当我们说「你总是……」时，对方容易进入防御。试着换成「我感到……，因为我需要……，你愿意……吗？」\n\n例如：「我感到孤单，因为我需要陪伴，你愿意今晚一起散步吗？」\n\n表达需求不是索取，而是邀请对方更了解你。',
    status: false,
    updatedAt: '2026-05-05',
  },
]

export const moodKeywords = ['平静', '疲惫', '感恩', '焦虑', '开心', '低落', '紧张', '放松']

export const moodDiaryDemo = [
  { date: '2026-05-08', score: 5, keywords: ['焦虑'], note: '脑子停不下来，后来散步好了些。' },
  { date: '2026-05-09', score: 6, keywords: ['平静'], note: '午后阳光很好，心情慢慢舒展。' },
  { date: '2026-05-10', score: 5, keywords: ['焦虑'], note: '脑子停不下来，后来散步好了些。' },
  { date: '2026-05-11', score: 7, keywords: ['感恩'], note: '朋友发来一句问候，心里暖了一下。' },
  { date: '2026-05-12', score: 6, keywords: ['平静', '疲惫'], note: '工作收尾后慢慢放松下来。' },
  { date: '2026-05-13', score: 7, keywords: ['开心'], note: '完成了一件拖延很久的小事。' },
  { date: '2026-05-14', score: 6, keywords: ['平静'], note: '早睡一晚，精神好多了。' },
]

export const adminMoodLogs = [
  {
    id: 'M-501',
    user: 'xiaoming',
    date: '2026-05-14',
    score: 6,
    keywords: '平静 / 疲惫',
    content: '工作收尾后慢慢放松下来，给自己泡了杯茶。',
  },
  {
    id: 'M-500',
    user: 'xiaoming',
    date: '2026-05-13',
    score: 7,
    keywords: '开心',
    content: '完成了一件拖延很久的小事，松了一口气。',
  },
  {
    id: 'M-499',
    user: 'lily',
    date: '2026-05-12',
    score: 5,
    keywords: '焦虑',
    content: '考试前有点紧张，做了几次深呼吸。',
  },
]

export const consultationSessions = [
  {
    id: 'S-2001',
    user: 'xiaoming',
    startTime: '2026-05-14 19:40',
    duration: '18分钟',
    summary: '讨论工作压力与睡眠',
    messages: [
      { role: 'assistant', content: '你好，我在这里陪你，今天想从哪里开始聊都可以。' },
      { role: 'user', content: '最近工作压力很大，晚上也睡不好。' },
      { role: 'assistant', content: '听起来你承担了很多。愿意说说最让你挂心的一件事吗？' },
    ],
  },
  {
    id: 'S-2000',
    user: 'xiaoming',
    startTime: '2026-05-13 21:12',
    duration: '26分钟',
    summary: '情绪低落与自我苛责',
    messages: [
      { role: 'assistant', content: '你好，我在这里陪你。' },
      { role: 'user', content: '总觉得自己做得不够好。' },
      { role: 'assistant', content: '自我苛责往往来自很高的期待。此刻，你最想被怎样对待？' },
    ],
  },
]

export const chatHistoryDemo = [
  { time: '今天 20:10', title: '与焦虑共处的一小时' },
  { time: '昨天 21:36', title: '关于睡眠的小困扰' },
]

export const dashboardStats = {
  totalUsers: 8,
  activeUsers: 1,
  moodLogs: 1,
  moodLogsToday: 0,
  sessions: 11,
  sessionsToday: 0,
  avgMood: 6.2,
  totalSessionsChart: 6,
  avgDuration: '42分钟',
}

export const emotionTrendDates = [
  '2026-01-26',
  '2026-02-01',
  '2026-02-06',
  '2026-02-11',
  '2026-02-16',
  '2026-02-20',
]

export const emotionTrendScores = [5.2, 5.8, 6.1, 6.0, 6.4, 6.2]
export const emotionTrendCounts = [2, 3, 4, 3, 5, 4]

export const sessionBarDates = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
export const sessionCounts = [3, 5, 4, 6, 5, 2, 4]
export const sessionUserCounts = [2, 3, 2, 4, 3, 1, 2]

export const activityDates = emotionTrendDates
export const activityLogin = [3, 4, 5, 4, 6, 5]
export const activityDiary = [1, 2, 2, 3, 2, 3]
export const activityConsult = [2, 3, 4, 3, 5, 4]
