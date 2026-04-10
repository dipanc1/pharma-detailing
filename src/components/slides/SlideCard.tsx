import { memo, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { PanGestureHandler, GestureHandlerStateChangeNativeEvent } from 'react-native-gesture-handler';
import { Slide } from '../../types/models';
import { styles } from '../../styles/appStyles';

type SlideCardProps = {
  slide: Slide;
  index: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: (slideId: string) => void;
};

function SlideCardComponent({
  slide,
  index,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onRemove,
}: SlideCardProps) {
  const [isDragged, setIsDragged] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const handlePanEvent = (event: any) => {
    setDragOffset(event.nativeEvent.translationY);
  };

  const handlePanStateChange = (event: any) => {
    const { state } = event.nativeEvent;
    
    if (state === 2) { // ACTIVE - dragging
      setIsDragged(true);
    } else if (state === 5 || state === 3) { // END or CANCELLED
      setIsDragged(false);
      
      // Drag threshold: 30 pixels
      const threshold = 30;
      
      if (dragOffset < -threshold && canMoveUp) {
        onMoveUp();
      } else if (dragOffset > threshold && canMoveDown) {
        onMoveDown();
      }
      
      setDragOffset(0);
    }
  };

  return (
    <PanGestureHandler
      onGestureEvent={handlePanEvent}
      onHandlerStateChange={handlePanStateChange}
    >
      <View style={[
        styles.slideCard,
        isDragged && styles.slideCardDragged,
        isDragged && { transform: [{ translateY: dragOffset }] }
      ]}>
        <Image
          source={{ uri: slide.uri }}
          style={styles.slideImage}
          resizeMode="cover"
          resizeMethod="resize"
          fadeDuration={0}
        />
        <View style={styles.slideCardContent}>
          <Text style={styles.slideTitle}>Slide {index + 1}</Text>
          <Text style={styles.slideHint}>Drag to reorder • Use buttons below</Text>
          <View style={styles.slideButtonGroup}>
            <Pressable
              disabled={!canMoveUp}
              onPress={onMoveUp}
              style={[styles.slideControlBtn, !canMoveUp && { opacity: 0.5 }]}
            >
              <Text style={styles.slideControlBtnText}>↑</Text>
            </Pressable>
            <Pressable
              disabled={!canMoveDown}
              onPress={onMoveDown}
              style={[styles.slideControlBtn, !canMoveDown && { opacity: 0.5 }]}
            >
              <Text style={styles.slideControlBtnText}>↓</Text>
            </Pressable>
            <Pressable
              onPress={() => onRemove(slide.id)}
              style={styles.slideRemoveBtn}
            >
              <Text style={styles.slideRemoveBtnText}>✕</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </PanGestureHandler>
  );
}

export const SlideCard = memo(SlideCardComponent);
