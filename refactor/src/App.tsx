import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useTheme } from './hooks/useTheme';
import { motion, AnimatePresence } from 'framer-motion';
import Background from './components/layout/Background';
import Overlays from './components/layout/Overlays';
import CertsDrawer from './components/layout/CertsDrawer';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ProjectAwsPage from './pages/ProjectAwsPage';
import ProjectPrsPage from './pages/ProjectPrsPage';

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects/aws" element={<ProjectAwsPage />} />
        <Route path="/projects/prs" element={<ProjectPrsPage />} />
        {/* Catch-all 404 */}
        <Route path="*" element={
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6"
          >
            <h1 className="text-4xl md:text-6xl font-black font-mono text-customCyan mb-4 tracking-tighter">404 - SECTOR OFFLINE</h1>
            <p className="max-w-md text-customTextMuted font-medium">The requested trajectory does not exist in this sector of the grid.</p>
            <motion.a 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/"
              className="mt-12 px-8 py-3 bg-white/5 border border-white/10 rounded-full font-mono text-xs uppercase tracking-widest font-bold hover:bg-white/10 transition-colors"
            >
              Return to Nexus
            </motion.a>
          </motion.div>
        } />
      </Routes>
    </AnimatePresence>
  );
}


function App() {
  const { theme, setTheme, rotateTheme } = useTheme();

  useEffect(() => {
    document.body.classList.add('is-ready');
    return () => document.body.classList.remove('is-ready');
  }, []);

  return (
    <Router>
      <div className="min-h-screen flex flex-col relative w-full overflow-hidden bg-black selection:bg-customCyan/30 selection:text-white">
        {/* Dynamic Background and Overlays */}
        <Background />
        <Overlays />
        <CertsDrawer />

        <Navbar activeTheme={theme} setActiveTheme={setTheme} rotateTheme={rotateTheme} />
        
        <main id="main-content" className="flex-grow w-full relative z-10 m-0 p-0">
          <AnimatedRoutes />
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
