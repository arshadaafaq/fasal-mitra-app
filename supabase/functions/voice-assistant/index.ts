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
    const { transcript, language } = await req.json();
    
    // Mock AI response based on query type
    let response = "";
    
    if (transcript.toLowerCase().includes("price") || transcript.toLowerCase().includes("market")) {
      response = `Current tomato prices in Bangalore: ₹25-30 per kg. Prices are trending upward due to festival demand. Best time to sell is within 3-4 days. Visit Yeshwantpur APMC for best rates.`;
    } else if (transcript.toLowerCase().includes("disease") || transcript.toLowerCase().includes("pest")) {
      response = `For crop disease diagnosis, please take a clear photo of the affected plant parts using our camera feature. Common signs include leaf spots, wilting, or unusual discoloration.`;
    } else if (transcript.toLowerCase().includes("scheme") || transcript.toLowerCase().includes("subsidy")) {
      response = `PM-KISAN provides ₹6,000 annually. Drip irrigation subsidy offers 55% support up to ₹40,000 per hectare. Visit your nearest CSC for applications.`;
    } else {
      response = `Thank you for your farming question. For specific guidance on "${transcript}", I recommend: Monitor crops daily, maintain proper irrigation, and contact your local Agriculture Extension Officer for detailed advice.`;
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    return new Response(JSON.stringify({
      success: true,
      response: response
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in voice-assistant function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});