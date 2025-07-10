<template>
  <div class="tce-brightcove-video-root">
    <BrightcovePlayer
      v-if="isConfigured"
      ref="player"
      :account-id="accountId!"
      :player-id="playerId!"
      :video-id="videoId!"
      class="player"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Element } from '@tailor-cms/ce-brightcove-video-manifest';

import BrightcovePlayer from './BrightcovePlayer.vue';

const props = defineProps<{ element: Element; userState: any }>();
defineEmits(['interaction']);

const accountId = computed(() => props.element.data.accountId);
const playerId = computed(() => props.element.data.playerId);
const videoId = computed(() => props.element.data.videoId);

const isConfigured = computed(
  () => accountId.value && playerId.value && videoId.value,
);
</script>

<style scoped>
.tce-brightcove-video-root {
}
</style>
