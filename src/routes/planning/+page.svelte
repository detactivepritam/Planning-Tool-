<script lang="ts">
  import { goto } from '$app/navigation';
  import Header from '$lib/components/Header.svelte';
  import WeekNavigation from '$lib/components/WeekNavigation.svelte';
  import PlanningGrid from '$lib/components/PlanningGrid.svelte';
  import ShowMenu from '$lib/components/ShowMenu.svelte';
  import ToolsMenu from '$lib/components/ToolsMenu.svelte';
  import ShiftModal from '$lib/components/ShiftModal.svelte';
  import EventModal from '$lib/components/EventModal.svelte';
  import { auth } from '$lib/auth';
  import {
    createWeekStart,
    createId,
    defaultEvents,
    defaultShifts,
    getWeekDays,
    type EventItem,
    type Shift,
    weekKey,
    teamRows
  } from '$lib/planning';
  import { onMount } from 'svelte';

  let weekStart = createWeekStart(new Date());
  let selectedDayIndex = 0;
  let shifts: Shift[] = defaultShifts();
  let events: EventItem[] = defaultEvents();
  let shiftModalOpen = false;
  let eventModalOpen = false;
  let editingShift: Shift | null = null;
  let editingEvent: EventItem | null = null;
  let showMenuOpen = false;
  let toolsMenuOpen = false;

  const weekStoragePrefix = 'proxy_planning_week_';

  onMount(() => {
    auth.initialize();
    let isAuthed = false;
    auth.subscribe((value) => {
      isAuthed = value.isAuthenticated;
    })();

    if (!isAuthed) {
      goto('/');
    }

    loadWeekState();
  });

  $: weekDays = getWeekDays(weekStart);
  $: plannedShiftCount = shifts.length;
  $: dayLabels = weekDays.map((date) => date.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' }));

  function loadWeekState() {
    const key = `${weekStoragePrefix}${weekKey(weekStart)}`;
    const raw = localStorage.getItem(key);

    if (!raw) {
      selectedDayIndex = 0;
      shifts = defaultShifts();
      events = defaultEvents();
      return;
    }

    const parsed = JSON.parse(raw) as { shifts: Shift[]; events: EventItem[]; selectedDayIndex: number };
    shifts = (parsed.shifts ?? defaultShifts()).filter((shift) => shift.teamId === 'general');
    events = (parsed.events ?? defaultEvents()).map((eventItem) => ({
      ...eventItem,
      dayIndex: Number(eventItem.dayIndex),
      start: eventItem.start ?? '09:00',
      end: eventItem.end ?? '10:00'
    }));
    selectedDayIndex = parsed.selectedDayIndex ?? 0;
  }

  function saveWeekState() {
    const key = `${weekStoragePrefix}${weekKey(weekStart)}`;
    localStorage.setItem(key, JSON.stringify({ shifts, events, selectedDayIndex }));
  }

  function previousWeek() {
    const next = new Date(weekStart);
    next.setDate(next.getDate() - 7);
    weekStart = next;
    loadWeekState();
  }

  function nextWeek() {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + 7);
    weekStart = next;
    loadWeekState();
  }

  function todayWeek() {
    weekStart = createWeekStart(new Date());
    loadWeekState();
  }

  function openShiftModal(teamId: string, dayIndex: number) {
    editingShift = {
      id: createId(),
      teamId,
      dayIndex,
      title: 'New shift',
      start: '09:00',
      end: '17:00',
      breakDuration: '00:30',
      type: 'Standard',
      notes: '',
      published: false,
      openShift: false
    };
    shiftModalOpen = true;
  }

  function editShift(shift: Shift) {
    editingShift = shift;
    shiftModalOpen = true;
  }

  function saveShift(shift: Shift) {
    const savedShift: Shift = {
      ...shift,
      teamId: String(shift.teamId),
      dayIndex: Number(shift.dayIndex)
    };
    const existingIndex = shifts.findIndex((item) => item.id === savedShift.id);

    if (existingIndex === -1) {
      shifts = [...shifts, savedShift];
    } else {
      const next = [...shifts];
      next[existingIndex] = savedShift;
      shifts = next;
    }

    saveWeekState();
    shiftModalOpen = false;
    editingShift = null;
  }

  function deleteShift(shiftId: string) {
    shifts = shifts.filter((item) => item.id !== shiftId);
    saveWeekState();
    shiftModalOpen = false;
    editingShift = null;
  }

  function openEventModal(dayIndex: number) {
    editingEvent = {
      id: createId(),
      dayIndex,
      title: 'New event',
      start: '09:00',
      end: '10:00',
      notes: ''
    };
    eventModalOpen = true;
  }

  function editEvent(eventItem: EventItem) {
    editingEvent = eventItem;
    eventModalOpen = true;
  }

  function saveEvent(eventItem: EventItem) {
    const savedEvent: EventItem = {
      ...eventItem,
      dayIndex: Number(eventItem.dayIndex),
      start: eventItem.start ?? '09:00',
      end: eventItem.end ?? '10:00'
    };
    const existingIndex = events.findIndex((item) => item.id === savedEvent.id);

    if (existingIndex === -1) {
      events = [...events, savedEvent];
    } else {
      const next = [...events];
      next[existingIndex] = savedEvent;
      events = next;
    }

    saveWeekState();
    eventModalOpen = false;
    editingEvent = null;
  }

  function deleteEvent(eventId: string) {
    events = events.filter((item) => item.id !== eventId);
    saveWeekState();
    eventModalOpen = false;
    editingEvent = null;
  }

  function selectDay(dayIndex: number) {
    selectedDayIndex = dayIndex;
  }

  function closeMenus() {
    showMenuOpen = false;
    toolsMenuOpen = false;
  }

  function loadTemplate() {
    shifts = defaultShifts();
    events = defaultEvents();
    saveWeekState();
    closeMenus();
  }

  function addEventFromTools() {
    openEventModal(selectedDayIndex ?? 0);
    closeMenus();
  }

  function selectShifts() {
    closeMenus();
  }

  function clearWeek() {
    shifts = [];
    events = [];
    saveWeekState();
    closeMenus();
  }
