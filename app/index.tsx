import { router } from 'expo-router';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DEMO_VENUE, seatTarget } from '../src/data/demoVenue';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.page}>
      <View>
        <Text style={styles.brand}>GoAR</Text>
        <Text style={styles.hero}>Find your exact seat.</Text>
        <Text style={styles.copy}>
          OpenStreetMap gets you to the venue. GoAR checkpoint localization and AR guidance take you to the physical seat.
        </Text>
      </View>

      <View style={styles.ticket}>
        <Text style={styles.kicker}>DEMO EVENT</Text>
        <Text style={styles.venue}>{DEMO_VENUE.name}</Text>
        <View style={styles.row}>
          <View><Text style={styles.meta}>SECTION</Text><Text style={styles.value}>{seatTarget.section}</Text></View>
          <View><Text style={styles.meta}>ROW</Text><Text style={styles.value}>{seatTarget.row}</Text></View>
          <View><Text style={styles.meta}>SEAT</Text><Text style={styles.value}>{seatTarget.seat}</Text></View>
        </View>
        <TouchableOpacity style={styles.primary} onPress={() => router.push('/checkpoint')}>
          <Text style={styles.primaryText}>Find my seat</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f7f8f5', padding: 24, justifyContent: 'space-between' },
  brand: { fontWeight: '900', fontSize: 18, marginTop: 6 },
  hero: { fontWeight: '900', fontSize: 46, lineHeight: 49, marginTop: 42 },
  copy: { opacity: .58, fontSize: 16, lineHeight: 23, marginTop: 14 },
  ticket: { backgroundColor: '#fff', borderRadius: 26, padding: 22, marginBottom: 16 },
  kicker: { opacity: .42, fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
  venue: { fontSize: 25, fontWeight: '900', marginTop: 7 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 28 },
  meta: { opacity: .42, fontSize: 9, fontWeight: '900' },
  value: { fontWeight: '900', fontSize: 26, marginTop: 4 },
  primary: { backgroundColor: '#111', borderRadius: 16, padding: 17, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
