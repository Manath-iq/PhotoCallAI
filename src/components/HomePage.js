import { useState, useEffect } from 'react';
import { STORAGE_KEYS, loadFromStorage } from '../utils/storage';
import UserProfile from './UserProfile';
import ProfileIcon from './ProfileIcon';
import { useTelegram } from '../TelegramContext';

const HomePage = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const { webApp, user } = useTelegram();

  useEffect(() => {
    // Check if user profile exists
    const savedProfile = loadFromStorage(STORAGE_KEYS.USER_PROFILE);
    if (savedProfile) {
      setUserProfile(savedProfile);
      setShowProfileForm(false);
    } else {
      setShowProfileForm(true);
    }
  }, []);

  const handleProfileComplete = (profile) => {
    setUserProfile(profile);
    setShowProfileForm(false);

    // Main Button setup if available
    if (webApp && webApp.MainButton) {
      webApp.MainButton.setText('Добавить приём пищи');
      webApp.MainButton.show();
    }
  };

  const handleEditProfile = () => {
    setShowProfileForm(true);
    
    // Hide Main Button during profile editing
    if (webApp && webApp.MainButton) {
      webApp.MainButton.hide();
    }
  };

  if (showProfileForm) {
    return <UserProfile onComplete={handleProfileComplete} />;
  }

  // Calculate BMI if profile data is available
  const calculateBMI = () => {
    if (!userProfile || !userProfile.height || !userProfile.weight) {
      return null;
    }
    
    const heightInMeters = parseFloat(userProfile.height) / 100;
    const weightInKg = parseFloat(userProfile.weight);
    
    return (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const bmi = calculateBMI();
  
  // Determine goal text
  const getGoalText = (goalId) => {
    switch (goalId) {
      case 'weight_loss':
        return 'Похудение';
      case 'maintenance':
        return 'Поддержание формы';
      case 'muscle_gain':
        return 'Набор массы';
      default:
        return 'Не указана';
    }
  };

  return (
    <div className="home-page">
      <ProfileIcon onProfileClick={handleEditProfile} />
      
      <div className="food-diary-intro card">
        <h3>Дневник питания</h3>
        <p>Здесь будет находиться ваш дневник питания. Добавляйте приемы пищи и получайте рекомендации от AI.</p>
        
        <div className="diary-actions">
          <button className="add-food-btn">
            Добавить приём пищи
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 