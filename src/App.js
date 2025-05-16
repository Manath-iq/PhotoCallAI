import { useEffect, useState } from 'react';
import './App.css';
import { TelegramProvider, useTelegram } from './TelegramContext';
import HomePage from './components/HomePage';
import GaugeTest from './components/GaugeTest';
import './components/UserProfile.css';
import './components/HomePage.css';
import { ConfigProvider } from 'antd';

// Зеленая тема для Ant Design
const theme = {
  token: {
    colorPrimary: '#00b96b',
    colorLink: '#00b96b',
    colorSuccess: '#4caf50',
    colorWarning: '#ff9800',
    colorError: '#f44336',
    colorInfo: '#009f5f',
    borderRadius: 8,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
  },
  components: {
    Button: {
      colorPrimary: '#00b96b',
      algorithm: true,
    },
    Input: {
      colorPrimary: '#00b96b',
      algorithm: true,
    },
  },
};

// Main App Content
function AppContent() {
  const { webApp, user, initialized } = useTelegram();
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState('home');

  useEffect(() => {
    if (initialized) {
      setLoading(false);
    }

    // Check if we're in test mode
    const params = new URLSearchParams(window.location.search);
    if (params.get('test') === 'gauge') {
      setRoute('gauge-test');
    }
  }, [initialized]);

  // Show loading while Telegram WebApp is initializing
  if (loading) {
    return <div className="loading">Загрузка приложения...</div>;
  }

  return (
    <div 
      className="App bg-light-bg"
      style={{
        // Используем светло-зеленый фон вместо темы Telegram
        color: '#2c3e50'
      }}
    >
      <main>
        {route === 'home' && <HomePage />}
        {route === 'gauge-test' && <GaugeTest />}
      </main>
    </div>
  );
}

// Wrapper App with TelegramProvider
function App() {
  return (
    <TelegramProvider>
      <ConfigProvider theme={theme}>
        <AppContent />
      </ConfigProvider>
    </TelegramProvider>
  );
}

export default App;
