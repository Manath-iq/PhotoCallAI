import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col } from 'antd';
import { Gauge } from './ui/gauge';
import { STORAGE_KEYS, loadFromStorage } from '../utils/storage';
import './NutritionGauges.css';

const { Title } = Typography;

// Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
const calculateBMR = (gender, weight, height, age) => {
  if (!gender || !weight || !height || !age) return 0;
  
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
};

// Calculate Total Daily Energy Expenditure (TDEE)
// Activity levels: sedentary=1.2, light=1.375, moderate=1.55, active=1.725, very_active=1.9
const calculateTDEE = (bmr, activityLevel = 1.375) => {
  return bmr * activityLevel;
};

// Calculate macros based on goals
const calculateMacros = (tdee, goal) => {
  let calorieAdjustment = 0;
  let proteinPercentage = 0;
  let fatPercentage = 0;
  let carbPercentage = 0;
  
  switch (goal) {
    case 'weight_loss':
      calorieAdjustment = -500; // Deficit for weight loss
      proteinPercentage = 0.30; // Higher protein for muscle preservation
      fatPercentage = 0.30;
      carbPercentage = 0.40;
      break;
    case 'maintenance':
      calorieAdjustment = 0;
      proteinPercentage = 0.25;
      fatPercentage = 0.30;
      carbPercentage = 0.45;
      break;
    case 'muscle_gain':
      calorieAdjustment = 300; // Surplus for muscle gain
      proteinPercentage = 0.30; // Higher protein for muscle building
      fatPercentage = 0.25;
      carbPercentage = 0.45;
      break;
    default:
      calorieAdjustment = 0;
      proteinPercentage = 0.25;
      fatPercentage = 0.30;
      carbPercentage = 0.45;
  }
  
  const adjustedCalories = Math.max(1200, tdee + calorieAdjustment);
  
  // 1g protein = 4 calories, 1g fat = 9 calories, 1g carbs = 4 calories
  const protein = Math.round((adjustedCalories * proteinPercentage) / 4);
  const fat = Math.round((adjustedCalories * fatPercentage) / 9);
  const carbs = Math.round((adjustedCalories * carbPercentage) / 4);
  
  return {
    calories: Math.round(adjustedCalories),
    protein,
    fat,
    carbs
  };
};

// Компонент, добавляющий символ процента к числу
const PercentValue = ({ value }) => (
  <>
    {Math.round(value)}
    <tspan className="gauge-percent">%</tspan>
  </>
);

