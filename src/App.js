import { useEffect, useState } from 'react';
import './App.css';
import { TelegramProvider, useTelegram } from './TelegramContext';
import HomePage from './components/HomePage';
import './components/UserProfile.css';
import './components/HomePage.css';

// Main App Content
function AppContent() {
  const { webApp, user, initialized } = useTelegram();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialized) {
      setLoading(false);
    }
  }, [initialized]);

  // Show loading while Telegram WebApp is initializing
  if (loading) {
    return <div className="loading">Загрузка приложения...</div>;
  }

  return (
    <div 
      className="App"
      style={{
        // Use Telegram theme colors if available
        backgroundColor: webApp?.backgroundColor || '#ffffff',
        color: webApp?.textColor || '#000000'
      }}
    >
      <main>
        <HomePage />
      </main>
    </div>
  );
}

// Wrapper App with TelegramProvider
function App() {
  return (
    <TelegramProvider>
      <AppContent />
    </TelegramProvider>
  );
}

export default App;
