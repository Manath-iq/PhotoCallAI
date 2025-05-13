import { useState } from 'react';
import { useTelegram } from '../TelegramContext';
import { STORAGE_KEYS, loadFromStorage } from '../utils/storage';
import './ProfileIcon.css';

const ProfileIcon = ({ onProfileClick }) => {
  const { user } = useTelegram();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const userProfile = loadFromStorage(STORAGE_KEYS.USER_PROFILE);
  
  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick();
    } else {
      setIsMenuOpen(!isMenuOpen);
    }
  };
  
  const getInitials = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };
  
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

  return (
    <div className="profile-icon-container">
      <div className="profile-icon" onClick={handleProfileClick}>
        {user?.photo_url ? (
          <img src={user.photo_url} alt={user.first_name} className="user-avatar" />
        ) : (
          <div className="user-initials">
            {getInitials(user?.first_name || 'User')}
          </div>
        )}
        <div className="user-name-container">
          <span className="user-name">{user?.first_name || 'Пользователь'}</span>
          {user?.username && <span className="user-username">@{user.username}</span>}
        </div>
      </div>
      
      {isMenuOpen && userProfile && (
        <div className="profile-dropdown">
          <div className="profile-info">
            <div className="profile-detail">
              <span className="detail-label">Пол:</span>
              <span className="detail-value">{userProfile.gender === 'male' ? 'Мужской' : 'Женский'}</span>
            </div>
            <div className="profile-detail">
              <span className="detail-label">Возраст:</span>
              <span className="detail-value">{userProfile.age} лет</span>
            </div>
            <div className="profile-detail">
              <span className="detail-label">Рост:</span>
              <span className="detail-value">{userProfile.height} см</span>
            </div>
            <div className="profile-detail">
              <span className="detail-label">Вес:</span>
              <span className="detail-value">{userProfile.weight} кг</span>
            </div>
            {bmi && (
              <div className="profile-detail">
                <span className="detail-label">ИМТ:</span>
                <span className="detail-value">{bmi}</span>
              </div>
            )}
            <div className="profile-detail">
              <span className="detail-label">Цель:</span>
              <span className="detail-value">{getGoalText(userProfile.goal)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileIcon; 