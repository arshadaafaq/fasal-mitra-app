import { useState } from "react";
import { TrendingUp, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const MarketAnalysisComponent = () => {
  const [crop, setCrop] = useState("");
  const [location, setLocation] = useState("Bangalore");
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const analyzeMarket = async () => {
    if (!crop.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a crop name",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setAnalysis(null);

    try {
      // Call Supabase Edge Function for market analysis
      const { data, error } = await supabase.functions.invoke('market-analysis', {
        body: {
          crop: crop,
          location: location
        }
      });

      if (error) throw error;

      const result = data.analysis;
      setAnalysis(result);

      // Save to database
      await supabase.from('market_queries').insert({
        crop: crop,
        location: location,
        analysis: result
      });

      toast({
        title: "Analysis Complete",
        description: `Market data for ${crop} in ${location}`,
      });

    } catch (error) {
      console.error('Market analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Please check your connection and try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-medium">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-forest-green">
          <TrendingUp className="w-5 h-5" />
          Market Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Crop Name</label>
            <Input
              placeholder="Enter crop (e.g., tomato, onion, rice)"
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <Select value={location} onValueChange={setLocation} disabled={loading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bangalore">Bangalore</SelectItem>
                <SelectItem value="Mysore">Mysore</SelectItem>
                <SelectItem value="Hubli">Hubli</SelectItem>
                <SelectItem value="Mangalore">Mangalore</SelectItem>
                <SelectItem value="Bellary">Bellary</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button
          onClick={analyzeMarket}
          disabled={loading || !crop.trim()}
          className="w-full"
          variant="agriculture"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing Market...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Get Market Analysis
            </>
          )}
        </Button>

        {analysis && (
          <div className="bg-crop-green/10 border border-crop-green/20 rounded-lg p-4">
            <h4 className="font-semibold text-crop-green mb-3">📊 Market Intelligence</h4>
            <div className="space-y-3 text-sm">
              <div>
                <strong>Current Price:</strong> {analysis.current_price}
              </div>
              <div>
                <strong>Trend:</strong> {analysis.price_trend}
              </div>
              <div>
                <strong>Demand:</strong> {analysis.market_analysis?.demand}
              </div>
              <div>
                <strong>Recommendation:</strong> {analysis.selling_recommendation?.timing}
              </div>
              <div>
                <strong>Best Markets:</strong> {analysis.selling_recommendation?.markets?.join(", ")}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MarketAnalysisComponent;