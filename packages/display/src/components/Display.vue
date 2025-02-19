<template>
  <div class="tce-root">
    <BrightcovePlayer
      v-if="isConfigured"
      ref="player"
      :account-id="data.accountId!"
      :player-id="data.playerId!"
      :video-id="data.videoId!"
      class="player"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ElementData } from '@tailor-cms/ce-brightcove-video-manifest';

import BrightcovePlayer from './BrightcovePlayer.vue';

const props = defineProps<{ id: number; data: ElementData; userState: any }>();
defineEmits(['interaction']);

const isConfigured = computed(
  () => props.data.accountId && props.data.playerId && props.data.videoId,
);
</script>

<style scoped>
.tce-root {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 1rem;
}
</style>
