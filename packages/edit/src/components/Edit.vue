<template>
  <div class="tce-video">
    <BrightcovePlayer
      v-if="isConfigured"
      ref="player"
      :account-id="config.accountId!"
      :player-id="config.playerId!"
      :video-id="config.videoId!"
      class="player"
    />
    <ElementPlaceholder
      v-else
      :icon="manifest.ui.icon"
      :is-disabled="isDisabled"
      :is-focused="isFocused"
      :name="`${manifest.name} component`"
      active-icon="mdi-arrow-up"
      active-placeholder="Use toolbar to set the video parameters"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import type { Element } from '@tailor-cms/ce-brightcove-video-manifest';
import { ElementPlaceholder } from '@tailor-cms/core-components';
import manifest from '@tailor-cms/ce-brightcove-video-manifest';

import BrightcovePlayer from './BrightcovePlayer.vue';

const props = defineProps<{
  element: Element;
  isFocused: boolean;
  isDisabled: boolean;
}>();
defineEmits(['save']);

const player = ref<any>(null);
const config = computed(() => props.element.data);
const isConfigured = computed(
  () => config.value.accountId && config.value.playerId && config.value.videoId,
);

watch(
  () => props.isFocused,
  (val) => {
    if (!val && player.value) player.value.pause();
  },
);
</script>

<style lang="scss" scoped>
.tce-video {
  text-align: left;

  iframe {
    aspect-ratio: 16/9;
  }
}
</style>
