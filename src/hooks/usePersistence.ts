import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { SLIDE_NOTES_KEY, STORAGE_KEY } from '../constants/storage';
import { Doctor } from '../types/models';

type UsePersistenceParams = {
  doctors: Doctor[];
  setDoctors: (value: Doctor[]) => void;
  setSelectedDoctorId: (value: string | null) => void;
  slideNotes: Record<string, string>;
  setSlideNotes: (value: Record<string, string>) => void;
};

export function usePersistence({
  doctors,
  setDoctors,
  setSelectedDoctorId,
  slideNotes,
  setSlideNotes,
}: UsePersistenceParams) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedDoctors = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedDoctors) {
          const parsedDoctors: Doctor[] = JSON.parse(savedDoctors);
          setDoctors(parsedDoctors);
          if (parsedDoctors.length > 0) {
            setSelectedDoctorId(parsedDoctors[0].id);
          }
        }

        const savedNotes = await AsyncStorage.getItem(SLIDE_NOTES_KEY);
        if (savedNotes) {
          const parsedNotes: Record<string, string> = JSON.parse(savedNotes);
          setSlideNotes(parsedNotes);
        }
      } catch {
        Alert.alert('Load Error', 'Unable to load saved app data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [setDoctors, setSelectedDoctorId, setSlideNotes]);

  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(doctors)).catch(() => {
        Alert.alert('Save Error', 'Unable to save doctor data.');
      });
    }
  }, [doctors, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem(SLIDE_NOTES_KEY, JSON.stringify(slideNotes)).catch(() => {
        Alert.alert('Save Error', 'Unable to save slide notes.');
      });
    }
  }, [slideNotes, isLoading]);

  return { isLoading };
}
