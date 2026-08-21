<script lang="ts">
  export let open = false;
  export let onToggle: () => void;
  export let onClose: () => void;
</script>

<div class="menu-wrap">
  <button type="button" class:active={open} class="trigger" on:click={onToggle}>
    <span class="icon" aria-hidden="true">◉</span>
    Show
  </button>
  {#if open}
    <div class="menu surface">
      <button type="button" class="menu-item" on:click={onClose}>
        <span class="icon" aria-hidden="true">◉</span>
        <span>Show per planned shift</span>
        <span class="chevron" aria-hidden="true">›</span>
      </button>
      <button type="button" class="menu-item" on:click={onClose}>
        <span class="icon" aria-hidden="true">◉</span>
        <span>Show per availability</span>
        <span class="chevron" aria-hidden="true">›</span>
      </button>
      <button type="button" class="menu-item" on:click={onClose}>
        <span class="icon" aria-hidden="true">◉</span>
        <span>Show per day</span>
        <span class="chevron" aria-hidden="true">›</span>
      </button>
      <button type="button" class="menu-item" on:click={onClose}>
        <span class="icon" aria-hidden="true">◉</span>
        <span>Extra rows</span>
        <span class="chevron" aria-hidden="true">›</span>
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
    border-radius: 14px;
    padding: 0.7rem 0.95rem;
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
    padding: 0.8rem 0.95rem;
    display: grid;
    grid-template-columns: 1.2rem 1fr auto;
    align-items: center;
    gap: 0.65rem;
  }

  .menu-item:last-child {
    border-bottom: none;
  }

  .menu-item:hover {
    background: var(--bg-accent);
  }

  .icon {
    font-size: 1.1rem;
    line-height: 1;
  }

  .chevron {
    font-size: 1.5rem;
    line-height: 0.8;
  }
</style>