interface Customer {
  ID: number;
  NAME: string;
  EMAIL: string;
}

export const useAuthStore = defineStore("auth", () => {
  const customer = ref<Customer | null>(null);
  const ready = ref(false);

  async function fetchMe() {
    customer.value = await $fetch("/api/auth/me");
    ready.value = true;
  }

  async function login(name: string, email: string) {
    customer.value = await $fetch("/api/auth/login", { method: "POST", body: { name, email } });
  }

  async function logout() {
    await $fetch("/api/auth/logout", { method: "POST" });
    customer.value = null;
  }

  return { customer, ready, fetchMe, login, logout };
});
