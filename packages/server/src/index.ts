import type {
  BeforeDisplayHook,
  HookMap,
  OnUserInteractionHook,
  ServerModule,
} from '@tailor-cms/cek-common';
import { initState, type } from '@tailor-cms/ce-brightcove-video-manifest';
import type { Element } from '@tailor-cms/ce-brightcove-video-manifest';

// Detect if hooks are running in CEK (used for mocking end-system runtime)
const IS_CEK = process.env.CEK_RUNTIME;
// Don't use in production, use only when IS_CEK=true
const USER_STATE: any = {};

export const beforeDisplay: BeforeDisplayHook<Element> = (
  _element,
  context,
) => {
  return { ...context, ...USER_STATE };
};

export const onUserInteraction: OnUserInteractionHook<Element> = (
  _element,
  context,
  payload,
) => {
  const { currentTime, furthestTime } = payload;
  if (IS_CEK) {
    context.currentTime = currentTime;
    context.furthestTime = Math.max(context.furthestTime ?? 0, furthestTime);
  }
  return { updateDisplayState: true };
};

export const hookMap: HookMap<Element> = new Map(
  Object.entries({
    beforeDisplay,
    onUserInteraction,
  }),
);

const serverModule: ServerModule<Element> = {
  type,
  initState,
  hookMap,
  beforeDisplay,
  onUserInteraction,
};

export default serverModule;

export { type, initState };
