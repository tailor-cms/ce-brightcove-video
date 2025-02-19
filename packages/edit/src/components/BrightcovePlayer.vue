<template>
  <div class="brightcove-player">
    <VSheet
      v-if="showError"
      class="h-100 d-flex flex-column align-center justify-center opacity-90"
      color="black"
    >
      <VIcon class="mb-2" icon="mdi-alert" size="42" />
      <div class="text-h6">Error loading media!</div>
    </VSheet>
    <div v-show="!showError" ref="videoWrapper" class="wrapper"></div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import join from 'url-join';

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    bc: any;
  }
}

const BASE_URL = '//players.brightcove.net/';
const BrightcoveErrorCode = {
  NOT_FOUND: 'VIDEO_CLOUD_ERR_VIDEO_NOT_FOUND',
  INVALID_CONFIG: 'ERR_INVALID_CONFIGURATION',
};

interface BrightcoveError {
  code: string;
  accountId: string;
  playerId: string;
}

const props = defineProps<{
  accountId: string;
  playerId: string;
  videoId: string;
}>();

const error = ref<BrightcoveError | null>(null);
const style = ref<Element | null>(null);
const script = ref<HTMLScriptElement | null>(null);
const player = ref<any>(null);

const playerUrl = computed(() =>
  join(BASE_URL, props.accountId, `${props.playerId}_default`, 'index.min.js'),
);

const showError = computed(() => {
  if (!error.value) return false;
  const code = error.value.code;
  return (
    code === BrightcoveErrorCode.NOT_FOUND ||
    code === BrightcoveErrorCode.INVALID_CONFIG
  );
});

const createPlayer = () => {
  const video = document.createElement('video');
  Object.assign(video.dataset, {
    account: props.accountId,
    player: props.playerId,
    videoId: props.videoId,
  });
  video.className = 'video-js';
  video.setAttribute('controls', '');
  return video;
};

const destroyPlayer = () => {
  if (player.value) {
    player.value.pause();
    player.value.dispose();
    player.value = null;
  }
  error.value = null;
  if (script.value) document.body.removeChild(script.value);
  script.value = null;
  if (style.value) document.head.removeChild(style.value);
  style.value = null;
  if (videoWrapper.value) videoWrapper.value.innerHTML = '';
};

const initPlayer = (url = playerUrl.value) => {
  destroyPlayer();
  script.value = loadScript(url, document.body, (err) => {
    if (err) {
      onError({
        code: BrightcoveErrorCode.INVALID_CONFIG,
        accountId: props.accountId,
        playerId: props.playerId,
      });
      return;
    }
    style.value = setTheme();
    const video = createPlayer();
    videoWrapper.value?.appendChild(video);
    player.value = window.bc(video);
    player.value.autoplay(false);
    player.value.on('error', () => onError(player.value.error()));
  });
};

const setTheme = () => {
  const cls = `bc-style-${props.playerId}-default`;
  const theme = document.head.getElementsByClassName(cls)[0];
  return document.head.insertBefore(theme, null);
};

const pause = () => {
  if (player.value) player.value.pause();
};

const onError = (err: any) => {
  error.value = err;
};

watch(playerUrl, () => {
  if (!videoWrapper.value) return;
  initPlayer();
});

watch(
  () => props.videoId,
  () => {
    if (!videoWrapper.value) return;
    initPlayer();
  },
);

onMounted(() => {
  initPlayer();
});

onBeforeUnmount(() => {
  destroyPlayer();
});

const videoWrapper = ref<HTMLElement | null>(null);

function loadScript(
  url: string,
  dest: HTMLElement,
  cb: (err: Error | null, script: HTMLScriptElement) => void,
) {
  const script = document.createElement('script');
  script.src = url;
  script.async = false;
  script.onload = () => cb(null, script);
  script.onerror = () => cb(new Error('Error loading script!'), script);
  return dest.appendChild(script);
}

defineExpose({
  pause,
});
</script>

<style lang="scss" scoped>
.brightcove-player,
.brightcove-player :deep(.video-js) {
  width: 100%;
  height: 360px;
}
</style>
