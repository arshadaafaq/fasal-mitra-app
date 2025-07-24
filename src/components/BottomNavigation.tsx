import { Button } from "@/components/ui/button";
import { Home, Camera, TrendingUp, FileText, User } from "lucide-react";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'diagnose', label: 'Diagnose', icon: Camera },
    { id: 'prices', label: 'Prices', icon: TrendingUp },
    { id: 'schemes', label: 'Schemes', icon: FileText },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-strong z-50">
      <div className="flex justify-around py-2 max-w-md mx-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant="ghost"
            size="sm"
            onClick={() => onTabChange(id)}
            className={`
              flex-col gap-1 h-auto py-3 px-2 text-xs
              ${activeTab === id 
                ? 'text-crop-green bg-crop-green/10' 
                : 'text-muted-foreground hover:text-foreground'
              }
            `}
          >
            <Icon className={`w-5 h-5 ${activeTab === id ? 'text-crop-green' : ''}`} />
            <span className="font-medium">{label}</span>
          </Button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;