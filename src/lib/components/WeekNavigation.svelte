<script lang="ts">
  import { formatWeekLabel } from '$lib/planning';

  export let weekStart: Date;
  export let onPreviousWeek: () => void;
  export let onNextWeek: () => void;
  export let onToday: () => void;
</script>

<div class="week-nav surface">
  <div class="meta">
    <div class="title">Planning</div>
    <div class="week mono">{formatWeekLabel(weekStart)}</div>
  </div>

  <div class="controls">
    <button type="button" on:click={onPreviousWeek}>←</button>
    <button type="button" class="today" on:click={onToday}>Today</button>
    <button type="button" on:click={onNextWeek}>→</button>
  </div>
</div>

<style>
  .week-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 1.2rem;
    border-radius: 22px;
    margin-bottom: 1rem;
  }

  .title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.3rem;
    font-weight: 700;
  }

  .week {
    color: var(--muted);
    font-size: 0.92rem;
  }

  .controls {
    display: flex;
    gap: 0.5rem;
  }

  button {
    border: 1px solid var(--border);
    background: white;
    border-radius: 999px;
    padding: 0.7rem 0.9rem;
    min-width: 2.5rem;
  }

  .today {
    padding-inline: 1rem;
  }

  @media (max-width: 720px) {
    .week-nav {
      align-items: flex-start;
      flex-direction: column;
    }
  }
</style>