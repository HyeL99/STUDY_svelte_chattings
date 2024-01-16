<script>
  import ArticleHeader from "../components/ArticleHeader.svelte";
  import ArticleList from "../components/ArticleList.svelte";
  import ArticleAddForm from "../components/ArticleAddForm.svelte";
  import { isLogin } from "../stores";
  import { Route } from "tinro";
  import Comments from "./Comments.svelte";
</script>

<ArticleHeader />
<main class="slog-main">
  {#if $isLogin}
    <ArticleAddForm />
  {/if}
  <ArticleList />

  <Route path='/comments/:id'>
    <Comments />
  </Route>
</main>
