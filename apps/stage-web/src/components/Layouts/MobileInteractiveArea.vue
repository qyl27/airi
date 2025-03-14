<script setup lang="ts">
import type { ChatProvider } from '@xsai-ext/shared-providers'

import { BasicTextarea } from '@proj-airi/stage-ui/components'
import { useMicVAD } from '@proj-airi/stage-ui/composables'
import { useChatStore, useConsciousnessStore, useProvidersStore, useSettings } from '@proj-airi/stage-ui/stores'
import { storeToRefs } from 'pinia'
import { DrawerContent, DrawerOverlay, DrawerPortal, DrawerRoot, DrawerTrigger } from 'vaul-vue'
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import MobileChatHistory from '../Widgets/MobileChatHistory.vue'
import MobileSettings from '../Widgets/MobileSettings.vue'

const emit = defineEmits<{
  (e: 'settingsOpen', open: boolean): void
}>()

const messageInput = ref('')
const listening = ref(false)

const providersStore = useProvidersStore()
const { activeProvider, activeModel } = storeToRefs(useConsciousnessStore())

// const { audioInputs } = useDevicesList({ constraints: { audio: true }, requestPermissions: true })
// const { selectedAudioDevice, isAudioInputOn, selectedAudioDeviceId } = storeToRefs(useSettings())
const { isAudioInputOn, selectedAudioDeviceId } = storeToRefs(useSettings())
const { send, onAfterSend } = useChatStore()
const { t } = useI18n()

async function handleSend() {
  if (!messageInput.value.trim()) {
    return
  }

  await send(messageInput.value, { chatProvider: providersStore.getProviderInstance(activeProvider.value) as ChatProvider, model: activeModel.value })
}

const { destroy, start } = useMicVAD(selectedAudioDeviceId, {
  onSpeechStart: () => {
    // TODO: interrupt the playback
    // TODO: interrupt any of the ongoing TTS
    // TODO: interrupt any of the ongoing LLM requests
    // TODO: interrupt any of the ongoing animation of Live2D or VRM
    // TODO: once interrupted, we should somehow switch to listen or thinking
    //       emotion / expression?
    listening.value = true
  },
  // VAD misfire means while speech end is detected but
  // the frames of the segment of the audio buffer
  // is not enough to be considered as a speech segment
  // which controlled by the `minSpeechFrames` parameter
  onVADMisfire: () => {
    // TODO: do audio buffer send to whisper
    listening.value = false
  },
  onSpeechEnd: (buffer) => {
    // TODO: do audio buffer send to whisper
    listening.value = false
    handleTranscription(buffer)
  },
  auto: false,
})

function handleTranscription(_buffer: Float32Array<ArrayBufferLike>) {
  // eslint-disable-next-line no-alert
  alert('Transcription is not implemented yet')
}

// async function handleAudioInputChange(event: Event) {
//   const target = event.target as HTMLSelectElement
//   const found = audioInputs.value.find(d => d.deviceId === target.value)
//   if (!found) {
//     selectedAudioDevice.value = undefined
//     return
//   }

//   selectedAudioDevice.value = found
// }

function handleSettingsOpen(open: boolean) {
  emit('settingsOpen', open)
}

watch(isAudioInputOn, async (value) => {
  if (value === 'false') {
    destroy()
  }
})

onAfterSend(async () => {
  messageInput.value = ''
})

onMounted(() => {
  start()
})
</script>

<template>
  <div>
    <div relative w-full flex gap-1>
      <MobileChatHistory absolute left-0 top-0 transform="translate-y-[-100%]" w-full />
      <div flex flex-1>
        <BasicTextarea
          v-model="messageInput"
          :placeholder="t('stage.message')"
          border="solid 2 primary-100 dark:primary-400/20"
          text="primary-400 hover:primary-600 dark:[#905073] dark:hover:primary-600 placeholder:primary-400 placeholder:hover:primary-600 placeholder:dark:[#905073] placeholder:dark:hover:primary-600"
          bg="primary-50 dark:[#3c2632]" max-h="[10lh]" min-h="[1lh]"
          w-full resize-none overflow-y-scroll rounded-l-xl p-2 font-medium outline-none
          transition="all duration-250 ease-in-out placeholder:all placeholder:duration-250 placeholder:ease-in-out"
          @submit="handleSend"
        />
      </div>
      <DrawerRoot should-scale-background @update:open="handleSettingsOpen">
        <DrawerTrigger
          class="px-4 py-2.5"
          border="solid 2 primary-100 dark:primary-400/20"
          text="lg primary-400 hover:primary-600 dark:[#905073] dark:hover:primary-600 placeholder:primary-400 placeholder:hover:primary-600 placeholder:dark:[#905073] placeholder:dark:hover:primary-600"
          bg="primary-50 dark:[#3c2632]" max-h="[10lh]" min-h="[1lh]" rounded-r-xl
        >
          <div i-solar:settings-bold-duotone />
        </DrawerTrigger>
        <DrawerPortal>
          <DrawerOverlay class="fixed inset-0 z-50 bg-black/40" />
          <DrawerContent
            max-h="[75%]"
            fixed bottom-0 left-0 right-0 z-50 mt-24 h-full flex flex-col rounded-t-lg bg="[#fffbff] dark:[#1f1a1d]"
          >
            <div class="flex flex-1 flex-col rounded-t-lg p-5" bg="[#fffbff] dark:[#1f1a1d]" gap-2>
              <MobileSettings />
            </div>
          </DrawerContent>
        </DrawerPortal>
      </DrawerRoot>
    </div>
  </div>
</template>
