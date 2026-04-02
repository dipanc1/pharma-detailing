import { Alert } from 'react-native';
import { useMemo, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Doctor, Slide } from '../types/models';
import { uid } from '../utils/id';

export function useDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [isDoctorModalVisible, setIsDoctorModalVisible] = useState(false);
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [hospital, setHospital] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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
  };
}
