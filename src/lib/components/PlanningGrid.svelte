<script lang="ts">
  import { formatDayHeader, type EventItem, type Shift, type TeamRow } from '$lib/planning';

  export let dayDates: Date[] = [];
  export let teamRows: TeamRow[] = [];
  export let shifts: Shift[] = [];
  export let events: EventItem[] = [];
  export let onAddShift: (teamId: string, dayIndex: number) => void;
  export let onEditShift: (shift: Shift) => void;
  export let onAddEvent: (dayIndex: number) => void;
  export let onEditEvent: (eventItem: EventItem) => void;
  export let selectedDayIndex: number | null = null;
  export let onSelectDay: (dayIndex: number) => void;

  $: eventsByDay = dayDates.map((_, dayIndex) => events.filter((eventItem) => eventItem.dayIndex === dayIndex));
  $: shiftsByTeamDay = teamRows.map((team) => dayDates.map((_, dayIndex) => shifts.filter((shift) => shift.teamId === team.id && shift.dayIndex === dayIndex)));

  function shiftForCell(teamId: string, dayIndex: number) {
    return shifts.filter((shift) => shift.teamId === teamId && shift.dayIndex === dayIndex);
  }

  function eventForDay(dayIndex: number) {
    return events.filter((eventItem) => eventItem.dayIndex === dayIndex);
  }

  function combinedItems(teamId: string, dayIndex: number) {
    return shiftForCell(teamId, dayIndex).map((shift) => ({ kind: 'shift' as const, item: shift }));
  }
</script>

