<script setup>
const route = useRoute()
const showtimeId = Number(route.params.id)

const store = useBookingStore()
const { currentShowtime, loading, error } = storeToRefs(store)

const selectedSeat = ref(null)
const customerName = ref('')
const bookingError = ref('')

onMounted(() => {
  store.fetchShowtime(showtimeId)
})

const seatRows = computed(() => {
  if (!currentShowtime.value) return []
  const perRow = 10
  const rowCount = Math.ceil(currentShowtime.value.SEAT_COUNT / perRow)
  const rows = []
  for (let r = 0; r < rowCount; r++) {
    const rowLetter = String.fromCharCode(65 + r)
    const seats = []
    for (let n = 1; n <= perRow; n++) {
      seats.push(`${rowLetter}${n}`)
    }
    rows.push({ label: rowLetter, seats })
  }
  return rows
})

const bookedSeatNumbers = computed(() => {
  if (!currentShowtime.value) return new Set()
  return new Set(currentShowtime.value.bookings.map(b => b.SEAT_NUMBER))
})

function selectSeat(seat) {
  if (bookedSeatNumbers.value.has(seat)) return
  selectedSeat.value = selectedSeat.value === seat ? null : seat
}

async function confirmBooking() {
  bookingError.value = ''
  if (!selectedSeat.value || !customerName.value) return
  try {
    await store.bookSeat({
      showtimeId,
      customerName: customerName.value,
      seatNumber: selectedSeat.value
    })
    selectedSeat.value = null
    customerName.value = ''
  } catch (e) {
    bookingError.value = e.data?.statusMessage || 'Could not book that seat.'
  }
}

async function cancel(bookingId) {
  await store.cancelBooking(bookingId, showtimeId)
}

function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="page">
    <NuxtLink to="/" class="back-link">← All movies</NuxtLink>

    <p v-if="loading" class="muted">Loading showtime...</p>
    <p v-else-if="error" class="muted">{{ error }}</p>

    <template v-else-if="currentShowtime">
      <div class="header">
        <h1>{{ currentShowtime.MOVIE_TITLE }}</h1>
        <div class="meta">
          <span class="badge">{{ currentShowtime.GENRE }}</span>
          <span>{{ currentShowtime.HALL_NAME }}</span>
          <span>{{ formatDateTime(currentShowtime.STARTS_AT) }}</span>
          <span class="price">${{ currentShowtime.PRICE.toFixed(2) }} / seat</span>
        </div>
      </div>

      <div class="content">
        <div class="panel seat-panel">
          <div class="screen">SCREEN</div>

          <div class="seat-map">
            <div v-for="row in seatRows" :key="row.label" class="seat-row">
              <span class="row-label">{{ row.label }}</span>
              <button
                v-for="seat in row.seats"
                :key="seat"
                type="button"
                class="seat"
                :class="{
                  booked: bookedSeatNumbers.has(seat),
                  selected: selectedSeat === seat
                }"
                :disabled="bookedSeatNumbers.has(seat)"
                :aria-label="`Seat ${seat}`"
                @click="selectSeat(seat)"
              >
                {{ seat }}
              </button>
            </div>
          </div>

          <div class="legend">
            <span><i class="dot available"></i> Available</span>
            <span><i class="dot selected"></i> Selected</span>
            <span><i class="dot booked"></i> Booked</span>
          </div>
        </div>

        <div class="panel booking-panel">
          <h2>Book Your Seat</h2>
          <p v-if="selectedSeat" class="selected-seat">Seat {{ selectedSeat }}</p>
          <p v-else class="muted">Pick a seat from the map.</p>

          <input v-model="customerName" placeholder="Your name" aria-label="Your name" />
          <button type="button" class="confirm-btn" :disabled="!selectedSeat || !customerName" @click="confirmBooking">
            Confirm Booking
          </button>
          <p v-if="bookingError" class="error-text">{{ bookingError }}</p>

          <div class="bookings-list">
            <h3>Booked Seats ({{ currentShowtime.bookings.length }})</h3>
            <p v-if="!currentShowtime.bookings.length" class="muted">No bookings yet.</p>
            <ul v-else>
              <li v-for="b in currentShowtime.bookings" :key="b.ID">
                <span>{{ b.SEAT_NUMBER }} — {{ b.CUSTOMER_NAME }}</span>
                <button type="button" class="cancel-btn" aria-label="Cancel booking" @click="cancel(b.ID)">✕</button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style>
