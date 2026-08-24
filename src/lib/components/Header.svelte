<script lang="ts">
  import { auth } from '$lib/auth';
  import { goto } from '$app/navigation';

  let currentUser = 'Planner';

  $: currentUser = $auth.user ?? 'Planner';

  function handleLogout() {
    auth.logout();
    goto('/');
  }
</script>

<header class="header surface">
  <div class="brand">
    <div class="logo">P</div>
    <div>
      <div class="name">Proxie</div>
      <div class="subtitle">Planning Tool</div>
    </div>
  </div>

  <div class="actions">
    <div class="user">{currentUser}</div>
    <button class="ghost" type="button" on:click={handleLogout}>Log out</button>
  </div>
</header>

<style>
  .header {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 1rem;
    padding: 0.5rem 0;
    border: none;
    border-radius: 0;
    border-top: none;
    margin-bottom: 0.35rem;
    box-shadow: none;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.65rem;
  }

  .logo {
    width: 2rem;
    height: 2rem;
    border-radius: 4px;
    display: grid;
    place-items: center;
    background: var(--primary);
    color: white;
    font-family: 'Manrope', sans-serif;
    font-weight: 700;
  }

  .name {
    font-family: 'Manrope', sans-serif;
    font-weight: 700;
  }

  .subtitle,
  .user {
    color: var(--muted);
    font-size: 0.9rem;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-left: auto;
    min-width: 8.9rem;
  }

  .ghost {
    border: 1px solid var(--border);
    background: white;
    border-radius: 4px;
    padding: 0.45rem 0.75rem;
    color: var(--text);
  }

  @media (max-width: 720px) {
    .header {
      align-items: flex-start;
      flex-direction: column;
    }

    .actions {
      width: 100%;
      justify-content: space-between;
    }
  }
</style>