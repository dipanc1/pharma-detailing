import { useEffect, useState } from 'react';
import { Platform, StatusBar as RNStatusBar } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';

export function useSlideshow() {
  const [isSlideshowMode, setIsSlideshowMode] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isSlideshowUiVisible, setIsSlideshowUiVisible] = useState(true);
  const [slideNotes, setSlideNotes] = useState<Record<string, string>>({});
  const canControlNavigationBar =
    Platform.OS === 'android' && typeof Platform.Version === 'number' && Platform.Version >= 29;

  useEffect(() => {
    const hideChrome = isSlideshowMode && !isSlideshowUiVisible;
    RNStatusBar.setHidden(hideChrome, 'fade');

    if (canControlNavigationBar) {
      NavigationBar.setVisibilityAsync(hideChrome ? 'hidden' : 'visible').catch(() => {});
    }

    return () => {
      RNStatusBar.setHidden(false, 'fade');
      if (canControlNavigationBar) {
        NavigationBar.setVisibilityAsync('visible').catch(() => {});
      }
    };
  }, [isSlideshowMode, isSlideshowUiVisible, canControlNavigationBar]);

  const openSlideshow = (startIndex = 0) => {
    setCurrentSlideIndex(startIndex);
    setIsSlideshowUiVisible(true);
    setIsSlideshowMode(true);
  };

  const closeSlideshow = () => setIsSlideshowMode(false);
  const toggleSlideshowUi = () => setIsSlideshowUiVisible((prev) => !prev);

  const onNoteChange = (slideId: string, value: string) => {
    setSlideNotes((prev) => ({
      ...prev,
      [slideId]: value,
    }));
  };

  return {
    isSlideshowMode,
    currentSlideIndex,
    setCurrentSlideIndex,
    isSlideshowUiVisible,
    setIsSlideshowUiVisible,
    slideNotes,
    setSlideNotes,
    openSlideshow,
    closeSlideshow,
    toggleSlideshowUi,
    onNoteChange,
  };
}
