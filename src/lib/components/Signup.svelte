<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{ complete: { email: string; company: string; memberName: string } }>();

  let step = 1;
  let name = '';
  let lastName = '';
  let phone = '';
  let email = '';
  let password = '';
  let company = '';
  let error = '';

  function next() {
    if (step === 1) {
      if (!name.trim() || !email.trim() || !password) {
        error = 'Complete all required fields.';
        return;
      }

      if (!/^.{8,}$/.test(password) || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
        error = 'The password must contain at least 8 characters, including 1 uppercase letter, 1 lowercase letter, and 1 digit.';
        return;
      }

      error = '';
      step = 2;
      return;
    }

    if (!company.trim()) {
      error = 'Enter your company name.';
      return;
    }

    dispatch('complete', { email: email.trim(), company: company.trim(), memberName: `${name.trim()} ${lastName.trim()}`.trim() });
  }
</script>

<div class="signup-card surface">
  {#if step === 2}
    <div class="steps" aria-label="Step 2 of 2"><span class="done"></span><span class="done"></span></div>
  {/if}

  <h1>{step === 1 ? 'Create your account' : 'Create your company'}</h1>
  <p>Try Eitje for free and without hassle. No credit card required.</p>

  {#if step === 1}
    <label><span>Name*</span><input bind:value={name} type="text" autocomplete="given-name" /></label>
    <label><span>Last name</span><input bind:value={lastName} type="text" autocomplete="family-name" /></label>
    <label><span>Phone number</span><input bind:value={phone} type="tel" autocomplete="tel" /></label>
    <label><span>Email*</span><input bind:value={email} type="email" autocomplete="email" /></label>
    <label class:error-field={error && password}><span>Password*</span><input bind:value={password} type="password" autocomplete="new-password" /></label>
  {:else}
    <label><span>Company name*</span><input bind:value={company} type="text" autocomplete="organization" /></label>
  {/if}

  {#if error}<div class="error">{error}</div>{/if}

  <button class="next" type="button" on:click={next}><span aria-hidden="true">→</span> Next</button>
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

  .error-field input,
  .error-field {
    color: var(--danger);
  }

  .error-field input {
    border-color: var(--danger);
    background: rgba(245, 108, 108, 0.12);
  }

  .error {
    color: var(--danger);
    font-size: 0.9rem;
    line-height: 1.45;
  }

  .next {
    justify-self: center;
    border: none;
    border-radius: 6px;
    padding: 0.85rem 1.4rem;
    background: var(--primary);
    color: white;
    font-weight: 700;
  }

  .next span {
    margin-right: 0.4rem;
    font-size: 1.2rem;
  }
</style>
