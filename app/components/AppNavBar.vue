<script setup>
const auth = useAuthStore()
const catalog = useCatalogStore()
const { customer, ready } = storeToRefs(auth)
const { searchQuery } = storeToRefs(catalog)

const showLoginForm = ref(false)
const loginName = ref('')
const loginEmail = ref('')
const loginError = ref('')

onMounted(() => {
  auth.fetchMe()
})

async function submitLogin() {
  loginError.value = ''
  if (!loginName.value.trim() || !loginEmail.value.trim()) {
    loginError.value = 'Enter your name and email.'
    return
  }
  try {
    await auth.login(loginName.value.trim(), loginEmail.value.trim())
    showLoginForm.value = false
    loginName.value = ''
    loginEmail.value = ''
  } catch (e) {
    loginError.value = 'Could not log in.'
  }
}

async function doLogout() {
  await auth.logout()
}
</script>

<template>
  <nav class="navbar">
    <NuxtLink to="/" class="brand">CineBook</NuxtLink>

    <div class="search-wrap">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8" />
        <path d="M21 21l-4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      </svg>
      <input v-model="searchQuery" type="text" placeholder="Search movies..." aria-label="Search movies" />
    </div>

    <div class="account">
      <template v-if="ready && customer">
        <span class="hello">Hi, {{ customer.NAME }}</span>
        <button type="button" class="nav-btn" @click="doLogout">Log Out</button>
      </template>
      <template v-else-if="ready">
        <button type="button" class="nav-btn primary" @click="showLoginForm = !showLoginForm">Log In</button>
        <div v-if="showLoginForm" class="login-popover">
          <input v-model="loginName" placeholder="Your name" aria-label="Your name" />
          <input v-model="loginEmail" placeholder="Your email" aria-label="Your email" />
          <button type="button" class="nav-btn primary" @click="submitLogin">Continue</button>
          <p v-if="loginError" class="login-error">{{ loginError }}</p>
        </div>
      </template>
    </div>
  </nav>
</template>

<style>
.navbar {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 16px 32px;
  background: #17171F;
  border-bottom: 1px solid #2C2C38;
}

.brand {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.6em;
  letter-spacing: 0.03em;
  color: #F2C14E;
  text-decoration: none;
  flex-shrink: 0;
}

.search-wrap {
  flex-grow: 1;
  max-width: 420px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  border-radius: 999px;
  background: #0F0F14;
  border: 1px solid #2C2C38;
  color: #8B8894;
}

.search-wrap input {
  flex-grow: 1;
  border: none;
  background: transparent;
  color: #F2F0EA;
  font-family: 'Manrope', sans-serif;
  font-size: 0.9em;
  outline: none;
}

.account {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.hello {
  color: #8B8894;
  font-size: 0.85em;
}

.nav-btn {
  padding: 8px 18px;
  border: 1px solid #2C2C38;
  border-radius: 8px;
  background: transparent;
  color: #F2F0EA;
  font-family: 'Manrope', sans-serif;
  font-weight: 600;
  font-size: 0.85em;
  cursor: pointer;
  white-space: nowrap;
}

.nav-btn.primary {
  background: #F2C14E;
  color: #0F0F14;
  border-color: #F2C14E;
}

.login-popover {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 220px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  background: #1A1A22;
  border: 1px solid #2C2C38;
  border-radius: 12px;
  z-index: 10;
}

.login-popover input {
  padding: 10px 12px;
  border: 1px solid #2C2C38;
  border-radius: 8px;
  background: #0F0F14;
  color: #F2F0EA;
  font-family: 'Manrope', sans-serif;
  font-size: 0.85em;
}

.login-error {
  color: #E5484D;
  font-size: 0.8em;
  margin: 0;
}
</style>