body {
  margin: 0;
  background: #0F0F14;
}

.page {
  max-width: 960px;
  margin: 40px auto;
  padding: 24px;
  font-family: 'Manrope', sans-serif;
  color: #F2F0EA;
}

.back-link {
  color: #8B8894;
  text-decoration: none;
  font-size: 0.85em;
}

.back-link:hover {
  color: #F2C14E;
}

.muted {
  color: #8B8894;
  font-size: 0.9em;
}

.header {
  margin: 16px 0 24px;
}

h1 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 2.8em;
  letter-spacing: 0.02em;
  margin: 0;
  color: #F2C14E;
}

.meta {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 8px;
  color: #8B8894;
  font-size: 0.9em;
}

.badge {
  padding: 3px 10px;
  border-radius: 999px;
  background: #2C2C38;
  color: #F2C14E;
  font-size: 0.85em;
  font-weight: 600;
}

.price {
  color: #F2F0EA;
  font-weight: 600;
}

.content {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.panel {
  background: #1A1A22;
  border: 1px solid #2C2C38;
  border-radius: 12px;
  padding: 24px;
}

.panel h2 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.4em;
  letter-spacing: 0.02em;
  margin: 0 0 16px;
}

.seat-panel {
  flex: 1;
  min-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.screen {
  width: 80%;
  padding: 8px;
  text-align: center;
  background: #2C2C38;
  color: #8B8894;
  border-radius: 4px;
  font-size: 0.75em;
  letter-spacing: 0.2em;
  margin-bottom: 24px;
}

.seat-map {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.seat-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.row-label {
  width: 16px;
  color: #8B8894;
  font-size: 0.8em;
  text-align: center;
}

.seat {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: 1px solid #2C2C38;
  background: transparent;
  color: #8B8894;
  font-size: 0.65em;
  cursor: pointer;
}

.seat:hover:not(:disabled) {
  border-color: #F2C14E;
  color: #F2F0EA;
}

.seat.selected {
  background: #F2C14E;
  border-color: #F2C14E;
  color: #0F0F14;
  font-weight: 700;
}

.seat.booked {
  background: #2C2C38;
  border-color: #2C2C38;
  color: #6B6874;
  cursor: not-allowed;
}

.legend {
  display: flex;
  gap: 20px;
  margin-top: 24px;
  font-size: 0.8em;
  color: #8B8894;
}

.legend span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 3px;
  border: 1px solid #2C2C38;
}

.dot.available {
  background: transparent;
}

.dot.selected {
  background: #F2C14E;
  border-color: #F2C14E;
}

.dot.booked {
  background: #2C2C38;
}

.booking-panel {
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.selected-seat {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.4em;
  letter-spacing: 0.02em;
  color: #F2C14E;
  margin: 0;
}

input {
  padding: 11px 12px;
  border: 1px solid #2C2C38;
  border-radius: 8px;
  background: #0F0F14;
  color: #F2F0EA;
  font-family: 'Manrope', sans-serif;
  font-size: 0.9em;
}

.confirm-btn {
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: #F2C14E;
  color: #0F0F14;
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  cursor: pointer;
}

.confirm-btn:disabled {
  background: #2C2C38;
  color: #6B6874;
  cursor: not-allowed;
}

.error-text {
  color: #E5484D;
  font-size: 0.85em;
  margin: 0;
}

.bookings-list {
  margin-top: 12px;
  border-top: 1px solid #2C2C38;
  padding-top: 16px;
}

.bookings-list h3 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.1em;
  letter-spacing: 0.02em;
  margin: 0 0 10px;
}

.bookings-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bookings-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85em;
}

.cancel-btn {
  width: 22px;
  height: 22px;
  border: none;
  background: transparent;
  color: #6B6874;
  cursor: pointer;
  border-radius: 6px;
}

.cancel-btn:hover {
  color: #E5484D;
}
</style>
