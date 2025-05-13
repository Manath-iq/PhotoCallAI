import { useState, useEffect } from 'react';
import { STORAGE_KEYS, saveToStorage, loadFromStorage } from '../utils/storage';
import { useTelegram } from '../TelegramContext';

// Default profile values
const DEFAULT_PROFILE = {
  gender: '',
  age: '',
  height: '',
  weight: '',
  goal: '',
};

// Available goals
const GOALS = [
  { id: 'weight_loss', label: 'Похудение' },
  { id: 'maintenance', label: 'Поддержание формы' },
  { id: 'muscle_gain', label: 'Набор массы' },
];

const UserProfile = ({ onComplete }) => {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [errors, setErrors] = useState({});
  const { webApp, user } = useTelegram();

  useEffect(() => {
    // Try to load existing profile
    const savedProfile = loadFromStorage(STORAGE_KEYS.USER_PROFILE);
    if (savedProfile) {
      setProfile(savedProfile);
    }
    
    // Set back button handler if available
    if (webApp) {
      webApp.BackButton.hide();
    }
  }, [webApp]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value,
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!profile.gender) {
      newErrors.gender = 'Выберите пол';
    }
    
    if (!profile.age || isNaN(profile.age) || profile.age < 16 || profile.age > 120) {
      newErrors.age = 'Укажите возраст от 16 до 120 лет';
    }
    
    if (!profile.height || isNaN(profile.height) || profile.height < 120 || profile.height > 250) {
      newErrors.height = 'Укажите рост от 120 до 250 см';
    }
    
    if (!profile.weight || isNaN(profile.weight) || profile.weight < 30 || profile.weight > 300) {
      newErrors.weight = 'Укажите вес от 30 до 300 кг';
    }
    
    if (!profile.goal) {
      newErrors.goal = 'Выберите цель';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Save to localStorage
      saveToStorage(STORAGE_KEYS.USER_PROFILE, profile);
      
      // Notify parent component
      if (onComplete) {
        onComplete(profile);
      }
      
      // Haptic feedback if available
      if (webApp && webApp.HapticFeedback) {
        webApp.HapticFeedback.notificationOccurred('success');
      }
    } else {
      // Error haptic feedback
      if (webApp && webApp.HapticFeedback) {
        webApp.HapticFeedback.notificationOccurred('error');
      }
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="user-profile-container">
      <div className="profile-header">
        {user && (
          <div className="profile-edit-icon">
            {user.photo_url ? (
              <img src={user.photo_url} alt={user.first_name} className="user-avatar" />
            ) : (
              <div className="user-initials">
                {getInitials(user.first_name || 'User')}
              </div>
            )}
            <div className="user-name-container">
              <span className="user-name">{user.first_name || 'Пользователь'}</span>
              {user.username && <span className="user-username">@{user.username}</span>}
            </div>
          </div>
        )}
        <h2 className="profile-title">Заполните профиль</h2>
        <p className="profile-subtitle">Данные для оптимального подбора питания</p>
      </div>
      
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label>Пол</label>
          <div className="gender-buttons">
            <button 
              type="button" 
              className={`gender-btn ${profile.gender === 'male' ? 'active' : ''}`}
              onClick={() => handleInputChange({ target: { name: 'gender', value: 'male' } })}
            >
              Мужской
            </button>
            <button 
              type="button" 
              className={`gender-btn ${profile.gender === 'female' ? 'active' : ''}`}
              onClick={() => handleInputChange({ target: { name: 'gender', value: 'female' } })}
            >
              Женский
            </button>
          </div>
          {errors.gender && <div className="error-message">{errors.gender}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="age">Возраст (лет)</label>
          <input
            type="number"
            id="age"
            name="age"
            placeholder="Например: 30"
            value={profile.age}
            onChange={handleInputChange}
            min="16"
            max="120"
          />
          {errors.age && <div className="error-message">{errors.age}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="height">Рост (см)</label>
          <input
            type="number"
            id="height"
            name="height"
            placeholder="Например: 175"
            value={profile.height}
            onChange={handleInputChange}
            min="120"
            max="250"
          />
          {errors.height && <div className="error-message">{errors.height}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="weight">Вес (кг)</label>
          <input
            type="number"
            id="weight"
            name="weight"
            placeholder="Например: 70"
            value={profile.weight}
            onChange={handleInputChange}
            min="30"
            max="300"
          />
          {errors.weight && <div className="error-message">{errors.weight}</div>}
        </div>
        
        <div className="form-group">
          <label>Цель</label>
          <select 
            name="goal" 
            value={profile.goal} 
            onChange={handleInputChange}
          >
            <option value="">Выберите цель</option>
            {GOALS.map(goal => (
              <option key={goal.id} value={goal.id}>
                {goal.label}
              </option>
            ))}
          </select>
          {errors.goal && <div className="error-message">{errors.goal}</div>}
        </div>
        
        <button type="submit" className="submit-btn">
          Сохранить
        </button>
      </form>
    </div>
  );
};

export default UserProfile; 