import { useState } from "react";
import { Camera, Mic, TrendingUp, FileText, Thermometer, Bell, Activity } from "lucide-react";
import KisanHeader from "@/components/KisanHeader";
import QuickActionCard from "@/components/QuickActionCard";
import CameraCapture from "@/components/CameraCapture";
import VoiceRecorder from "@/components/VoiceRecorder";
import MarketPriceCard from "@/components/MarketPriceCard";
import MarketAnalysisComponent from "@/components/MarketAnalysisComponent";
import BottomNavigation from "@/components/BottomNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import farmingHero from "@/assets/farming-hero.jpg";

const Index = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [activeTab, setActiveTab] = useState("home");
  const [showCamera, setShowCamera] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Sample market data
  const marketPrices = [
    { crop: "Tomato", price: 45, unit: "kg", change: 8.2, trend: "up" as const, market: "Bangalore APMC" },
    { crop: "Onion", price: 35, unit: "kg", change: -2.1, trend: "down" as const, market: "Mysore Market" },
    { crop: "Rice", price: 3200, unit: "quintal", change: 0, trend: "stable" as const, market: "Mandya Mandi" },
    { crop: "Wheat", price: 2850, unit: "quintal", change: 5.5, trend: "up" as const, market: "Hubli Market" }
  ];

  const handleImageCapture = (file: File) => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      // Here you would integrate with actual AI service
    }, 3000);
  };

  const handleVoiceQuery = (transcript: string) => {
    // Handle voice query processing
    console.log("Voice query:", transcript);
  };

  const quickActions = [
    {
      title: "Diagnose Crop Disease",
      description: "Take a photo of your crop to identify diseases and get treatment recommendations",
      icon: Camera,
      variant: "camera" as const,
      onClick: () => setShowCamera(true)
    },
    {
      title: "Ask Voice Assistant", 
      description: "Speak your farming questions in your preferred language",
      icon: Mic,
      variant: "voice" as const,
      onClick: () => setShowVoice(true)
    },
    {
      title: "Market Prices",
      description: "Get real-time crop prices and selling recommendations",
      icon: TrendingUp,
      variant: "agriculture" as const,
      onClick: () => setActiveTab("prices")
    },
    {
      title: "Government Schemes",
      description: "Find and apply for agricultural subsidies and schemes",
      icon: FileText,
      variant: "harvest" as const,
      onClick: () => setActiveTab("schemes"),
      disabled: true
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "diagnose":
        return (
          <div className="px-4 pb-20">
            <CameraCapture onImageCapture={handleImageCapture} isAnalyzing={isAnalyzing} />
          </div>
        );
      
      case "prices":
        return (
          <div className="px-4 pb-20 space-y-6">
            <MarketPriceCard prices={marketPrices} />
            <MarketAnalysisComponent />
          </div>
        );
      
      case "schemes":
        return (
          <div className="px-4 pb-20">
            <Card className="shadow-medium">
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Government Schemes</h3>
                <p className="text-muted-foreground">Coming soon - Browse and apply for agricultural subsidies</p>
              </CardContent>
            </Card>
          </div>
        );
      
      case "profile":
        return (
          <div className="px-4 pb-20">
            <Card className="shadow-medium">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👨‍🌾</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Farmer Profile</h3>
                <p className="text-muted-foreground">Manage your profile and farming preferences</p>
              </CardContent>
            </Card>
          </div>
        );
      
      default:
        return (
          <div className="px-4 pb-20">
            {/* Hero Section */}
            <div className="relative rounded-2xl overflow-hidden mb-6 shadow-medium">
              <img 
                src={farmingHero} 
                alt="Modern farming"
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                <div className="absolute bottom-4 left-4 text-white">
                  <h2 className="text-2xl font-bold mb-1">Smart Farming</h2>
                  <p className="text-sm opacity-90">AI-powered agricultural assistance</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {quickActions.map((action, index) => (
                <QuickActionCard
                  key={index}
                  title={action.title}
                  description={action.description}
                  icon={action.icon}
                  variant={action.variant}
                  onClick={action.onClick}
                  disabled={action.disabled}
                />
              ))}
            </div>

            {/* Today's Highlights */}
            <Card className="mb-6 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-forest-green">
                  <Activity className="w-5 h-5" />
                  Today's Highlights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Weather Widget */}
                <div className="flex items-center justify-between p-3 bg-sky-blue/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Thermometer className="w-8 h-8 text-sky-blue" />
                    <div>
                      <p className="font-medium">Weather Today</p>
                      <p className="text-sm text-muted-foreground">Bangalore</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">28°C</p>
                    <p className="text-sm text-muted-foreground">Partly cloudy</p>
                  </div>
                </div>

                {/* Price Alert */}
                <div className="flex items-center justify-between p-3 bg-crop-green/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="w-8 h-8 text-crop-green" />
                    <div>
                      <p className="font-medium">Price Alert</p>
                      <p className="text-sm text-muted-foreground">Tomato prices up 8%</p>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-crop-green">
                    Sell Now
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-forest-green">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-4">
                  Start using the app to see your activity here
                </p>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-earth">
      <KisanHeader 
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
      />
      
      <main className="pt-4">
        {renderTabContent()}
      </main>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Modal Overlays */}
      {showCamera && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Crop Diagnosis</h2>
                <button 
                  onClick={() => setShowCamera(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
              <CameraCapture onImageCapture={handleImageCapture} isAnalyzing={isAnalyzing} />
            </div>
          </div>
        </div>
      )}

      {showVoice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Voice Assistant</h2>
                <button 
                  onClick={() => setShowVoice(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
              <VoiceRecorder 
                selectedLanguage={selectedLanguage}
                onVoiceQuery={handleVoiceQuery}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
