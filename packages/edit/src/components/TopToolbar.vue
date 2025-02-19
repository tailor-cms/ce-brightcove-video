<template>
  <VForm ref="form" validate-on="submit" @submit.prevent="save">
    <VToolbarItems class="ga-2">
      <VTextField
        v-model="elementData.accountId"
        :disabled="!isEditing"
        :rules="[rules.required]"
        class="required mt-2 mr-3"
        hide-details="auto"
        label="Account Id"
        min-width="150"
        variant="outlined"
      />
      <VTextField
        v-model="elementData.playerId"
        :disabled="!isEditing"
        :rules="[rules.required]"
        class="required mt-2 mr-3"
        hide-details="auto"
        label="Player Id"
        min-width="100"
        variant="outlined"
      />
      <VTextField
        v-model="elementData.videoId"
        :disabled="!isEditing"
        :rules="[rules.required]"
        class="required mt-2 mr-3"
        hide-details="auto"
        label="Video Id"
        min-width="150"
        variant="outlined"
      />
      <VBtn v-if="!isEditing" @click="isEditing = true">Edit</VBtn>
      <template v-else>
        <VBtn v-if="isDirty" @click="save">Save</VBtn>
        <VBtn v-if="isDirty || !isEmpty(elementData)" @click="cancel">
          Cancel
        </VBtn>
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
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';

const rules = {
  required: (val: string) => !!val || 'The field is required.',
};

const props = defineProps<{ element: Element }>();
const emit = defineEmits(['save']);

const elementData = reactive<ElementData>(cloneDeep(props.element.data));
const isEditing = ref(isEmpty(elementData));
const form = ref<HTMLFormElement>();

const isDirty = computed(() => !isEqual(elementData, props.element.data));

const save = async () => {
  const { valid } = await form.value?.validate();
  if (!valid) return;
  emit('save', elementData);
  isEditing.value = false;
};

const cancel = () => {
  Object.assign(elementData, cloneDeep(props.element.data));
  form.value?.resetValidation();
  isEditing.value = false;
};
</script>
