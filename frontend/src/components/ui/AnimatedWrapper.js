import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../theme';

// Tipos de animaciones disponibles
const ANIMATION_TYPES = {
  FADE_IN: 'fadeIn',
  SLIDE_UP: 'slideUp',
  SLIDE_DOWN: 'slideDown',
  SLIDE_LEFT: 'slideLeft',
  SLIDE_RIGHT: 'slideRight',
  SCALE_IN: 'scaleIn',
  BOUNCE: 'bounce',
  PULSE: 'pulse',
  SHAKE: 'shake',
  ROTATE: 'rotate',
};

// Componente wrapper para animaciones
const AnimatedWrapper = ({
  children,
  type = ANIMATION_TYPES.FADE_IN,
  duration = 500,
  delay = 0,
  easing = 'ease',
  onAnimationComplete,
  style,
  ...props
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;
  const translateX = useRef(new Animated.Value(50)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      // Resetear valores iniciales según el tipo de animación
      switch (type) {
        case ANIMATION_TYPES.SLIDE_UP:
          translateY.setValue(50);
          break;
        case ANIMATION_TYPES.SLIDE_DOWN:
          translateY.setValue(-50);
          break;
        case ANIMATION_TYPES.SLIDE_LEFT:
          translateX.setValue(50);
          break;
        case ANIMATION_TYPES.SLIDE_RIGHT:
          translateX.setValue(-50);
          break;
        case ANIMATION_TYPES.SCALE_IN:
          scale.setValue(0.8);
          break;
        case ANIMATION_TYPES.ROTATE:
          rotate.setValue(0);
          break;
        default:
          break;
      }

      // Configurar animación según el tipo
      let animation;
      switch (type) {
        case ANIMATION_TYPES.FADE_IN:
          animation = Animated.timing(animatedValue, {
            toValue: 1,
            duration,
            delay,
            useNativeDriver: true,
          });
          break;

        case ANIMATION_TYPES.SLIDE_UP:
          animation = Animated.parallel([
            Animated.timing(animatedValue, {
              toValue: 1,
              duration,
              delay,
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: 0,
              duration,
              delay,
              useNativeDriver: true,
            }),
          ]);
          break;

        case ANIMATION_TYPES.SLIDE_DOWN:
          animation = Animated.parallel([
            Animated.timing(animatedValue, {
              toValue: 1,
              duration,
              delay,
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: 0,
              duration,
              delay,
              useNativeDriver: true,
            }),
          ]);
          break;

        case ANIMATION_TYPES.SLIDE_LEFT:
          animation = Animated.parallel([
            Animated.timing(animatedValue, {
              toValue: 1,
              duration,
              delay,
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: 0,
              duration,
              delay,
              useNativeDriver: true,
            }),
          ]);
          break;

        case ANIMATION_TYPES.SLIDE_RIGHT:
          animation = Animated.parallel([
            Animated.timing(animatedValue, {
              toValue: 1,
              duration,
              delay,
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: 0,
              duration,
              delay,
              useNativeDriver: true,
            }),
          ]);
          break;

        case ANIMATION_TYPES.SCALE_IN:
          animation = Animated.parallel([
            Animated.timing(animatedValue, {
              toValue: 1,
              duration,
              delay,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1,
              duration,
              delay,
              useNativeDriver: true,
            }),
          ]);
          break;

        case ANIMATION_TYPES.BOUNCE:
          animation = Animated.sequence([
            Animated.timing(animatedValue, {
              toValue: 1,
              duration: duration * 0.6,
              delay,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1.1,
              duration: duration * 0.2,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1,
              duration: duration * 0.2,
              useNativeDriver: true,
            }),
          ]);
          break;

        case ANIMATION_TYPES.PULSE:
          animation = Animated.loop(
            Animated.sequence([
              Animated.timing(scale, {
                toValue: 1.05,
                duration: duration * 0.5,
                useNativeDriver: true,
              }),
              Animated.timing(scale, {
                toValue: 1,
                duration: duration * 0.5,
                useNativeDriver: true,
              }),
            ])
          );
          break;

        case ANIMATION_TYPES.SHAKE:
          animation = Animated.sequence([
            Animated.timing(translateX, {
              toValue: 10,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: -10,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: 10,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: 0,
              duration: 100,
              useNativeDriver: true,
            }),
          ]);
          break;

        case ANIMATION_TYPES.ROTATE:
          animation = Animated.timing(rotate, {
            toValue: 1,
            duration,
            delay,
            useNativeDriver: true,
          });
          break;

        default:
          animation = Animated.timing(animatedValue, {
            toValue: 1,
            duration,
            delay,
            useNativeDriver: true,
          });
      }

      // Ejecutar animación
      animation.start(({ finished }) => {
        if (finished && onAnimationComplete) {
          onAnimationComplete();
        }
      });
    };

    startAnimation();
  }, [type, duration, delay, onAnimationComplete]);

  // Configurar estilos de transformación según el tipo
  const getTransformStyle = () => {
    switch (type) {
      case ANIMATION_TYPES.SLIDE_UP:
        return {
          opacity: animatedValue,
          transform: [{ translateY }],
        };
      case ANIMATION_TYPES.SLIDE_DOWN:
        return {
          opacity: animatedValue,
          transform: [{ translateY }],
        };
      case ANIMATION_TYPES.SLIDE_LEFT:
        return {
          opacity: animatedValue,
          transform: [{ translateX }],
        };
      case ANIMATION_TYPES.SLIDE_RIGHT:
        return {
          opacity: animatedValue,
          transform: [{ translateX }],
        };
      case ANIMATION_TYPES.SCALE_IN:
        return {
          opacity: animatedValue,
          transform: [{ scale }],
        };
      case ANIMATION_TYPES.BOUNCE:
        return {
          opacity: animatedValue,
          transform: [{ scale }],
        };
      case ANIMATION_TYPES.PULSE:
        return {
          opacity: animatedValue,
          transform: [{ scale }],
        };
      case ANIMATION_TYPES.SHAKE:
        return {
          opacity: animatedValue,
          transform: [{ translateX }],
        };
      case ANIMATION_TYPES.ROTATE:
        return {
          opacity: animatedValue,
          transform: [
            {
              rotate: rotate.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }),
            },
          ],
        };
      default:
        return {
          opacity: animatedValue,
        };
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        getTransformStyle(),
        style,
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Los estilos se aplican dinámicamente según la animación
  },
});

export default AnimatedWrapper;
export { ANIMATION_TYPES }; 