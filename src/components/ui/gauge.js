import { cn } from '../../utils/cn';

/**
 * Renders a circular gauge using SVG. Allows configuration of colors, stroke, and animations.
 * @param {Object} props - Component props
 * @param {number} props.value - Current value of the gauge, expressed as a percentage.
 * @param {number|string} props.size - Width and height of the gauge. Defaults to 100%.
 * @param {number} props.gapPercent - Percentage of the total circumference that represents a gap in the gauge. Defaults to 5%.
 * @param {number} props.strokeWidth - Stroke width of the gauge. Defaults to 10px.
 * @param {boolean} props.equal - Determines if the gauge should have equal primary and secondary stroke lengths. Defaults to false.
 * @param {boolean} props.showValue - Option to display the numeric value inside the gauge. Defaults to true.
 * @param {string|Object} props.primary - Primary color or set of colors for the gauge, with optional threshold values to determine color changes.
 * @param {string|Object} props.secondary - Secondary color or set of colors for the gauge, similar to `primary`.
 * @param {Object} props.transition - Transition settings for the gauge's animation, specifying the length, step, and delay of transitions.
 * @param {string|Object} props.className - Class names for different parts of the gauge, including the SVG container and individual elements.
 * @param {Function} props.renderValue - Optional function to customize how the value is rendered in the center.
 * @returns {JSX.Element} - The rendered Gauge component
 */
