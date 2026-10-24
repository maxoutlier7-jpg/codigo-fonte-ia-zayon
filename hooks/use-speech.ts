'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'

type RecognitionResultEvent = {
  resultIndex: number
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>
}

type Recognition = {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: RecognitionResultEvent) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
}

type RecognitionConstructor = new () => Recognition

function getRecognitionConstructor(): RecognitionConstructor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: RecognitionConstructor
    webkitSpeechRecognition?: RecognitionConstructor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

const noopSubscribe = () => () => {}

export function useSpeechRecognition(onFinalTranscript: (text: string) => void) {
  const supported = useSyncExternalStore(
    noopSubscribe,
    () => getRecognitionConstructor() !== null,
    () => false,
  )
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const recognitionRef = useRef<Recognition | null>(null)
  const callbackRef = useRef(onFinalTranscript)

  useEffect(() => {
    callbackRef.current = onFinalTranscript
  }, [onFinalTranscript])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  const start = useCallback(() => {
    const Ctor = getRecognitionConstructor()
    if (!Ctor) return
    recognitionRef.current?.abort()

    const recognition = new Ctor()
    recognition.lang = 'pt-BR'
    recognition.continuous = false
    recognition.interimResults = true

    let finalText = ''
    recognition.onresult = (event) => {
      let interimText = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) finalText += result[0].transcript
        else interimText += result[0].transcript
      }
      setInterim(finalText + interimText)
    }
    recognition.onend = () => {
      setListening(false)
      setInterim('')
      const text = finalText.trim()
      if (text) callbackRef.current(text)
    }
    recognition.onerror = () => {
      setListening(false)
      setInterim('')
    }

    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }, [])

  useEffect(() => () => recognitionRef.current?.abort(), [])

  return { supported, listening, interim, start, stop }
}

function cleanForSpeech(text: string) {
  return text
    .replace(/```[\s\S]*?```/g, ' código omitido. ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_#>~|-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function useSpeechSynthesis() {
  const [speaking, setSpeaking] = useState(false)

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const clean = cleanForSpeech(text)
    if (!clean) return

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(clean)
    utterance.lang = 'pt-BR'
    utterance.rate = 1.05
    utterance.pitch = 0.95

    const voices = window.speechSynthesis.getVoices()
    const voice =
      voices.find((v) => v.lang === 'pt-BR' && /google|luciana|francisca|daniel/i.test(v.name)) ??
      voices.find((v) => v.lang.startsWith('pt'))
    if (voice) utterance.voice = voice

    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }, [])

  const cancel = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [])

  useEffect(() => cancel, [cancel])

  return { speaking, speak, cancel }
}
