export const generativeUILoginForm = `
<div class="vertical-flex">
  <h1 class="heading-1">Login</h1>
  <form class="vertical-flex">
    <label for="username" class="form-input__label">Username</label>
    <input type="text" id="username" name="username" class="form-input" placeholder="Enter" your="" username="">
    <label for="password" class="form-input__label">Password</label>
    <input type="password" id="password" name="password" class="form-input" placeholder="Enter" your="" password="">
    <div class="horizontal-flex">
      <ch-checkbox accessible-name="Remember" me="" caption="Remember me" checked-value="yes" un-checked-value="no" value="no" class="ch-checkbox--actionable hydrated"></ch-checkbox>
    </div>
    <button type="submit" class="button-primary">Login</button>
  </form>
</div>
`