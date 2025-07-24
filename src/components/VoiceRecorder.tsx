import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Volume2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceRecorderProps {
  selectedLanguage: string;
  onVoiceQuery: (transcript: string) => void;
}

const VoiceRecorder = ({ selectedLanguage, onVoiceQuery }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const { toast } = useToast();

  const languageNames = {
    en: "English",
    hi: "Hindi", 
    kn: "Kannada"
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const audioChunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        setIsProcessing(true);
        
        // Simulate speech recognition
        setTimeout(() => {
          const sampleQueries = {
            en: ["What's the tomato price today?", "My wheat crop has yellow spots", "Show me PM Kisan scheme"],
            hi: ["आज टमाटर का भाव क्या है?", "मेरी गेहूं की फसल में पीले धब्बे हैं", "पीएम किसान योजना दिखाएं"],
            kn: ["ಇಂದು ಟೊಮೇಟೋ ಬೆಲೆ ಎಷ್ಟು?", "ನನ್ನ ಗೋಧಿ ಬೆಳೆಯಲ್ಲಿ ಹಳದಿ ಚುಕ್ಕೆಗಳಿವೆ", "ಪಿಎಂ ಕಿಸಾನ್ ಯೋಜನೆ ತೋರಿಸಿ"]
          };
          
          const queries = sampleQueries[selectedLanguage as keyof typeof sampleQueries] || sampleQueries.en;
          const randomQuery = queries[Math.floor(Math.random() * queries.length)];
          setTranscript(randomQuery);
          onVoiceQuery(randomQuery);
          
          // Simulate AI response
          setTimeout(() => {
            const responses = {
              en: "Current tomato price is ₹45/kg. Market trend shows 8% increase from last week. Best time to sell!",
              hi: "वर्तमान टमाटर की कीमत ₹45/किलो है। बाजार की प्रवृत्ति पिछले सप्ताह से 8% वृद्धि दिखाती है। बेचने का सबसे अच्छा समय!",
              kn: "ಪ್ರಸ್ತುತ ಟೊಮೇಟೋ ಬೆಲೆ ₹45/ಕೆಜಿ. ಮಾರುಕಟ್ಟೆಯ ಪ್ರವೃತ್ತಿ ಕಳೆದ ವಾರದಿಂದ 8% ಹೆಚ್ಚಳವನ್ನು ತೋರಿಸುತ್ತದೆ. ಮಾರಾಟ ಮಾಡಲು ಉತ್ತಮ ಸಮಯ!"
            };
            setResponse(responses[selectedLanguage as keyof typeof responses] || responses.en);
            setIsProcessing(false);
          }, 2000);
        }, 1500);
        
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
    } catch (error) {
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to use voice features",
        variant: "destructive"
      });
    }
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