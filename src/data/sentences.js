// 句子拆解：五种基本句型 + 可点击词块
// chunks: { text, role } role: S 主语 V 谓语 O 宾语 P 表语 A 定语/状语等修饰 Oi 间宾 Od 直宾 C 补语
export const patterns = [
  {
    id: 'sv', name: '主 + 谓', formula: 'S + V', color: '#2f5233',
    desc: '谓语是不及物动词，句子到动词就结束了。',
    sentences: [
      {
        chunks: [
          { text: 'The sun', role: 'S' },
          { text: 'rises', role: 'V' },
          { text: 'in the east', role: 'A' },
        ],
        zh: '太阳从东方升起。',
        notes: { S: '动作的执行者', V: '不及物动词，后面不需要宾语', A: '介词短语作地点状语，修饰 rises' },
      },
      {
        chunks: [
          { text: 'The little girl', role: 'S' },
          { text: 'cried', role: 'V' },
          { text: 'loudly', role: 'A' },
        ],
        zh: '小女孩大声哭了起来。',
        notes: { S: 'the + 形容词 + 名词构成主语', V: '不及物动词过去式', A: '副词作方式状语' },
      },
    ],
  },
  {
    id: 'svo', name: '主 + 谓 + 宾', formula: 'S + V + O', color: '#3d6ec6',
    desc: '谓语是及物动词，动作要有承受对象。',
    sentences: [
      {
        chunks: [
          { text: 'I', role: 'S' },
          { text: 'love', role: 'V' },
          { text: 'English', role: 'O' },
        ],
        zh: '我喜欢英语。',
        notes: { S: '主语', V: '及物动词', O: '动作的承受者，名词作宾语' },
      },
      {
        chunks: [
          { text: 'My father', role: 'S' },
          { text: 'bought', role: 'V' },
          { text: 'a new bike', role: 'O' },
          { text: 'for me', role: 'A' },
          { text: 'yesterday', role: 'A' },
        ],
        zh: '昨天爸爸给我买了一辆新自行车。',
        notes: { S: '主语', V: 'buy 的过去式', O: 'a + 形容词 + 名词作宾语', A: '状语：对象与时间' },
      },
    ],
  },
  {
    id: 'svp', name: '主 + 系 + 表', formula: 'S + Link-V + P', color: '#c65f3d',
    desc: '系动词（be / look / feel / become…）连接主语和它的状态或身份。',
    sentences: [
      {
        chunks: [
          { text: 'The soup', role: 'S' },
          { text: 'tastes', role: 'V' },
          { text: 'delicious', role: 'P' },
        ],
        zh: '这汤尝起来很美味。',
        notes: { S: '主语', V: '感官系动词 taste，后面接形容词', P: '表语说明主语怎么样' },
      },
      {
        chunks: [
          { text: 'She', role: 'S' },
          { text: 'became', role: 'V' },
          { text: 'a teacher', role: 'P' },
          { text: 'in 2020', role: 'A' },
        ],
        zh: '她在 2020 年成了一名老师。',
        notes: { S: '主语', V: '变化系动词 become', P: '名词作表语，说明身份', A: '时间状语' },
      },
    ],
  },
  {
    id: 'svoo', name: '主 + 谓 + 间宾 + 直宾', formula: 'S + V + Oi + Od', color: '#e8a33d',
    desc: '动词后接两个宾语：人（间接宾语）+ 物（直接宾语）。可转换为 give sth. to sb.。',
    sentences: [
      {
        chunks: [
          { text: 'He', role: 'S' },
          { text: 'gave', role: 'V' },
          { text: 'me', role: 'Oi' },
          { text: 'a book', role: 'Od' },
        ],
        zh: '他给了我一本书。 = He gave a book to me.',
        notes: { S: '主语', V: 'give 的过去式，常接双宾', Oi: '间接宾语：接受动作的人', Od: '直接宾语：被给出的物' },
      },
      {
        chunks: [
          { text: 'Mom', role: 'S' },
          { text: 'made', role: 'V' },
          { text: 'us', role: 'Oi' },
          { text: 'dinner', role: 'Od' },
        ],
        zh: '妈妈给我们做了晚饭。 = Mom made dinner for us.',
        notes: { S: '主语', V: 'make 类双宾动词用 for 转换', Oi: '间接宾语', Od: '直接宾语' },
      },
    ],
  },
  {
    id: 'svoc', name: '主 + 谓 + 宾 + 补', formula: 'S + V + O + C', color: '#7a4fc6',
    desc: '宾语后面再加补语，说明宾语的状态或动作（使役/感官动词常见）。',
    sentences: [
      {
        chunks: [
          { text: 'We', role: 'S' },
          { text: 'keep', role: 'V' },
          { text: 'our classroom', role: 'O' },
          { text: 'clean', role: 'C' },
        ],
        zh: '我们保持教室干净。',
        notes: { S: '主语', V: 'keep + 宾语 + 形容词', O: '宾语', C: '宾语补足语，说明 classroom 的状态' },
      },
      {
        chunks: [
          { text: 'The teacher', role: 'S' },
          { text: 'asked', role: 'V' },
          { text: 'us', role: 'O' },
          { text: 'to read aloud', role: 'C' },
        ],
        zh: '老师让我们大声朗读。',
        notes: { S: '主语', V: 'ask sb. to do sth.', O: '宾语', C: '不定式作宾补，说明 us 要做的动作' },
      },
    ],
  },
]

// 句子成分图例
export const roleLegend = [
  { role: 'S', label: '主语', color: '#2f5233', desc: '谁 / 什么' },
  { role: 'V', label: '谓语', color: '#c65f3d', desc: '做什么 / 怎么样' },
  { role: 'O', label: '宾语', color: '#3d6ec6', desc: '动作的承受者' },
  { role: 'P', label: '表语', color: '#7a4fc6', desc: '主语的身份或状态' },
  { role: 'Oi', label: '间接宾语', color: '#c68a3d', desc: '给谁' },
  { role: 'Od', label: '直接宾语', color: '#3d9ec6', desc: '给什么' },
  { role: 'C', label: '宾语补足语', color: '#c63d6e', desc: '补充说明宾语' },
  { role: 'A', label: '状语/修饰语', color: '#8a8f85', desc: '时间、地点、方式等' },
]
