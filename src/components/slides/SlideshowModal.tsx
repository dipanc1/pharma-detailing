import React, { memo, useRef, useState } from 'react';
import { FlatList, Image, Modal, Pressable, Text, TextInput, View } from 'react-native';
import { Doctor } from '../../types/models';
import { styles } from '../../styles/appStyles';

type SlideshowModalProps = {
  visible: boolean;
  doctor: Doctor;
  screenWidth: number;
  currentSlideIndex: number;
  isUiVisible: boolean;
  slideNotes: Record<string, string>;
  slideRotations: Record<string, number>;
  onClose: () => void;
  onToggleUi: () => void;
  onSlideChange: (index: number) => void;
  onNoteChange: (slideId: string, value: string) => void;
  onRotateSlide: (slideId: string) => void;
  onResetRotation: (slideId: string) => void;
};

function SlideshowModalComponent({
  visible,
  doctor,
  screenWidth,
  currentSlideIndex,
  isUiVisible,
  slideNotes,
  slideRotations,
  onClose,
  onToggleUi,
  onSlideChange,
  onNoteChange,
  onRotateSlide,
  onResetRotation,
}: SlideshowModalProps) {
  const flatListRef = useRef<FlatList<Doctor['slides'][number]>>(null);
  const [zoom, setZoom] = useState(1);
  const [resizeMode, setResizeMode] = useState<'contain' | 'cover'>('contain');

  const onMomentumEnd = (event: any) => {
    const slideWidth = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
    const boundedIndex = Math.max(0, Math.min(doctor.slides.length - 1, index));
    onSlideChange(boundedIndex);
    setZoom(1);
    setResizeMode('contain');
  };

  const activeSlide = doctor.slides[currentSlideIndex];

  React.useEffect(() => {
    if (!visible) {
      setZoom(1);
      setResizeMode('contain');
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
          onScrollBeginDrag={() => setZoom(1)}
          renderItem={({ item }) => (
            <View style={[styles.slidePage, { width: screenWidth, height: '100%' }]}>
              <Pressable
                onPress={onToggleUi}
                style={{ flex: 1, width: '100%', height: '100%' }}
                android_ripple={{ color: 'transparent' }}
              >
                <Image
                  source={{ uri: item.uri }}
                  style={[styles.slideshowImage, { transform: [{ rotate: `${slideRotations[item.id] ?? 0}deg` }, { scale: zoom }] }]}
                  resizeMode={resizeMode}
                  resizeMethod="resize"
                  fadeDuration={0}
                />
              </Pressable>
            </View>
          )}
        />

        {isUiVisible && (
          <View style={styles.slideshowFooter}>
            <View style={styles.slideshowControlsRow}>
              <Text style={styles.slideshowIndicatorText}>
                {currentSlideIndex + 1} / {doctor.slides.length}
              </Text>
              {activeSlide && (
                <View style={styles.rotateButtonsGroup}>
                  <Pressable
                    onPress={() => onRotateSlide(activeSlide.id)}
                    style={styles.rotateBtn}
                  >
                    <Text style={styles.rotateBtnText}>↻</Text>
                  </Pressable>
                  {(slideRotations[activeSlide.id] ?? 0) !== 0 && (
                    <Pressable
                      onPress={() => onResetRotation(activeSlide.id)}
                      style={[styles.rotateBtn, styles.resetBtn]}
                    >
                      <Text style={styles.resetBtnText}>Reset</Text>
                    </Pressable>
                  )}
                  <Pressable
                    onPress={() => setZoom(Math.min(zoom + 0.3, 3))}
                    style={styles.rotateBtn}
                  >
                    <Text style={styles.rotateBtnText}>+</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setZoom(Math.max(zoom - 0.3, 1))}
                    style={styles.rotateBtn}
                  >
                    <Text style={styles.rotateBtnText}>−</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setResizeMode(resizeMode === 'contain' ? 'cover' : 'contain')}
                    style={styles.rotateBtn}
                  >
                    <Text style={styles.rotateBtnText}>{resizeMode === 'contain' ? '⛶' : '□'}</Text>
                  </Pressable>
                </View>
              )}
            </View>
            <Text style={styles.swipeHintText}>Swipe left/right • Rotate and note slides</Text>
            <TextInput
              value={activeSlide ? slideNotes[activeSlide.id] ?? '' : ''}
              onChangeText={(value) => {
                if (!activeSlide) return;
                onNoteChange(activeSlide.id, value);
              }}
              placeholder="Write note for this slide..."
              placeholderTextColor="#a0aec0"
              style={styles.slideNoteInput}
            />
          </View>
        )}
      </View>
    </Modal>
  );
}

export const SlideshowModal = memo(SlideshowModalComponent);
