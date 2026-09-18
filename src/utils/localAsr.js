// 离线语音识别：transformers.js + Whisper tiny.en，完全在浏览器本地运行
// 模型从国内镜像 hf-mirror.com 下载（约 40MB），浏览器缓存后离线可用
// 不依赖 Google/微软云端识别服务

let asrPromise = null

export async function loadLocalAsr(onProgress) {
  if (!asrPromise) {
    asrPromise = (async () => {
      const { pipeline, env } = await import('@huggingface/transformers')
      // 国内可访问的 HuggingFace 镜像
      env.remoteHost = 'https://hf-mirror.com'
      // 本站未配置 COOP/COEP 跨域隔离头，WASM 只能单线程运行
      if (env.backends?.onnx?.wasm) env.backends.onnx.wasm.numThreads = 1
      return pipeline('automatic-speech-recognition', 'onnx-community/whisper-tiny.en', {
        dtype: 'q8',
        progress_callback: onProgress,
      })
    })()
  }
  return asrPromise
}

/**
 * 把录音 Blob 转成文字
 * 流程：解码 → 重采样到 16kHz 单声道 → Whisper 推理
 */
export async function transcribeRecording(blobUrl, onProgress) {
  const blob = await (await fetch(blobUrl)).blob()

  // decodeAudioData 需要一个 BaseAudioContext（离线即可，不会出声）
  const arrayBuffer = await blob.arrayBuffer()
  const decodeCtx = new OfflineAudioContext(1, 1, 44100)
  const audioBuffer = await decodeCtx.decodeAudioData(arrayBuffer)

  // 重采样到 16kHz（Whisper 要求）
  const targetLen = Math.max(1, Math.ceil(audioBuffer.duration * 16000))
  const offline = new OfflineAudioContext(1, targetLen, 16000)
  const src = offline.createBufferSource()
  src.buffer = audioBuffer
  src.connect(offline.destination)
  src.start()
  const rendered = await offline.startRendering()
  const pcm = rendered.getChannelData(0)

  const asr = await loadLocalAsr(onProgress)
  const out = await asr(pcm)
  return (out?.text || '').trim()
}
