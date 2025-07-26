import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Volume2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface VoiceRecorderProps {
  selectedLanguage: string;
  onVoiceQuery: (transcript: string) => void;
}

const VoiceRecorder = ({ selectedLanguage, onVoiceQuery }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [currentFarmerId, setCurrentFarmerId] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [agentResponse, setAgentResponse] = useState<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const { toast } = useToast();

  const languageNames = {
    en: "English",
    hi: "Hindi", 
    kn: "Kannada"
  };

  const initializeAgentSession = async () => {
    // Generate random farmer_id and session_id
    const farmerId = `farmer_${Math.random().toString(36).substring(2, 15)}`;
    const sessionId = `session_${Math.random().toString(36).substring(2, 15)}`;
    
    try {
      // Make HTTP POST request to agent backend
      const response = await fetch(`http://127.0.0.1:8000/apps/agents/users/${farmerId}/sessions/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const agentData = await response.json();
      
      // Store in variables
      setCurrentFarmerId(farmerId);
      setCurrentSessionId(sessionId);
      setAgentResponse(agentData);
      
      return { farmerId, sessionId, agentData };
    } catch (error) {
      console.error('Failed to initialize agent session:', error);
      toast({
        title: "Session initialization failed",
        description: "Could not connect to agent backend",
        variant: "destructive"
      });
      throw error;
    }
  };

  const startRecording = async () => {
    // Use real speech recognition instead of simulated recording
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Speech recognition not supported",
        description: "Please use a modern browser with speech recognition support",
        variant: "destructive"
      });
      return;
    }

    // Initialize agent session before starting recording
    try {
      await initializeAgentSession();
    } catch (error) {
      return; // Exit if session initialization fails
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = selectedLanguage === 'hi' ? 'hi-IN' : selectedLanguage === 'kn' ? 'kn-IN' : 'en-IN';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
      setTranscript('');
      setResponse('');
    };

    recognition.onend = () => {
      setIsRecording(false);
    };
    
    recognition.onresult = async (event) => {
      const spokenText = event.results[0][0].transcript;
      setTranscript(spokenText);
      setIsProcessing(true);
      onVoiceQuery(spokenText);
      
      try {
        // Call backend agent API
        const response = await fetch('http://127.0.0.1:8000/run', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            appName: "agents",
            userId: currentFarmerId,
            sessionId: currentSessionId,
            newMessage: {
              parts: [
                {
                  text: spokenText
                }
              ],
              role: "user"
            }
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const agentResponseData = await response.json();
        
        // Parse the response array - get last element's content.parts[0].text
        const lastElement = agentResponseData[agentResponseData.length - 1];
        const aiResponse = lastElement.content.parts[0].text;
        
        setResponse(aiResponse);

        // Save interaction to database
        await supabase.from('voice_interactions').insert({
          transcript: spokenText,
          response: aiResponse,
          language: selectedLanguage === 'hi' ? 'hi-IN' : selectedLanguage === 'kn' ? 'kn-IN' : 'en-IN'
        });

        // Automatically speak the response
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(aiResponse);
          utterance.lang = selectedLanguage === 'hi' ? 'hi-IN' : selectedLanguage === 'kn' ? 'kn-IN' : 'en-IN';
          utterance.rate = 0.8;
          speechSynthesis.speak(utterance);
        }

      } catch (error) {
        console.error('Voice processing error:', error);
        const errorMsg = "Sorry, I couldn't process your request. Please try again.";
        setResponse(errorMsg);
        
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(errorMsg);
          utterance.lang = selectedLanguage === 'hi' ? 'hi-IN' : selectedLanguage === 'kn' ? 'kn-IN' : 'en-IN';
          speechSynthesis.speak(utterance);
        }
      } finally {
        setIsProcessing(false);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      setIsProcessing(false);
      toast({
        title: "Speech recognition failed",
        description: "Please try speaking again",
        variant: "destructive"
      });
    };

    recognition.start();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const speakResponse = () => {
    if ('speechSynthesis' in window && response) {
      const utterance = new SpeechSynthesisUtterance(response);
      utterance.lang = selectedLanguage === 'hi' ? 'hi-IN' : selectedLanguage === 'kn' ? 'kn-IN' : 'en-IN';
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-medium">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-forest-green">
          <Mic className="w-5 h-5" />
          Voice Assistant ({languageNames[selectedLanguage as keyof typeof languageNames]})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <Button
            variant={isRecording ? "destructive" : "voice"}
            size="icon-lg"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`mx-auto ${isRecording ? 'animate-pulse-soft' : ''}`}
          >
            {isProcessing ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : isRecording ? (
              <MicOff className="w-8 h-8" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </Button>
          
          <p className="mt-4 text-sm text-muted-foreground">
            {isRecording ? "Listening... Tap to stop" : 
             isProcessing ? "Processing your query..." :
             "Tap to speak your question"}
          </p>
        </div>

        {transcript && (
          <div className="bg-secondary/50 rounded-lg p-4">
            <h4 className="font-medium text-sm mb-2 text-forest-green">You said:</h4>
            <p className="text-sm">{transcript}</p>
          </div>
        )}

        {response && (
          <div className="bg-gradient-primary/10 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm text-forest-green">AI Response:</h4>
              <Button variant="ghost" size="sm" onClick={speakResponse}>
                <Volume2 className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm leading-relaxed">{response}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceRecorder;