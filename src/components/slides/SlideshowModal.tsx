import React, { memo, useRef, useState } from 'react';
import { FlatList, Image, Modal, Pressable, Text, View, Animated } from 'react-native';
import { PinchGestureHandler, State } from 'react-native-gesture-handler';
import { Doctor } from '../../types/models';
import { styles } from '../../styles/appStyles';

type SlideshowModalProps = {
  visible: boolean;
  doctor: Doctor;
  screenWidth: number;
  currentSlideIndex: number;
  isUiVisible: boolean;
  onClose: () => void;
  onToggleUi: () => void;
  onSlideChange: (index: number) => void;
};

function SlideshowModalComponent({
  visible,
  doctor,
  screenWidth,
  currentSlideIndex,
  isUiVisible,
  onClose,
  onToggleUi,
  onSlideChange,
}: SlideshowModalProps) {
  const flatListRef = useRef<FlatList<Doctor['slides'][number]>>(null);
  const scaleRef = useRef(1);
  const lastScaleRef = useRef(1);
  const [zoom, setZoom] = useState(1);

  const onPinchGestureEvent = (e: any) => {
    const { scale } = e.nativeEvent;
    scaleRef.current = Math.max(1, Math.min(scale * lastScaleRef.current, 3));
    setZoom(scaleRef.current);
  };

  const onPinchHandlerStateChange = (e: any) => {
    if (e.nativeEvent.oldState === State.ACTIVE) {
      lastScaleRef.current = scaleRef.current;
    }
  };

  const onMomentumEnd = (event: any) => {
    const slideWidth = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
    const boundedIndex = Math.max(0, Math.min(doctor.slides.length - 1, index));
    onSlideChange(boundedIndex);
    scaleRef.current = 1;
    lastScaleRef.current = 1;
    setZoom(1);
  };

  React.useEffect(() => {
    if (!visible) {
      scaleRef.current = 1;
      lastScaleRef.current = 1;
      setZoom(1);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent={false} animationType="fade" statusBarTranslucent>
      <View style={styles.slideshowContainer}>
        {isUiVisible && (
          <Pressable style={styles.slideshowCloseBtn} onPress={onClose}>
            <Text style={styles.slideshowCloseBtnText}>x</Text>
          </Pressable>
        )}

        <FlatList
          ref={flatListRef}
          data={doctor.slides}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={true}
          initialScrollIndex={currentSlideIndex}
          initialNumToRender={1}
          maxToRenderPerBatch={1}
          windowSize={2}
          removeClippedSubviews
          scrollEventThrottle={16}
          getItemLayout={(_, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
          onScrollToIndexFailed={(info) => {
            setTimeout(() => {
              flatListRef.current?.scrollToIndex({
                index: Math.max(0, Math.min(info.index, doctor.slides.length - 1)),
                animated: false,
              });
            }, 50);
          }}
          onMomentumScrollEnd={onMomentumEnd}
          renderItem={({ item }) => (
            <View style={[styles.slidePage, { width: screenWidth, height: '100%' }]}>
              <PinchGestureHandler
                onGestureEvent={onPinchGestureEvent}
                onHandlerStateChange={onPinchHandlerStateChange}
              >
                <Pressable
                  onPress={onToggleUi}
                  style={{ flex: 1, width: '100%', height: '100%' }}
                  android_ripple={{ color: 'transparent' }}
                >
                  <Image
                    source={{ uri: item.uri }}
                    style={[styles.slideshowImage, { transform: [{ scale: zoom }] }]}
                    resizeMode="contain"
                    resizeMethod="resize"
                  />
                </Pressable>
              </PinchGestureHandler>
            </View>
          )}
        />

        {isUiVisible && (
          <View style={styles.slideshowFooter}>
            <Text style={styles.slideshowIndicatorText}>
              {currentSlideIndex + 1} / {doctor.slides.length}
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

export const SlideshowModal = memo(SlideshowModalComponent);
