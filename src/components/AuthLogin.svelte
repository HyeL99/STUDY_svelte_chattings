<script>
  import { auth } from "../stores/index";
  const values = { formEmail: "", formPassword: "" };
  import { loginValidate, extractErrors } from "../utils/validates";

  let errors = {};

  const resetValues = () => {
    values.formEmail = "";
    values.formPassword = "";
  };

  const onLogin = async () => {
    try {console.log('check01');
      await loginValidate.validate(values, {abortEarly: false});
      await auth.login(values.formEmail, values.formPassword);
      resetValues();
    } catch (e) {
      errors = extractErrors(e);
      console.log('check02', errors);
      if(errors.formEmail) alert(errors.formEmail);
      if(errors.formPassword) alert(errors.formPassword);
    }
  };
</script>

<div class="auth-content-box">
  <div class="auth-box-main">
    <div class="auth-input-box">
      <input
        type="email"
        name="floating_email"
        id="floating_email"
        class="auth-input-text peer"
        placeholder=" "
        bind:value={values.formEmail}
        class:wrong={errors.formEmail}
      />
      <label for="floating_email" class="auth-input-label">이메일</label>
    </div>
    <div class="auth-input-box">
      <input
        type="password"
        name="floating_email"
        id="floating_email"
        class="auth-input-text peer"
        placeholder=" "
        bind:value={values.formPassword}
        class:wrong={errors.formPassword}
        class:check-asdf={true}
      />
      <label for="floating_email" class="auth-input-label">비밀번호</label>
    </div>
  </div>
  <div class="content-box-bottom">
    <div class="button-box">
      <button class="button-base" on:click={onLogin}>로그인</button>
    </div>
  </div>
</div>