function Gauge({
  value,
  size = '100%',
  gapPercent = 5,
  strokeWidth = 10,
  equal = false,
  showValue = true,

  primary,
  secondary,

  transition = {
    length: 1200, // ms - increased to match parent animation duration
    step: 100, // ms - reduced for smoother transition
    delay: 0 // ms
  },

  className,
  renderValue,

  ...props
}) {
  const strokePercent = value // %

  const circleSize = 100 // px
  const radius = circleSize / 2 - strokeWidth / 2
  const circumference = 2 * Math.PI * radius

  const percentToDegree = 360 / 100 // deg
  const percentToPx = circumference / 100 // px

  const offsetFactor = equal ? 0.5 : 0
  const offsetFactorSecondary = 1 - offsetFactor

  const primaryStrokeDasharray = () => {
    if (offsetFactor > 0 && strokePercent > 100 - gapPercent * 2 * offsetFactor) {
      // calculation to gradually shift back to 0 offset as progress nears 100% when offsetFactor > 0
      const subtract = -strokePercent + 100

      return `${Math.max(strokePercent * percentToPx - subtract * percentToPx, 0)} ${circumference}`
    } else {
      const subtract = gapPercent * 2 * offsetFactor

      return `${Math.max(strokePercent * percentToPx - subtract * percentToPx, 0)} ${circumference}`
    }
  }

  const secondaryStrokeDasharray = () => {
    if (offsetFactorSecondary < 1 && strokePercent < gapPercent * 2 * offsetFactorSecondary) {
      // calculation to gradually shift back to 1 secondary offset as progress nears 100% when offsetFactorSecondary < 1
      const subtract = strokePercent

      return `${Math.max((100 - strokePercent) * percentToPx - subtract * percentToPx, 0)} ${circumference}`
    } else {
      const subtract = gapPercent * 2 * offsetFactorSecondary

      return `${Math.max((100 - strokePercent) * percentToPx - subtract * percentToPx, 0)} ${circumference}`
    }
  }

  const primaryTransform = () => {
    if (offsetFactor > 0 && strokePercent > 100 - gapPercent * 2 * offsetFactor) {
      // calculation to gradually shift back to 0 offset as progress nears 100% when offsetFactor > 0
      const add = 0.5 * (-strokePercent + 100)

      return `rotate(${-90 + add * percentToDegree}deg)`
    } else {
      const add = gapPercent * offsetFactor

      return `rotate(${-90 + add * percentToDegree}deg)`
    }
  }

  const secondaryTransform = () => {
    if (offsetFactorSecondary < 1 && strokePercent < gapPercent * 2 * offsetFactorSecondary) {
      // calculation to gradually shift back to 1 secondary offset as progress nears 100% when offsetFactorSecondary < 1
      const subtract = 0.5 * strokePercent

      return `rotate(${360 - 90 - subtract * percentToDegree}deg) scaleY(-1)`
    } else {
      const subtract = gapPercent * offsetFactorSecondary

      return `rotate(${360 - 90 - subtract * percentToDegree}deg) scaleY(-1)`
    }
  }

  const primaryStroke = () => {
    if (!primary) {
      return strokePercent <= 25
        ? '#dc2626' // Red
        : strokePercent <= 50
          ? '#f59e0b' // Amber
          : strokePercent <= 75
            ? '#3b82f6' // Blue
            : '#22c55e' // Green
    }
  
    else if (typeof primary === 'string') {
      return primary === 'danger'
        ? '#dc2626' // Red
        : primary === 'warning'
          ? '#f59e0b' // Amber
          : primary === 'info'
            ? '#3b82f6' // Blue
            : primary === 'success'
              ? '#00b96b' // Green matching app theme
              : primary
    }
  
    else if (typeof primary === 'object') {
      const primaryKeys = Object.keys(primary).sort((a, b) => Number(a) - Number(b))
      let primaryStroke = ''
      for (let i = 0; i < primaryKeys.length; i++) {
        const currentKey = Number(primaryKeys[i])
        const nextKey = Number(primaryKeys[i + 1])
  
        if (strokePercent >= currentKey && (strokePercent < nextKey || !nextKey)) {
          primaryStroke = primary[currentKey] || ''
  
          if (['danger', 'warning', 'success', 'info'].includes(primaryStroke)) {
            primaryStroke = {
              danger: '#dc2626',
              warning: '#f59e0b',
              info: '#3b82f6',
              success: '#00b96b'
            }[primaryStroke] || primaryStroke
          }
  
          break
        }
      }
      return primaryStroke
    }
  }

  const secondaryStroke = () => {
    if (!secondary) {
      return '#E0E0E0' // Light gray for better contrast on light background
    }
  
    else if (typeof secondary === 'string') {
      return secondary === 'danger'
        ? '#fecaca' // Light Red
        : secondary === 'warning'
          ? '#fde68a' // Light Amber
          : secondary === 'info'
            ? '#bfdbfe' // Light Blue
            : secondary === 'success'
              ? '#d0f0e0' // Light Green
              : secondary
    }
  
    else if (typeof secondary === 'object') {
      const stroke_percent_secondary = 100 - strokePercent
      const secondaryKeys = Object.keys(secondary).sort((a, b) => Number(a) - Number(b))
      let secondaryStroke = ''
  
      for (let i = 0; i < secondaryKeys.length; i++) {
        const currentKey = Number(secondaryKeys[i])
        const nextKey = Number(secondaryKeys[i + 1])
  
        if (stroke_percent_secondary >= currentKey && (stroke_percent_secondary < nextKey || !nextKey)) {
          secondaryStroke = secondary[currentKey] || ''
  
          if (['danger', 'warning', 'success', 'info'].includes(secondaryStroke)) {
            secondaryStroke = {
              danger: '#fecaca',
              warning: '#fde68a',
              info: '#bfdbfe',
              success: '#d0f0e0'
            }[secondaryStroke] || secondaryStroke
          }
  
          break
        }
      }
      return secondaryStroke
    }
  }

  const primaryOpacity = () => {
    if (
      offsetFactor > 0 &&
      strokePercent < gapPercent * 2 * offsetFactor &&
      strokePercent < gapPercent * 2 * offsetFactorSecondary
    ) {
      return 0
    } else return 1
  }

  const secondaryOpacity = () => {
    if (
      (offsetFactor === 0 && strokePercent > 100 - gapPercent * 2) ||
      (offsetFactor > 0 &&
        strokePercent > 100 - gapPercent * 2 * offsetFactor &&
        strokePercent > 100 - gapPercent * 2 * offsetFactorSecondary)
    ) {
      return 0
    } else return 1
  }

  const circleStyles = {
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeDashoffset: 0,
    strokeWidth: strokeWidth,
    transition: `all ${transition?.length}ms cubic-bezier(0.34, 1.15, 0.64, 1) ${transition?.delay}ms`,
    transformOrigin: '50% 50%',
    shapeRendering: 'geometricPrecision'
  }

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox={`0 0 ${circleSize} ${circleSize}`}
      shapeRendering='crispEdges'
      width={size}
      height={size}
      style={{ userSelect: 'none' }}
      strokeWidth={2} // TODO: not needed?
      fill='none'
      className={cn('', typeof className === 'string' ? className : className?.svgClassName)}
      {...props}
    >
      {/*secondary*/}
      <circle
        cx={circleSize / 2}
        cy={circleSize / 2}
        r={radius}
        style={{
          ...circleStyles,
          strokeDasharray: secondaryStrokeDasharray(),
          transform: secondaryTransform(),
          stroke: secondaryStroke(),
          opacity: secondaryOpacity()
        }}
        className={cn('', typeof className === 'object' && className?.secondaryClassName)}
      />

      {/* primary */}
      <circle
        cx={circleSize / 2}
        cy={circleSize / 2}
        r={radius}
        style={{
          ...circleStyles,
          strokeDasharray: primaryStrokeDasharray(),
          transform: primaryTransform(),
          stroke: primaryStroke(),
          opacity: primaryOpacity()
        }}
        className={cn('', typeof className === 'object' && className?.primaryClassName)}
      />

      {showValue && (
        <text
          x='50%'
          y='50%'
          textAnchor='middle'
          dominantBaseline='central'
          alignmentBaseline='central'
          fill={primaryStroke()}
          fontSize={36}
          className={cn('font-semibold', typeof className === 'object' && className?.textClassName)}
          style={{
            dominantBaseline: 'central',
            alignmentBaseline: 'central',
          }}
        >
          {renderValue ? renderValue() : Math.round(strokePercent)}
        </text>
      )}
    </svg>
  )
}

export { Gauge } 