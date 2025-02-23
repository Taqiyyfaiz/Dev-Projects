import { useState, useEffect } from 'react'
import Search from './Components/Search'
import Spinner from './Components/Spinner';
import MovieCard from './Components/MovieCard';
import { useDebounce } from 'react-use';
import { getTrendingMovies, updateSearchCount } from './appwrite.js';

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}


function App() {
  const [search, setSearch] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [trendingMovies, setTrendingMovies] = useState([])

  // Debounce the search term to prevent making too many API requests
  // By waiting for the user to stop typing for 500ms
  useDebounce(() => setDebouncedSearch(search), 500, [search])
  
  const fetchMovies = async (query) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const endpoint = query 
      ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);

      if(!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();

      if(data.response === 'False') {
        setErrorMessage(data.error || 'Error Fecthing Movies');
        setMovies([]);
        return;
      }

      setMovies(data.results || []);
    

     if(query && data.results.length > 0) {
        updateSearchCount(query, data.results[0]);
      }

    } catch (error) {
        console.error(`Error Fecthing Movies: ${error}`);
        setErrorMessage('Error Fetching Movies.Please try again later');
    } finally {
      setIsLoading(false);
    }
  }

  
  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();

      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  }

  useEffect(() => {
    fetchMovies(debouncedSearch);
  }, [debouncedSearch]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <main>
      <div className='pattern'></div>
      <div className='wrapper'>
        <header>
          <img src="./hero-img.png" alt="Hero Banner" />
          <h1>Find <span className='text-gradient'>Movies</span> You'll Enjoy without the Hassle</h1>
          <Search Search={search} setSearch={setSearch}/>
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movies, index) => (
                <li key={movies.$id}>
                  <p>{index + 1}</p>
                  <img src={movies.poster_url} alt={movies.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className='all-movies'>
          <h2>All Movies</h2>
          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className='text-red-500'>{errorMessage}</p>
          ) : (
            <ul>
              {movies.map((movies) => (
                <MovieCard key={movies.id} movies={movies}/>
              ))}
            </ul>
          )}
          
        </section>
        </div>
    </main>
    
  )
}

export default App