// 12 个核心时态：在时间线上的位置、结构公式与双语例句
// pos: 时间轴位置（0=远过去, 50=现在, 100=远未来）；span 表示是否覆盖一段时间
export const tenses = [
  {
    id: 'past-simple', name: '一般过去时', en: 'Simple Past', group: 'past',
    pos: 25, span: null,
    formula: '主语 + 动词过去式 (did)',
    signal: 'yesterday, last week, ago, in 2010',
    explain: '过去某个时间点发生并结束的动作，与现在没有联系。',
    examples: [
      { en: 'I visited my grandparents last Sunday.', zh: '上周日我看望了祖父母。' },
      { en: 'She finished her homework an hour ago.', zh: '她一小时前完成了作业。' },
    ],
  },
  {
    id: 'past-continuous', name: '过去进行时', en: 'Past Continuous', group: 'past',
    pos: 25, span: [18, 32],
    formula: '主语 + was/were + doing',
    signal: 'at that time, at 8 yesterday, while',
    explain: '过去某一时刻正在进行的动作，时间线上是一段区间而不是一个点。',
    examples: [
      { en: 'I was reading when the phone rang.', zh: '电话响的时候我正在看书。' },
      { en: 'They were playing football at 4 pm yesterday.', zh: '昨天下午四点他们正在踢足球。' },
    ],
  },
  {
    id: 'past-perfect', name: '过去完成时', en: 'Past Perfect', group: 'past',
    pos: 12, span: null,
    formula: '主语 + had + done',
    signal: 'by the time, before, when（主句用过去时）',
    explain: '“过去的过去”：在过去某个动作之前已经完成。时间轴上钉在过去点之前。',
    examples: [
      { en: 'The train had left when we arrived.', zh: '我们到的时候火车已经开走了。' },
      { en: 'By 2019, he had learned 2,000 words.', zh: '到 2019 年为止，他已经学了 2000 个单词。' },
    ],
  },
  {
    id: 'present-simple', name: '一般现在时', en: 'Simple Present', group: 'present',
    pos: 50, span: [10, 90],
    formula: '主语 + 动词原形/三单 (do/does)',
    signal: 'always, usually, every day, often',
    explain: '习惯、事实和真理。它不钉在一个点上，而是覆盖整条时间线的反复发生。',
    examples: [
      { en: 'The sun rises in the east.', zh: '太阳从东方升起。' },
      { en: 'She goes to school by bike every day.', zh: '她每天骑自行车上学。' },
    ],
  },
  {
    id: 'present-continuous', name: '现在进行时', en: 'Present Continuous', group: 'present',
    pos: 50, span: [45, 55],
    formula: '主语 + am/is/are + doing',
    signal: 'now, right now, look, listen',
    explain: '此刻正在进行的一小段动作，时间线上是“现在”周围的一小段区间。',
    examples: [
      { en: 'Look! The kids are flying kites.', zh: '看！孩子们正在放风筝。' },
      { en: 'I am writing an email now.', zh: '我现在正在写一封邮件。' },
    ],
  },
  {
    id: 'present-perfect', name: '现在完成时', en: 'Present Perfect', group: 'present',
    pos: 50, span: [20, 50],
    formula: '主语 + have/has + done',
    signal: 'already, yet, just, ever, since, for',
    explain: '从过去开始、与现在有联系：要么持续到现在，要么结果影响现在。',
    examples: [
      { en: 'I have lived here for ten years.', zh: '我已经在这里住了十年。' },
      { en: 'She has just finished her lunch.', zh: '她刚吃完午饭。' },
    ],
  },
  {
    id: 'present-perfect-continuous', name: '现在完成进行时', en: 'Present Perfect Continuous', group: 'present',
    pos: 50, span: [30, 55],
    formula: '主语 + have/has + been + doing',
    signal: 'for + 时间段, since, all morning',
    explain: '从过去持续到现在、并且还在进行的动作，强调“一直在做”。',
    examples: [
      { en: 'It has been raining all morning.', zh: '雨下了一整个上午（还在下）。' },
      { en: 'He has been studying English since 2020.', zh: '他从 2020 年起一直在学英语。' },
    ],
  },
  {
    id: 'future-simple', name: '一般将来时', en: 'Simple Future', group: 'future',
    pos: 78, span: null,
    formula: '主语 + will / be going to + do',
    signal: 'tomorrow, next week, soon, in the future',
    explain: '将来某个时间要发生的动作或打算。will 表意愿/预测，be going to 表计划/迹象。',
    examples: [
      { en: 'I will call you tomorrow.', zh: '我明天会给你打电话。' },
      { en: 'Look at the clouds. It is going to rain.', zh: '看那些云，要下雨了。' },
    ],
  },
  {
    id: 'future-continuous', name: '将来进行时', en: 'Future Continuous', group: 'future',
    pos: 78, span: [72, 84],
    formula: '主语 + will be + doing',
    signal: 'at this time tomorrow, from 7 to 9 tonight',
    explain: '将来某一时刻正在进行的一段动作。',
    examples: [
      { en: 'This time tomorrow, we will be flying over the sea.', zh: '明天这个时候，我们将正飞越大海。' },
    ],
  },
  {
    id: 'future-perfect', name: '将来完成时', en: 'Future Perfect', group: 'future',
    pos: 85, span: [60, 85],
    formula: '主语 + will have + done',
    signal: 'by tomorrow, by the end of, by then',
    explain: '到将来某个时间点为止会完成的动作，时间线钉在“截止点”。',
    examples: [
      { en: 'I will have finished the report by Friday.', zh: '到周五为止我会完成这份报告。' },
    ],
  },
  {
    id: 'past-in-the-future', name: '过去将来时', en: 'Future in the Past', group: 'past',
    pos: 32, span: [32, 45],
    formula: '主语 + would / was going to + do',
    signal: 'he said…, I thought…（从句中）',
    explain: '站在过去的某个点向将来看：那时打算/预计要做的事。',
    examples: [
      { en: 'He said he would come the next day.', zh: '他说他第二天会来。' },
    ],
  },
  {
    id: 'present-simple-timetable', name: '一般现在时表将来', en: 'Present Simple for Timetables', group: 'present',
    pos: 50, span: [50, 80],
    formula: '主语 + 动词原形（时刻表用法）',
    signal: '时刻表、日程：train leaves, class starts',
    explain: '按时刻表确定发生的将来事件，用一般现在时表示“铁定的日程”。',
    examples: [
      { en: 'The train leaves at 7:05 tomorrow morning.', zh: '火车明早 7:05 发车。' },
    ],
  },
]

export const tenseGroups = [
  { key: 'past', label: '过去', color: '#c65f3d' },
  { key: 'present', label: '现在', color: '#2f5233' },
  { key: 'future', label: '未来', color: '#3d6ec6' },
]
