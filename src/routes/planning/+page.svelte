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
    formatDateISO,
    getDayIndexFromDate,
    getWeekDays,
    type EventItem,
    type Shift,
    type TeamRow,
    teamRows as defaultTeams
  } from '$lib/planning';
  import { onMount } from 'svelte';

  let weekStart = createWeekStart(new Date());
  let selectedDayIndex = 0;
  let shifts: Shift[] = [];
  let events: EventItem[] = [];
  let teams: TeamRow[] = defaultTeams;
  let shiftModalOpen = false;
  let eventModalOpen = false;
  let editingShift: Shift | null = null;
  let planningShiftDraft = false;
  let editingEvent: EventItem | null = null;
  let showMenuOpen = false;
  let toolsMenuOpen = false;
  let showEvents = true;
  let showAvailability = true;
  let showAbsent = true;
  let viewMode = 'Per team';
  let loading = false;

  $: weekDays = getWeekDays(weekStart);
  $: plannedShiftCount = shifts.length;
  $: dayLabels = weekDays.map((date) => date.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' }));
  $: memberName = $auth.memberName || $auth.user || 'Planner';

  onMount(async () => {
    const state = await auth.initialize();
    if (!state.isAuthenticated) {
      goto('/');
      return;
    }
    await loadWeekState();
  });

  async function loadWeekState() {
    loading = true;
    const from = formatDateISO(weekDays[0]);
    const to = formatDateISO(weekDays[6]);

    try {
      const res = await fetch(`/api/planning/summary?from=${from}&to=${to}`);
      if (res.status === 401) {
        goto('/');
        return;
      }

      if (res.ok) {
        const data = await res.json();

        // Update Teams
        if (data.teams && data.teams.length > 0) {
          teams = data.teams.map((t: any) => ({
            id: t.id,
            name: t.name,
            label: 'Team'
          }));
        } else {
          teams = [{ id: 'general', name: 'Algemeen', label: 'Team' }];
        }

        // Map Shifts from database
        shifts = (data.shifts || []).map((s: any) => {
          const shiftDateStr = typeof s.shift_date === 'string' ? s.shift_date.split('T')[0] : formatDateISO(new Date(s.shift_date));
          const dayIdx = getDayIndexFromDate(shiftDateStr, weekStart);
          const start = s.start_time ? s.start_time.slice(0, 5) : '09:00';
          const end = s.end_time ? s.end_time.slice(0, 5) : '17:00';
          const breakMins = s.break_minutes || 0;
          const breakHours = Math.floor(breakMins / 60).toString().padStart(2, '0');
          const breakRem = (breakMins % 60).toString().padStart(2, '0');

          return {
            id: s.id,
            teamId: s.team_id || teams[0]?.id || 'general',
            dayIndex: dayIdx,
            title: s.shift_type || 'Standard',
            start,
            end,
            breakDuration: `${breakHours}:${breakRem}`,
            type: s.shift_type || 'Standard',
            notes: s.note || '',
            published: s.status === 'published',
            openShift: Boolean(s.is_open),
            shiftDate: shiftDateStr,
            teamMemberId: s.team_member_id
          };
        });

        // Map Events from database
        events = (data.events || []).map((e: any) => {
          const eventDateStr = typeof e.event_date === 'string' ? e.event_date.split('T')[0] : formatDateISO(new Date(e.event_date));
          const dayIdx = getDayIndexFromDate(eventDateStr, weekStart);

          return {
            id: e.id,
            dayIndex: dayIdx,
            title: e.title,
            start: e.start_time ? e.start_time.slice(0, 5) : '09:00',
            end: e.end_time ? e.end_time.slice(0, 5) : '10:00',
            notes: e.description || '',
            eventDate: eventDateStr
          };
        });
      }
    } catch (err) {
      console.error('Failed to load planning data:', err);
    } finally {
      loading = false;
    }
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
    planningShiftDraft = false;
    editingShift = {
      id: '',
      teamId: teamId || teams[0]?.id || 'general',
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

  function openPlanningShiftModal(dayIndex: number) {
    planningShiftDraft = true;
    openShiftModal(teams[0]?.id || 'general', dayIndex);
    planningShiftDraft = true;
  }

  function editShift(shift: Shift) {
    editingShift = { ...shift };
    shiftModalOpen = true;
  }

  async function saveShift(shift: Shift) {
    if (planningShiftDraft) {
      shiftModalOpen = false;
      editingShift = null;
      planningShiftDraft = false;
      return;
    }

    const targetDate = formatDateISO(weekDays[shift.dayIndex]);
    const breakParts = (shift.breakDuration || '00:00').split(':');
    const breakMinutes = (parseInt(breakParts[0], 10) || 0) * 60 + (parseInt(breakParts[1], 10) || 0);

    const payload = {
      teamId: shift.teamId !== 'general' ? shift.teamId : (teams[0]?.id !== 'general' ? teams[0]?.id : null),
      teamMemberId: shift.teamMemberId || null,
      shiftDate: targetDate,
      startTime: shift.start.length === 5 ? shift.start : '09:00',
      endTime: shift.end.length === 5 ? shift.end : '17:00',
      breakMinutes,
      shiftType: shift.type || shift.title || 'Standard',
      note: shift.notes || '',
      status: shift.published ? 'published' : 'draft',
      isOpen: Boolean(shift.openShift)
    };

    try {
      if (shift.id && shift.id.length > 20) {
        // Update existing shift
        await fetch(`/api/shifts/${shift.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // Create new shift in DB
        await fetch('/api/shifts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      await loadWeekState();
    } catch (err) {
      console.error('Failed to save shift:', err);
    }

    shiftModalOpen = false;
    editingShift = null;
  }

  async function deleteShift(shiftId: string) {
    if (shiftId && shiftId.length > 20) {
      try {
        await fetch(`/api/shifts/${shiftId}`, { method: 'DELETE' });
        await loadWeekState();
      } catch (err) {
        console.error('Failed to delete shift:', err);
      }
    } else {
      shifts = shifts.filter((item) => item.id !== shiftId);
    }

    shiftModalOpen = false;
    editingShift = null;
    planningShiftDraft = false;
  }

  function openEventModal(dayIndex: number) {
    editingEvent = {
      id: '',
      dayIndex,
      title: 'New event',
      start: '09:00',
      end: '10:00',
      notes: ''
    };
    eventModalOpen = true;
  }

  function editEvent(eventItem: EventItem) {
    editingEvent = { ...eventItem };
    eventModalOpen = true;
  }

  async function saveEvent(eventItem: EventItem) {
    const targetDate = formatDateISO(weekDays[eventItem.dayIndex]);
    const payload = {
      title: eventItem.title.trim() || 'Event',
      eventDate: targetDate,
      startTime: eventItem.start || '09:00',
      endTime: eventItem.end || '10:00',
      description: eventItem.notes || ''
    };

    try {
      if (eventItem.id && eventItem.id.length > 20) {
        await fetch(`/api/events/${eventItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      await loadWeekState();
    } catch (err) {
      console.error('Failed to save event:', err);
    }

    eventModalOpen = false;
    editingEvent = null;
  }

  async function deleteEvent(eventId: string) {
    if (eventId && eventId.length > 20) {
      try {
        await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
        await loadWeekState();
      } catch (err) {
        console.error('Failed to delete event:', err);
      }
    } else {
      events = events.filter((item) => item.id !== eventId);
    }

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
    closeMenus();
  }

  function updateShowOption(label: string, checked: boolean) {
    if (label === 'Events') showEvents = checked;
    if (label === 'Availability of team' || label === 'Availability open / closed') showAvailability = checked;
    if (label === 'Absent') showAbsent = checked;
  }

  function changeView(mode: string) {
    viewMode = mode;
  }
</script>

<svelte:head>
  <title>Proxie Planning Tool</title>
</svelte:head>

<main class="page">
  <Header />

  <div class="toolbar surface">
    <WeekNavigation
      weekStart={weekStart}
      onPreviousWeek={previousWeek}
      onNextWeek={nextWeek}
      onToday={todayWeek}
      {viewMode}
      onViewChange={changeView}
    />

    <div class="secondary-row">
      <div class="count">{plannedShiftCount} planned shifts</div>
      <div class="menus">
        <ShowMenu
          open={showMenuOpen}
          onToggle={() => { showMenuOpen = !showMenuOpen; toolsMenuOpen = false; }}
          onClose={closeMenus}
          onOptionChange={updateShowOption}
        />
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
      {weekStart}
      dayDates={weekDays}
      teamRows={teams}
      shifts={shifts}
      events={events}
      onAddShift={openShiftModal}
      onAddPlanningShift={openPlanningShiftModal}
      onEditShift={editShift}
      onAddEvent={openEventModal}
      onEditEvent={editEvent}
      selectedDayIndex={selectedDayIndex}
      onSelectDay={selectDay}
      showEvents={showEvents}
      showAvailability={showAvailability}
      showAbsent={showAbsent}
      {viewMode}
      {memberName}
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
  teamRows={teams}
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
    max-width: none;
    margin: 0 auto;
    padding: 0 0.25rem 2rem;
  }

  .toolbar {
    position: relative;
    z-index: 30;
    display: grid;
    grid-template-columns: minmax(max-content, 1fr) auto minmax(max-content, 1fr);
    align-items: center;
    min-width: max-content;
    padding: 0;
    border: none;
    border-radius: 0;
    box-shadow: none;
    margin-bottom: 0.35rem;
  }

  .secondary-row {
    display: contents;
  }

  .toolbar :global(.week-nav) {
    grid-column: 1;
    grid-row: 1;
  }

  .count {
    grid-column: 2;
    grid-row: 1;
    white-space: nowrap;
    text-align: center;
  }

  .menus {
    grid-column: 3;
    grid-row: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.4rem;
    white-space: nowrap;
  }

  .planning {
    position: relative;
    z-index: 1;
    overflow: hidden;
    border-radius: 0;
  }

  .bottom-panels {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
    margin-top: 0.75rem;
  }

  .panel {
    padding: 1rem 1.2rem;
    border-radius: 0;
  }

  .panel-title {
    font-family: 'Manrope', sans-serif;
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

  @media (max-width: 600px) {
    .page {
      padding: 0 0.5rem 1rem;
    }

    .toolbar {
      overflow-x: auto;
      border-radius: 6px;
    }

    .secondary-row {
      display: contents;
    }

    .count {
      min-width: 0;
      font-size: 1.15rem;
      line-height: 1.2;
      align-self: center;
    }

    .menus {
      width: auto;
      margin-left: auto;
      justify-content: flex-end;
      gap: 0.4rem;
    }

    .menus :global(.trigger) {
      min-height: 2.75rem;
      padding: 0.55rem 0.65rem;
      font-size: 0.9rem;
    }

    .planning {
      border-radius: 16px;
    }
  }
</style>