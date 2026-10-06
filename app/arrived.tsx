import { router } from 'expo-router';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DEMO_VENUE, seatTarget } from '../src/data/demoVenue';

export default function ArrivedScreen() {
  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.hero}>
        <Text style={styles.icon}>✓</Text>
        <Text style={styles.kicker}>YOU'VE ARRIVED</Text>
        <Text style={styles.title}>Seat {seatTarget.seat}</Text>
        <Text style={styles.location}>
          {DEMO_VENUE.name} · Section {seatTarget.section} · Row {seatTarget.row}
        </Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Done</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f7f8f5', padding: 24, justifyContent: 'space-between' },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 62 },
  kicker: { marginTop: 18, fontSize: 12, fontWeight: '900', letterSpacing: 1.5, opacity: 0.45 },
  title: { fontSize: 50, fontWeight: '900', marginTop: 8 },
  location: { marginTop: 8, textAlign: 'center', fontSize: 16, opacity: 0.6 },
  button: { backgroundColor: '#111', borderRadius: 16, padding: 17, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
