import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { crop, location } = await req.json();
    
    // Mock market analysis response
    const mockAnalysis = {
      crop: crop,
      current_price: "₹25-30 per kg",
      price_trend: "Increasing (+15% this week)",
      market_analysis: {
        demand: "High due to festival season",
        supply: "Moderate, some crop damage due to recent rains",
        prediction: "Prices likely to increase by 10-15% next week"
      },
      selling_recommendation: {
        timing: "Sell within 3-4 days for best prices",
        markets: ["Yeshwantpur APMC", "Binny Mills Market"],
        transportation_tips: "Early morning transport recommended"
      },
      nearby_mandis: [
        { name: "Bangalore APMC", distance: "25km", current_rate: "₹28/kg" },
        { name: "Nelamangala Mandi", distance: "35km", current_rate: "₹26/kg" }
      ]
    };

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    return new Response(JSON.stringify({
      success: true,
      analysis: mockAnalysis
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in market-analysis function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});