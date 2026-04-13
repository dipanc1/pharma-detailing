import React from 'react';
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
                  ) : filteredDoctors.length > 5 ? (
                    <View style={styles.horizontalScrollerContainer}>
                      <FlatList
                        data={filteredDoctors}
                        keyExtractor={(item) => item.id}
                        horizontal
                        renderItem={({ item }) => (
                          <View style={styles.doctorCardHorizontal}>
                            <DoctorCard
                              doctor={item}
                              isActive={item.id === selectedDoctorId}
                              onSelect={setSelectedDoctorId}
                              onDelete={removeDoctor}
                            />
                          </View>
                        )}
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
                        renderItem={({ item }) => (
                          <DoctorCard
                            doctor={item}
                            isActive={item.id === selectedDoctorId}
                            onSelect={setSelectedDoctorId}
                            onDelete={removeDoctor}
                          />
                        )}
                        scrollEnabled={true}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                        nestedScrollEnabled={true}
                      />
                    </View>
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
                  ) : selectedDoctor.slides.length > 5 ? (
                    <View style={styles.horizontalScrollerContainer}>
                      <FlatList
                        data={selectedDoctor.slides}
                        keyExtractor={(item) => item.id}
                        horizontal
                        renderItem={({ item, index }) => (
                          <View style={styles.slideCardHorizontal}>
                            <SlideCard
                              slide={item}
                              index={index}
                              canMoveUp={index > 0}
                              canMoveDown={index < selectedDoctor.slides.length - 1}
                              onMoveUp={() => moveSlide(index, index - 1)}
                              onMoveDown={() => moveSlide(index, index + 1)}
                              onRemove={removeSlide}
                            />
                          </View>
                        )}
                        scrollEnabled={true}
                        showsHorizontalScrollIndicator={true}
                        snapToInterval={280}
                        decelerationRate="fast"
                      />
                    </View>
                  ) : (
                    <View style={styles.listContainer}>
                      <FlatList
                        data={selectedDoctor.slides}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item, index }) => (
                          <SlideCard
                            slide={item}
                            index={index}
                            canMoveUp={index > 0}
                            canMoveDown={index < selectedDoctor.slides.length - 1}
                            onMoveUp={() => moveSlide(index, index - 1)}
                            onMoveDown={() => moveSlide(index, index + 1)}
                            onRemove={removeSlide}
                          />
                        )}
                        scrollEnabled={true}
                        contentContainerStyle={styles.slidesList}
                        nestedScrollEnabled={true}
                      />
                    </View>
                  )}
                </View>
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
