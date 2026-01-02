import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTournament } from '../context/TournamentContext';
import { TOP_YOUTUBERS, TopRappers, Top_Streamers } from '../data/prebuiltData';
import { featuredPlaylists } from '../data/featuredPlaylists';
import { GlassCard, NeonButton, AnimatedText } from '../components/UIComponents';
import { motion, AnimatePresence } from 'framer-motion';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();
    const { startPrebuiltTournament, resetTournament } = useTournament();
    const [showSizeModal, setShowSizeModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const categories = [
        {
            id: 'streamers',
            title: 'Top Streamers',
            description: 'Battle of the gaming legends',
            image: '🎮',
            data: Top_Streamers,
            gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)'
        },
        {
            id: 'youtubers',
            title: 'Top YouTubers',
            description: 'Content creation kings',
            image: '🎬',
            data: TOP_YOUTUBERS,
            gradient: 'linear-gradient(135deg, #007CF0 0%, #00DFD8 100%)'
        },
        {
            id: 'songs',
            title: 'Top Rappers',
            description: 'Battle of the rappers',
            image: '🎵',
            data: TopRappers,
            gradient: 'linear-gradient(135deg, #FF0080 0%, #7928CA 100%)'
        },
        ...featuredPlaylists.map(p => ({
            id: p.id,
            title: p.name,
            description: p.description,
            image: '🔥',
            data: p.songs,
            gradient: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)'
        })),
        {
            id: 'custom',
            title: 'Custom (YouTube)',
            description: 'Create your own tournament',
            image: '✨',
            data: [],
            gradient: 'linear-gradient(135deg, #FF0000 0%, #990000 100%)'
        }
    ];

    const handleCategoryClick = (category) => {
        if (category.id === 'custom') {
            resetTournament();
            navigate('/custom');
        } else if (category.id === 'streamers' || category.id === 'youtubers') {
            setSelectedCategory(category);
            handleStartPrebuilt(8, category);
        } else {
            setSelectedCategory(category);
            setShowSizeModal(true);
        }
    };

    const handleStartPrebuilt = async (size, categoryOverride = null) => {
        const category = categoryOverride || selectedCategory;
        if (!category) return;

        setIsLoading(true);
        setShowSizeModal(false);

        try {
            const shuffled = [...category.data].sort(() => 0.5 - Math.random());
            const selectedItems = shuffled.slice(0, size);

            const tournamentId = await startPrebuiltTournament(selectedItems, size);
            navigate(`/bracket/${tournamentId}`);
        } catch (error) {
            console.error('Error starting tournament:', error);
            alert('Failed to start tournament. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="home-page">
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        className="loading-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="loading-content">
                            <div className="spinner"></div>
                            <p>Preparing your arena...</p>
                            <span>Fetching song details from YouTube</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="hero-section">
                <AnimatedText text="Champions League" className="main-title" />
                <motion.p
                    className="subtitle"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    Choose your battleground
                </motion.p>
            </div>

            <motion.div
                className="categories-grid"
                initial="hidden"
                animate="visible"
                style={{
                    minHeight: '800px',
                    contain: 'layout style'
                }}
                variants={{
                    visible: {
                        transition: {
                            staggerChildren: 0.06
                        }
                    }
                }}
            >
                {categories.map((category) => (
                    <GlassCard
                        key={category.id}
                        className="category-card"
                        onClick={() => handleCategoryClick(category)}
                        style={{
                            '--card-gradient': category.gradient,
                            height: '350px'
                        }}
                        variants={{
                            hidden: { opacity: 0, scale: 0.8, rotateY: -15 },
                            visible: {
                                opacity: 1,
                                scale: 1,
                                rotateY: 0,
                                transition: { type: 'spring', damping: 15, stiffness: 120 }
                            }
                        }}
                        whileHover={{
                            scale: 1.03,
                            rotateZ: 0.5,
                            boxShadow: "0 0 30px rgba(0, 243, 255, 0.3)"
                        }}
                    >
                        <div className="card-icon">{category.image}</div>
                        <h3>{category.title}</h3>
                        <p>{category.description}</p>
                        <NeonButton
                            variant="primary"
                            className="btn-play"
                            whileHover={{ scale: 1.1, letterSpacing: '2px' }}
                        >
                            Play Now
                        </NeonButton>
                    </GlassCard>
                ))}
            </motion.div>

            <AnimatePresence>
                {showSizeModal && (
                    <motion.div
                        className="modal-overlay"
                        onClick={() => setShowSizeModal(false)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <GlassCard
                            className="modal-content size-modal"
                            onClick={e => e.stopPropagation()}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                        >
                            <h2>Select Tournament Size</h2>
                            <p>How many competitors?</p>

                            <div className="size-options">
                                {[8, 16, 32].map(size => (
                                    <NeonButton
                                        key={size}
                                        className="btn-size"
                                        onClick={() => handleStartPrebuilt(size)}
                                        variant="secondary"
                                    >
                                        {size}
                                    </NeonButton>
                                ))}
                            </div>

                            <button className="btn-close-modal" onClick={() => setShowSizeModal(false)}>Cancel</button>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Home;
