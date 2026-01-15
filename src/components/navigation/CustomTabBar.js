import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  const getIconName = (routeName) => {
    switch (routeName) {
      case 'Home':
        return '🏠';
      case 'Expedientes':
        return '📁';
      case 'Documentos':
        return '📄';
      case 'Usuarios':
        return '👥';
      case 'Auditoria':
        return '📊';
      default:
        return '❓';
    }
  };

  const getTabColor = (isFocused) => {
    return isFocused ? '#1976d2' : '#666';
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.title || route.name;
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
          >
            <Text style={[styles.icon, { color: getTabColor(isFocused) }]}>
              {getIconName(route.name)}
            </Text>
            <Text style={[styles.label, { color: getTabColor(isFocused) }]}>
              {label}
            </Text>
            {isFocused && <View style={styles.indicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    position: 'relative',
  },
  icon: {
    fontSize: 24,
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    marginLeft: -15,
    width: 30,
    height: 3,
    backgroundColor: '#1976d2',
    borderRadius: 2,
  },
});

export default CustomTabBar; 