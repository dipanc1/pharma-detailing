import { Alert } from 'react-native';
import { useCallback, useMemo, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Doctor, Slide } from '../types/models';
import { uid } from '../utils/id';

export function useDoctors() {
  const MAX_IMPORT_SLIDES = 8;

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [isDoctorModalVisible, setIsDoctorModalVisible] = useState(false);
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [hospital, setHospital] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  const selectedDoctor = useMemo(
    () => doctors.find((doc) => doc.id === selectedDoctorId) ?? null,
    [doctors, selectedDoctorId],
  );

  const filteredDoctors = useMemo(() => {
    if (!searchQuery.trim()) return doctors;
    const q = searchQuery.toLowerCase();
    return doctors.filter(
      (doc) =>
        doc.name.toLowerCase().includes(q) ||
        doc.specialty.toLowerCase().includes(q) ||
        doc.hospital.toLowerCase().includes(q),
    );
  }, [doctors, searchQuery]);

  const resetDoctorForm = useCallback(() => {
    setDoctorName('');
    setSpecialty('');
    setHospital('');
  }, []);

  const addDoctor = useCallback(() => {
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
  }, [doctorName, specialty, hospital, resetDoctorForm]);

  const removeDoctor = useCallback((doctorId: string) => {
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
              setSelectedDoctorId((current) =>
                current === doctorId ? (updated.length > 0 ? updated[0].id : null) : current,
              );
              return updated;
            });
          },
        },
      ],
    );
  }, []);

  const addSlidesFromGallery = useCallback(async () => {
    if (!selectedDoctor) {
      Alert.alert('Select Doctor', 'Choose a doctor first to add slides.');
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Needed', 'Gallery access is required to select visuals.');
      return;
    }

    setIsLoadingImages(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        allowsMultipleSelection: true,
        orderedSelection: true,
        quality: 0.5,
        selectionLimit: MAX_IMPORT_SLIDES,
      });

      if (result.canceled) {
        setIsLoadingImages(false);
        return;
      }

      if (!result.assets?.length) {
        setIsLoadingImages(false);
        return;
      }

      const selectedAssets = result.assets.slice(0, MAX_IMPORT_SLIDES);

      if (result.assets.length > MAX_IMPORT_SLIDES) {
        Alert.alert(
          'Slide Limit Applied',
          `Only the first ${MAX_IMPORT_SLIDES} images were added to keep performance stable on older phones.`,
        );
      }

      const newSlides: Slide[] = selectedAssets.map((asset) => ({
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
    } finally {
      setIsLoadingImages(false);
    }
  }, [selectedDoctor]);

  const removeSlide = useCallback((slideId: string) => {
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
  }, [selectedDoctor]);

  const reorderSlides = useCallback((slides: Slide[]) => {
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
  }, [selectedDoctor]);

  return {
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
  };
}
