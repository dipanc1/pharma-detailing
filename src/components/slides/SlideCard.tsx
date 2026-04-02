import { Image, Pressable, Text, View } from 'react-native';
import { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { Slide } from '../../types/models';
import { styles } from '../../styles/appStyles';

type SlideCardProps = {
  params: RenderItemParams<Slide>;
  onRemove: (slideId: string) => void;
};

export function SlideCard({ params, onRemove }: SlideCardProps) {
  const { item, drag, isActive, getIndex } = params;
  const index = getIndex() ?? 0;

  return (
    <ScaleDecorator>
      <Pressable
        onLongPress={drag}
        delayLongPress={180}
        style={[styles.slideCard, isActive && styles.slideCardActive]}
      >
        <Image source={{ uri: item.uri }} style={styles.slideImage} resizeMode="cover" />
        <View style={styles.slideCardContent}>
          <Text style={styles.slideTitle}>Slide {index + 1}</Text>
          <Text style={styles.slideHint}>Long press and drag to reorder</Text>
          <Pressable onPress={() => onRemove(item.id)} style={styles.removeSlideButton}>
            <Text style={styles.removeSlideText}>Remove</Text>
          </Pressable>
        </View>
      </Pressable>
    </ScaleDecorator>
  );
}
