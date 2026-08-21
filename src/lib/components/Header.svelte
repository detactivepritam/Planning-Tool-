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
      <div class="name">Proxy</div>
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
    justify-content: space-between;
    gap: 1rem;
    padding: 0.9rem 1.2rem;
    border-radius: 22px;
    margin-bottom: 1rem;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.85rem;
  }

  .logo {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.9rem;
    display: grid;
    place-items: center;
    background: linear-gradient(135deg, var(--primary), #5aa7ff);
    color: white;
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 700;
  }

  .name {
    font-family: 'Space Grotesk', sans-serif;
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
  }

  .ghost {
    border: 1px solid var(--border);
    background: white;
    border-radius: 999px;
    padding: 0.65rem 1rem;
    color: var(--text);
  }

  @media (max-width: 720px) {
    .header {
      align-items: flex-start;
      flex-direction: column;
    }
  }
</style>