import React from 'react';

interface Props {
  size?: number;
  className?: string;
}

export default function RafflebotLogo({ size = 48, className = '' }: Props) {
  return (
    <img
      src="/ChatGPT_Image_Mar_8,_2026,_09_16_12_AM.png"
      alt="RaffleBot"
      width={size}
      height={size}
      className={className}
    />
  );
}
