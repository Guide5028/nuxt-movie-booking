interface Movie {
  ID: number;
  TITLE: string;
  GENRE: string;
  DURATION_MINUTES: number;
}

interface Showtime {
  ID: number;
  HALL_NAME: string;
  STARTS_AT: string;
  PRICE: number;
  SEAT_COUNT: number;
}

interface SeatBooking {
  ID: number;
  SEAT_NUMBER: string;
  CUSTOMER_NAME: string;
}

interface ShowtimeDetail extends Showtime {
  MOVIE_ID: number;
  MOVIE_TITLE: string;
  GENRE: string;
  DURATION_MINUTES: number;
  bookings: SeatBooking[];
}

export const useBookingStore = defineStore("booking", () => {
  const movies = ref<Movie[]>([]);
  const showtimesByMovie = ref<Record<number, Showtime[]>>({});
  const currentShowtime = ref<ShowtimeDetail | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchMovies() {
    loading.value = true;
    error.value = null;
    try {
      movies.value = await $fetch("/api/movies");
    } catch (e) {
      error.value = "Failed to load movies";
    } finally {
      loading.value = false;
    }
  }

  async function fetchShowtimes(movieId: number) {
    const result = await $fetch<Showtime[]>(`/api/movies/${movieId}/showtimes`);
    showtimesByMovie.value[movieId] = result;
  }

  async function fetchShowtime(id: number) {
    loading.value = true;
    error.value = null;
    try {
      currentShowtime.value = await $fetch(`/api/showtimes/${id}`);
    } catch (e) {
      error.value = "Failed to load showtime";
    } finally {
      loading.value = false;
    }
  }

  async function bookSeat(payload: { showtimeId: number; customerName: string; seatNumber: string }) {
    await $fetch("/api/bookings", { method: "POST", body: payload });
    await fetchShowtime(payload.showtimeId);
  }

  async function cancelBooking(bookingId: number, showtimeId: number) {
    await $fetch(`/api/bookings/${bookingId}`, { method: "DELETE" });
    await fetchShowtime(showtimeId);
  }

  return {
    movies,
    showtimesByMovie,
    currentShowtime,
    loading,
    error,
    fetchMovies,
    fetchShowtimes,
    fetchShowtime,
    bookSeat,
    cancelBooking,
  };
});
