<script>
  import { articles } from "../stores";

  export let article;

  const articleValue = {
    id: article.id,
    userEmail: article.userEmail,
    createdAt: article.createdAt,
    content: article.content
  };

  const onCloseEditModeArticle = () => {
    articles.closeEditModeArticle();
  };

  const onUpdateArticle = () => {
    articles.updateArticle(articleValue);
  };
</script>
<div class="slog-content-box">
  <div class="content-box-header">
    <div class="content-box-header-inner-left">
      <p class="p-user">{articleValue.userEmail}</p>
      <p class="p-date">{articleValue.createdAt}</p>
    </div>
  </div>

  <div class="content-box-main">
    <textarea
      id="message"
      rows="5"
      class="slog-content-textarea"
      placeholder="내용을 입력해 주세요."
      bind:value={articleValue.content}
    ></textarea>
  </div>

  <div class="content-box-bottom">
    <div class="button-box">
      <button class="button-base" on:click={onUpdateArticle}>완료</button>
      <button class="button-base" on:click={onCloseEditModeArticle}>취소</button>
    </div>
  </div>
</div>
