import { Modal, Pressable, Text, TextInput, View } from 'react-native';
import { styles } from '../../styles/appStyles';

type DoctorFormModalProps = {
  visible: boolean;
  doctorName: string;
  specialty: string;
  hospital: string;
  onChangeDoctorName: (value: string) => void;
  onChangeSpecialty: (value: string) => void;
  onChangeHospital: (value: string) => void;
  onCancel: () => void;
  onCreate: () => void;
};

export function DoctorFormModal({
  visible,
  doctorName,
  specialty,
  hospital,
  onChangeDoctorName,
  onChangeSpecialty,
  onChangeHospital,
  onCancel,
  onCreate,
}: DoctorFormModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Create Doctor</Text>
          <TextInput
            value={doctorName}
            onChangeText={onChangeDoctorName}
            placeholder="Doctor Name"
            placeholderTextColor="#64748b"
            style={styles.input}
          />
          <TextInput
            value={specialty}
            onChangeText={onChangeSpecialty}
            placeholder="Specialty (optional)"
            placeholderTextColor="#64748b"
            style={styles.input}
          />
          <TextInput
            value={hospital}
            onChangeText={onChangeHospital}
            placeholder="Hospital / Clinic (optional)"
            placeholderTextColor="#64748b"
            style={styles.input}
          />
          <View style={styles.modalActions}>
            <Pressable style={styles.modalSecondaryBtn} onPress={onCancel}>
              <Text style={styles.modalSecondaryText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.modalPrimaryBtn} onPress={onCreate}>
              <Text style={styles.modalPrimaryText}>Create</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
