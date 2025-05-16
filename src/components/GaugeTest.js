import React, { useState } from 'react';
import NutritionGauges from './NutritionGauges';
import { GaugeDemo } from './ui/gauge-demo';
import { Card, Button, Slider, InputNumber, Row, Col, Divider } from 'antd';

const GaugeTest = () => {
  const [nutritionValues, setNutritionValues] = useState({
    calories: 1200,
    protein: 30,
    fat: 40,
    carbs: 150
  });

  const handleValueChange = (type, value) => {
    setNutritionValues(prev => ({
      ...prev,
      [type]: value
    }));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Тестирование компонентов Gauge</h1>
      
      <Card title="Демо нового компонента Gauge" className="mb-6">
        <GaugeDemo />
      </Card>
      
      <Card title="Тест компонента NutritionGauges" className="mb-6">
        <NutritionGauges 
          calories={nutritionValues.calories}
          protein={nutritionValues.protein}
          fat={nutritionValues.fat}
          carbs={nutritionValues.carbs}
        />
        
        <Divider orientation="left">Настройка значений для теста</Divider>
        
        <div className="mb-4">
          <p className="font-medium mb-2">Калории:</p>
          <Row>
            <Col span={18}>
              <Slider
                min={0}
                max={3000}
                value={nutritionValues.calories}
                onChange={(value) => handleValueChange('calories', value)}
              />
            </Col>
            <Col span={4} offset={2}>
              <InputNumber
                min={0}
                max={3000}
                value={nutritionValues.calories}
                onChange={(value) => handleValueChange('calories', value)}
              />
            </Col>
          </Row>
        </div>
        
        <div className="mb-4">
          <p className="font-medium mb-2">Белки (г):</p>
          <Row>
            <Col span={18}>
              <Slider
                min={0}
                max={200}
                value={nutritionValues.protein}
                onChange={(value) => handleValueChange('protein', value)}
              />
            </Col>
            <Col span={4} offset={2}>
              <InputNumber
                min={0}
                max={200}
                value={nutritionValues.protein}
                onChange={(value) => handleValueChange('protein', value)}
              />
            </Col>
          </Row>
        </div>
        
        <div className="mb-4">
          <p className="font-medium mb-2">Жиры (г):</p>
          <Row>
            <Col span={18}>
              <Slider
                min={0}
                max={200}
                value={nutritionValues.fat}
                onChange={(value) => handleValueChange('fat', value)}
              />
            </Col>
            <Col span={4} offset={2}>
              <InputNumber
                min={0}
                max={200}
                value={nutritionValues.fat}
                onChange={(value) => handleValueChange('fat', value)}
              />
            </Col>
          </Row>
        </div>
        
        <div className="mb-4">
          <p className="font-medium mb-2">Углеводы (г):</p>
          <Row>
            <Col span={18}>
              <Slider
                min={0}
                max={400}
                value={nutritionValues.carbs}
                onChange={(value) => handleValueChange('carbs', value)}
              />
            </Col>
            <Col span={4} offset={2}>
              <InputNumber
                min={0}
                max={400}
                value={nutritionValues.carbs}
                onChange={(value) => handleValueChange('carbs', value)}
              />
            </Col>
          </Row>
        </div>
      </Card>
    </div>
  );
};

export default GaugeTest; 