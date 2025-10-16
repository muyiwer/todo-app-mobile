import { useState, useEffect } from "react";
import { Platform } from "react-native";
import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
} from "expo-audio";
import * as Speech from "expo-speech";
import Constants from "expo-constants";
// For web, we'll use the Web Speech API
// For mobile, we'll use expo-audio for recording and send to a speech-to-text service

interface UseVoiceRecognitionReturn {
  isListening: boolean;
  transcript: string;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  resetTranscript: () => void;
  error: string | null;
}

export const useVoiceRecognition = (): UseVoiceRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any>(null);

  // Use the expo-audio hook for mobile recording
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  useEffect(() => {
    // Initialize Web Speech API for web platform
    if (Platform.OS === "web" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = "en-US";

      recognitionInstance.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPiece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPiece + " ";
          }
        }
        if (finalTranscript) {
          setTranscript((prev) => prev + finalTranscript);
        }
      };

      recognitionInstance.onerror = (event: any) => {
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }

    // Setup audio mode for mobile on mount
    const setupAudioMode = async () => {
      if (Platform.OS !== "web") {
        try {
          // Request permissions
          const status = await AudioModule.requestRecordingPermissionsAsync();
          if (!status.granted) {
            setError("Microphone permission not granted");
            return;
          }

          // Set audio mode
          await setAudioModeAsync({
            playsInSilentMode: true,
            allowsRecording: true,
          });
        } catch (err) {
          console.warn("Failed to set audio mode:", err);
          setError(`Failed to set audio mode: ${err}`);
        }
      }
    };

    setupAudioMode();

    return () => {
      if (recognition) {
        try {
          recognition.stop();
        } catch (err) {
          console.warn("Error stopping recognition:", err);
        }
      }
    };
  }, []);

  const startListening = async () => {
    setError(null);
    setTranscript("");

    try {
      if (Platform.OS === "web" && recognition) {
        // Use Web Speech API on web
        recognition.start();
        setIsListening(true);
      } else {
        // Use expo-audio recording on mobile
        try {
          // Prepare and start recording
          await audioRecorder.prepareToRecordAsync();
          audioRecorder.record();

          setIsListening(true);

          // Provide feedback
          Speech.speak("Listening", { language: "en" });

          // Auto-stop after 10 seconds
          setTimeout(async () => {
            await stopListening();
          }, 10000);
        } catch (recordError) {
          setError(`Failed to start recording: ${recordError}`);
          setIsListening(false);
        }
      }
    } catch (err) {
      setError(`Failed to start listening: ${err}`);
      setIsListening(false);
    }
  };

  const stopListening = async () => {
    try {
      if (Platform.OS === "web" && recognition) {
        recognition.stop();
      } else if (audioRecorder) {
        try {
          // Stop recording - the URI will be available on audioRecorder.uri
          await audioRecorder.stop();

          const uri = audioRecorder.uri;

          if (!uri) {
            setError("Recording URI not available");
            return;
          }

          //  Send to speech-to-text API
          try {
            const apiKey = Constants.expoConfig?.extra?.assemblyAiApiKey;
            const apiUrl = Constants.expoConfig?.extra?.assemblyAiApiUrl;
            if (!apiKey && !apiUrl) {
              setError("AssemblyAI API key or API url is missing");
              return;
            }

            // Step 1: Upload audio file
            const audioFile = await fetch(uri);
            const audioBlob = await audioFile.blob();

            const uploadResponse = await fetch(`${apiUrl}upload`, {
              method: "POST",
              headers: {
                authorization: apiKey,
                "transfer-encoding": "chunked",
              },
              body: audioBlob,
            });

            const uploadData = await uploadResponse.json();
            const audioUrl = uploadData.upload_url;

            if (!audioUrl) {
              setError("Failed to upload audio to AssemblyAI");
              return;
            }

            // Step 2: Request transcription
            const transcriptResponse = await fetch(`${apiUrl}transcript`, {
              method: "POST",
              headers: {
                authorization: apiKey,
                "content-type": "application/json",
              },
              body: JSON.stringify({
                audio_url: audioUrl,
                language_code: "en_us",
              }),
            });

            const transcriptData = await transcriptResponse.json();
            const transcriptId = transcriptData.id;

            if (!transcriptId) {
              setError("Failed to create transcription job");
              return;
            }

            // Step 3: Poll for completion
            let completed = false;
            let attempts = 0;

            while (!completed && attempts < 20) {
              await new Promise((resolve) => setTimeout(resolve, 5000)); // wait 5s

              const pollingResponse = await fetch(
                `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
                {
                  headers: { authorization: apiKey },
                }
              );
              const pollingData = await pollingResponse.json();

              if (pollingData.status === "completed") {
                setTranscript(pollingData.text.trim());
                completed = true;
                break;
              } else if (pollingData.status === "error") {
                setError(pollingData.error || "Transcription failed");
                break;
              }

              attempts++;
            }

            if (!completed && !error) {
              setError("Transcription timed out");
            }
          } catch (apiError) {
            console.error("AssemblyAI transcription error:", apiError);
            setError("Failed to transcribe audio");
          }
        } catch (stopError) {
          console.error("Error stopping recorder:", stopError);
          setError(`Failed to stop recording: ${stopError}`);
        }
      }
      setIsListening(false);
    } catch (err) {
      setError(`Failed to stop listening: ${err}`);
      setIsListening(false);
    }
  };

  const resetTranscript = () => {
    setTranscript("");
  };

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    error,
  };
};
