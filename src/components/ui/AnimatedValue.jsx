import React from 'react';
import NumberFlow from '@number-flow/react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

const baseFlowTiming = {
  transformTiming: { duration: 650, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
  spinTiming: { duration: 850, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
  opacityTiming: { duration: 240, easing: 'ease-out' },
};

function useFlowProps() {
  const prefersReduced = usePrefersReducedMotion();

  return React.useMemo(() => {
    if (!prefersReduced) {
      return {
        animated: true,
        respectMotionPreference: false,
        ...baseFlowTiming,
      };
    }

    return {
      animated: false,
      respectMotionPreference: false,
      transformTiming: { duration: 0 },
      spinTiming: { duration: 0 },
      opacityTiming: { duration: 0 },
    };
  }, [prefersReduced]);
}

export function AnimatedValue({
  value,
  format,
  prefix,
  suffix,
  className = '',
  locales = 'en-IN',
  ...rest
}) {
  const flowProps = useFlowProps();

  return (
    <span className={className} {...rest}>
      <NumberFlow
        value={value}
        locales={locales}
        format={format}
        prefix={prefix}
        suffix={suffix}
        willChange
        {...flowProps}
      />
    </span>
  );
}

export function CurrencyValue({
  value,
  className = '',
  maximumFractionDigits = 0,
  minimumFractionDigits = 0,
  ...rest
}) {
  return (
    <AnimatedValue
      value={value}
      className={className}
      {...rest}
      format={{
        style: 'currency',
        currency: 'INR',
        notation: 'standard',
        maximumFractionDigits,
        minimumFractionDigits,
      }}
    />
  );
}

export function DecimalValue({
  value,
  className = '',
  maximumFractionDigits = 1,
  minimumFractionDigits = 0,
  suffix,
  ...rest
}) {
  return (
    <AnimatedValue
      value={value}
      className={className}
      suffix={suffix}
      {...rest}
      format={{
        maximumFractionDigits,
        minimumFractionDigits,
      }}
    />
  );
}

export function PercentValue({
  value,
  className = '',
  maximumFractionDigits = 0,
  asWhole = false,
  ...rest
}) {
  const normalizedValue = asWhole ? value / 100 : value;

  return (
    <AnimatedValue
      value={normalizedValue}
      className={className}
      {...rest}
      format={{
        style: 'percent',
        maximumFractionDigits,
      }}
    />
  );
}
