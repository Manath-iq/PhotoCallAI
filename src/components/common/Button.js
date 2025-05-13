import React from 'react';
import { Button as AntButton } from 'antd';

/**
 * Общий компонент кнопки, использующий Tailwind и Ant Design
 */
const Button = ({
  children,
  onClick,
  type = 'primary',
  size = 'middle',
  block = false,
  danger = false,
  disabled = false,
  className = '',
  icon = null,
  loading = false,
  ...props
}) => {
  // Базовые стили с Tailwind
  const baseClasses = 'transition-all duration-200 font-medium shadow-btn';
  
  // Зеленый стиль приоритетен над цветами темы Telegram
  const buttonClasses = `${baseClasses} ${className}`;
  
  return (
    <AntButton
      onClick={onClick}
      type={type}
      size={size}
      block={block}
      danger={danger}
      disabled={disabled}
      icon={icon}
      loading={loading}
      className={buttonClasses}
      {...props}
    >
      {children}
    </AntButton>
  );
};

export default Button; 