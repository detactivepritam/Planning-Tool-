<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    complete: { email: string; company: string; memberName: string; password: string; phone?: string }
  }>();

  export let loading = false;
  export let errorMessage = '';

  let step = 1;
  let name = '';
  let lastName = '';
  let phone = '';
  let email = '';
  let password = '';
  let company = '';
  let localError = '';

  $: currentError = errorMessage || localError;

  function next() {
    localError = '';
    if (step === 1) {
      if (!name.trim() || !email.trim() || !password) {
        localError = 'Complete all required fields.';
        return;
      }

      if (password.length < 6) {
        localError = 'The password must contain at least 6 characters.';
        return;
      }

      localError = '';
      step = 2;
      return;
    }

    if (!company.trim()) {
      localError = 'Enter your company or organization name.';
      return;
    }

    dispatch('complete', {
      email: email.trim(),
      company: company.trim(),
      memberName: `${name.trim()} ${lastName.trim()}`.trim(),
      password,
      phone: phone.trim() || undefined
    });
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      next();
    }
  }
</script>

<div class="signup-card surface">
  {#if step === 2}
    <div class="steps" aria-label="Step 2 of 2"><span class="done"></span><span class="done"></span></div>
  {/if}

  <h1>{step === 1 ? 'Create your account' : 'Create your workspace'}</h1>
  <p>{step === 1 ? 'Register to start scheduling your team.' : 'Set up your organization workspace.'}</p>

  {#if step === 1}
    <label><span>First Name*</span><input bind:value={name} type="text" autocomplete="given-name" on:keydown={handleKeydown} /></label>
    <label><span>Last Name</span><input bind:value={lastName} type="text" autocomplete="family-name" on:keydown={handleKeydown} /></label>
    <label><span>Phone Number</span><input bind:value={phone} type="tel" autocomplete="tel" on:keydown={handleKeydown} /></label>
    <label><span>Email*</span><input bind:value={email} type="email" autocomplete="email" on:keydown={handleKeydown} /></label>
    <label class:error-field={currentError && password}><span>Password*</span><input bind:value={password} type="password" autocomplete="new-password" on:keydown={handleKeydown} /></label>
  {:else}
    <label><span>Company / Workspace Name*</span><input bind:value={company} type="text" autocomplete="organization" on:keydown={handleKeydown} /></label>
  {/if}

  {#if currentError}<div class="error">{currentError}</div>{/if}

  <button class="next" type="button" disabled={loading} on:click={next}>
    {#if loading}
      Creating account...
    {:else}
      <span aria-hidden="true">→</span> {step === 1 ? 'Next' : 'Create Account'}
    {/if}
  </button>
</div>

<style>
  .signup-card {
    width: min(100%, 28rem);
    padding: 2rem;
    border-radius: 28px;
    display: grid;
    gap: 1rem;
    background: rgba(255, 255, 255, 0.94);
  }

  .steps {
    display: flex;
    justify-content: center;
    gap: 0.55rem;
  }

  .steps span {
    width: 0.95rem;
    height: 0.95rem;
    border-radius: 50%;
    background: var(--primary);
  }

  h1 {
    margin: 0;
    text-align: center;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 2rem;
  }

  p {
    margin: 0 0 0.7rem;
    color: var(--muted);
    text-align: center;
    line-height: 1.5;
  }

  label {
    display: grid;
    gap: 0.45rem;
  }

  label span {
    color: var(--muted);
    font-size: 0.9rem;
  }

  input {
    width: 100%;
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 0.9rem 1rem;
    background: white;
    color: var(--text);
    outline: none;
  }

  input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(29, 124, 242, 0.12);
  }

  .error-field input {
    border-color: var(--danger);
    background: rgba(245, 108, 108, 0.12);
  }

  .error {
    color: var(--danger);
    font-size: 0.9rem;
    line-height: 1.45;
    font-weight: 600;
  }

  .next {
    justify-self: center;
    border: none;
    border-radius: 6px;
    padding: 0.85rem 1.4rem;
    background: var(--primary);
    color: white;
    font-weight: 700;
    cursor: pointer;
  }

  .next:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .next span {
    margin-right: 0.4rem;
    font-size: 1.2rem;
  }
</style>
