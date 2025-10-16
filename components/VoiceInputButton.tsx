import React, { useContext, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, Text, Alert } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import * as Speech from "expo-speech";
import { ThemeContext } from "../contexts/ThemeContext";
import { useVoiceRecognition } from "../hooks/useVoiceRecognition";

interface VoiceInputButtonProps {
  onTasksDetected: (tasks: string[]) => void;
}

const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTasksDetected,
}) => {
  const { theme } = useContext(ThemeContext);
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    error,
  } = useVoiceRecognition();

  const scale = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  // Animated styles for the button
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: isListening ? 0.6 : 0,
  }));

  // Start/stop listening animation
  useEffect(() => {
    if (isListening) {
      pulseScale.value = withRepeat(
        withTiming(1.5, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      pulseScale.value = withTiming(1);
    }
  }, [isListening]);

  // Handle errors
  useEffect(() => {
    if (error) {
      Alert.alert("Voice Recognition Error", error);
      console.error("error", error);
    }
  }, [error]);

  // Process transcript when listening stops
  useEffect(() => {
    if (!isListening && transcript) {
      const tasks = parseTasksFromText(transcript);
      
      if (tasks.length > 0) {
        onTasksDetected(tasks);
        Speech.speak(`Added ${tasks.length} task${tasks.length > 1 ? 's' : ''}`, {
          language: "en",
        });
      } else {
        Alert.alert("No Tasks Detected", "Please try again with a clearer command.");
      }

      resetTranscript();
    }
  }, [isListening, transcript]);

  // Parse tasks from transcribed text using NLP-inspired approach
  const parseTasksFromText = (text: string): string[] => {
    if (!text.trim()) return [];

    text = text.toLowerCase().trim();

    // Common separators for splitting tasks
    const separators = [
      " and then ",
      " then ",
      " and also ",
      " also ",
      " plus ",
      " as well as ",
      " followed by ",
      ", ",
    ];

    let tasks = [text];

    // Split by each separator
    for (const separator of separators) {
      const newTasks: string[] = [];
      for (const task of tasks) {
        const split = task
          .split(new RegExp(separator, "gi"))
          .map((t) => t.trim())
          .filter((t) => t.length > 0);
        newTasks.push(...split);
      }
      tasks = newTasks;
    }

    // Clean up tasks
    return tasks
      .map((task) => {
        // Remove common task prefixes
        task = task.replace(
          /^(to |i need to |i have to |i must |i should |remember to |don't forget to |make sure to )/gi,
          ""
        );
        
        // Remove trailing conjunctions
        task = task.replace(/( and| then| also)$/gi, "");
        
        // Capitalize first letter
        task = task.charAt(0).toUpperCase() + task.slice(1);
        
        // Remove trailing periods and exclamation marks
        task = task.replace(/[.!]+$/, "");
        
        return task.trim();
      })
      .filter((task) => {
        // Filter out very short tasks (likely parsing errors)
        if (task.length < 3) return false;
        
        // Filter out common filler words that might be parsed as tasks
        const fillerWords = ["um", "uh", "er", "ah", "hmm", "okay", "ok", "yes", "no"];
        return !fillerWords.includes(task.toLowerCase());
      });
  };

  const handlePress = async () => {
    if (isListening) {
      stopListening();
      scale.value = withSpring(1);
    } else {
      scale.value = withSpring(0.9);
      await startListening();
    }
  };

  return (
    <View style={styles.container}>
      {/* Pulse animation background */}
      <Animated.View
        style={[
          styles.pulseCircle,
          pulseStyle,
          { backgroundColor: theme === "dark" ? "#005BB5" : "#007AFF" },
        ]}
      />

      {/* Main FAB button */}
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          style={[
            styles.fab,
            isListening && styles.fabActive,
            theme === "dark" && styles.darkFab,
          ]}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <View style={styles.micIcon}>
            {isListening ? (
              <View style={styles.listeningIndicator}>
                <View style={[styles.soundWave, styles.wave1]} />
                <View style={[styles.soundWave, styles.wave2]} />
                <View style={[styles.soundWave, styles.wave3]} />
              </View>
            ) : (
              <Text style={styles.micText}>🎤</Text>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Status text */}
      {isListening && (
        <View style={styles.statusContainer}>
          <Text
            style={[styles.statusText, theme === "dark" && styles.darkStatusText]}
          >
            Listening...
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 80,
    right: 20,
    alignItems: "center",
  },
  pulseCircle: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#007AFF",
  },
  fab: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  darkFab: {
    backgroundColor: "#005BB5",
  },
  fabActive: {
    backgroundColor: "#FF3B30",
  },
  micIcon: {
    justifyContent: "center",
    alignItems: "center",
  },
  micText: {
    fontSize: 32,
  },
  listeningIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  soundWave: {
    width: 4,
    backgroundColor: "#fff",
    borderRadius: 2,
  },
  wave1: {
    height: 16,
  },
  wave2: {
    height: 24,
  },
  wave3: {
    height: 16,
  },
  statusContainer: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(0, 122, 255, 0.9)",
    borderRadius: 20,
  },
  statusText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  darkStatusText: {
    color: "#fff",
  },
});

export default VoiceInputButton;