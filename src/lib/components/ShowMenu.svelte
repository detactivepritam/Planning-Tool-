<script lang="ts">
  export let open = false;
  export let onToggle: () => void;
  export let onClose: () => void;
  export let onOptionChange: (label: string, checked: boolean) => void = () => {};

  type ShowSection = 'planned' | 'availability' | 'day' | 'extra';
  type ShowOption = { label: string; checked: boolean };

  let activeSection: ShowSection | null = null;
  let options: Record<ShowSection, ShowOption[]> = {
    planned: [
      { label: 'Planned hours in the current week', checked: true },
      { label: "Team member's 'Functions'", checked: true }
    ],
    availability: [
      { label: 'Weather', checked: false },
      { label: 'Availability open / closed', checked: true }
    ],
    day: [
      { label: 'Hours with members vs. Total hours', checked: false }
    ],
    extra: [
      { label: 'Availability of team', checked: true },
      { label: 'Events', checked: true },
      { label: 'Hours with team member vs. total hours', checked: true },
      { label: 'Absent', checked: true },
      { label: 'Revenue forecasts', checked: true }
    ]
  };

  const sectionLabels: Record<ShowSection, string> = {
    planned: 'Show per planned shift',
    availability: 'Show per availability',
    day: 'Show per day',
    extra: 'Extra rows'
  };

  function selectSection(section: ShowSection) {
    activeSection = activeSection === section ? null : section;
  }

  function toggleOption(section: ShowSection, index: number) {
    const option = options[section][index];
    const checked = !option.checked;
    options = {
      ...options,
      [section]: options[section].map((option, optionIndex) =>
        optionIndex === index ? { ...option, checked } : option
      )
    };
    onOptionChange(option.label, checked);
  }

  function hideAll(section: ShowSection) {
    options = { ...options, [section]: options[section].map((option) => ({ ...option, checked: false })) };
    options[section].forEach((option) => onOptionChange(option.label, false));
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && open) {
      activeSection = null;
      onClose();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="menu-wrap">
  <button type="button" class:active={open} class="trigger" on:click={onToggle}>
    <span class="icon" aria-hidden="true">◉</span>
    Show
  </button>
  {#if open}
    <div class="menu surface">
      {#each Object.entries(sectionLabels) as [section, label]}
        <button type="button" class:chosen={activeSection === section} class="menu-item" on:click={() => selectSection(section as ShowSection)}>
          <span class="icon" aria-hidden="true">◉</span>
          <span>{label}</span>
          <span class="chevron" aria-hidden="true">›</span>
        </button>
      {/each}
    </div>

    {#if activeSection}
      <div class="submenu surface">
        <button type="button" class="submenu-item hide-all" on:click={() => hideAll(activeSection!)}>
          <span class="icon" aria-hidden="true">◉̸</span>
          <span>Hide all</span>
        </button>
        {#each options[activeSection] as option, index}
          <button type="button" class="submenu-item" on:click={() => toggleOption(activeSection!, index)}>
            <span class:checked={option.checked} class="checkbox" aria-hidden="true">{option.checked ? '✓' : ''}</span>
            <span>{option.label}</span>
          </button>
        {/each}
      </div>
    {/if}
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

  .submenu {
    position: absolute;
    right: calc(100% + 0.5rem);
    top: 3rem;
    min-width: 20.5rem;
    padding: 0;
    border-radius: 5px;
    z-index: 21;
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

  .menu-item.chosen {
    color: var(--primary);
    background: var(--primary-soft);
  }

  .submenu-item {
    width: 100%;
    min-height: 3.1rem;
    text-align: left;
    border: none;
    border-bottom: 1px solid var(--border);
    background: transparent;
    padding: 0.75rem 1rem;
    display: grid;
    grid-template-columns: 1.25rem 1fr;
    align-items: center;
    gap: 0.65rem;
  }

  .submenu-item:last-child {
    border-bottom: none;
  }

  .submenu-item:hover {
    background: var(--bg-accent);
  }

  .hide-all {
    grid-template-columns: 1.25rem 1fr;
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

  .icon {
    font-size: 1.1rem;
    line-height: 1;
  }

  .chevron {
    font-size: 1.5rem;
    line-height: 0.8;
  }
</style>