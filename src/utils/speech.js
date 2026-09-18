// 浏览器内置语音合成朗读英文；返回 utterance（可挂 onstart/onend 驱动播放动画），不支持时返回 null
export function speak(text, rate = 0.9) {
  if (!('speechSynthesis' in window)) return null
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'en-US'
  u.rate = rate
  window.speechSynthesis.speak(u)
  return u
}
