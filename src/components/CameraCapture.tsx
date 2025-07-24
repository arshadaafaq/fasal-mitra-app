import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, RotateCcw, Upload, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CameraCaptureProps {
  onImageCapture: (imageFile: File) => void;
  isAnalyzing?: boolean;
}

const CameraCapture = ({ onImageCapture, isAnalyzing = false }: CameraCaptureProps) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setDiagnosis(null);

    try {
      // Upload image to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('crop-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('crop-images')
        .getPublicUrl(fileName);

      // Convert to base64 for AI analysis
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(',')[1];
        setCapturedImage(e.target?.result as string);

        // Call AI analysis function
        const { data, error } = await supabase.functions.invoke('crop-diagnosis', {
          body: {
            imageBase64: base64,
            prompt: "Analyze this crop image for diseases and provide treatment recommendations"
          }
        });

        if (error) throw error;

        const result = data.diagnosis;
        setDiagnosis(result);

        // Save to database
        await supabase.from('crop_diagnoses').insert({
          image_url: publicUrl,
          diagnosis: result,
          confidence: result.confidence
        });

        onImageCapture(file);
        
        toast({
          title: "Analysis Complete",
          description: `Identified: ${result.disease_name}`,
        });
      };
      reader.readAsDataURL(file);

    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Please try again or check your connection",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
                disabled={loading}
              >
                <Camera className="w-4 h-4 mr-2" />
                {loading ? "Analyzing..." : "Capture Photo"}
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
              disabled={loading}
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
              {loading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-white text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm">Analyzing with AI...</p>
                  </div>
                </div>
              )}
            </div>
            
            {diagnosis && (
              <div className="bg-crop-green/10 border border-crop-green/20 rounded-lg p-4">
                <h4 className="font-semibold text-crop-green mb-2">🔬 AI Diagnosis</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Disease:</strong> {diagnosis.disease_name}</p>
                  <p><strong>Confidence:</strong> {(diagnosis.confidence * 100).toFixed(1)}%</p>
                  <p><strong>Severity:</strong> {diagnosis.severity}</p>
                  <p><strong>Treatment:</strong> {diagnosis.treatment?.[0]}</p>
                  <p><strong>Cost:</strong> {diagnosis.cost_estimate}</p>
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleRetake}
                className="flex-1"
                disabled={loading}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake
              </Button>
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