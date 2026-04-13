import React from 'react';
import { Modal, View, Text, ActivityIndicator } from 'react-native';
import { styles } from '../../styles/appStyles';

type LoadingOverlayProps = {
  visible: boolean;
  message?: string;
};

export function LoadingOverlay({ visible, message = 'Loading...' }: LoadingOverlayProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.loaderContainer}>
        <View style={styles.loaderCard}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loaderText}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
}
