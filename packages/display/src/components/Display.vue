<template>
  <div class="tce-brightcove-video-root">
    <BrightcovePlayer
      v-if="isConfigured"
      ref="player"
      :account-id="accountId!"
      :player-id="playerId!"
      :resume-time="userState?.currentTime"
      :video-id="videoId!"
      class="player"
      @seeked="handleSeeked"
      @timeupdate="handleTimeUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { debounce, throttle } from 'lodash-es';
import { computed } from 'vue';
import type { Element } from '@tailor-cms/ce-brightcove-video-manifest';

import BrightcovePlayer from './BrightcovePlayer.vue';

const PROGRESS_UPDATE_INTERVAL = 5000;
const SEEK_DEBOUNCE_INTERVAL = 300;

const props = defineProps<{ element: Element; userState: any }>();
const emit = defineEmits<{ interaction: [data: any] }>();

const accountId = computed(() => props.element.data.accountId);
const playerId = computed(() => props.element.data.playerId);
const videoId = computed(() => props.element.data.videoId);

const isConfigured = computed(
  () => accountId.value && playerId.value && videoId.value,
);

const interact = (currentTime: number) => {
  const furthestTime = Math.max(
    props.userState?.furthestTime ?? 0,
    currentTime,
  );
  emit('interaction', { currentTime, furthestTime });
};
const handleTimeUpdate = throttle(interact, PROGRESS_UPDATE_INTERVAL);
const handleSeeked = debounce(interact, SEEK_DEBOUNCE_INTERVAL);
</script>

<style scoped>
.tce-brightcove-video-root {
}
</style>
