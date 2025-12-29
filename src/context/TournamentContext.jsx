import { createContext, useContext, useState, useEffect } from 'react';
import { generateBracket, recordVote as recordVoteUtil, getCurrentBattle, encodeTournament, decodeTournament } from '../utils/tournamentUtils';

const TournamentContext = createContext();

export const useTournament = () => {
    const context = useContext(TournamentContext);
    if (!context) {
        throw new Error('useTournament must be used within TournamentProvider');
    }
    return context;
};

export const TournamentProvider = ({ children }) => {
    const [songs, setSongs] = useState([]);
    const [bracket, setBracket] = useState(null);
    const [currentBattle, setCurrentBattle] = useState(null);
    const [tournamentId, setTournamentId] = useState(null);

    // Initialize tournament from URL if exists
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const encodedTournament = params.get('t');

        if (encodedTournament) {
            const decoded = decodeTournament(encodedTournament);
            if (decoded) {
                setSongs(decoded.songs || []);
                setBracket(decoded.bracket || null);
                setTournamentId(decoded.id || null);
            }
        }
    }, []);

    // Update current battle when bracket changes
    useEffect(() => {
        if (bracket) {
            const battle = getCurrentBattle(bracket);
            setCurrentBattle(battle);
        }
    }, [bracket]);

    // Add song to tournament
    const addSong = (song) => {
        if (songs.length >= 32) {
            throw new Error('Maximum 32 songs allowed');
        }
        setSongs([...songs, song]);
    };

    // Remove song from tournament
    const removeSong = (songId) => {
        setSongs(songs.filter(s => s.id !== songId));
    };

    // Clear all songs
    const clearSongs = () => {
        setSongs([]);
    };

    // Start tournament (generate bracket)
    const startTournament = () => {
        if (songs.length !== 32) {
            throw new Error('Need exactly 32 songs to start tournament');
        }

        const newBracket = generateBracket(songs);
        setBracket(newBracket);

        // Generate unique tournament ID
        const id = 'tournament-' + Date.now();
        setTournamentId(id);

        return id;
    };

    // Record a vote
    const recordVote = (battleId, winningSong) => {
        if (!bracket) return;

        const updatedBracket = recordVoteUtil(bracket, battleId, winningSong);
        setBracket(updatedBracket);

        // Save to localStorage
        saveTournamentState(updatedBracket);
    };

    // Save tournament state
    const saveTournamentState = (currentBracket) => {
        const state = {
            id: tournamentId,
            songs,
            bracket: currentBracket || bracket,
            timestamp: Date.now()
        };

        localStorage.setItem('currentTournament', JSON.stringify(state));
    };

    // Get shareable URL
    const getShareableUrl = () => {
        const state = {
            id: tournamentId,
            songs,
            bracket
        };

        const encoded = encodeTournament(state);
        if (!encoded) return null;

        const baseUrl = window.location.origin;
        return `${baseUrl}?t=${encoded}`;
    };

    // Reset tournament
    const resetTournament = () => {
        setSongs([]);
        setBracket(null);
        setCurrentBattle(null);
        setTournamentId(null);
        localStorage.removeItem('currentTournament');
    };

    // Load a playlist (replace current songs)
    const loadPlaylist = (newSongs) => {
        if (newSongs.length > 32) {
            throw new Error('Playlist has too many songs (max 32)');
        }
        setSongs(newSongs);
    };

    // Save playlist to local storage
    const saveLocalPlaylist = (name) => {
        if (songs.length === 0) {
            throw new Error('Cannot save empty playlist');
        }

        const playlists = getLocalPlaylists();
        const newPlaylist = {
            id: `local-${Date.now()}`,
            name,
            songs,
            createdAt: Date.now()
        };

        playlists.push(newPlaylist);
        localStorage.setItem('my_playlists', JSON.stringify(playlists));
        return newPlaylist;
    };

    // Get saved playlists
    const getLocalPlaylists = () => {
        try {
            const saved = localStorage.getItem('my_playlists');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Error loading playlists', e);
            return [];
        }
    };

    // Delete saved playlist
    const deleteLocalPlaylist = (id) => {
        const playlists = getLocalPlaylists().filter(p => p.id !== id);
        localStorage.setItem('my_playlists', JSON.stringify(playlists));
    };

    const value = {
        songs,
        bracket,
        currentBattle,
        tournamentId,
        addSong,
        removeSong,
        clearSongs,
        startTournament,
        recordVote,
        getShareableUrl,
        resetTournament,
        loadPlaylist,
        saveLocalPlaylist,
        getLocalPlaylists,
        deleteLocalPlaylist
    };

    return (
        <TournamentContext.Provider value={value}>
            {children}
        </TournamentContext.Provider>
    );
};
