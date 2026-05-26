<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

const props = defineProps<{
  diagram: string;
}>();

const svg = ref("");
const error = ref("");

const source = computed(() => {
  const binary = atob(props.diagram);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
});

onMounted(async () => {
  try {
    const mermaid = (await import("mermaid")).default;
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: document.documentElement.classList.contains("dark") ? "dark" : "neutral"
    });
    const id = `mermaid-${Math.random().toString(36).slice(2)}`;
    const result = await mermaid.render(id, source.value);
    svg.value = result.svg;
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  }
});
</script>

<template>
  <div class="mermaid-block">
    <div v-if="svg" v-html="svg" />
    <pre v-else-if="error" class="mermaid-error">{{ error }}</pre>
    <pre v-else class="mermaid-source">{{ source }}</pre>
  </div>
</template>
