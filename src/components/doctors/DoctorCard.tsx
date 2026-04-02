import { Pressable, Text, View } from 'react-native';
import { Doctor } from '../../types/models';
import { styles } from '../../styles/appStyles';

type DoctorCardProps = {
  doctor: Doctor;
  isActive: boolean;
  onSelect: (doctorId: string) => void;
  onDelete: (doctorId: string) => void;
};

export function DoctorCard({ doctor, isActive, onSelect, onDelete }: DoctorCardProps) {
  return (
    <Pressable
      onPress={() => onSelect(doctor.id)}
      style={[styles.doctorCard, isActive && styles.activeDoctorCard]}
    >
      <View>
        <Text style={styles.doctorName}>{doctor.name}</Text>
        <Text style={styles.doctorMeta}>{doctor.specialty}</Text>
        <Text style={styles.doctorMeta}>{doctor.hospital}</Text>
      </View>
      <View style={styles.doctorCardActions}>
        <Text style={styles.slideCount}>{doctor.slides.length} slides</Text>
        <Pressable onPress={() => onDelete(doctor.id)}>
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}
