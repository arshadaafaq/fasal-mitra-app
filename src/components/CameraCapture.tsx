import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, RotateCcw, Upload, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CameraCaptureProps {
  onImageCapture: (imageFile: File) => void;
  isAnalyzing?: boolean;
}

const CameraCapture = ({ onImageCapture, isAnalyzing = false }: CameraCaptureProps) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      onImageCapture(file);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-medium">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-forest-green">
          <Camera className="w-5 h-5" />
          Crop Disease Diagnosis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!capturedImage ? (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-gradient-earth">
              <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Take a clear photo of the affected plant parts
              </p>
              <Button 
                variant="camera" 
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
                disabled={isAnalyzing}
              >
                <Camera className="w-4 h-4 mr-2" />
                Capture Photo
              </Button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
              disabled={isAnalyzing}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload from Gallery
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden shadow-soft">
              <img 
                src={capturedImage} 
                alt="Captured crop" 
                className="w-full h-48 object-cover"
              />
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-white text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm">Analyzing crop...</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleRetake}
                className="flex-1"
                disabled={isAnalyzing}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake
              </Button>
              
              {!isAnalyzing && (
                <Button variant="agriculture" className="flex-1">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Analyze
                </Button>
              )}
            </div>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
};

export default CameraCapture;