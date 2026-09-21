<script setup>
const store = useBookingStore()
const catalog = useCatalogStore()
const { movies, showtimesByMovie, loading, error } = storeToRefs(store)
const { searchQuery, genreFilter } = storeToRefs(catalog)

const expandedMovieId = ref(null)
const promotions = ref([])

onMounted(async () => {
  store.fetchMovies()
  promotions.value = await $fetch('/api/promotions')
})

const trendingMovies = computed(() => movies.value.filter(m => m.IS_TRENDING))

const availableGenres = computed(() => [...new Set(movies.value.map(m => m.GENRE))].sort())

const filteredMovies = computed(() => {
  return movies.value.filter(m => {
    const matchesGenre = genreFilter.value === 'All' || m.GENRE === genreFilter.value
    const matchesSearch = m.TITLE.toLowerCase().includes(searchQuery.value.trim().toLowerCase())
    return matchesGenre && matchesSearch
  })
})

async function toggleShowtimes(movieId) {
  if (expandedMovieId.value === movieId) {
    expandedMovieId.value = null
    return
  }
  expandedMovieId.value = movieId
  if (!showtimesByMovie.value[movieId]) {
    await store.fetchShowtimes(movieId)
  }
}

async function scrollToMovie(movieId) {
  expandedMovieId.value = movieId
  if (!showtimesByMovie.value[movieId]) {
    await store.fetchShowtimes(movieId)
  }
  nextTick(() => {
    document.getElementById(`movie-${movieId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

function groupByTheater(showtimes) {
  const map = new Map()
  for (const s of showtimes) {
    if (!map.has(s.THEATER_NAME)) {
      map.set(s.THEATER_NAME, { name: s.THEATER_NAME, city: s.THEATER_CITY, showtimes: [] })
    }
    map.get(s.THEATER_NAME).showtimes.push(s)
  }
  return [...map.values()]
}

function formatTime(isoString) {
  return new Date(isoString).toLocaleString('en-US', {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit'
  })
}

const genreColors = {
  'Sci-Fi': '#3B7DD8',
  'Comedy': '#F2C14E',
  'Action': '#D8473B',
  'Drama': '#8B5CF6',
  'Horror': '#7A1F2B'
}

function genreColor(genre) {
  return genreColors[genre] || '#4A4A58'
}
</script>

<template>
  <div class="page">
    <section v-if="trendingMovies.length" class="hero">
      <h2 class="section-title">Trending Now</h2>
      <div class="hero-row">
        <div v-for="m in trendingMovies" :key="m.ID" class="hero-card" :style="{ background: genreColor(m.GENRE) }">
          <div class="hero-info">
            <span class="badge">{{ m.GENRE }}</span>
            <h3>{{ m.TITLE }}</h3>
            <p class="hero-duration">{{ m.DURATION_MINUTES }} min</p>
            <button type="button" class="hero-btn" @click="scrollToMovie(m.ID)">View Showtimes</button>
          </div>
        </div>
      </div>
    </section>

    <section v-if="promotions.length" class="promotions">
      <h2 class="section-title">Promotions</h2>
      <div class="promo-row">
        <div v-for="p in promotions" :key="p.ID" class="promo-card">
          <h3>{{ p.TITLE }}</h3>
          <p>{{ p.DESCRIPTION }}</p>
        </div>
      </div>
    </section>

    <div class="header">
      <h1>Now Showing</h1>
      <p class="subtitle">Pick a movie, pick a showtime, pick your seat.</p>
    </div>

    <div class="filter-bar">
      <select v-model="genreFilter" aria-label="Filter by genre">
        <option value="All">All Genres</option>
        <option v-for="g in availableGenres" :key="g" :value="g">{{ g }}</option>
      </select>
    </div>

    <p v-if="loading" class="muted">Loading movies...</p>
    <p v-else-if="error" class="muted">{{ error }}</p>
    <p v-else-if="!filteredMovies.length" class="muted">No movies match your search.</p>

    <div class="movie-grid">
      <div v-for="movie in filteredMovies" :key="movie.ID" :id="`movie-${movie.ID}`" class="movie-card">
        <div class="poster" :style="!movie.POSTER_URL ? { background: genreColor(movie.GENRE) } : null">
          <img v-if="movie.POSTER_URL" :src="movie.POSTER_URL" :alt="`${movie.TITLE} poster`" />
          <svg v-else class="poster-icon" width="56" height="56" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="1.5" />
            <path d="M2 8h20M7 4v4M17 4v4" stroke="currentColor" stroke-width="1.5" />
          </svg>
          <div class="poster-overlay">
            <h2>{{ movie.TITLE }}</h2>
          </div>
        </div>

        <div class="movie-body">
          <div class="movie-meta">
            <span class="badge">{{ movie.GENRE }}</span>
            <span class="duration">{{ movie.DURATION_MINUTES }} min</span>
          </div>

          <button type="button" class="toggle-btn" @click="toggleShowtimes(movie.ID)">
            {{ expandedMovieId === movie.ID ? 'Hide showtimes' : 'View showtimes' }}
          </button>

          <div v-if="expandedMovieId === movie.ID" class="showtimes">
            <p v-if="!showtimesByMovie[movie.ID]" class="muted">Loading showtimes...</p>
            <p v-else-if="!showtimesByMovie[movie.ID].length" class="muted">No showtimes scheduled.</p>
            <div v-else v-for="group in groupByTheater(showtimesByMovie[movie.ID])" :key="group.name" class="theater-group">
              <div class="theater-name">{{ group.name }} <span class="theater-city">· {{ group.city }}</span></div>
              <div class="theater-times">
                <NuxtLink v-for="s in group.showtimes" :key="s.ID" :to="`/showtime/${s.ID}`" class="time-pill">
                  {{ formatTime(s.STARTS_AT) }}
                  <span class="time-price">${{ s.PRICE.toFixed(2) }}</span>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
body {
  margin: 0;
  background: #0F0F14;
}

.page {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 24px;
  font-family: 'Manrope', sans-serif;
  color: #F2F0EA;
}

.section-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.6em;
  letter-spacing: 0.02em;
  margin: 0 0 14px;
  color: #F2F0EA;
}

.hero {
  margin-bottom: 32px;
}

.hero-row {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.hero-card {
  flex: 0 0 320px;
  height: 160px;
  border-radius: 14px;
  display: flex;
  align-items: flex-end;
  padding: 20px;
}

.hero-info h3 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.8em;
  letter-spacing: 0.02em;
  margin: 6px 0 2px;
  color: #12141A;
}

.hero-duration {
  margin: 0 0 10px;
  color: rgba(15, 15, 20, 0.7);
  font-size: 0.85em;
}

.hero-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: #12141A;
  color: #F2F0EA;
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 0.8em;
  cursor: pointer;
}

.promotions {
  margin-bottom: 32px;
}

.promo-row {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.promo-card {
  flex: 0 0 280px;
  padding: 18px 20px;
  border-radius: 12px;
  background: #1A1A22;
  border: 1px solid #2C2C38;
}

.promo-card h3 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.2em;
  letter-spacing: 0.02em;
  margin: 0 0 6px;
  color: #F2C14E;
}

.promo-card p {
  margin: 0;
  font-size: 0.85em;
  color: #8B8894;
}

.header {
  margin-bottom: 16px;
}

h1 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 3em;
  letter-spacing: 0.03em;
  margin: 0;
  color: #F2C14E;
}

.subtitle {
  color: #8B8894;
  margin-top: 4px;
}

.filter-bar {
  margin-bottom: 20px;
}

.filter-bar select {
  padding: 9px 14px;
  border-radius: 8px;
  border: 1px solid #2C2C38;
  background: #1A1A22;
  color: #F2F0EA;
  font-family: 'Manrope', sans-serif;
  font-size: 0.85em;
}

.muted {
  color: #8B8894;
  font-size: 0.9em;
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.movie-card {
  background: #1A1A22;
  border: 1px solid #2C2C38;
  border-radius: 12px;
  overflow: hidden;
  scroll-margin-top: 20px;
}

.poster {
  position: relative;
  aspect-ratio: 2 / 3;
  display: flex;
  align-items: center;
  justify-content: center;
}

.poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.poster-icon {
  color: rgba(255, 255, 255, 0.35);
}

.poster-overlay {
  position: absolute;
  inset: auto 0 0 0;
  padding: 24px 16px 12px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.85), transparent);
}

.poster-overlay h2 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.5em;
  letter-spacing: 0.02em;
  margin: 0;
  color: #F2F0EA;
}

.movie-body {
  padding: 16px 20px 20px;
}

.movie-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.badge {
  padding: 3px 10px;
  border-radius: 999px;
  background: #2C2C38;
  color: #F2C14E;
  font-size: 0.75em;
  font-weight: 600;
}

.duration {
  color: #8B8894;
  font-size: 0.85em;
}

.toggle-btn {
  width: 100%;
  padding: 10px;
  border: 1px solid #2C2C38;
  border-radius: 8px;
  background: transparent;
  color: #F2F0EA;
  font-family: 'Manrope', sans-serif;
  font-weight: 600;
  font-size: 0.85em;
  cursor: pointer;
}

.toggle-btn:hover {
  border-color: #F2C14E;
}

.showtimes {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.theater-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.theater-name {
  font-size: 0.85em;
  font-weight: 700;
}

.theater-city {
  font-weight: 400;
  color: #8B8894;
}

.theater-times {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.time-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 14px;
  border-radius: 8px;
  background: #0F0F14;
  border: 1px solid #2C2C38;
  color: #F2F0EA;
  text-decoration: none;
  font-size: 0.8em;
  font-weight: 600;
}

.time-pill:hover {
  border-color: #F2C14E;
}

.time-price {
  color: #F2C14E;
  font-weight: 600;
  font-size: 0.9em;
}
</style>
