import { StatusBar } from 'expo-status-bar';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DoctorCard, DoctorFormModal } from './src/components/doctors';
import { SlideCard, SlideshowModal } from './src/components/slides';
import { LoadingOverlay } from './src/components/common';
import { useDoctors, usePersistence, useSlideshow } from './src/hooks';
import { styles } from './src/styles/appStyles';

export default function App() {
  const {
    doctors,
    setDoctors,
    selectedDoctor,
    selectedDoctorId,
    setSelectedDoctorId,
    filteredDoctors,
    searchQuery,
    setSearchQuery,
    isDoctorModalVisible,
    setIsDoctorModalVisible,
    doctorName,
    setDoctorName,
    specialty,
    setSpecialty,
    hospital,
    setHospital,
    resetDoctorForm,
    addDoctor,
    removeDoctor,
    addSlidesFromGallery,
    removeSlide,
    reorderSlides,
    isLoadingImages,
  } = useDoctors();

  const {
    isSlideshowMode,
    currentSlideIndex,
    setCurrentSlideIndex,
    isSlideshowUiVisible,
    slideNotes,
    setSlideNotes,
    openSlideshow,
    closeSlideshow,
    toggleSlideshowUi,
    onNoteChange,
  } = useSlideshow();

  usePersistence({
    doctors,
    setDoctors,
    setSelectedDoctorId,
    slideNotes,
    setSlideNotes,
  });

  const { width: screenWidth } = useWindowDimensions();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" hidden={isSlideshowMode && !isSlideshowUiVisible} />
        <View style={styles.gradientBg}>
          <FlatList
            data={[{ id: 'page' }]}
            keyExtractor={(item) => item.id}
            renderItem={() => null}
            ListHeaderComponent={
              <View style={styles.screen}>
                <View style={styles.header}>
                  <Text style={styles.title}>DS Medical Agencies</Text>
                  <Text style={styles.subtitle}>Pharma Detailing Flow</Text>
                </View>

                <View style={styles.panel}>
                  <View style={styles.panelHeaderRow}>
                    <Text style={styles.panelTitle}>Doctors</Text>
                    <Pressable style={styles.primaryBtn} onPress={() => setIsDoctorModalVisible(true)}>
                      <Text style={styles.primaryBtnText}>+ Add Doctor</Text>
                    </Pressable>
                  </View>

                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
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
                  ) : (
                    <FlatList
                      data={filteredDoctors}
                      keyExtractor={(item) => item.id}
                      renderItem={({ item }) => (
                        <DoctorCard
                          doctor={item}
                          isActive={item.id === selectedDoctorId}
                          onSelect={setSelectedDoctorId}
                          onDelete={removeDoctor}
                        />
                      )}
                      scrollEnabled={false}
                      ItemSeparatorComponent={() => <View style={styles.separator} />}
                    />
                  )}
                </View>

                <View style={styles.panel}>
                  <View style={styles.panelHeaderRow}>
                    <View>
                      <Text style={styles.panelTitle}>Detail Slides</Text>
                      <Text style={styles.selectedDoctorInfo}>
                        {selectedDoctor
                          ? `Selected: ${selectedDoctor.name}`
                          : 'Select or create a doctor'}
                      </Text>
                    </View>
                    <View style={styles.actionButtonsGroup}>
                      <Pressable style={styles.secondaryBtn} onPress={addSlidesFromGallery}>
                        <Text style={styles.secondaryBtnText}>+ Gallery</Text>
                      </Pressable>
                      {selectedDoctor && selectedDoctor.slides.length > 0 && (
                        <Pressable
                          style={[styles.primaryBtn]}
                          onPress={() => openSlideshow(0)}
                        >
                          <Text style={styles.primaryBtnText}>Show</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>

                  {!selectedDoctor || selectedDoctor.slides.length === 0 ? (
                    <Text style={styles.emptyText}>
                      Add images and then drag to set your narrative order before the visit.
                    </Text>
                  ) : (
                    <DraggableFlatList
                      data={selectedDoctor.slides}
                      onDragEnd={({ data }) => reorderSlides(data)}
                      keyExtractor={(item) => item.id}
                      renderItem={(params) => <SlideCard params={params} onRemove={removeSlide} />}
                      scrollEnabled={false}
                      containerStyle={styles.slidesList}
                      activationDistance={8}
                    />
                  )}
                </View>
              </View>
            }
            ListFooterComponent={<View style={{ height: 20 }} />}
            scrollIndicatorInsets={{ right: 1 }}
          />

          <DoctorFormModal
            visible={isDoctorModalVisible}
            doctorName={doctorName}
            specialty={specialty}
            hospital={hospital}
            onChangeDoctorName={setDoctorName}
            onChangeSpecialty={setSpecialty}
            onChangeHospital={setHospital}
            onCancel={() => {
              setIsDoctorModalVisible(false);
              resetDoctorForm();
            }}
            onCreate={addDoctor}
          />

          {selectedDoctor && selectedDoctor.slides.length > 0 && (
            <SlideshowModal
              visible={isSlideshowMode}
              doctor={selectedDoctor}
              screenWidth={screenWidth}
              currentSlideIndex={currentSlideIndex}
              isUiVisible={isSlideshowUiVisible}
              slideNotes={slideNotes}
              onClose={closeSlideshow}
              onToggleUi={toggleSlideshowUi}
              onSlideChange={setCurrentSlideIndex}
              onNoteChange={onNoteChange}
            />
          )}
        </View>
        <LoadingOverlay visible={isLoadingImages} message="Adding images..." />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