<div class="grid surface">
  <div class="row header-row">
    <div class="corner">
      <div class="label">Week</div>
    </div>

    {#each dayDates as date, index}
      <button type="button" class:selected={selectedDayIndex === index} class="day-cell" on:click={() => onSelectDay(index)}>
        {formatDayHeader(date)}
      </button>
    {/each}
  </div>

  <div class="row event-row">
    <div class="corner event-label">
      <div class="label">Events</div>
    </div>

    {#each dayDates as _, index}
      <div class:selected={selectedDayIndex === index} class="cell event-cell" role="button" tabindex="0" on:click={() => onSelectDay(index)} on:keydown={(event) => event.key === 'Enter' || event.key === ' ' ? onSelectDay(index) : null}>
        <div class="events">
          {#each eventsByDay[index] ?? [] as eventItem}
            <button type="button" class="event-pill" on:click|stopPropagation={() => onEditEvent(eventItem)}>
              <strong>{eventItem.title}</strong>
              <span>{eventItem.start ?? '09:00'} - {eventItem.end ?? '10:00'}</span>
            </button>
          {/each}
        </div>

        {#if (eventsByDay[index] ?? []).length === 0}
          <button type="button" class="add-event" on:click|stopPropagation={() => onAddEvent(index)}>
            <span aria-hidden="true">+</span>
            Event
          </button>
        {/if}
      </div>
    {/each}
  </div>

  {#each teamRows as team}
    <div class="row body-row">
      <div class="corner team">
        <div>
          <div class="team-name">{team.name}</div>
          <div class="team-label">{team.label}</div>
        </div>
        <button type="button" class="add" on:click={() => onAddShift(team.id, selectedDayIndex ?? 0)}>+</button>
      </div>

      {#each dayDates as _, index}
        <div class:selected={selectedDayIndex === index} class="cell" role="button" tabindex="0" on:click={() => onSelectDay(index)} on:keydown={(event) => event.key === 'Enter' || event.key === ' ' ? onSelectDay(index) : null}>
          <div class="events">
            {#each (shiftsByTeamDay[teamRows.indexOf(team)]?.[index] ?? []) as shift}
              <button
                type="button"
                class:open={shift.openShift}
                class="shift-pill"
                aria-label={`Edit ${shift.title} shift`}
                on:click|stopPropagation={() => onEditShift(shift)}
              >
                <span>{shift.title}</span>
                <strong>{shift.start} - {shift.end}</strong>
                <small>Edit shift</small>
              </button>
            {/each}
          </div>

          {#if (shiftsByTeamDay[teamRows.indexOf(team)]?.[index] ?? []).length === 0}
            <span class="empty">00:00 / 00:00</span>
            <button type="button" class="create-shift" on:click|stopPropagation={() => onAddShift(team.id, index)}>
              <span aria-hidden="true">+</span>
              Create shift
            </button>
          {/if}
        </div>
      {/each}
    </div>
  {/each}

  <div class="section availability-row">
    <div class="corner section-label">Availability</div>
    {#each dayDates as _, index}
      <button type="button" class:selected={selectedDayIndex === index} class="cell compact" on:click={() => onSelectDay(index)}>
        <span>Open availability</span>
      </button>
    {/each}
  </div>

  <div class="section absent-row">
    <div class="corner section-label">Absent</div>
    {#each dayDates as _, index}
      <button type="button" class:selected={selectedDayIndex === index} class="cell compact" on:click={() => onSelectDay(index)}>
        <span>None</span>
      </button>
    {/each}
  </div>
</div>

<style>
  .grid {
    overflow: hidden;
    border-radius: 24px;
  }

  .row {
    display: grid;
    grid-template-columns: 14rem repeat(7, minmax(10rem, 1fr));
    border-bottom: 1px solid var(--border);
  }

  .row:last-child {
    border-bottom: none;
  }

  .corner,
  .cell,
  .day-cell {
    min-height: 7.25rem;
    padding: 0.9rem;
    border: none;
    background: transparent;
    text-align: left;
  }

  .header-row .corner,
  .header-row .day-cell {
    min-height: 4.5rem;
    background: rgba(247, 250, 255, 0.96);
  }

  .event-row .corner,
  .event-row .cell {
    min-height: 4rem;
  }

  .event-label {
    min-height: 4rem;
  }

  .event-cell {
    padding-block: 0.55rem;
  }

  .add-event {
    width: 100%;
    min-height: 3rem;
    border: 1px solid var(--primary);
    border-radius: 6px;
    background: rgba(220, 236, 255, 0.35);
    color: var(--primary);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    font-size: 1rem;
    font-weight: 600;
    opacity: 0;
    transition: opacity 120ms ease, background 120ms ease;
  }

  .event-cell:hover .add-event,
  .event-cell:focus-within .add-event {
    opacity: 1;
  }

  .add-event:hover {
    background: var(--primary-soft);
  }

  .add-event span {
    font-size: 1.5rem;
    font-weight: 300;
    line-height: 0.8;
  }

  .corner {
    border-right: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .team-name,
  .label,
  .section-label {
    font-weight: 700;
  }

  .team-label {
    color: var(--muted);
    font-size: 0.85rem;
  }

  .add {
    width: 2rem;
    height: 2rem;
    border-radius: 0.75rem;
    border: 1px solid var(--border);
    background: white;
    flex: none;
  }

  .create-shift {
    display: flex;
    width: 100%;
    min-height: 2.4rem;
    align-items: center;
    justify-content: center;
    gap: 0.55rem;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: white;
    opacity: 0;
    transition: opacity 120ms ease, background 120ms ease;
  }

  .create-shift span {
    font-size: 1.4rem;
    line-height: 0.8;
  }

  .cell:hover .create-shift,
  .cell:focus-within .create-shift {
    opacity: 1;
  }

  .create-shift:hover {
    background: var(--bg-accent);
  }

  .day-cell,
  .cell {
    border-right: 1px solid var(--border);
    border-bottom: 1px solid transparent;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    justify-content: flex-start;
  }

  .selected {
    background: rgba(29, 124, 242, 0.08);
  }

  .events {
    display: grid;
    gap: 0.35rem;
  }

  .event-pill,
  .shift-pill {
    width: 100%;
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 0.65rem 0.75rem;
    background: white;
    display: grid;
    gap: 0.15rem;
    text-align: left;
  }

  .shift-pill {
    background: linear-gradient(180deg, rgba(29, 124, 242, 0.09), rgba(29, 124, 242, 0.04));
  }

  .shift-pill small {
    color: var(--primary);
    font-size: 0.72rem;
    font-weight: 700;
  }

  .shift-pill.open {
    background: linear-gradient(180deg, rgba(245, 108, 108, 0.14), rgba(245, 108, 108, 0.05));
  }

  .empty {
    color: var(--muted);
    font-size: 0.85rem;
    margin-top: auto;
  }

  .section {
    display: grid;
    grid-template-columns: 14rem repeat(7, minmax(10rem, 1fr));
    border-top: 1px solid var(--border);
  }

  .compact {
    min-height: 4rem;
    color: var(--muted);
  }

  @media (max-width: 1200px) {
    .row,
    .section {
      grid-template-columns: 10rem repeat(7, minmax(10rem, 1fr));
    }
  }

  @media (max-width: 900px) {
    .grid {
      overflow-x: auto;
    }

    .row,
    .section {
      min-width: 86rem;
    }
  }

  @media (hover: none) {
    .add-event,
    .create-shift {
      opacity: 1;
    }
  }
</style>