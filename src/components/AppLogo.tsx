import React from 'react';
// @ts-ignore
import pianaLogo from './Piana.png';

interface AppLogoProps {
  className?: string;
  withContainer?: boolean;
}

export default function AppLogo({ className = 'w-8 h-8', withContainer = false }: AppLogoProps) {
  const containerClasses = "bg-[#fcfaf7] w-9 h-9 rounded-lg flex items-center justify-center shadow-2xs hover:scale-105 active:scale-95 transition cursor-pointer overflow-hidden p-0.5 border border-amber-500/10";

  const imgContent = (
    <img
      src={pianaLogo}
      alt="Conexão Piana Logo"
      className={withContainer ? "w-full h-full object-cover rounded-md" : className}
      referrerPolicy="no-referrer"
    />
  );

  if (withContainer) {
    return (
      <div className={containerClasses} title="Conexão Piana">
        {imgContent}
      </div>
    );
  }

  return imgContent;
}