const NutritionGauges = ({ calories, protein, fat, carbs, showAnimation = true }) => {
  // State for animated values
  const [animatedValues, setAnimatedValues] = useState({
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0
  });
  
  // State for recommended daily values
  const [dailyRecommended, setDailyRecommended] = useState({
    calories: 2000, // Default values
    protein: 50,
    fat: 70,
    carbs: 260
  });

  // Load user profile and calculate recommended values
  useEffect(() => {
    const userProfile = loadFromStorage(STORAGE_KEYS.USER_PROFILE);
    
    if (userProfile) {
      const { gender, weight, height, age, goal } = userProfile;
      
      // Calculate BMR and TDEE
      const bmr = calculateBMR(gender, weight, height, age);
      const tdee = calculateTDEE(bmr);
      
      // Calculate macros based on goal
      const recommended = calculateMacros(tdee, goal);
      setDailyRecommended(recommended);
    }
  }, []);

  // Calculate percentages (capped at 100%)
  const getPercentage = (value, recommended) => {
    return Math.min(100, (value / recommended) * 100);
  };

  // Animation effect when values change
  useEffect(() => {
    if (!showAnimation) {
      // Skip animation if not needed
      setAnimatedValues({ calories, protein, fat, carbs });
      return;
    }

    // Animate to new values
    const animationDuration = 1200; // A bit longer for smoother animation
    const startTime = performance.now();
    const initialValues = { ...animatedValues };
    const targetValues = { calories, protein, fat, carbs };

    const animateValues = (timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      
      // Cubic easing for more natural and consistent animation
      // This creates a smoother start and end to the animation
      const easedProgress = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      const newValues = {
        calories: initialValues.calories + (targetValues.calories - initialValues.calories) * easedProgress,
        protein: initialValues.protein + (targetValues.protein - initialValues.protein) * easedProgress,
        fat: initialValues.fat + (targetValues.fat - initialValues.fat) * easedProgress,
        carbs: initialValues.carbs + (targetValues.carbs - initialValues.carbs) * easedProgress
      };
      
      setAnimatedValues(newValues);
      
      if (progress < 1) {
        requestAnimationFrame(animateValues);
      }
    };
    
    requestAnimationFrame(animateValues);
  }, [calories, protein, fat, carbs, showAnimation]);

  return (
    <Card className="nutrition-gauges-card">
      <Title level={4} className="gauges-title">Потребление питательных веществ</Title>
      
      <Row gutter={[24, 12]} className="gauges-container" justify="center">
        <Col xs={6}>
          <div className="gauge-wrapper">
            <Gauge
              size={80}
              value={getPercentage(animatedValues.calories, dailyRecommended.calories)}
              primary="success"
              showValue={true}
              className={{
                svgClassName: "gauge-svg",
                primaryClassName: "gauge-primary gauge-primary-calories",
                secondaryClassName: "gauge-secondary",
                textClassName: "gauge-center-text"
              }}
              renderValue={() => <PercentValue value={getPercentage(animatedValues.calories, dailyRecommended.calories)} />}
            />
            <div className="gauge-label">Калории</div>
            <div className="gauge-ratio">
              {Math.round(animatedValues.calories)}/{dailyRecommended.calories}кал
            </div>
          </div>
        </Col>
        <Col xs={6}>
          <div className="gauge-wrapper">
            <Gauge
              size={80}
              value={getPercentage(animatedValues.protein, dailyRecommended.protein)}
              primary="info"
              showValue={true}
              className={{
                svgClassName: "gauge-svg",
                primaryClassName: "gauge-primary gauge-primary-protein",
                secondaryClassName: "gauge-secondary",
                textClassName: "gauge-center-text"
              }}
              renderValue={() => <PercentValue value={getPercentage(animatedValues.protein, dailyRecommended.protein)} />}
            />
            <div className="gauge-label">Белки</div>
            <div className="gauge-ratio">
              {Math.round(animatedValues.protein)}/{dailyRecommended.protein}г
            </div>
          </div>
        </Col>
        <Col xs={6}>
          <div className="gauge-wrapper">
            <Gauge
              size={80}
              value={getPercentage(animatedValues.fat, dailyRecommended.fat)}
              primary="warning"
              showValue={true}
              className={{
                svgClassName: "gauge-svg",
                primaryClassName: "gauge-primary gauge-primary-fat",
                secondaryClassName: "gauge-secondary",
                textClassName: "gauge-center-text"
              }}
              renderValue={() => <PercentValue value={getPercentage(animatedValues.fat, dailyRecommended.fat)} />}
            />
            <div className="gauge-label">Жиры</div>
            <div className="gauge-ratio">
              {Math.round(animatedValues.fat)}/{dailyRecommended.fat}г
            </div>
          </div>
        </Col>
        <Col xs={6}>
          <div className="gauge-wrapper">
            <Gauge
              size={80}
              value={getPercentage(animatedValues.carbs, dailyRecommended.carbs)}
              primary="danger"
              showValue={true}
              className={{
                svgClassName: "gauge-svg",
                primaryClassName: "gauge-primary gauge-primary-carbs",
                secondaryClassName: "gauge-secondary",
                textClassName: "gauge-center-text"
              }}
              renderValue={() => <PercentValue value={getPercentage(animatedValues.carbs, dailyRecommended.carbs)} />}
            />
            <div className="gauge-label">Углеводы</div>
            <div className="gauge-ratio">
              {Math.round(animatedValues.carbs)}/{dailyRecommended.carbs}г
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default NutritionGauges; 