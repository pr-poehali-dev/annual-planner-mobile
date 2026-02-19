import React from 'react';
import { ChevronLeft, ChevronRight, X, Plus, CircleAlert, LucideProps } from 'lucide-react';

const iconMap: Record<string, React.FC<LucideProps>> = {
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  CircleAlert,
};

interface IconProps extends LucideProps {
  name: string;
  fallback?: string;
}

const Icon: React.FC<IconProps> = ({ name, fallback = 'CircleAlert', ...props }) => {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    const FallbackIcon = iconMap[fallback];
    if (!FallbackIcon) {
      return <span className="text-xs text-gray-400">[icon]</span>;
    }
    return <FallbackIcon {...props} />;
  }

  return <IconComponent {...props} />;
};

export default Icon;
