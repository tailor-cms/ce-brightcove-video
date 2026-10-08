<template>
  <div class="tce-video text-left">
    <TailorElementPlaceholder
      v-if="!isConfigured && isReadonly"
      :icon="manifest.ui.icon"
      :name="`${manifest.name} component`"
      is-readonly
    />
    <div
      v-else-if="!isConfigured"
      class="d-flex flex-column align-center text-center pa-6"
    >
      <VAvatar size="x-large" variant="tonal">
        <VIcon :icon="manifest.ui.icon" size="28" />
      </VAvatar>
      <div class="mt-4 mb-1 font-weight-medium text-title-large">
        Add a Brightcove video
      </div>
      <div class="text-body-medium text-medium-emphasis">
        Show a video from your Brightcove account
      </div>
      <VBtn
        class="mt-4"
        color="secondary"
        prepend-icon="mdi-form-textbox"
        text="Enter IDs"
        variant="tonal"
        @click="openDialog"
      />
    </div>
    <template v-else>
      <BrightcovePlayer
        ref="player"
        :account-id="element.data.accountId!"
        :player-id="element.data.playerId!"
        :video-id="element.data.videoId!"
        class="player"
        @mediainfo="videoTitle = $event"
      />
      <VExpandTransition>
        <div
          v-if="isFocused && !isReadonly"
          class="position-sticky bottom-0 pa-3 mb-n3 bg-surface-raised"
        >
          <div class="d-flex align-center ga-2">
            <VIcon :icon="manifest.ui.icon" size="small" />
            <span
              :title="`Video ${element.data.videoId}`"
              class="text-body-small text-medium-emphasis text-truncate"
            >
              {{ videoTitle || `Video ${element.data.videoId}` }}
            </span>
            <VSpacer />
            <div class="d-flex align-center mr-n3">
              <VBtn
                prepend-icon="mdi-pencil-outline"
                size="small"
                text="Change IDs"
                variant="text"
                @click="openDialog"
              />
              <VBtn
                color="error"
                prepend-icon="mdi-trash-can-outline"
                size="small"
                text="Remove"
                variant="text"
                @click="remove"
              />
            </div>
          </div>
        </div>
      </VExpandTransition>
    </template>
    <TailorDialog
      v-model="isDialogOpen"
      :header-icon="manifest.ui.icon"
      :title="isConfigured ? 'Change IDs' : 'Add a Brightcove video'"
      width="500"
      @after-enter="focusFirst"
    >
      <template #body>
        <VForm
          ref="dialogForm"
          class="d-flex flex-column ga-3 pt-2"
          validate-on="submit"
          @submit.prevent="save(dialogForm)"
        >
          <VTextField
            v-for="(field, index) in FIELDS"
            :key="field.key"
            :ref="index === 0 ? 'firstField' : undefined"
            v-model="form[field.key]"
            :label="field.label"
            :rules="[rules.required(field.label)]"
            hide-details="auto"
            variant="outlined"
          />
        </VForm>
      </template>
      <template #actions>
        <VBtn text="Cancel" variant="text" @click="isDialogOpen = false" />
        <VBtn
          :text="isConfigured ? 'Save' : 'Submit'"
          class="ml-2 px-4"
          color="primary"
          variant="flat"
          @click="save(dialogForm)"
        />
      </template>
    </TailorDialog>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, watch } from 'vue';
import type {
  Element,
  ElementData,
} from '@tailor-cms/ce-brightcove-video-manifest';
import manifest from '@tailor-cms/ce-brightcove-video-manifest';

import BrightcovePlayer from './BrightcovePlayer.vue';

type IdKey = 'accountId' | 'playerId' | 'videoId';

const FIELDS: { key: IdKey; label: string }[] = [
  { key: 'accountId', label: 'Account ID' },
  { key: 'playerId', label: 'Player ID' },
  { key: 'videoId', label: 'Video ID' },
];

const rules = {
  required: (label: string) => (val: string) =>
    !!val?.trim() || `Enter the ${label[0].toLowerCase()}${label.slice(1)}.`,
};

const props = defineProps<{
  element: Element;
  isDragged: boolean;
  isFocused: boolean;
  isReadonly: boolean;
}>();
const emit = defineEmits<{ save: [data: ElementData] }>();

const player = ref<any>(null);
const videoTitle = ref<string | null>(null);
const dialogForm = ref();
const firstField = ref();
const isDialogOpen = ref(false);

const pick = (data: ElementData) => ({
  accountId: data.accountId ?? '',
  playerId: data.playerId ?? '',
  videoId: data.videoId ?? '',
});
const form = reactive(pick(props.element.data));

const isConfigured = computed(() => {
  const { accountId, playerId, videoId } = props.element.data;
  return !!(accountId && playerId && videoId);
});

const save = async (formRef: any) => {
  const { valid } = await formRef.validate();
  if (!valid) return;
  emit('save', {
    ...props.element.data,
    accountId: form.accountId.trim(),
    playerId: form.playerId.trim(),
    videoId: form.videoId.trim(),
  });
  isDialogOpen.value = false;
};

const openDialog = () => {
  Object.assign(form, pick(props.element.data));
  dialogForm.value?.resetValidation();
  isDialogOpen.value = true;
};

// v-for refs collect into an array
const focusFirst = () => {
  const field = Array.isArray(firstField.value)
    ? firstField.value[0]
    : firstField.value;
  field?.focus();
};

const remove = () => {
  Object.assign(form, { accountId: '', playerId: '', videoId: '' });
  emit('save', { ...props.element.data, ...form });
};

// Drop the stale title until the new video reports its own
watch(
  () => [
    props.element.data.accountId,
    props.element.data.playerId,
    props.element.data.videoId,
  ],
  () => (videoTitle.value = null),
);

watch(
  () => props.isFocused,
  (val) => {
    if (!val && player.value) player.value.pause();
  },
);
</script>

<style lang="scss" scoped>
.tce-video iframe {
  aspect-ratio: 16/9;
}
</style>
