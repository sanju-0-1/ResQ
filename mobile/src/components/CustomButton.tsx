import React, { useRef, useState } from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, View, Animated, Easing } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../utils/theme';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  onLongPress?: () => void;
  delayLongPress?: number;
  variant?: 'primary' | 'danger' | 'secondary' | 'outline';
  isLoading?: boolean;
  disabled?: boolean;
  subtitle?: string;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  onLongPress,
  delayLongPress = 1500,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  subtitle,
}) => {
  const [isPressing, setIsPressing] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

  let bgColor = COLORS.trustBlue;
  let textColor = COLORS.white;

  if (variant === 'danger') {
    bgColor = COLORS.emergencyRed;
  } else if (variant === 'secondary') {
    bgColor = COLORS.cardDarkElevated;
  } else if (variant === 'outline') {
    bgColor = COLORS.transparent;
  }

  const isLongPressMode = Boolean(onLongPress);

  const handlePressIn = () => {
    if (disabled || isLoading || !isLongPressMode) return;
    setIsPressing(true);
    setShowHint(false);

    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: delayLongPress,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled || isLoading || !isLongPressMode) return;
    setIsPressing(false);
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleShortPress = () => {
    if (disabled || isLoading) return;
    if (isLongPressMode) {
      setShowHint(true);
      setTimeout(() => setShowHint(false), 2500);
    } else {
      onPress();
    }
  };

  const handleTriggerLongPress = () => {
    if (disabled || isLoading || !onLongPress) return;
    setIsPressing(false);
    progressAnim.setValue(0);
    onLongPress();
  };

  const fillWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.wrapper}>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: bgColor },
          variant === 'outline' && styles.outline,
          (disabled || isLoading) && styles.disabled,
          pressed && !disabled && styles.pressed,
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handleShortPress}
        onLongPress={isLongPressMode ? handleTriggerLongPress : undefined}
        delayLongPress={isLongPressMode ? delayLongPress : undefined}
        disabled={disabled || isLoading}
      >
        {/* Animated Progress Fill Background for Long Press */}
        {isLongPressMode && (
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: fillWidth,
                backgroundColor:
                  variant === 'danger'
                    ? 'rgba(255, 255, 255, 0.35)'
                    : 'rgba(255, 255, 255, 0.25)',
              },
            ]}
          />
        )}

        {isLoading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.text,
                { color: variant === 'outline' ? COLORS.trustBlueLight : textColor },
              ]}
            >
              {isPressing ? 'HOLDING... KEEP PRESSING' : title}
            </Text>
            {subtitle || isLongPressMode ? (
              <Text style={styles.subtitle}>
                {isPressing
                  ? `HOLD FOR ${delayLongPress / 1000}s TO BROADCAST`
                  : subtitle || `HOLD ${delayLongPress / 1000}s TO CONFIRM`}
              </Text>
            ) : null}
          </View>
        )}
      </Pressable>

      {showHint && isLongPressMode && (
        <Text style={styles.hintText}>
          ⚠️ Press and HOLD for {delayLongPress / 1000} seconds to confirm
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: SPACING.xs,
    width: '100%',
  },
  button: {
    height: 56,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    overflow: 'hidden',
    position: 'relative',
  },
  pressed: {
    opacity: 0.9,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: COLORS.trustBlue,
  },
  disabled: {
    opacity: 0.5,
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  text: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  hintText: {
    color: COLORS.emergencyRedBright,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
  },
});
