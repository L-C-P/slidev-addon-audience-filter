<script setup lang="ts">
import {onMounted, onUnmounted, ref} from 'vue'
import {useNav} from '@slidev/client'
// Provided by setup/vite-plugins.ts
import initialState from 'virtual:audience-filter'

interface AudienceFilterState {
  active: string | null
  options: string[]
}

const {isPresenter} = useNav()

// Switching needs the dev server; in a static build the audience is fixed.
const hot = import.meta.hot
const state = ref<AudienceFilterState>(initialState)

function onState(next: AudienceFilterState) {
  state.value = next
}

onMounted(() => {
  hot?.on('audience-filter:state', onState)
  // The virtual module may be cached across reloads, so ask for the current state.
  hot?.send('audience-filter:get')
})

onUnmounted(() => {
  hot?.off('audience-filter:state', onState)
})

function selectAudience(event: Event) {
  const audience = (event.target as HTMLSelectElement).value
  if (audience && audience !== state.value.active) {
    hot?.send('audience-filter:set', {audience})
  }
}
</script>

<template>
  <template v-if="isPresenter">
    <div class="w-1px opacity-10 bg-current m-1 lg:m-2" />
    <label
      class="audience-filter"
      :title="hot ? 'Active audience (switching reloads all views)' : 'Active audience'"
    >
      <svg class="audience-filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
      <span v-if="hot" class="audience-filter-dropdown">
        <select class="audience-filter-select" :value="state.active ?? ''" @change="selectAudience">
          <option v-if="!state.active" value="" disabled>none</option>
          <option v-for="option in state.options" :key="option" :value="option">{{ option }}</option>
        </select>
        <!-- Own chevron: the native arrow cannot be positioned -->
        <svg class="audience-filter-chevron" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M1 1l4 4 4-4" />
        </svg>
      </span>
      <span v-else class="audience-filter-label">{{ state.active ?? 'none' }}</span>
    </label>
  </template>
</template>

<style scoped>
.audience-filter {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0 0.5rem;
  opacity: 0.75;
  font-size: 0.875rem;
}

.audience-filter:hover {
  opacity: 1;
}

.audience-filter-icon {
  width: 20px;
  height: 20px;
}

.audience-filter-dropdown {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.audience-filter-select {
  appearance: none;
  background: transparent;
  color: inherit;
  font: inherit;
  border: 1px solid currentColor;
  border-radius: 4px;
  line-height: 1.25;
  padding: 1px 24px 1px 6px;
  cursor: pointer;
}

.audience-filter-chevron {
  position: absolute;
  right: 8px;
  width: 10px;
  height: 6px;
  pointer-events: none;
}

.audience-filter-select option {
  color: initial;
}
</style>