</script>

<svelte:head>
  <title>Proxy Planning Tool</title>
</svelte:head>

<main class="page">
  <Header />

  <div class="toolbar surface">
    <WeekNavigation weekStart={weekStart} onPreviousWeek={previousWeek} onNextWeek={nextWeek} onToday={todayWeek} />

    <div class="secondary-row">
      <div class="count">{plannedShiftCount} planned shifts</div>
      <div class="menus">
        <ShowMenu open={showMenuOpen} onToggle={() => { showMenuOpen = !showMenuOpen; toolsMenuOpen = false; }} onClose={closeMenus} />
        <ToolsMenu
          open={toolsMenuOpen}
          onToggle={() => { toolsMenuOpen = !toolsMenuOpen; showMenuOpen = false; }}
          onAddEvent={addEventFromTools}
          onSelectShifts={selectShifts}
          onLoadTemplate={loadTemplate}
          onClearWeek={clearWeek}
          onClose={closeMenus}
        />
      </div>
    </div>
  </div>

  <section class="planning surface">
    <PlanningGrid
      dayDates={weekDays}
      teamRows={teamRows}
      shifts={shifts}
      events={events}
      onAddShift={openShiftModal}
      onEditShift={editShift}
      onAddEvent={openEventModal}
      onEditEvent={editEvent}
      selectedDayIndex={selectedDayIndex}
      onSelectDay={selectDay}
    />
  </section>

  <section class="bottom-panels">
    <div class="panel surface">
      <div class="panel-title">Availability</div>
      <p>Weekly availability can be tracked directly in the planning grid.</p>
    </div>
    <div class="panel surface">
      <div class="panel-title">Absent</div>
      <p>Absence statuses are shown in the schedule overview.</p>
    </div>
  </section>
</main>

<ShiftModal
  open={shiftModalOpen}
  shift={editingShift}
  teamRows={teamRows}
  dayLabels={dayLabels}
  onSave={saveShift}
  onDelete={deleteShift}
  onClose={() => { shiftModalOpen = false; editingShift = null; }}
/>

<EventModal
  open={eventModalOpen}
  eventItem={editingEvent}
  dayLabels={dayLabels}
  onSave={saveEvent}
  onDelete={deleteEvent}
  onClose={() => { eventModalOpen = false; editingEvent = null; }}
/>

<style>
  .page {
    max-width: 96rem;
    margin: 0 auto;
    padding: 1rem;
  }

  .toolbar {
    position: relative;
    z-index: 30;
    padding: 1rem;
    border-radius: 28px;
    margin-bottom: 1rem;
  }

  .secondary-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 1rem;
    flex-wrap: wrap;
  }

  .count {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.8rem;
    font-weight: 700;
  }

  .menus {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .planning {
    position: relative;
    z-index: 1;
    overflow: hidden;
  }

  .bottom-panels {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  .panel {
    padding: 1rem 1.2rem;
    border-radius: 22px;
  }

  .panel-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: 0.4rem;
  }

  p {
    margin: 0;
    color: var(--muted);
  }

  @media (max-width: 900px) {
    .toolbar {
      overflow: visible;
    }

    .bottom-panels {
      grid-template-columns: 1fr;
    }
  }
</style>