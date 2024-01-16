<script>
  import Router from "./router.svelte";
  import { auth, isRefresh } from "./stores";
  import { onMount } from "svelte";

  const refreshTime = 1000 * 60 * 14;

  onMount(() => {
    const onRefresh = setInterval(() => {
      if($isRefresh) {console.log('refresh on')
        auth.refresh();
      } else {console.log('refresh off')
        clearInterval(onRefresh);
      }
    }, refreshTime)
  })
</script>

<div class="main-container">
  {#await auth.refresh() then }
    <Router />
  {/await}
</div>