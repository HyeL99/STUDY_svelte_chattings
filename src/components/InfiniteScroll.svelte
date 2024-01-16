<script>
  import { onMount, onDestroy, createEventDispatcher } from "svelte";
  import ArticleLoading from "./ArticleLoading.svelte";
  import { articlePageLock, currentArticlesPage } from "../stores";

  export let loading;
  export let pageLock;
  export let totalPageCount;
  export let currentPage;
  export let domTarget;

  let component;
  let element;

  const dispatch = createEventDispatcher();

  onMount(() => {
    component = document.querySelector(domTarget);
    element = component.parentNode;
  });

  onDestroy(() => {
    if(element){
      element.removeEventListener('scroll', onScroll);
      element.removeEventListener('resize', onScroll);
    }
  });

  $: {
    if(element) {
      element.addEventListener('scroll', onScroll);
      element.addEventListener('resize', onScroll);
    }
  }

  const onScroll = (e) => {
    const scrollHeight = e.target.scrollHeight;
    const clientHeight = e.target.clientHeight;
    const scrollTop = e.target.scrollTop;
    const realHeight = scrollHeight - clientHeight;
    const triggerHeight = realHeight * 0.7;

    const triggerComputed = () => scrollTop > triggerHeight;
    
    const countCheck = () => totalPageCount <= currentPage;
    countCheck() && dispatch('onPageLock');
    
    const scrollTrigger = () => triggerComputed() && !countCheck()  && !pageLock;
    scrollTrigger() && dispatch('increPage');
  };
</script>

{#if loading}
  <ArticleLoading />
{/if}