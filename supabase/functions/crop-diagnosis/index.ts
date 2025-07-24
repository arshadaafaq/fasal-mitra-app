import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, prompt } = await req.json();
    
    // Mock AI diagnosis response (replace with actual Vertex AI integration)
    const mockDiagnosis = {
      disease_name: "Early Blight (Alternaria solani)",
      confidence: 0.89,
      severity: "Moderate (6/10)",
      symptoms: "Dark brown spots with concentric rings on leaves",
      treatment: [
        "Remove affected leaves immediately",
        "Apply copper-based fungicide (available at local agri stores)",
        "Improve air circulation around plants",
        "Avoid overhead watering"
      ],
      prevention: [
        "Crop rotation with non-solanaceous crops",
        "Use resistant varieties",
        "Apply mulch to prevent soil splash"
      ],
      cost_estimate: "₹150-200 for treatment per acre",
      recovery_time: "2-3 weeks with proper treatment",
      local_suppliers: [
        "Karnataka Agri Supply Center, Bangalore",
        "Farmer Producer Organizations in your district"
      ]
    };

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    return new Response(JSON.stringify({
      success: true,
      diagnosis: mockDiagnosis
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in crop-diagnosis function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});