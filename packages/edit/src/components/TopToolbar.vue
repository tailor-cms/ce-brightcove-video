<template>
  <VForm ref="form" validate-on="submit" @submit.prevent="save">
    <VToolbarItems class="ga-2">
      <VTextField
        v-model="elementData.accountId"
        :disabled="!isEditing"
        :rules="[rules.required]"
        class="required"
        hide-details="auto"
        label="Account Id"
        min-width="150"
        variant="outlined"
      />
      <VTextField
        v-model="elementData.playerId"
        :disabled="!isEditing"
        :rules="[rules.required]"
        class="required"
        hide-details="auto"
        label="Player Id"
        min-width="150"
        variant="outlined"
      />
      <VTextField
        v-model="elementData.videoId"
        :disabled="!isEditing"
        :rules="[rules.required]"
        class="required"
        hide-details="auto"
        label="Video Id"
        min-width="150"
        variant="outlined"
      />
      <VBtn v-if="!isEditing" @click="isEditing = true">Edit</VBtn>
      <template v-else>
        <VBtn v-if="isDirty" @click="save">Save</VBtn>
        <VBtn v-if="isDirty || !isEmpty" @click="cancel">Cancel</VBtn>
      </template>
    </VToolbarItems>
  </VForm>
</template>

<script lang="ts" setup>
import { computed, reactive, ref } from 'vue';
import type {
  Element,
  ElementData,
} from '@tailor-cms/ce-brightcove-video-manifest';
import cloneDeep from 'lodash/cloneDeep';

const rules = {
  required: (val: string) => !!val || 'The field is required.',
};

const props = defineProps<{ element: Element }>();
const emit = defineEmits(['save']);

const elementData = reactive<ElementData>(cloneDeep(props.element.data));
const isEmpty = computed(
  () => !elementData.accountId || !elementData.playerId || !elementData.videoId,
);
const isEditing = ref(isEmpty.value);
const form = ref<HTMLFormElement>();

const isDirty = computed(() => {
  const { accountId, playerId, videoId } = props.element.data;
  return (
    accountId !== elementData.accountId ||
    playerId !== elementData.playerId ||
    videoId !== elementData.videoId
  );
});

const save = async () => {
  const { valid } = await form.value?.validate();
  if (!valid) return;
  emit('save', elementData);
  isEditing.value = false;
};

const cancel = () => {
  elementData.accountId = props.element.data.accountId;
  elementData.playerId = props.element.data.playerId;
  elementData.videoId = props.element.data.videoId;
  form.value?.resetValidation();
  isEditing.value = false;
};
</script>
