import { memo } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
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

  return (
    <View style={styles.slideCard}>
        <Image
          source={{ uri: slide.uri }}
          style={styles.slideImage}
          resizeMode="cover"
          resizeMethod="resize"
          fadeDuration={0}
        />
        <View style={styles.slideCardContent}>
          <Text style={styles.slideTitle}>Slide {index + 1}</Text>
          <Text style={styles.slideHint}>Use arrows to set presentation order</Text>
          <View style={{ flexDirection: 'row', marginTop: 8 }}>
            <Pressable
              disabled={!canMoveUp}
              onPress={onMoveUp}
              style={[styles.secondaryBtn, { marginRight: 8 }, !canMoveUp && { opacity: 0.5 }]}
            >
              <Text style={styles.secondaryBtnText}>Up</Text>
            </Pressable>
            <Pressable
              disabled={!canMoveDown}
              onPress={onMoveDown}
              style={[styles.secondaryBtn, !canMoveDown && { opacity: 0.5 }]}
            >
              <Text style={styles.secondaryBtnText}>Down</Text>
            </Pressable>
          </View>
          <Pressable onPress={() => onRemove(slide.id)} style={styles.removeSlideButton}>
            <Text style={styles.removeSlideText}>Remove</Text>
          </Pressable>
        </View>
      </View>
  );
}

export const SlideCard = memo(SlideCardComponent);
