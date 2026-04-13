import React, { useCallback, useMemo } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { Doctor } from '../../types/models';
import { styles } from '../../styles/appStyles';
import { SlideCard } from './SlideCard';

type SlidesPanelProps = {
  selectedDoctor: Doctor | null;
  onAddSlides: () => void;
  onShowSlideshow: () => void;
  onRemoveSlide: (slideId: string) => void;
  onMoveSlide: (fromIndex: number, toIndex: number) => void;
};

function SlidesPanelComponent({
  selectedDoctor,
  onAddSlides,
  onShowSlideshow,
  onRemoveSlide,
  onMoveSlide,
}: SlidesPanelProps) {
  const hasSlides = selectedDoctor && selectedDoctor.slides.length > 0;
  const useHorizontalLayout = hasSlides && selectedDoctor!.slides.length > 5;

  const renderSlideCard = useCallback(
    ({ item, index }: { item: any; index: number }) => (
      <SlideCard
        slide={item}
        index={index}
        canMoveUp={index > 0}
        canMoveDown={index < selectedDoctor!.slides.length - 1}
        onMoveUp={() => onMoveSlide(index, index - 1)}
        onMoveDown={() => onMoveSlide(index, index + 1)}
        onRemove={onRemoveSlide}
      />
    ),
    [selectedDoctor, onMoveSlide, onRemoveSlide],
  );

  const renderSlideCardHorizontal = useCallback(
    ({ item, index }: { item: any; index: number }) => (
      <View style={styles.slideCardHorizontal}>
        {renderSlideCard({ item, index })}
      </View>
    ),
    [renderSlideCard],
  );

  return (
    <View style={styles.panel}>
      <View style={styles.panelHeaderRow}>
        <View>
          <Text style={styles.panelTitle}>Detail Slides</Text>
          <Text style={styles.selectedDoctorInfo}>
            {selectedDoctor ? `Selected: ${selectedDoctor.name}` : 'Select or create a doctor'}
          </Text>
        </View>
        <View style={styles.actionButtonsGroup}>
          <Pressable style={styles.secondaryBtn} onPress={onAddSlides}>
            <Text style={styles.secondaryBtnText}>+ Gallery</Text>
          </Pressable>
          {hasSlides && (
            <Pressable style={[styles.primaryBtn]} onPress={onShowSlideshow}>
              <Text style={styles.primaryBtnText}>Show</Text>
            </Pressable>
          )}
        </View>
      </View>

      {!selectedDoctor || selectedDoctor.slides.length === 0 ? (
        <Text style={styles.emptyText}>
          Add images and then drag to set your narrative order before the visit.
        </Text>
      ) : useHorizontalLayout ? (
        <View style={styles.horizontalScrollerContainer}>
          <FlatList
            data={selectedDoctor.slides}
            keyExtractor={(item) => item.id}
            horizontal
            renderItem={renderSlideCardHorizontal}
            scrollEnabled={true}
            showsHorizontalScrollIndicator={true}
            snapToInterval={300}
            decelerationRate="fast"
          />
        </View>
      ) : (
        <View style={styles.listContainer}>
          <FlatList
            data={selectedDoctor.slides}
            keyExtractor={(item) => item.id}
            renderItem={renderSlideCard}
            scrollEnabled={true}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            nestedScrollEnabled={true}
          />
        </View>
      )}
    </View>
  );
}

export const SlidesPanel = React.memo(SlidesPanelComponent);
