import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const getIconName = (routeName) => {
    switch (routeName) {
      case 'Home': return 'home';
      case 'Expedientes': return 'folder';
      case 'Documentos': return 'document';
      case 'Usuarios': return 'people';
      case 'Auditoria': return 'analytics';
      case 'Perfil': return 'person';
      default: return 'help-circle';
    }
  };

  const getIconColor = (isFocused) => {
    return isFocused ? COLORS.primary : COLORS.text.secondary;
  };

  const getTextColor = (isFocused) => {
    return isFocused ? COLORS.primary : COLORS.text.secondary;
  };

  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel || options.title || route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tab}
            activeOpacity={0.8}
          >
            <View style={styles.tabContent}>
              <View style={[
                styles.iconContainer,
                isFocused && styles.iconContainerFocused
              ]}>
                <Ionicons
                  name={getIconName(route.name)}
                  size={24}
                  color={getIconColor(isFocused)}
                />
              </View>
              
              <Text style={[
                styles.tabLabel,
                { color: getTextColor(isFocused) }
              ]}>
                {label}
              </Text>
              
              {isFocused && <View style={styles.activeIndicator} />}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingBottom: Platform.OS === 'ios' ? SPACING.md : SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.medium,
  },
  
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  tabContent: {
    alignItems: 'center',
    position: 'relative',
  },
  
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
    backgroundColor: 'transparent',
  },
  
  iconContainerFocused: {
    backgroundColor: COLORS.primary + '20',
  },
  
  tabLabel: {
    ...TYPOGRAPHY.caption,
    fontWeight: '500',
    textAlign: 'center',
  },
  
  activeIndicator: {
    position: 'absolute',
    bottom: -SPACING.sm,
    width: 4,
    height: 4,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.primary,
  },
});

export default CustomTabBar; 