import React from 'react';
import { Card as AntCard } from 'antd';

/**
 * Общий компонент карточки с использованием Tailwind и Ant Design
 */
const Card = ({
  children,
  title = null,
  bordered = true,
  className = '',
  bodyStyle = {},
  hoverable = false,
  ...props
}) => {
  // Базовые стили с Tailwind
  const baseClasses = 'rounded-xl shadow-card bg-white';
  
  return (
    <AntCard
      title={title}
      bordered={bordered}
      className={`${baseClasses} ${className}`}
      bodyStyle={bodyStyle}
      hoverable={hoverable}
      {...props}
    >
      {children}
    </AntCard>
  );
};

export default Card; 