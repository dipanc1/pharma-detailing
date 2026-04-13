import React from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  FlatList,
  SafeAreaView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DoctorFormModal, DoctorsPanel } from './src/components/doctors';
import { SlideshowModal, SlidesPanel } from './src/components/slides';
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
    moveSlide,
    isLoadingImages,
  } = useDoctors();

  const {
    isSlideshowMode,
    currentSlideIndex,
    setCurrentSlideIndex,
    isSlideshowUiVisible,
    slideNotes,
    setSlideNotes,
    slideRotations,
    setSlideRotations,
    openSlideshow,
    closeSlideshow,
    toggleSlideshowUi,
    onNoteChange,
    rotateSlide,
    resetRotation,
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
            showsVerticalScrollIndicator={true}
            scrollIndicatorInsets={{ right: 4 }}
            ListHeaderComponent={
              <View style={styles.screen}>
                <View style={styles.header}>
                  <Text style={styles.title}>DSMA Detailing</Text>
                  <Text style={styles.subtitle}>Organize your pharma visits</Text>
                </View>

                <DoctorsPanel
                  doctors={doctors}
                  filteredDoctors={filteredDoctors}
                  selectedDoctorId={selectedDoctorId}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onSelectDoctor={setSelectedDoctorId}
                  onDeleteDoctor={removeDoctor}
                  onAddDoctorPress={() => setIsDoctorModalVisible(true)}
                />

                <SlidesPanel
                  selectedDoctor={selectedDoctor}
                  onAddSlides={addSlidesFromGallery}
                  onShowSlideshow={() => openSlideshow(0)}
                  onRemoveSlide={removeSlide}
                  onMoveSlide={moveSlide}
                />
              </View>
            }
            ListFooterComponent={<View style={{ height: 20 }} />}
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
              slideRotations={slideRotations}
              onClose={closeSlideshow}
              onToggleUi={toggleSlideshowUi}
              onSlideChange={setCurrentSlideIndex}
              onNoteChange={onNoteChange}
              onRotateSlide={rotateSlide}
              onResetRotation={resetRotation}
            />
          )}
        </View>
        <LoadingOverlay visible={isLoadingImages} message="Adding images..." />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
