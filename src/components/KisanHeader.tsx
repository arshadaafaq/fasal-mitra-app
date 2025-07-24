import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Globe } from "lucide-react";

interface KisanHeaderProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}

const KisanHeader = ({ selectedLanguage, onLanguageChange }: KisanHeaderProps) => {
  const languages = {
    en: "English",
    hi: "हिंदी", 
    kn: "ಕನ್ನಡ"
  };

  return (
    <header className="bg-gradient-primary text-white px-4 py-4 shadow-medium">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold">🌱</span>
          </div>
          <h1 className="text-xl font-bold">Project Kisan</h1>
        </div>

        {/* Language Selector & Profile */}
        <div className="flex items-center gap-2">
          <Select value={selectedLanguage} onValueChange={onLanguageChange}>
            <SelectTrigger className="w-auto bg-white/10 border-white/20 text-white">
              <Globe className="w-4 h-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(languages).map(([code, name]) => (
                <SelectItem key={code} value={code}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default KisanHeader;