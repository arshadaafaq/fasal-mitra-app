import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: "agriculture" | "harvest" | "voice" | "camera";
  disabled?: boolean;
}

const QuickActionCard = ({ 
  title, 
  description, 
  icon: Icon, 
  onClick, 
  variant = "agriculture",
  disabled = false 
}: QuickActionCardProps) => {
  return (
    <Button
      variant="card"
      className="h-auto p-6 flex-col gap-4 text-left animate-fade-in-up group"
      onClick={onClick}
      disabled={disabled}
    >
      <div className="w-full flex items-center justify-between">
        <div className={`
          w-12 h-12 rounded-xl flex items-center justify-center
          ${variant === 'agriculture' ? 'bg-gradient-primary' : ''}
          ${variant === 'harvest' ? 'bg-gradient-harvest' : ''}
          ${variant === 'voice' ? 'bg-crop-green' : ''}
          ${variant === 'camera' ? 'bg-forest-green' : ''}
          group-hover:scale-110 transition-transform duration-300
        `}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {disabled && (
          <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
            Coming Soon
          </span>
        )}
      </div>
      
      <div className="w-full">
        <h3 className="font-semibold text-lg mb-1 text-foreground group-hover:text-crop-green transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </Button>
  );
};

export default QuickActionCard;