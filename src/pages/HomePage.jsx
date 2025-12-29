import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTournament } from '../context/TournamentContext';
import { featuredPlaylists } from '../data/featuredPlaylists';
import { createSongFromUrl } from '../utils/songUtils';
import './HomePage.css';

const HomePage = () => {
    const navigate = useNavigate();
    const { resetTournament, tournamentId, loadPlaylist } = useTournament();

    // Redirect to bracket if tournament is loaded from URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('t') && tournamentId) {
            navigate(`/bracket/${tournamentId}`);
        }
    }, [tournamentId, navigate]);

    const handleCreateTournament = () => {
        resetTournament();
        navigate('/setup');
    };

    const handleLoadPlaylist = (playlist) => {
        resetTournament();
        try {
            // Convert playlist URLs to song objects
            const songs = playlist.songs.map(s => createSongFromUrl(s.url));
            loadPlaylist(songs);
            navigate('/setup');
        } catch (error) {
            console.error('Error loading playlist:', error);
            alert('Failed to load playlist: ' + error.message);
        }
    };

    return (
        <div className="home-page">
            <div className="container">
                <div className="home-content animate-fadeIn">
                    <div className="logo animate-scaleIn delay-200">
                        <svg viewBox="0 0 100 100" className="logo-icon">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="url(#gradient1)" strokeWidth="3" />
                            <path d="M 30 50 L 70 30 L 70 70 Z" fill="url(#gradient2)" />
                            <defs>
                                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#7C3AED" />
                                    <stop offset="100%" stopColor="#EC4899" />
                                </linearGradient>
                                <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#8B5CF6" />
                                    <stop offset="100%" stopColor="#F472B6" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    <h1 className="title animate-fadeIn delay-300">
                        Song Battle
                    </h1>

                    <p className="subtitle animate-fadeIn delay-400">
                        Create epic music tournaments and let the best song win
                    </p>

                    <div className="cta-buttons animate-fadeIn delay-500">
                        <button
                            className="btn btn-primary btn-large animate-glow"
                            onClick={handleCreateTournament}
                        >
                            Create New Tournament
                        </button>
                    </div>

                    <div className="featured-section animate-fadeIn delay-600">
                        <h2 className="section-title">Featured Playlists</h2>
                        <div className="playlists-grid">
                            {featuredPlaylists.map((playlist) => (
                                <div
                                    key={playlist.id}
                                    className="playlist-card card card-glow"
                                    onClick={() => handleLoadPlaylist(playlist)}
                                >
                                    <div className="playlist-cover">
                                        <img src={playlist.coverImage} alt={playlist.name} />
                                        <div className="playlist-overlay">
                                            <span>▶ Play</span>
                                        </div>
                                    </div>
                                    <div className="playlist-info">
                                        <h3>{playlist.name}</h3>
                                        <p>{playlist.description}</p>
                                        <span className="song-count">{playlist.songs.length} Songs</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="features animate-fadeIn delay-700">
                        <div className="feature card">
                            <div className="feature-icon">🎵</div>
                            <h3>32 Songs</h3>
                            <p>Add your favorite tracks from YouTube or Spotify</p>
                        </div>

                        <div className="feature card">
                            <div className="feature-icon">🏆</div>
                            <h3>Tournament Style</h3>
                            <p>Bracket-based elimination rounds to crown the champion</p>
                        </div>

                        <div className="feature card">
                            <div className="feature-icon">🔗</div>
                            <h3>Share & Vote</h3>
                            <p>Get a shareable link and let others vote in real-time</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
