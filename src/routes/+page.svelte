<script lang="ts">
  import { goto } from '$app/navigation';
  import Login from '$lib/components/Login.svelte';
  import Signup from '$lib/components/Signup.svelte';
  import { auth } from '$lib/auth';

  let loading = false;
  let signup = false;

  async function handleLogin(event: CustomEvent<{ identity: string; password: string }>) {
    loading = true;
    const { identity } = event.detail;

    auth.login(identity);
    await goto('/planning', { invalidateAll: true });
    loading = false;
  }

  async function handleSignup(event: CustomEvent<{ email: string; company: string; memberName: string }>) {
    loading = true;
    auth.login(event.detail.email, event.detail.company, event.detail.memberName);
    await goto('/planning', { invalidateAll: true });
    loading = false;
  }
</script>

<svelte:head>
  <title>Proxy Planning Tool</title>
  <meta name="description" content="Proxy login page" />
</svelte:head>

<main class="login-page">
  <section class="hero surface">
    <div class="brand">
      <div class="logo">P</div>
      <div>
        <div class="title">Proxy</div>
        <div class="subtitle">Planning Tool</div>
      </div>
    </div>

    <div class="copy">
      <h1>Plan the week with clarity.</h1>
      <p>Sign in to access the planning workspace and manage shifts, events, and scheduling across the week.</p>
    </div>
  </section>

  <div class="auth-column">
    {#if signup}
      <Signup on:complete={handleSignup} />
      <button class="switch" type="button" on:click={() => signup = false}>Already have an account? Sign in</button>
    {:else}
      <Login {loading} on:login={handleLogin} />
      <button class="switch" type="button" on:click={() => signup = true}>Create an account</button>
    {/if}
  </div>
</main>

<style>
  .login-page {
    min-height: 100vh;
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(24rem, 0.9fr);
    align-items: center;
    gap: 2rem;
    padding: 2rem;
    max-width: 78rem;
    margin: 0 auto;
  }

  .hero {
    min-height: 34rem;
    padding: 2.2rem;
    border-radius: 32px;
    display: grid;
    align-content: space-between;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0.95)),
      radial-gradient(circle at top right, rgba(29, 124, 242, 0.2), transparent 35%),
      radial-gradient(circle at bottom left, rgba(255, 170, 92, 0.16), transparent 26%);
  }

  .auth-column {
    display: grid;
    justify-items: center;
    gap: 0.9rem;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.9rem;
  }

  .logo {
    width: 3rem;
    height: 3rem;
    border-radius: 1rem;
    display: grid;
    place-items: center;
    background: linear-gradient(135deg, var(--primary), #5aa7ff);
    color: white;
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 700;
  }

  .title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .subtitle {
    color: var(--muted);
  }

  h1 {
    margin: 0 0 0.75rem;
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(2.4rem, 5vw, 4.6rem);
    line-height: 0.98;
    max-width: 12ch;
  }

  p {
    margin: 0;
    max-width: 34rem;
    color: var(--muted);
    font-size: 1.05rem;
    line-height: 1.7;
  }

  .switch {
    justify-self: center;
    border: none;
    background: transparent;
    color: var(--primary);
    cursor: pointer;
  }

  @media (max-width: 960px) {
    .login-page {
      grid-template-columns: 1fr;
      padding: 1rem;
    }

    .hero {
      min-height: auto;
      gap: 2rem;
    }
  }
</style>