import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
} from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';

type Slide = {
  id: string;
  uri: string;
};

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  slides: Slide[];
};

const STORAGE_KEY = 'dsma_doctors_v1';

const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [isDoctorModalVisible, setIsDoctorModalVisible] = useState(false);
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [hospital, setHospital] = useState('');

  const selectedDoctor = useMemo(
    () => doctors.find((doc) => doc.id === selectedDoctorId) ?? null,
    [doctors, selectedDoctorId],
  );

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed: Doctor[] = JSON.parse(saved);
          setDoctors(parsed);
          if (parsed.length > 0) {
            setSelectedDoctorId(parsed[0].id);
          }
        }
      } catch {
        Alert.alert('Load Error', 'Unable to load saved doctor data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDoctors();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(doctors)).catch(() => {
        Alert.alert('Save Error', 'Unable to save the latest changes.');
      });
    }
  }, [doctors, isLoading]);

  const resetDoctorForm = () => {
    setDoctorName('');
    setSpecialty('');
    setHospital('');
  };

  const addDoctor = () => {
    if (!doctorName.trim()) {
      Alert.alert('Doctor Name Required', 'Please enter the doctor name.');
      return;
    }

    const newDoctor: Doctor = {
      id: uid(),
      name: doctorName.trim(),
      specialty: specialty.trim() || 'General Practitioner',
      hospital: hospital.trim() || 'Independent Practice',
      slides: [],
    };

    setDoctors((prev) => [newDoctor, ...prev]);
    setSelectedDoctorId(newDoctor.id);
    setIsDoctorModalVisible(false);
    resetDoctorForm();
  };

  const removeDoctor = (doctorId: string) => {
    Alert.alert(
      'Delete Doctor',
      'This will remove the doctor and all selected detail slides. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setDoctors((prev) => {
              const updated = prev.filter((doc) => doc.id !== doctorId);
              if (selectedDoctorId === doctorId) {
                setSelectedDoctorId(updated.length > 0 ? updated[0].id : null);
              }
              return updated;
            });
          },
        },
      ],
    );
  };

  const addSlidesFromGallery = async () => {
    if (!selectedDoctor) {
      Alert.alert('Select Doctor', 'Choose a doctor first to add slides.');
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Needed', 'Gallery access is required to select visuals.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      allowsMultipleSelection: true,
      orderedSelection: true,
      quality: 0.85,
      selectionLimit: 20,
    });

    if (result.canceled) {
      return;
    }

    const newSlides: Slide[] = result.assets.map((asset) => ({
      id: uid(),
      uri: asset.uri,
    }));

    setDoctors((prev) =>
      prev.map((doc) =>
        doc.id === selectedDoctor.id
          ? {
              ...doc,
              slides: [...doc.slides, ...newSlides],
            }
          : doc,
      ),
    );
  };

  const removeSlide = (slideId: string) => {
    if (!selectedDoctor) {
      return;
    }
    setDoctors((prev) =>
      prev.map((doc) =>
        doc.id === selectedDoctor.id
          ? {
              ...doc,
              slides: doc.slides.filter((slide) => slide.id !== slideId),
            }
          : doc,
      ),
    );
  };

  const reorderSlides = (slides: Slide[]) => {
    if (!selectedDoctor) {
      return;
    }
    setDoctors((prev) =>
      prev.map((doc) =>
        doc.id === selectedDoctor.id
          ? {
              ...doc,
              slides,
            }
          : doc,
      ),
    );
  };

  const renderDoctorCard = ({ item }: { item: Doctor }) => {
    const isActive = item.id === selectedDoctorId;
    return (
      <Pressable
        onPress={() => setSelectedDoctorId(item.id)}
        style={[styles.doctorCard, isActive && styles.activeDoctorCard]}
      >
        <View>
          <Text style={styles.doctorName}>{item.name}</Text>
          <Text style={styles.doctorMeta}>{item.specialty}</Text>
          <Text style={styles.doctorMeta}>{item.hospital}</Text>
        </View>
        <View style={styles.doctorCardActions}>
          <Text style={styles.slideCount}>{item.slides.length} slides</Text>
          <Pressable onPress={() => removeDoctor(item.id)}>
            <Text style={styles.deleteText}>Delete</Text>
          </Pressable>
        </View>
      </Pressable>
    );
  };

  const renderSlideCard = ({
    item,
    drag,
    isActive,
    getIndex,
  }: RenderItemParams<Slide>) => {
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
            <Pressable onPress={() => removeSlide(item.id)} style={styles.removeSlideButton}>
              <Text style={styles.removeSlideText}>Remove</Text>
            </Pressable>
          </View>
        </Pressable>
      </ScaleDecorator>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <LinearGradient colors={['#09203f', '#1f4e79', '#4b86b4']} style={styles.gradientBg}>
        <ScrollView contentContainerStyle={styles.screen}>
          <View style={styles.header}>
            <Text style={styles.title}>DS Medical Agencies</Text>
            <Text style={styles.subtitle}>Pharma Detailing Flow</Text>
          </View>

          <View style={styles.panel}>
            <View style={styles.panelHeaderRow}>
              <Text style={styles.panelTitle}>Doctors</Text>
              <Pressable
                style={styles.primaryBtn}
                onPress={() => setIsDoctorModalVisible(true)}
              >
                <Text style={styles.primaryBtnText}>+ Add Doctor</Text>
              </Pressable>
            </View>

            {doctors.length === 0 ? (
              <Text style={styles.emptyText}>
                No doctors added yet. Create your first doctor to begin detailing.
              </Text>
            ) : (
              <FlatList
                data={doctors}
                keyExtractor={(item) => item.id}
                renderItem={renderDoctorCard}
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
              <Pressable style={styles.secondaryBtn} onPress={addSlidesFromGallery}>
                <Text style={styles.secondaryBtnText}>Add From Gallery</Text>
              </Pressable>
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
                renderItem={renderSlideCard}
                scrollEnabled={false}
                containerStyle={styles.slidesList}
                activationDistance={8}
              />
            )}
          </View>
        </ScrollView>

        <Modal visible={isDoctorModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Create Doctor</Text>
              <TextInput
                value={doctorName}
                onChangeText={setDoctorName}
                placeholder="Doctor Name"
                placeholderTextColor="#64748b"
                style={styles.input}
              />
              <TextInput
                value={specialty}
                onChangeText={setSpecialty}
                placeholder="Specialty (optional)"
                placeholderTextColor="#64748b"
                style={styles.input}
              />
              <TextInput
                value={hospital}
                onChangeText={setHospital}
                placeholder="Hospital / Clinic (optional)"
                placeholderTextColor="#64748b"
                style={styles.input}
              />
              <View style={styles.modalActions}>
                <Pressable
                  style={styles.modalSecondaryBtn}
                  onPress={() => {
                    setIsDoctorModalVisible(false);
                    resetDoctorForm();
                  }}
                >
                  <Text style={styles.modalSecondaryText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.modalPrimaryBtn} onPress={addDoctor}>
                  <Text style={styles.modalPrimaryText}>Create</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#082032',
  },
  gradientBg: {
    flex: 1,
  },
  screen: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 16,
    paddingBottom: 36,
  },
  header: {
    marginTop: 8,
  },
  title: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  subtitle: {
    color: '#dbeafe',
    marginTop: 4,
    fontSize: 14,
  },
  panel: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  panelHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  primaryBtn: {
    backgroundColor: '#0f766e',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  primaryBtnText: {
    color: '#f0fdfa',
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: '#1d4ed8',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  secondaryBtnText: {
    color: '#eff6ff',
    fontWeight: '700',
    fontSize: 12,
  },
  emptyText: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
  },
  doctorCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
    padding: 12,
    gap: 10,
  },
  activeDoctorCard: {
    borderColor: '#0ea5e9',
    backgroundColor: '#e0f2fe',
  },
  doctorCardActions: {
    alignItems: 'flex-end',
    gap: 6,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  doctorMeta: {
    color: '#334155',
    fontSize: 12,
  },
  slideCount: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteText: {
    color: '#be123c',
    fontWeight: '700',
  },
  separator: {
    height: 10,
  },
  selectedDoctorInfo: {
    color: '#334155',
    marginTop: 2,
    maxWidth: 170,
  },
  slidesList: {
    gap: 10,
  },
  slideCard: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    backgroundColor: '#f8fafc',
    overflow: 'hidden',
  },
  slideCardActive: {
    opacity: 0.86,
  },
  slideImage: {
    width: 94,
    height: 94,
    backgroundColor: '#e2e8f0',
  },
  slideCardContent: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  slideTitle: {
    color: '#0f172a',
    fontWeight: '800',
    fontSize: 16,
  },
  slideHint: {
    color: '#475569',
    fontSize: 12,
  },
  removeSlideButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#fee2e2',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  removeSlideText: {
    color: '#9f1239',
    fontWeight: '700',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.58)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 4,
  },
  modalSecondaryBtn: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  modalSecondaryText: {
    color: '#334155',
    fontWeight: '700',
  },
  modalPrimaryBtn: {
    backgroundColor: '#0f766e',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  modalPrimaryText: {
    color: '#f0fdfa',
    fontWeight: '800',
  },
});
