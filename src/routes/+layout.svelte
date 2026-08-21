<script lang="ts">
  import '../app.css';
  import { auth } from '$lib/auth';

  auth.initialize();
</script>

<slot />