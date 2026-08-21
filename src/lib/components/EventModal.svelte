<script lang="ts">
  import { createId, type EventItem } from '$lib/planning';

  export let open = false;
  export let eventItem: EventItem | null = null;
  export let dayLabels: string[] = [];
  export let onSave: (eventItem: EventItem) => void;
  export let onDelete: (eventId: string) => void;
  export let onClose: () => void;

  let form: EventItem = createEmptyEvent();
  let previousOpen = false;

  function createEmptyEvent(): EventItem {
    return {
      id: createId(),
      dayIndex: 0,
      title: 'New event',
      start: '09:00',
      end: '10:00',
      notes: ''
    };
  }

  $: if (open !== previousOpen) {
    previousOpen = open;

    if (open) {
      form = eventItem ? { ...eventItem } : createEmptyEvent();
    }
  }

  function save() {
    onSave({ ...form, title: form.title.trim() || 'New event' });
  }
</script>

{#if open}
  <button class="backdrop" type="button" aria-label="Close event modal" on:click={onClose}></button>
  <div class="modal surface" role="dialog" aria-modal="true" tabindex="-1">
    <div class="head">
      <h2>{eventItem ? 'Edit event' : 'Create event'}</h2>
    </div>

    <div class="grid">
      <label>
        <span>Event title</span>
        <input bind:value={form.title} type="text" />
      </label>

      <label>
        <span>Day</span>
        <select bind:value={form.dayIndex}>
          {#each dayLabels as label, index}
            <option value={index}>{label}</option>
          {/each}
        </select>
      </label>

      <label>
        <span>Start</span>
        <input bind:value={form.start} type="time" />
      </label>

      <label>
        <span>End</span>
        <input bind:value={form.end} type="time" />
      </label>

      <label class="full">
        <span>Notes</span>
        <textarea bind:value={form.notes} rows="4" placeholder="Add a note"></textarea>
      </label>
    </div>

    <div class="footer">
      <div>
        {#if eventItem}
          <button type="button" class="danger" on:click={() => onDelete(eventItem.id)}>Delete</button>
        {/if}
      </div>

      <div class="right">
        <button type="button" class="ghost" on:click={onClose}>Close</button>
        <button type="button" class="primary" on:click={save}>Save</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(16, 24, 40, 0.38);
    z-index: 40;
    border: none;
    padding: 0;
  }

  .modal {
    position: fixed;
    inset: 50% auto auto 50%;
    transform: translate(-50%, -50%);
    z-index: 41;
  }

  .modal {
    width: min(100%, 40rem);
    max-height: min(92vh, 42rem);
    overflow: auto;
    border-radius: 28px;
    padding: 1.25rem;
  }

  .head,
  .footer,
  .right {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  h2 {
    margin: 0;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.7rem;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  .full {
    grid-column: 1 / -1;
  }

  label {
    display: grid;
    gap: 0.45rem;
  }

  input,
  select,
  textarea {
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 0.9rem 1rem;
    background: white;
  }

  .footer {
    margin-top: 1.2rem;
  }

  .right {
    margin-left: auto;
  }

  button {
    border-radius: 14px;
    border: 1px solid var(--border);
    background: white;
    padding: 0.75rem 1rem;
  }

  .primary {
    background: linear-gradient(135deg, var(--primary), #5aa7ff);
    color: white;
    border: none;
  }

  .danger {
    color: var(--danger);
  }

  @media (max-width: 720px) {
    .grid {
      grid-template-columns: 1fr;
    }

    .head,
    .footer,
    .right {
      align-items: flex-start;
      flex-direction: column;
    }

    .right {
      margin-left: 0;
    }
  }
</style>