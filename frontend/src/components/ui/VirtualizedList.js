import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../theme';
import { SkeletonLoader } from './LazyComponent';

const VirtualizedList = ({
  data = [],
  renderItem,
  keyExtractor,
  itemHeight = 80,
  windowHeight = 600,
  onEndReached,
  onRefresh,
  refreshing = false,
  loading = false,
  error = null,
  emptyMessage = 'No hay elementos para mostrar',
  errorMessage = 'Error al cargar los datos',
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
  style,
  contentContainerStyle,
  ...props
}) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const [scrollY, setScrollY] = useState(0);

  // Calcular elementos visibles basado en el scroll
  const visibleItems = useMemo(() => {
    const start = Math.floor(scrollY / itemHeight);
    const end = Math.min(
      start + Math.ceil(windowHeight / itemHeight) + 5,
      data.length
    );
    return data.slice(start, end);
  }, [data, scrollY, itemHeight, windowHeight]);

  // Manejar scroll para optimizar la renderización
  const handleScroll = useCallback((event) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    setScrollY(currentScrollY);
    
    // Actualizar rango visible solo si hay un cambio significativo
    const newStart = Math.floor(currentScrollY / itemHeight);
    const newEnd = Math.min(
      newStart + Math.ceil(windowHeight / itemHeight) + 5,
      data.length
    );
    
    if (newStart !== visibleRange.start || newEnd !== visibleRange.end) {
      setVisibleRange({ start: newStart, end: newEnd });
    }
  }, [visibleRange, itemHeight, windowHeight, data.length]);

  // Renderizar elemento con lazy loading
  const renderItemWithLazy = useCallback(({ item, index }) => {
    const isVisible = index >= visibleRange.start && index <= visibleRange.end;
    
    if (!isVisible) {
      return (
        <View style={[styles.placeholderItem, { height: itemHeight }]}>
          <SkeletonLoader width="100%" height={itemHeight - 10} />
        </View>
      );
    }

    return renderItem({ item, index });
  }, [renderItem, visibleRange, itemHeight]);

  // Componente de carga
  const LoadingFooter = () => {
    if (!loading) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando más elementos...</Text>
      </View>
    );
  };

  // Componente de error
  const ErrorComponent = () => {
    if (!error) return null;
    
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{errorMessage}</Text>
        <Text style={styles.errorSubtext}>Desliza hacia abajo para reintentar</Text>
      </View>
    );
  };

  // Componente vacío
  const EmptyComponent = () => {
    if (data.length > 0 || loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  };

  // Calcular altura total para el FlatList
  const getItemLayout = useCallback((data, index) => ({
    length: itemHeight,
    offset: itemHeight * index,
    index,
  }), [itemHeight]);

  // Optimizar la renderización con getItemLayout
  const optimizedProps = {
    getItemLayout,
    removeClippedSubviews: true,
    maxToRenderPerBatch: 10,
    windowSize: 10,
    initialNumToRender: 20,
    onEndReachedThreshold: 0.5,
    ...props,
  };

  return (
    <View style={[styles.container, style]}>
      <FlatList
        data={data}
        renderItem={renderItemWithLazy}
        keyExtractor={keyExtractor}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={
          <>
            {ListFooterComponent}
            <LoadingFooter />
          </>
        }
        ListEmptyComponent={
          <>
            <EmptyComponent />
            <ErrorComponent />
          </>
        }
        onEndReached={onEndReached}
        contentContainerStyle={[
          styles.contentContainer,
          contentContainerStyle,
        ]}
        {...optimizedProps}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  placeholderItem: {
    padding: SPACING.sm,
    marginHorizontal: SPACING.md,
  },
  loadingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  loadingText: {
    marginLeft: SPACING.sm,
    color: COLORS.text.secondary,
    fontSize: 14,
  },
  errorContainer: {
    alignItems: 'center',
    padding: SPACING.xl,
    marginHorizontal: SPACING.md,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  errorSubtext: {
    color: COLORS.text.secondary,
    fontSize: 14,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: SPACING.xl,
    marginHorizontal: SPACING.md,
  },
  emptyText: {
    color: COLORS.text.secondary,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default VirtualizedList; 