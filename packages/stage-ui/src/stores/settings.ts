import { useDevicesList, useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'

import { Voice } from '../constants/elevenlabs'

export const useSettings = defineStore('settings', () => {
  const selectedAudioDevice = ref<MediaDeviceInfo>()

  const language = useLocalStorage('settings/language', 'en-US')
  const stageView = useLocalStorage('settings/stage/view/model-renderer', '2d')

  const openAiApiKey = useLocalStorage('settings/credentials/openai-api-key', '')
  const openAiApiBaseURL = useLocalStorage('settings/credentials/openai-api-base-url', '')
  const elevenLabsApiKey = useLocalStorage('settings/credentials/elevenlabs-api-key', '')

  const openAiModel = useLocalStorage<{ id: string, name?: string }>('settings/llm/openai/model', { id: 'openai/gpt-3.5-turbo', name: 'OpenAI GPT3.5 Turbo' })

  const isAudioInputOn = useLocalStorage('settings/audio/input', 'true')
  const selectedAudioDeviceId = computed(() => selectedAudioDevice.value?.deviceId)
  const { audioInputs } = useDevicesList({ constraints: { audio: true }, requestPermissions: true })

  const elevenlabsVoiceEnglish = useLocalStorage<Voice>('settings/llm/elevenlabs/voice/en', Voice.Myriam)
  const elevenlabsVoiceJapanese = useLocalStorage<Voice>('settings/llm/elevenlabs/voice/ja', Voice.Morioki)

  // TODO: extract to a separate store, use a single page to do this
  const live2dModelFile = ref<File>()
  const live2dModelUrl = ref<string>('./assets/live2d/models/hiyori_pro_zh.zip')
  const live2dLoadSource = ref<'file' | 'url'>('url')
  const loadingLive2dModel = ref(false) // if set to true, the model will be loaded
  const live2dPosition = useLocalStorage('settings/live2d/position', { x: 0, y: 0 }) // position is relative to the center of the screen
  const live2dCurrentMotion = ref<{ group: string, index: number }>({ group: 'Idle', index: 0 })
  const availableLive2dMotions = ref<{ motionName: string, motionIndex: number, fileName: string }[]>([])
  const live2dMotionMap = useLocalStorage<Record<string, string>>('settings/live2d/motion-map', {})

  const disableTransitions = useLocalStorage('settings/disable-transitions', false)

  watch(isAudioInputOn, (value) => {
    if (value === 'false') {
      selectedAudioDevice.value = undefined
    }
    if (value === 'true') {
      selectedAudioDevice.value = audioInputs.value[0]
    }
  })

  onMounted(() => {
    if (isAudioInputOn.value === 'true' && !selectedAudioDevice.value) {
      selectedAudioDevice.value = audioInputs.value[0]
    }
  })

  watch(audioInputs, () => {
    if (isAudioInputOn.value === 'true' && !selectedAudioDevice.value) {
      selectedAudioDevice.value = audioInputs.value[0]
    }
  })

  return {
    openAiApiKey,
    openAiApiBaseURL,
    openAiModel,
    elevenLabsApiKey,
    live2dModelFile,
    live2dModelUrl,
    live2dLoadSource,
    live2dCurrentMotion,
    live2dPosition,
    availableLive2dMotions,
    live2dMotionMap,
    loadingLive2dModel,
    disableTransitions,
    language,
    stageView,
    isAudioInputOn,
    selectedAudioDevice,
    selectedAudioDeviceId,
    elevenlabsVoiceEnglish,
    elevenlabsVoiceJapanese,
  }
})
