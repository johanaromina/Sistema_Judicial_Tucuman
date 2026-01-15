import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../../theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Tipos de transiciones disponibles
export const TRANSITION_TYPES = {
  SLIDE_RIGHT: 'slideRight',
  SLIDE_LEFT: 'slideLeft',
  SLIDE_UP: 'slideUp',
  SLIDE_DOWN: 'slideDown',
  FADE: 'fade',
  SCALE: 'scale',
  FLIP: 'flip',
  CUBE: 'cube',
  ZOOM: 'zoom',
};

// Componente de transición entre pantallas
const ScreenTransition = ({
  children,
  type = TRANSITION_TYPES.SLIDE_RIGHT,
  duration = 300,
  delay = 0,
  onTransitionComplete,
  style,
  ...props
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const rotateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startTransition = () => {
      // Configurar valores iniciales según el tipo de transición
      switch (type) {
        case TRANSITION_TYPES.SLIDE_RIGHT:
          translateX.setValue(-screenWidth);
          break;
        case TRANSITION_TYPES.SLIDE_LEFT:
          translateX.setValue(screenWidth);
          break;
        case TRANSITION_TYPES.SLIDE_UP:
          translateY.setValue(screenHeight);
          break;
        case TRANSITION_TYPES.SLIDE_DOWN:
          translateY.setValue(-screenHeight);
          break;
        case TRANSITION_TYPES.SCALE:
          scale.setValue(0.8);
          break;
        case TRANSITION_TYPES.FLIP:
          rotateY.setValue(90);
          break;
        case TRANSITION_TYPES.CUBE:
          rotateY.setValue(90);
          translateX.setValue(-screenWidth / 2);
          break;
        case TRANSITION_TYPES.ZOOM:
          scale.setValue(0.5);
          break;
        default:
          break;
      }

      // Configurar animación según el tipo
      let animation;
      switch (type) {
        case TRANSITION_TYPES.SLIDE_RIGHT:
        case TRANSITION_TYPES.SLIDE_LEFT:
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

        case TRANSITION_TYPES.SLIDE_UP:
        case TRANSITION_TYPES.SLIDE_DOWN:
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

        case TRANSITION_TYPES.SCALE:
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

        case TRANSITION_TYPES.FLIP:
          animation = Animated.parallel([
            Animated.timing(animatedValue, {
              toValue: 1,
              duration,
              delay,
              useNativeDriver: true,
            }),
            Animated.timing(rotateY, {
              toValue: 0,
              duration,
              delay,
              useNativeDriver: true,
            }),
          ]);
          break;

        case TRANSITION_TYPES.CUBE:
          animation = Animated.parallel([
            Animated.timing(animatedValue, {
              toValue: 1,
              duration,
              delay,
              useNativeDriver: true,
            }),
            Animated.timing(rotateY, {
              toValue: 0,
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

        case TRANSITION_TYPES.ZOOM:
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
        if (finished && onTransitionComplete) {
          onTransitionComplete();
        }
      });
    };

    startTransition();
  }, [type, duration, delay, onTransitionComplete]);

  // Configurar estilos de transformación según el tipo
  const getTransformStyle = () => {
    switch (type) {
      case TRANSITION_TYPES.SLIDE_RIGHT:
      case TRANSITION_TYPES.SLIDE_LEFT:
        return {
          opacity: animatedValue,
          transform: [{ translateX }],
        };

      case TRANSITION_TYPES.SLIDE_UP:
      case TRANSITION_TYPES.SLIDE_DOWN:
        return {
          opacity: animatedValue,
          transform: [{ translateY }],
        };

      case TRANSITION_TYPES.SCALE:
        return {
          opacity: animatedValue,
          transform: [{ scale }],
        };

      case TRANSITION_TYPES.FLIP:
        return {
          opacity: animatedValue,
          transform: [
            {
              rotateY: rotateY.interpolate({
                inputRange: [0, 90],
                outputRange: ['0deg', '90deg'],
              }),
            },
          ],
        };

      case TRANSITION_TYPES.CUBE:
        return {
          opacity: animatedValue,
          transform: [
            {
              rotateY: rotateY.interpolate({
                inputRange: [0, 90],
                outputRange: ['0deg', '90deg'],
              }),
            },
            { translateX },
            { perspective: 1000 },
          ],
        };

      case TRANSITION_TYPES.ZOOM:
        return {
          opacity: animatedValue,
          transform: [{ scale }],
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
    flex: 1,
  },
});

export default ScreenTransition; 