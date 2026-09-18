// 方位/移动介词：在街区地图上的标注位置与双语例句
// x,y 为地图坐标（百分比），用于 SVG 标注
export const placePreps = [
  { word: 'in', zh: '在……里面', x: 30, y: 38, example: { en: 'The cat is in the box.', zh: '猫在盒子里。' }, note: '强调在封闭空间内部' },
  { word: 'on', zh: '在……上面（接触）', x: 52, y: 24, example: { en: 'The book is on the desk.', zh: '书在课桌上。' }, note: '与表面接触' },
  { word: 'under', zh: '在……下面', x: 52, y: 62, example: { en: 'The dog is under the table.', zh: '狗在桌子下面。' }, note: '正下方，不接触' },
  { word: 'behind', zh: '在……后面', x: 76, y: 38, example: { en: 'The garden is behind the house.', zh: '花园在房子后面。' }, note: '' },
  { word: 'in front of', zh: '在……前面（外部）', x: 14, y: 38, example: { en: 'A tree is in front of the house.', zh: '房子前面有一棵树。' }, note: '与 behind 相对；内部前面用 in the front of' },
  { word: 'next to', zh: '紧挨着', x: 42, y: 38, example: { en: 'The bank is next to the post office.', zh: '银行紧挨着邮局。' }, note: '相当于 beside' },
  { word: 'between', zh: '在两者之间', x: 64, y: 50, example: { en: 'The shop is between the bank and the school.', zh: '商店在银行和学校之间。' }, note: 'between A and B' },
  { word: 'opposite', zh: '在……对面', x: 30, y: 74, example: { en: 'The cinema is opposite the park.', zh: '电影院在公园对面。' }, note: '隔着一条街' },
  { word: 'near', zh: '在……附近', x: 36, y: 30, example: { en: 'There is a bus stop near my home.', zh: '我家附近有个公交站。' }, note: '距离近，不一定挨着' },
  { word: 'above', zh: '在……上方（不接触）', x: 52, y: 14, example: { en: 'The plane flew above the clouds.', zh: '飞机在云层上方飞。' }, note: '与 below 相对；接触表面用 on' },
  { word: 'below', zh: '在……下方', x: 52, y: 76, example: { en: 'The temperature is below zero.', zh: '气温在零度以下。' }, note: '' },
]

export const movePreps = [
  { word: 'into', zh: '进入……里', example: { en: 'He walked into the room.', zh: '他走进了房间。' }, note: '由外到内' },
  { word: 'out of', zh: '从……出来', example: { en: 'She ran out of the house.', zh: '她从房子里跑了出来。' }, note: '由内到外' },
  { word: 'across', zh: '横穿（表面）', example: { en: 'Walk across the street.', zh: '走过这条街。' }, note: '从一边到另一边（平面）' },
  { word: 'through', zh: '穿过（内部）', example: { en: 'The train went through the tunnel.', zh: '火车穿过了隧道。' }, note: '从空间内部穿过' },
  { word: 'along', zh: '沿着', example: { en: 'We walked along the river.', zh: '我们沿着河边走。' }, note: '' },
  { word: 'past', zh: '经过', example: { en: 'She walked past the shop.', zh: '她走过了商店。' }, note: '从旁边经过，不停留' },
  { word: 'over', zh: '越过（上方）', example: { en: 'The bird flew over the bridge.', zh: '鸟从桥上飞过。' }, note: '越过上方' },
  { word: 'to / towards', zh: '朝……去', example: { en: 'He walked towards the station.', zh: '他朝车站走去。' }, note: 'towards 强调方向，to 强调到达' },
  { word: 'around', zh: '环绕；在……周围', example: { en: 'They sat around the fire.', zh: '他们围坐在火堆旁。' }, note: '' },
]
