<script lang="ts">
  import { formatWeekLabel } from '$lib/planning';

  export let weekStart: Date;
  export let onPreviousWeek: () => void;
  export let onNextWeek: () => void;
  export let onToday: () => void;
  export let viewMode = 'Per team';
  export let onViewChange: (mode: string) => void = () => {};

  let viewMenuOpen = false;

  function selectView(mode: string) {
    onViewChange(mode);
    viewMenuOpen = false;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') viewMenuOpen = false;
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="week-nav surface">
  <div class="meta">
    <div class="title">Planning</div>
    <div class="week mono">{formatWeekLabel(weekStart)}</div>
  </div>

  <div class="controls">
    <div class="view-menu">
      <button type="button" class:active={viewMenuOpen} class="view-trigger" on:click={() => viewMenuOpen = !viewMenuOpen}>
        <strong>{viewMode}</strong>
        <span class="arrow" aria-hidden="true"></span>
      </button>
      {#if viewMenuOpen}
        <div class="view-options surface">
          <button type="button" class:selected={viewMode === 'Per team'} on:click={() => selectView('Per team')}>Per team</button>
          <button type="button" class:selected={viewMode === 'Per team member'} on:click={() => selectView('Per team member')}>Per team member</button>
        </div>
      {/if}
    </div>
    <button type="button" on:click={onPreviousWeek}>←</button>
    <button type="button" class="today" on:click={onToday}>Today</button>
    <button type="button" on:click={onNextWeek}>→</button>
  </div>
</div>

<style>
  .week-nav {
    position: relative;
    z-index: 5;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.1rem 0.25rem;
    border: none;
    box-shadow: none;
    border-radius: 0;
    margin-bottom: 0;
  }

  .title {
    font-family: 'Manrope', sans-serif;
    font-size: 1.1rem;
    font-weight: 700;
  }

  .week {
    color: var(--muted);
    font-size: 0.92rem;
  }

  .controls {
    display: flex;
    gap: 0.35rem;
    align-items: center;
  }

  .view-menu {
    position: relative;
  }

  .view-trigger {
    min-width: 7rem;
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.7rem;
  }

  .view-trigger.active,
  .view-trigger:hover {
    border-color: rgba(29, 124, 242, 0.65);
    background: var(--primary-soft);
    color: var(--primary);
  }

  .arrow {
    width: 0.45rem;
    height: 0.45rem;
    border-right: 2px solid currentColor;
    border-bottom: 2px solid currentColor;
    transform: translateY(-0.12rem) rotate(45deg);
  }

  .view-options {
    position: absolute;
    top: calc(100% + 0.45rem);
    left: 0;
    min-width: 10.5rem;
    padding: 0;
    border-radius: 5px;
    overflow: hidden;
    z-index: 100;
  }

  .view-options button {
    width: 100%;
    border: none;
    border-bottom: 1px solid var(--border);
    border-radius: 0;
    padding: 0.8rem 1rem;
    text-align: left;
    color: var(--text);
  }

  .view-options button:last-child {
    border-bottom: none;
  }

  .view-options button:hover,
  .view-options button.selected {
    background: var(--primary-soft);
    color: var(--primary);
  }

  button {
    border: 1px solid var(--border);
    background: white;
    border-radius: 4px;
    padding: 0.42rem 0.7rem;
    min-width: 2.25rem;
    color: var(--text);
  }

  .today {
    padding-inline: 0.85rem;
  }

  @media (max-width: 720px) {
    .week-nav {
      align-items: flex-start;
      flex-direction: column;
      padding: 0.85rem;
    }

    .controls {
      width: 100%;
      gap: 0.35rem;
    }

    .controls > button,
    .view-menu,
    .view-trigger {
      flex: 1;
    }

    .view-trigger {
      min-width: 0;
      padding-inline: 0.65rem;
    }

    .view-options {
      top: auto;
      bottom: calc(100% + 0.45rem);
    }
  }
</style>