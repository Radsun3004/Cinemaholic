import React, { Component } from 'react';

export class Home extends Component {
    static displayName = Home.name;

    constructor(props) {
        super(props);
        this.state = {
            upcomingMovies: [], // To store the upcoming movie data
            isLoading: true,
            page: 1, // Current page number
            isFetchingMore: false
        };
    }

    componentDidMount() {
        // Fetch upcoming movie data from an API (e.g., TMDb)
        fetch('https://api.themoviedb.org/3/movie/upcoming?api_key=406f04ba0fb65b86cfc55feae401ac63')
            .then((response) => response.json())
            .then((data) => {
                // Sort movies by release date (latest first)
                const sortedMovies = data.results.sort(
                    (a, b) => new Date(b.release_date) - new Date(a.release_date)
                );

                this.setState({
                    upcomingMovies: sortedMovies,
                    isLoading: false,
                });
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                this.setState({ isLoading: false });
            });
        this.intersectionObserver = new IntersectionObserver(this.handleIntersection, {
            rootMargin: '0px', // Trigger when the loading indicator enters the viewport
        });

    }

    componentWillUnmount() {
        // Cleanup: disconnect the Intersection Observer
        this.intersectionObserver.disconnect();
    }
    handleIntersection = (entries) => {
        const { page, isFetchingMore } = this.state;
        if (!isFetchingMore && entries[0].isIntersecting) {
            // If not already fetching and loading indicator is visible, load more data
            this.setState({ isFetchingMore: true });
            fetch(`https://api.themoviedb.org/3/movie/upcoming?api_key=406f04ba0fb65b86cfc55feae401ac63&page=${page + 1}`)
                .then((response) => response.json())
                .then((data) => {
                    // Append the new data to the existing movie list
                    const updatedMovies = [...this.state.upcomingMovies, ...data.results];
                    this.setState({
                        upcomingMovies: updatedMovies,
                        page: page + 1,
                        isFetchingMore: false,
                    });
                })
                .catch((error) => {
                    console.error('Error fetching more data:', error);
                    this.setState({ isFetchingMore: false });
                });
        }
    };

    handleSearchInputChange = (event) => {
        this.setState({ searchTerm: event.target.value });
    };
    handleSearch = () => {
        const { searchTerm } = this.state;
        if (searchTerm.trim() !== '') {
            // Fetch search results
            fetch(`https://api.themoviedb.org/3/search/movie?api_key=406f04ba0fb65b86cfc55feae401ac63&query=${searchTerm}`)
                .then((response) => response.json())
                .then((data) => {
                    this.setState({
                        upcomingMovies: data.results,
                    });
                })
                .catch((error) => {
                    console.error('Error fetching search results:', error);
                });
        } else {
            // If the search term is empty, revert to showing all movies
            this.loadUpcomingMovies();
        }
    };


    render() {
        const { upcomingMovies, isFetchingMore } = this.state;

        const { searchTerm } = this.state;
        return (
            <div>
                <h1>Upcoming Movies</h1>
                {/* Search input */}
                <div>
                    <input
                        type="text"
                        placeholder="Search for movies..."
                        value={searchTerm}
                        onChange={this.handleSearchInputChange}
                    />
                    <button onClick={this.handleSearch}>Search</button>
                </div>

                {/* Movie cards */}
                <div className="movie-card-container">
                    {upcomingMovies.map((movie) => (
                        <div key={movie.id} className="movie-card">
                            <img
                                src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                                alt={movie.title}
                            />
                            <h2>{movie.title}</h2>
                            <p>Rating: {movie.vote_average}</p>
                            <p>
                                {movie.overview.length > 100
                                    ? `${movie.overview.substring(0, 100)}...`
                                    : movie.overview}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Loading indicator */}
                {isFetchingMore && (
                    <div className="loading-indicator">
                        <p>Loading more movies...</p>
                    </div>
                )}
            </div>
        );
    }


    
}
