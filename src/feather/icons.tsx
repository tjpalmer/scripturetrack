import * as React from 'react';

export interface IconProps {
  className?: string;
  color?: string;
}

export function Icon(props: IconProps) {
  let color = props.color || 'currentColor';
  let className = 'icon';
  if (props.className) {
    className += ' ' + props.className;
  }
  return (
    <svg
      className={className}
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      {(props as any).children}
    </svg>
  );
};

export function ChevronDown(props: IconProps) {
  return <Icon {...props}>
    <polyline points="6 9 12 15 18 9"/>
  </Icon>;
}

export function ChevronUp(props: IconProps) {
  return <Icon {...props}>
    <polyline points="18 15 12 9 6 15"/>
  </Icon>;
};

export function ChevronsLeft(props: IconProps) {
  return <Icon {...props}>
    <polyline points="11 17 6 12 11 7"/>
    <polyline points="18 17 13 12 18 7"/>
  </Icon>;
}

export function ChevronsRight(props: IconProps) {
  return <Icon {...props}>
    <polyline points="13 17 18 12 13 7"/>
    <polyline points="6 17 11 12 6 7"/>
  </Icon>;
}

export function Settings(props: IconProps) {
  return <Icon {...props}>
    <circle cx="12" cy="12" r="3"/>
    <path strokeMiterlimit="10" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </Icon>;
}
