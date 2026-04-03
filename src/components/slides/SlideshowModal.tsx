import { memo, useRef } from 'react';
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
  onClose: () => void;
  onToggleUi: () => void;
  onSlideChange: (index: number) => void;
  onNoteChange: (slideId: string, value: string) => void;
};

function SlideshowModalComponent({
  visible,
  doctor,
  screenWidth,
  currentSlideIndex,
  isUiVisible,
  slideNotes,
  onClose,
  onToggleUi,
  onSlideChange,
  onNoteChange,
}: SlideshowModalProps) {
  const flatListRef = useRef<FlatList<Doctor['slides'][number]>>(null);

  const onMomentumEnd = (event: any) => {
    const slideWidth = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
    const boundedIndex = Math.max(0, Math.min(doctor.slides.length - 1, index));
    onSlideChange(boundedIndex);
  };

  const activeSlide = doctor.slides[currentSlideIndex];

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
            <Pressable style={[styles.slidePage, { width: screenWidth }]} onPress={onToggleUi}>
              <Image
                source={{ uri: item.uri }}
                style={styles.slideshowImage}
                resizeMode="contain"
                resizeMethod="resize"
                fadeDuration={0}
              />
            </Pressable>
          )}
        />

        {isUiVisible && (
          <View style={styles.slideshowFooter}>
            <Text style={styles.slideshowIndicatorText}>
              {currentSlideIndex + 1} / {doctor.slides.length}
            </Text>
            <Text style={styles.swipeHintText}>Swipe left/right</Text>
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
