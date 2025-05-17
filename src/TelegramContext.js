import { createContext, useContext, useEffect, useState } from 'react';
import { STORAGE_KEYS, loadFromStorage, debugStorage } from './utils/storage';

// Create a context for Telegram WebApp
const TelegramContext = createContext(null);

// Provider component
export const TelegramProvider = ({ children }) => {
  const [webApp, setWebApp] = useState(null);
  const [user, setUser] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Debug localStorage on initialization
    console.log('TelegramContext initializing - checking localStorage:');
    debugStorage();
    
    // Check if user profile exists in localStorage
    const userProfile = loadFromStorage(STORAGE_KEYS.USER_PROFILE);
    console.log('TelegramContext: Found user profile in localStorage:', userProfile);
    
    // Check if Telegram WebApp is available
    if (window.Telegram && window.Telegram.WebApp) {
      const tgWebApp = window.Telegram.WebApp;
      
      try {
        // Initialize the WebApp
        tgWebApp.ready();
        
        // Set the viewport to expand to the maximum available height
        tgWebApp.expand();
        
        // Set up viewport height fix for mobile browsers
        const setViewportHeight = () => {
          const vh = window.innerHeight * 0.01;
          document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        
        // Set initial viewport height
        setViewportHeight();
        
        // Update viewport height on resize
        window.addEventListener('resize', setViewportHeight);
        
        // Get user data if available
        const userData = tgWebApp.initDataUnsafe?.user || null;
        
        // Add photo_url if not present
        if (userData && !userData.photo_url && tgWebApp.initDataUnsafe?.auth_date) {
          // Use the Telegram profile photo placeholder with user ID if available
          if (userData.id) {
            userData.photo_url = `https://t.me/i/userpic/320/${userData.id}.jpg`;
          }
        }
        
        setWebApp(tgWebApp);
        setUser(userData);
        setInitialized(true);
        
        // Log for debugging
        console.log('Telegram WebApp initialized successfully', tgWebApp);
        console.log('User data retrieved:', userData);
        
        return () => {
          window.removeEventListener('resize', setViewportHeight);
        };
      } catch (error) {
        console.error('Error initializing Telegram WebApp:', error);
        setInitialized(true); // Still mark as initialized to prevent endless loading
      }
    } else {
      console.warn('Telegram WebApp is not available. Running in browser mode.');
      
      // For development/testing - mock user data when not in Telegram
      if (process.env.NODE_ENV === 'development') {
        const mockUser = {
          id: 12345678,
          first_name: 'Тестовый',
          last_name: 'Пользователь',
          username: 'testuser',
          language_code: 'ru',
          photo_url: 'https://t.me/i/userpic/320/0.jpg' // Placeholder image
        };
        setUser(mockUser);
        console.log('Created mock user for development:', mockUser);
      }
      
      setInitialized(true);
    }
  }, []);

  return (
    <TelegramContext.Provider value={{ webApp, user, initialized }}>
      {children}
    </TelegramContext.Provider>
  );
};

// Custom hook to use the Telegram context
export const useTelegram = () => {
  const context = useContext(TelegramContext);
  if (context === undefined) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }
  return context;
}; 