import React, { useCallback, useMemo } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { Doctor } from '../../types/models';
import { styles } from '../../styles/appStyles';
import { DoctorCard } from './DoctorCard';

type DoctorsPanelProps = {
  doctors: Doctor[];
  filteredDoctors: Doctor[];
  selectedDoctorId: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectDoctor: (doctorId: string) => void;
  onDeleteDoctor: (doctorId: string) => void;
  onAddDoctorPress: () => void;
};

function DoctorsPanelComponent({
  doctors,
  filteredDoctors,
  selectedDoctorId,
  searchQuery,
  onSearchChange,
  onSelectDoctor,
  onDeleteDoctor,
  onAddDoctorPress,
}: DoctorsPanelProps) {
  const useHorizontalLayout = filteredDoctors.length > 5;

  const renderDoctorCard = useCallback(
    ({ item }: { item: Doctor }) => (
      <DoctorCard
        doctor={item}
        isActive={item.id === selectedDoctorId}
        onSelect={onSelectDoctor}
        onDelete={onDeleteDoctor}
      />
    ),
    [selectedDoctorId, onSelectDoctor, onDeleteDoctor],
  );

  const renderDoctorCardHorizontal = useCallback(
    ({ item }: { item: Doctor }) => (
      <View style={styles.doctorCardHorizontal}>
        {renderDoctorCard({ item })}
      </View>
    ),
    [renderDoctorCard],
  );

  return (
    <View style={styles.panel}>
      <View style={styles.panelHeaderRow}>
        <Text style={styles.panelTitle}>Doctors</Text>
        <Pressable style={styles.primaryBtn} onPress={onAddDoctorPress}>
          <Text style={styles.primaryBtnText}>+ Add Doctor</Text>
        </Pressable>
      </View>

      <TextInput
        value={searchQuery}
        onChangeText={onSearchChange}
        placeholder="Search by name, specialty, or hospital..."
        placeholderTextColor="#d1d5db"
        style={styles.searchInput}
      />

      {doctors.length === 0 ? (
        <Text style={styles.emptyText}>
          No doctors added yet. Create your first doctor to begin detailing.
        </Text>
      ) : filteredDoctors.length === 0 ? (
        <Text style={styles.emptyText}>No doctors match your search.</Text>
      ) : useHorizontalLayout ? (
        <View style={styles.horizontalScrollerContainer}>
          <FlatList
            data={filteredDoctors}
            keyExtractor={(item) => item.id}
            horizontal
            renderItem={renderDoctorCardHorizontal}
            scrollEnabled={true}
            showsHorizontalScrollIndicator={true}
            snapToInterval={340}
            decelerationRate="fast"
          />
        </View>
      ) : (
        <View style={styles.listContainer}>
          <FlatList
            data={filteredDoctors}
            keyExtractor={(item) => item.id}
            renderItem={renderDoctorCard}
            scrollEnabled={true}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            nestedScrollEnabled={true}
          />
        </View>
      )}
    </View>
  );
}

export const DoctorsPanel = React.memo(DoctorsPanelComponent);
