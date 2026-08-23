<script lang="ts">
  type DayOption = { label: string; checked: boolean };

  export let open = false;
  export let onToggle: () => void = () => {};
  export let onClose: () => void = () => {};
  let options: DayOption[] = [
    { label: 'Weather', checked: false },
    { label: 'Availability open / closed', checked: true },
    { label: 'Hours with members vs. Total hours', checked: false }
  ];

  function toggleOption(index: number) {
    options = options.map((option, optionIndex) =>
      optionIndex === index ? { ...option, checked: !option.checked } : option
    );
  }

  function hideAll() {
    options = options.map((option) => ({ ...option, checked: false }));
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && open) onClose();
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="menu-wrap">
  <button
    type="button"
    class="show-button"
    class:active={open}
    aria-label="Show options for this date"
    aria-expanded={open}
    on:click|stopPropagation={onToggle}
  >
    <span class="arrow" aria-hidden="true"></span>
  </button>

  {#if open}
    <div class="menu surface">
      <button type="button" class="menu-item" on:click={hideAll}>
        <span class="hide-icon" aria-hidden="true">◉̸</span>
        <span>Hide all</span>
      </button>
      {#each options as option, index}
        <button type="button" class="menu-item" on:click={() => toggleOption(index)}>
          <span class:checked={option.checked} class="checkbox" aria-hidden="true">{option.checked ? '✓' : ''}</span>
          <span>{option.label}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .menu-wrap {
    position: relative;
    flex: none;
  }

  button {
    color: var(--text);
    font: inherit;
    cursor: pointer;
  }

  .show-button {
    width: 1.35rem;
    height: 1.35rem;
    border: none;
    border-radius: 0;
    background: transparent;
    color: var(--muted);
    display: grid;
    place-items: center;
  }

  .show-button:hover,
  .show-button.active {
    color: var(--primary);
  }

  .arrow {
    width: 0.5rem;
    height: 0.5rem;
    border-right: 2px solid currentColor;
    border-bottom: 2px solid currentColor;
    transform: translateY(-0.15rem) rotate(45deg);
  }

  .menu {
    position: absolute;
    top: calc(100% + 0.35rem);
    right: 0;
    min-width: 20.5rem;
    padding: 0;
    border-radius: 5px;
    z-index: 40;
    overflow: hidden;
  }

  .menu-item {
    width: 100%;
    min-height: 3.1rem;
    border: none;
    border-bottom: 1px solid var(--border);
    background: transparent;
    padding: 0.75rem 1rem;
    display: grid;
    grid-template-columns: 1.25rem 1fr;
    align-items: center;
    gap: 0.65rem;
    text-align: left;
  }

  .menu-item:last-child {
    border-bottom: none;
  }

  .menu-item:hover {
    background: var(--bg-accent);
  }

  .checkbox {
    width: 1.15rem;
    height: 1.15rem;
    border: 2px solid var(--text);
    border-radius: 0.22rem;
    display: grid;
    place-items: center;
    font-size: 0.9rem;
    line-height: 1;
  }

  .checkbox.checked {
    border-color: var(--primary);
    background: var(--primary);
    color: white;
  }

  .hide-icon {
    font-size: 1.15rem;
  }
</style>
