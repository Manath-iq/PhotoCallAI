import React, { useState, useEffect } from 'react';
import GaugeComponent from 'react-gauge-component';
import { Card, Typography, Row, Col } from 'antd';
import './NutritionGauges.css';

const { Title } = Typography;

const NutritionGauges = ({ calories, protein, fat, carbs, showAnimation = true }) => {
  // State for animated values
  const [animatedValues, setAnimatedValues] = useState({
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0
  });

  // Calculate percentages relative to daily recommended values
  // These are example values - adjust based on user's specific needs
  const dailyRecommended = {
    calories: 2000, // 2000 calories per day
    protein: 50,    // 50g of protein per day
    fat: 70,        // 70g of fat per day
    carbs: 260      // 260g of carbs per day
  };

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
    const animationDuration = 1000; // 1 second
    const startTime = performance.now();
    const initialValues = { ...animatedValues };
    const targetValues = { calories, protein, fat, carbs };

    const animateValues = (timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      
      // Easing function for smooth animation
      const easeOut = (t) => 1 - Math.pow(1 - t, 2);
      const easedProgress = easeOut(progress);
      
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
      
      <Row gutter={[16, 16]} className="gauges-container">
        <Col xs={12}>
          <div className="gauge-wrapper">
            <GaugeComponent
              id="calories-gauge"
              type="radial"
              value={getPercentage(animatedValues.calories, dailyRecommended.calories)}
              labels={{
                valueLabel: {
                  formatTextValue: () => `${Math.round(animatedValues.calories)} ккал`,
                  style: { fontSize: '0.9em', fill: '#000' }
                }
              }}
              arc={{
                colorArray: ['#5BE12C', '#F5CD19', '#EA4228'],
                subArcs: [{ limit: 50 }, { limit: 75 }, { limit: 100 }],
                padding: 0.02,
                width: 0.3
              }}
              pointer={{ elastic: true, animationDelay: 0 }}
            />
            <div className="gauge-label">Калории</div>
          </div>
        </Col>
        <Col xs={12}>
          <div className="gauge-wrapper">
            <GaugeComponent
              id="protein-gauge"
              type="radial"
              value={getPercentage(animatedValues.protein, dailyRecommended.protein)}
              labels={{
                valueLabel: {
                  formatTextValue: () => `${Math.round(animatedValues.protein)}г`,
                  style: { fontSize: '0.9em', fill: '#000' }
                }
              }}
              arc={{
                colorArray: ['#5BE12C', '#F5CD19', '#EA4228'],
                subArcs: [{ limit: 50 }, { limit: 75 }, { limit: 100 }],
                padding: 0.02,
                width: 0.3
              }}
              pointer={{ elastic: true, animationDelay: 0 }}
            />
            <div className="gauge-label">Белки</div>
          </div>
        </Col>
        <Col xs={12}>
          <div className="gauge-wrapper">
            <GaugeComponent
              id="fat-gauge"
              type="radial"
              value={getPercentage(animatedValues.fat, dailyRecommended.fat)}
              labels={{
                valueLabel: {
                  formatTextValue: () => `${Math.round(animatedValues.fat)}г`,
                  style: { fontSize: '0.9em', fill: '#000' }
                }
              }}
              arc={{
                colorArray: ['#5BE12C', '#F5CD19', '#EA4228'],
                subArcs: [{ limit: 50 }, { limit: 75 }, { limit: 100 }],
                padding: 0.02,
                width: 0.3
              }}
              pointer={{ elastic: true, animationDelay: 0 }}
            />
            <div className="gauge-label">Жиры</div>
          </div>
        </Col>
        <Col xs={12}>
          <div className="gauge-wrapper">
            <GaugeComponent
              id="carbs-gauge"
              type="radial"
              value={getPercentage(animatedValues.carbs, dailyRecommended.carbs)}
              labels={{
                valueLabel: {
                  formatTextValue: () => `${Math.round(animatedValues.carbs)}г`,
                  style: { fontSize: '0.9em', fill: '#000' }
                }
              }}
              arc={{
                colorArray: ['#5BE12C', '#F5CD19', '#EA4228'],
                subArcs: [{ limit: 50 }, { limit: 75 }, { limit: 100 }],
                padding: 0.02,
                width: 0.3
              }}
              pointer={{ elastic: true, animationDelay: 0 }}
            />
            <div className="gauge-label">Углеводы</div>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default NutritionGauges; 