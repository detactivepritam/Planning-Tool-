<script lang="ts">
  import { createId, shiftTypeOptions, type Shift, type TeamRow } from '$lib/planning';

  export let open = false;
  export let shift: Shift | null = null;
  export let teamRows: TeamRow[] = [];
  export let dayLabels: string[] = [];
  export let onSave: (shift: Shift) => void;
  export let onDelete: (shiftId: string) => void;
  export let onClose: () => void;

  let form: Shift = createEmptyShift();
  let previousOpen = false;

  function createEmptyShift(): Shift {
    return {
      id: createId(),
      teamId: teamRows[0]?.id ?? 'general',
      dayIndex: 0,
      title: 'New shift',
      start: '09:00',
      end: '17:00',
      breakDuration: '00:30',
      type: 'Standard',
      notes: '',
      published: false,
      openShift: false
    };
  }

  $: if (open !== previousOpen) {
    previousOpen = open;

    if (open) {
      form = shift
        ? { ...shift }
        : {
            ...createEmptyShift(),
            teamId: teamRows[0]?.id ?? 'general',
            dayIndex: 0
          };
    }
  }

  function save() {
    onSave({ ...form, title: form.title.trim() || 'New shift' });
  }
</script>

{#if open}
  <button class="backdrop" type="button" aria-label="Close shift modal" on:click={onClose}></button>
  <div class="modal surface" role="dialog" aria-modal="true" tabindex="-1">
    <div class="head">
      <h2>{shift ? 'Edit shift' : 'New shift'}</h2>
      <label class="published">
        <input bind:checked={form.published} type="checkbox" />
        Published
      </label>
    </div>

    <div class="grid">
      <label>
        <span>Shift title</span>
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
        <span>Team</span>
        <select bind:value={form.teamId}>
          {#each teamRows as row}
            <option value={row.id}>{row.name}</option>
          {/each}
        </select>
      </label>

      <label>
        <span>Start</span>
        <input bind:value={form.start} type="time" />
      </label>

      <label>
        <span>Expected end</span>
        <input bind:value={form.end} type="time" />
      </label>

      <label>
        <span>Break duration</span>
        <input bind:value={form.breakDuration} type="time" />
      </label>

      <label>
        <span>Type of shift</span>
        <select bind:value={form.type}>
          {#each shiftTypeOptions as option}
            <option value={option}>{option}</option>
          {/each}
        </select>
      </label>

      <label class="full">
        <span>Notes</span>
        <textarea bind:value={form.notes} rows="4" placeholder="Add a note"></textarea>
      </label>

      <label class="full check">
        <input bind:checked={form.openShift} type="checkbox" />
        Open shift
      </label>
    </div>

    <div class="footer">
      <div class="left">
        {#if shift}
          <button type="button" class="danger" on:click={() => onDelete(shift.id)}>Delete</button>
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
    width: min(60rem, calc(100vw - 1rem));
    max-height: calc(100vh - 1rem);
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

  .published,
  .check {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    color: var(--muted);
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
    position: sticky;
    bottom: -1.25rem;
    padding: 0.9rem 0 0.1rem;
    background: var(--surface-strong);
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
    .modal {
      border-radius: 20px;
      padding: 1rem;
    }

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

    .footer {
      bottom: -1rem;
    }
  }
</style>