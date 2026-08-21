<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{ login: { identity: string; password: string } }>();

  export let loading = false;

  let identity = '';
  let password = '';
  let error = '';

  function validate() {
    if (!identity.trim()) {
      error = 'Enter your email or username.';
      return false;
    }

    if (!password.trim()) {
      error = 'Enter your password.';
      return false;
    }

    if (password.trim().length < 4) {
      error = 'Use at least 4 characters for the demo login.';
      return false;
    }

    error = '';
    return true;
  }

  function submitForm() {
    if (!validate()) {
      return;
    }

    dispatch('login', {
      identity: identity.trim(),
      password: password.trim()
    });
  }
</script>

<div class="login-card surface">
  <div class="eyebrow">Proxy Planning Tool</div>
  <h1>Sign in to plan the week</h1>
  <p>Use the demo login to enter the planning workspace.</p>

  <label>
    <span>Email or username</span>
    <input bind:value={identity} type="text" placeholder="planner@proxy.local" autocomplete="username" />
  </label>

  <label>
    <span>Password</span>
    <input bind:value={password} type="password" placeholder="••••••••" autocomplete="current-password" />
  </label>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  <button class="primary" type="button" disabled={loading} on:click={submitForm}>
    {#if loading}
      Signing in...
    {:else}
      Login
    {/if}
  </button>

  <div class="hint">Demo credentials: any username with any password of 4+ characters.</div>
</div>

<style>
  .login-card {
    width: min(100%, 28rem);
    padding: 2rem;
    border-radius: 28px;
    display: grid;
    gap: 1rem;
  }

  .eyebrow {
    font-size: 0.82rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--primary);
    font-weight: 700;
  }

  h1 {
    margin: 0;
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(2rem, 4vw, 3rem);
    line-height: 1.05;
  }

  p,
  .hint,
  .error,
  span {
    color: var(--muted);
  }

  label {
    display: grid;
    gap: 0.45rem;
  }

  input {
    width: 100%;
    border: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.88);
    border-radius: 16px;
    padding: 0.95rem 1rem;
    color: var(--text);
    outline: none;
  }

  input:focus {
    border-color: rgba(29, 124, 242, 0.4);
    box-shadow: 0 0 0 4px rgba(29, 124, 242, 0.12);
  }

  .primary {
    border: none;
    border-radius: 16px;
    padding: 0.95rem 1rem;
    background: linear-gradient(135deg, var(--primary), #5aa7ff);
    color: white;
    font-weight: 700;
  }

  .error {
    color: var(--danger);
    font-size: 0.92rem;
  }

  .hint {
    font-size: 0.88rem;
  }
</style>