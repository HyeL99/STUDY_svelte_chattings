import { writable, get, derived } from "svelte/store";
import { getApi, putApi, delApi, postApi } from "../service/api";
import { router } from "tinro";
import { ALL, LIKE, MY } from "../utils/constant";

/* currentArticlesPage : 게시물 스크롤 시 페이지 증가 */
const setCurrentArticlesPage = () => {
  const {subscribe, update, set} = writable(1);

  const resetPage = () => set(1);
  const increPage = () => {
    update(data => data += 1);
    articles.fetchArticles();
  };

  return {subscribe, resetPage, increPage};
};

/* articles : 여러 게시물 관련 정보 세팅 */
const setArticles = () => {
  const initValues = {
    articleList: [],
    totalPageCount: 0,
    menuPopup: '',
    editMode: '',
  }

  const {subscribe, update, set} = writable({...initValues});

  const fetchArticles = async () => {
    loadingArticle.turnOnLoading();

    const currentPage = get(currentArticlesPage);
    // const path = `/articles/?pageNumber=${currentPage}`;
    let path = '';
    const mode = get(articlesMode);

    switch(mode) {
      case ALL:
        path = `/articles/?pageNumber=${currentPage}`;
        break;
      case LIKE:
        path = `/likes/?pageNumber=${currentPage}`;
        break;
      case MY:
        path = `/articles/?pageNumber=${currentPage}&mode=${mode}`;
        break;
      default:
        path = `/articles/${currentPage}`;
    }

    try {
      const accessToken = get(auth).Authorization;

      const options = {path, accessToken};

      const getDatas = await getApi(options);

      const newData = {
        articleList: getDatas.articleList,
        totalPageCount: getDatas.totalPageCount
      }

      update(datas => {
        if(currentPage === 1) {
          datas.articleList = newData.articleList;
          datas.totalPageCount = newData.totalPageCount;
        } else {
          const newArticles = [...datas.articleList, ...newData.articleList];
          // datas.articleList = newArticles;
          const uniqueArr = newArticles.filter((arr, index, callback) => index === callback.findIndex(t => t.id === arr.id));
          datas.articleList = uniqueArr;
          datas.totalPageCount = newData.totalPageCount;
        }
        return datas;
      })
      loadingArticle.turnOffLoading();
    } catch(e) {
      loadingArticle.turnOffLoading();
      throw e
    }
  };

  const resetArticles = () => {
    set({...initValues});
    currentArticlesPage.resetPage();
    articlePageLock.set(false);
  };

  const addArticle = async (content) => {
    const accessToken = get(auth).Authorization;

    try {
      const options = {
        path: '/articles',
        data: { content },
        accessToken
      };

      const newArticle = await postApi(options);

      update(datas => {
        datas.articleList = [newArticle, ...datas.articleList];
        return datas;
      });

      /*
        만약 무조건적으로 새로운 글이 나타나야 한다면,
        update로 store를 업데이트 하지 말고, 목록을 새로 호출
        - 단, 해당 방법은 매우 비효율적임
      */
      // articles.resetArticles();

      return;
    } catch(e) { throw e; }
  }

  const openMenuPopup = (id) => {
    update(datas => {
      datas.menuPopup = id;
      return datas;
    });
  };

  const closeMenuPopup = (id) => {
    update(datas => {
      datas.menuPopup = '';
      return datas;
    });
  };

  const openEditModeArticle = (id) => {
    closeMenuPopup();

    update(datas => {
      datas.editMode = id;
      return datas;
    });
  };

  const closeEditModeArticle = () => {
    update(datas => {
      datas.editMode = '';
      return datas;
    });
  };

  const updateArticle = async (article) => {
    const accessToken = get(auth).Authorization;
    try {
      const updateData = {
        articleId: article.id,
        content: article.content
      };
      const options = {
        path: '/articles',
        data: updateData,
        accessToken: accessToken
      };
      const updateArticle = await putApi(options);

      update(datas => {
        const newArticleList = datas.articleList.map(article => {
          if(article.id === updateArticle.id) article = updateArticle;
          return article;
        });
        datas.articleList = newArticleList;
        return datas;
      });

      articles.closeEditModeArticle();
      alert('수정이 완료되었습니다.');

    } catch (e) {
      alert('수정 중에 오류가 발생했습니다. 다시 시도해 주세요.')
    }
  };

  const deleteArticle = async (id) => {
    const accessToken = get(auth).Authorization;
    try {
      const options = {
        path: `/articles/${id}`,
        accessToken: accessToken
      };
      await delApi(options);

      update(datas => {
        const newArticleList = datas.articleList.filter(article => article.id !== id);
        datas.articleList = newArticleList;
        return datas;
      });
    } catch (e) {
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const increArticleCommentCount = (articleId) => {
    update(datas => {
      const newArticleList = datas.articleList.map(article => {
        if(article.id === articleId) article.commentCount += 1;
        return article;
      });
      datas.articleList = newArticleList;
      return datas;
    });
  };

  const decreArticleCommentCount = (articleId) => {
    update(datas => {
      const newArticleList = datas.articleList.map(article => {
        if(article.id === articleId) article.commentCount -= 1;
        return article;
      });
      datas.articleList = newArticleList;
      return datas;
    });
  };

  const likeArticle = async (articleId) => {
    const accessToken = get(auth).Authorization;

    try {
      const options = {
        path: `/likes/add/${articleId}`,
        accessToken: accessToken
      };

      await postApi(options);

      update(datas => {
        const newArticles = datas.articleList.map(article => {
          if(article.id === articleId) {
            article.likeCount += 1;
            article.likeMe = true;
          }
          return article;
        });
        return datas;
      });
    }  catch (e) {
      alert('오류가 발생했습니다. 다시 시도해 주세요.');
    }
  };

  const cancelLikeArticle = async (articleId) => {
    const accessToken = get(auth).Authorization;

    try {
      const options = {
        path: `/likes/cancel/${articleId}`,
        accessToken: accessToken
      };

      await postApi(options);

      update(datas => {
        const newArticles = datas.articleList.map(article => {
          if(article.id === articleId) {
            article.likeCount -= 1;
            article.likeMe = false;
          }
          return article;
        });
        return datas;
      });
    }  catch (e) {
      alert('오류가 발생했습니다. 다시 시도해 주세요.');
    }
  };

  return {
    subscribe,
    fetchArticles,
    resetArticles,
    addArticle,
    openMenuPopup,
    closeMenuPopup,
    openEditModeArticle,
    closeEditModeArticle,
    updateArticle,
    deleteArticle,
    increArticleCommentCount,
    decreArticleCommentCount,
    likeArticle,
    cancelLikeArticle
  };
};

/* loadingArticle : 서버 통신 중 로딩 상태 표시 */
const setLoadingArticle = () => {
  const {subscribe, set} = writable(false);

  const turnOnLoading = () => {
    set(true);
    articlePageLock.set(true);
  };
  const turnOffLoading = () => {
    set(false);
    articlePageLock.set(false);
  };

  return { subscribe, turnOnLoading, turnOffLoading };
};

/* articleContent : 단일 게시물 관련 정보 세팅 */
const setArticleContent = () => {
  const initValues = {
    id: '',
    userId: '',
    userEmail: '',
    content: '',
    createdAt: '',
    commentCount: 0,
    likeCount: 0,
    likeUser: []
  };

  const {subscribe, set} = writable({...initValues});

  const getArticle = async (id) => {
    try {
      const options = {
        path: `/articles/${id}`
      }

      const getData = await getApi(options);
      set(getData);
    } catch (e) {
      alert('오류가 발생했습니다. 다시 시도해 주세요.')
    }
  };

  return {
    subscribe,
    getArticle
  }
};

/* comments : 특정 게시물의 코멘트 정보 */
const setComments = () => {
  const {subscribe, update, set} = writable([]);

  const fetchComments = async (id) => {
    try {
      const options = {
        path: `/comments/${id}`
      };

      const getDatas = await getApi(options);
      set(getDatas.comments);
    } catch (e) {
      alert('오류가 발생했습니다. 다시 시도해 주세요.');
    }
  };
  const addComment = async (articleId, content) => {
    const accessToken = get(auth).Authorization;

    try {
      const options = {
        path: '/comments',
        data: { articleId, content },
        accessToken: accessToken
      };
      const newData = await postApi(options);
      update(datas => [...datas, newData]);
      articles.increArticleCommentCount(articleId);
    } catch (e) {
      alert('오류가 발생했습니다. 다시 시도해 주세요.')
    }
  };
  const deleteComment = async (commentId, articleId) => {
    const accessToken = get(auth).Authorization;
    try {
      const options = {
        path: '/comments',
        data: { commentId, articleId },
        accessToken: accessToken
      };

      await delApi(options);
      update(datas => datas.filter(comment => comment.id !== commentId));
      articles.decreArticleCommentCount(articleId);
      alert('코멘트가 삭제되었습니다.');
    } catch (e) {
      alert('삭제 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
  };

  return {
    subscribe,
    fetchComments,
    addComment,
    deleteComment
  }
};

/* auth : 로그인된 유저 정보 */
const setAuth = () => {
  const initValues = {id: '', email:'', Authorization: ''};

  const {subscribe, set, update} = writable({...initValues});

  // refresh 토큰을 이용해 accessToken 요청
  const refresh = async () => {
    try {
      const authenticationUser = await postApi({path: '/auth/refresh'});
      set(authenticationUser);
      isRefresh.set(true);
    } catch(e) {
      auth.resetUserInfo();
      isRefresh.set(false);
    }
  };
  // 스토어 초기화
  const resetUserInfo = () => set({...initValues});
  // 로그인
  const login = async (email, pwd) => {
    try{
      const options = {
        path: '/auth/login',
        data: {email, pwd}
      };
      
      const result = await postApi(options);
      set(result);
      isRefresh.set(true);
      router.goto('/');
    } catch(e) {
      alert('오류가 발생했습니다. 로그인을 다시 시도해주세요.')
    }
  };
  // 로그아웃
  const logout = async () => {
    try{
      const options = {path: '/auth/logout'};
      await delApi(options);
      set({...initValues})
      isRefresh.set(false);
      // router.goto('/');
      articlesMode.changeMode(ALL);
    }catch(e){
      alert('오류가 발생했습니다. 다시 시도해주세요.')
    }
  };
  // 회원가입
  const register = async (email, pwd) => {
    try{
      const options = {
        path: '/auth/register',
        data: {email, pwd}
      }

      await postApi(options);
      alert('가입이 완료되었습니다.');
      router.goto('/login');
    }catch(e){
      alert('오류가 발생했습니다. 다시 시도해주세요.')
    }
  };

  return {
    subscribe,
    refresh,
    login,
    logout,
    resetUserInfo,
    register
  }
};

/* articlesMode : 보기보드 상태(모두, 좋아요, 내글) */
const setArticlesMode = () => {
  const {subscribe, update, set} = writable(ALL);

  const changeMode = async (mode) => {
    set(mode);
    articles.resetArticles();
    await articles.fetchArticles();
  };

  return {
    subscribe, changeMode
  }
};

/* isLogin : 로그인 유무 상태 파악 */
const setIsLogin = () => {
  const checkLogin = derived(auth, $auth => $auth.Authorization ? true : false);
  console.log('setIsLogin', checkLogin);
  return checkLogin;
};

export const currentArticlesPage = setCurrentArticlesPage();
export const articles = setArticles();
export const articlePageLock = writable(false);
export const loadingArticle = setLoadingArticle();
export const articleContent = setArticleContent();
export const comments = setComments();
export const auth = setAuth();
export const articlesMode  = setArticlesMode();
export const isLogin = setIsLogin();
export const isRefresh = writable(false);