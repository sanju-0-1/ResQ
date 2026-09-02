import React, { useRef, useState } from 'react';
import { Pressable, Text, StyleSheet, View, Animated, Easing } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../utils/theme';

interface EmergencyButtonProps {
  onPress: () => void;
  isLoading?: boolean;
}

export const EmergencyButton: React.FC<EmergencyButtonProps> = ({ onPress, isLoading }) => {
  const [isPressing, setIsPressing] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    if (isLoading) return;
    setIsPressing(true);
    setShowHint(false);

    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 1500,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  };

  const handlePressOut = () => {
    if (isLoading) return;
    setIsPressing(false);
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleShortPress = () => {
    setShowHint(true);
    setTimeout(() => {
      setShowHint(false);
    }, 2500);
  };

  const handleLongPress = () => {
    setIsPressing(false);
    progressAnim.setValue(0);
    onPress();
  };

  // Interpolate progress to scale and background opacity
  const progressScale = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  const progressFillWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.outerGlowContainer,
          { transform: [{ scale: progressScale }] },
          isPressing && styles.outerGlowActive,
        ]}
      >
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handleShortPress}
          onLongPress={handleLongPress}
          delayLongPress={1500}
          disabled={isLoading}
        >
          {/* Progress fill overlay */}
          <Animated.View
            style={[
              styles.progressOverlay,
              {
                width: progressFillWidth,
                height: progressFillWidth,
                borderRadius: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 100],
                }),
              },
            ]}
          />

          <View style={styles.contentContainer}>
            <Text style={styles.icon}>🆘</Text>
            <Text style={styles.titleText}>
              {isPressing ? 'HOLDING...' : 'HOLD FOR SOS'}
            </Text>
            <Text style={styles.subtitleText}>
              {isPressing ? 'KEEP PRESSING FOR 1.5s' : 'PRESS & HOLD FOR ASSISTANCE'}
            </Text>
          </View>
        </Pressable>
      </Animated.View>

      {/* Progress Bar under button */}
      <View style={styles.progressBarContainer}>
        <Animated.View style={[styles.progressBarFill, { width: progressFillWidth }]} />
      </View>

      {showHint ? (
        <View style={styles.hintContainer}>
          <Text style={styles.hintText}>⚠️ Press and HOLD for 1.5 seconds to trigger SOS</Text>
        </View>
      ) : (
        <Text style={styles.instructionText}>Hold button for 1.5 sec to activate emergency</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  outerGlowContainer: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: COLORS.emergencyRedGlow,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 51, 51, 0.4)',
    shadowColor: COLORS.emergencyRed,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 20,
  },
  outerGlowActive: {
    borderColor: '#FF0000',
    backgroundColor: 'rgba(255, 0, 0, 0.35)',
    shadowOpacity: 0.9,
    shadowRadius: 30,
  },
  button: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.emergencyRed,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
    borderWidth: 4,
    borderColor: '#FF7979',
    overflow: 'hidden',
  },
  buttonPressed: {
    borderColor: '#FFFFFF',
  },
  progressOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    alignSelf: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  icon: {
    fontSize: 44,
    marginBottom: SPACING.xs,
  },
  titleText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  subtitleText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 4,
  },
  progressBarContainer: {
    width: 220,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 3,
    marginTop: 18,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.emergencyRedBright,
    borderRadius: 3,
  },
  instructionText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  hintContainer: {
    marginTop: 8,
    backgroundColor: 'rgba(229, 57, 53, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.emergencyRed,
  },
  hintText: {
    color: COLORS.emergencyRedBright,
    fontSize: 12,
    fontWeight: '700',
  },
});
