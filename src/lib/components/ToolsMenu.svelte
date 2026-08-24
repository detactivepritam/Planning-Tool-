<script lang="ts">
  export let open = false;
  export let onToggle: () => void;
  export let onAddEvent: () => void;
  export let onSelectShifts: () => void;
  export let onLoadTemplate: () => void;
  export let onClearWeek: () => void;
  export let onClose: () => void;
</script>

<div class="menu-wrap">
  <button type="button" class:active={open} class="trigger" on:click={onToggle}>
    <span class="icon" aria-hidden="true">⚒</span>
    Tools
  </button>
  {#if open}
    <div class="menu surface">
      <button type="button" class="menu-item" on:click={onSelectShifts}>
        <span class="icon" aria-hidden="true">⌕</span>
        <span>Edit multiple shifts</span>
      </button>
      <button type="button" class="menu-item" on:click={onLoadTemplate}>
        <span class="icon" aria-hidden="true">⇩</span>
        <span>Load template</span>
      </button>
      <button type="button" class="menu-item" disabled>
        <span class="icon" aria-hidden="true">▣</span>
        <span>Save as template</span>
      </button>
      <button type="button" class="menu-item" on:click={onClearWeek}>
        <span class="icon" aria-hidden="true">▣</span>
        <span>Manage templates</span>
      </button>
      <button type="button" class="menu-item" on:click={onClose}>
        <span class="icon" aria-hidden="true">♜</span>
        <span>Clear this week</span>
      </button>
      <button type="button" class="menu-item" on:click={onAddEvent}>
        <span class="icon" aria-hidden="true">▣</span>
        <span>Add event</span>
      </button>
      <button type="button" class="menu-item" on:click={onClose}>
        <span class="icon" aria-hidden="true">▱</span>
        <span>Export schedule</span>
      </button>
      <button type="button" class="menu-item" on:click={onClose}>
        <span class="icon" aria-hidden="true">⚙</span>
        <span>Settings</span>
      </button>
    </div>
  {/if}
</div>

<style>
  .menu-wrap {
    position: relative;
  }

  button {
    color: var(--text);
    font-size: 1rem;
    cursor: pointer;
  }

  .trigger {
    border: 1px solid var(--border);
    background: white;
    border-radius: 4px;
    padding: 0.48rem 0.75rem;
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
  }

  .active {
    border-color: rgba(29, 124, 242, 0.35);
    background: var(--primary-soft);
  }

  .menu {
    position: absolute;
    right: 0;
    top: calc(100% + 0.5rem);
    min-width: 17.5rem;
    padding: 0;
    border-radius: 5px;
    display: grid;
    z-index: 20;
    overflow: hidden;
  }

  .menu-item {
    width: 100%;
    text-align: left;
    border: none;
    background: transparent;
    border-bottom: 1px solid var(--border);
    padding: 0.72rem 0.95rem;
    display: grid;
    grid-template-columns: 1.2rem 1fr;
    align-items: center;
    gap: 0.65rem;
  }

  .menu-item:last-child {
    border-bottom: none;
  }

  .menu-item:hover {
    background: var(--bg-accent);
  }

  .menu-item:disabled {
    color: var(--muted);
    cursor: not-allowed;
    background: rgba(0, 0, 0, 0.03);
  }

  .icon {
    font-size: 1.1rem;
    line-height: 1;
  }
</style>