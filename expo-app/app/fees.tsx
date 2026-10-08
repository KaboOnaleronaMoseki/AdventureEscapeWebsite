import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Card, PageLayout, Section } from '@/components/SiteUI';
import { activities, accommodations, calculateBooking, formatRand } from '@/constants/booking';
import { colors, spacing } from '@/constants/theme';

function initialQuantities(items: { id: string }[]) {
  return items.reduce<Record<string, number>>((counts, item) => {
    counts[item.id] = 0;
    return counts;
  }, {});
}

export default function FeesScreen() {
  const [activityCounts, setActivityCounts] = useState(() => initialQuantities(activities));
  const [accommodationCounts, setAccommodationCounts] = useState(() =>
    initialQuantities(accommodations),
  );
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');

  const summary = useMemo(
    () => calculateBooking(activityCounts, accommodationCounts),
    [activityCounts, accommodationCounts],
  );

  function updateCount(
    setter: typeof setActivityCounts,
    current: Record<string, number>,
    id: string,
    change: number,
  ) {
    setter({ ...current, [id]: Math.max(0, (current[id] ?? 0) + change) });
    setMessage('');
  }

  function submitReservation() {
    if (!fullName.trim() || !email.trim() || !date.trim()) {
      setMessage('Please fill in your name, email, and preferred date.');
      return;
    }
    if (summary.totalActivities === 0 && summary.accommodationCount === 0) {
      setMessage('Please select at least one activity or accommodation.');
      return;
    }

    Alert.alert(
      'Reservation request received',
      `Thank you, ${fullName.trim()}! Your reservation request has been received.`,
    );
    setFullName('');
    setEmail('');
    setPhone('');
    setDate('');
    setNotes('');
    setActivityCounts(initialQuantities(activities));
    setAccommodationCounts(initialQuantities(accommodations));
    setMessage('');
  }

  return (
    <PageLayout
      eyebrow="Plan your escape"
      title="Calculate your fees"
      intro="Choose your adventures and accommodation to see your estimated total update instantly. Discounts apply automatically when you add multiple activities."
      image={require('../assets/site-images/hero-landscape.png')}
    >
      <Section eyebrow="Build your booking" title="Choose activities">
        {activities.map((item) => (
          <View key={item.id} style={styles.picker}>
            <View style={styles.pickerInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>{formatRand(item.price)} per person</Text>
            </View>
            <View style={styles.counter}>
              <Pressable
                onPress={() => updateCount(setActivityCounts, activityCounts, item.id, -1)}
                style={styles.counterButton}
                accessibilityLabel={`Remove one ${item.name}`}
              >
                <Text style={styles.counterSymbol}>−</Text>
              </Pressable>
              <Text style={styles.count}>{activityCounts[item.id]}</Text>
              <Pressable
                onPress={() => updateCount(setActivityCounts, activityCounts, item.id, 1)}
                style={styles.counterButton}
                accessibilityLabel={`Add one ${item.name}`}
              >
                <Text style={styles.counterSymbol}>+</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </Section>

      <Section eyebrow="Stay a little longer" title="Choose accommodation">
        {accommodations.map((item) => (
          <View key={item.id} style={styles.picker}>
            <View style={styles.pickerInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>
                {formatRand(item.price)} {item.unit}
              </Text>
            </View>
            <View style={styles.counter}>
              <Pressable
                onPress={() =>
                  updateCount(setAccommodationCounts, accommodationCounts, item.id, -1)
                }
                style={styles.counterButton}
                accessibilityLabel={`Remove one ${item.name}`}
              >
                <Text style={styles.counterSymbol}>−</Text>
              </Pressable>
              <Text style={styles.count}>{accommodationCounts[item.id]}</Text>
              <Pressable
                onPress={() =>
                  updateCount(setAccommodationCounts, accommodationCounts, item.id, 1)
                }
                style={styles.counterButton}
                accessibilityLabel={`Add one ${item.name}`}
              >
                <Text style={styles.counterSymbol}>+</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </Section>

      <Section eyebrow="Live estimate" title="Booking summary">
        <View style={styles.summary}>
          <SummaryRow label="Activities selected" value={`${summary.totalActivities}`} />
          <SummaryRow label="Activity subtotal" value={formatRand(summary.activitySubtotal)} />
          <SummaryRow
            label={`Multi-activity discount (${summary.discountPercent}%)`}
            value={`−${formatRand(summary.discountAmount)}`}
          />
          <SummaryRow label="Accommodation items" value={`${summary.accommodationCount}`} />
          <SummaryRow
            label="Accommodation subtotal"
            value={formatRand(summary.accommodationSubtotal)}
          />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Estimated total</Text>
            <Text style={styles.totalValue}>{formatRand(summary.total)}</Text>
          </View>
        </View>
      </Section>

      <Section eyebrow="One last step" title="Send a reservation request">
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          placeholder="Full name"
          placeholderTextColor={colors.muted}
          style={styles.input}
          autoComplete="name"
          accessibilityLabel="Full name"
        />
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email address"
          placeholderTextColor={colors.muted}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          accessibilityLabel="Email address"
        />
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone number (optional)"
          placeholderTextColor={colors.muted}
          style={styles.input}
          keyboardType="phone-pad"
          accessibilityLabel="Phone number (optional)"
        />
        <TextInput
          value={date}
          onChangeText={setDate}
          placeholder="Preferred date"
          placeholderTextColor={colors.muted}
          style={styles.input}
          accessibilityLabel="Preferred date"
        />
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Special requirements or notes (optional)"
          placeholderTextColor={colors.muted}
          style={[styles.input, styles.notesInput]}
          multiline
          textAlignVertical="top"
          accessibilityLabel="Special requirements or notes (optional)"
        />
        <Text style={styles.formNote}>
          The reservation acknowledgement is local to this app; it does not send or store booking
          details.
        </Text>
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <Pressable
          onPress={submitReservation}
          style={({ pressed }) => [styles.submit, pressed && styles.submitPressed]}
          accessibilityRole="button"
        >
          <Text style={styles.submitText}>Send reservation request</Text>
        </Pressable>
      </Section>

      <Section eyebrow="Included in your adventure" title="A well-supported experience">
        <Card
          title="Professional guides"
          body="Activities are led by experienced guides who provide orientation, instruction, and safety briefings."
          image={require('../assets/site-images/guide-team.png')}
        />
        <Card
          title="Quality equipment"
          body="Activity equipment is provided and checked so you can focus on the experience."
          image={require('../assets/site-images/Design2.png')}
        />
        <Card
          title="Full activity duration"
          body="Your selected experience includes the scheduled activity time with guide support."
          image={require('../assets/site-images/Design1.png')}
        />
      </Section>

      <Section eyebrow="Good to know" title="Booking and weather">
        <Card
          title="Payment"
          body="Invoice and payment instructions are sent by email after confirmation. Bank transfer, credit card, and mobile payments are accepted. A 20% deposit secures the booking; the balance is due 7 days before the activity."
        />
        <Card
          title="Cancellation"
          body="Full refund at least 14 days before; 50% refund 7–13 days before; cancellations within 6 days forfeit the booking. Free rescheduling is subject to availability."
        />
        <Card
          title="Weather policy"
          body="Severe weather means rescheduling at no extra cost or a full refund if the new date does not work. Activities may be adjusted for conditions."
        />
        <Card
          title="Groups"
          body="Special rates and flexible payment terms may apply for groups of 8 or more. Contact us for custom pricing and scheduling."
        />
        <Card
          title="Fitness"
          body="Basic fitness is required. Review each activity’s requirements and contact us about mobility or physical concerns and possible modifications."
        />
        <Card
          title="Important information"
          body="Participants must follow safety instructions. Activity video may be used for promotion, with an opt-out available. Insurance is recommended; booking acknowledges outdoor-adventure risks and terms."
        />
        <Card
          title="Have questions about pricing?"
          body="Contact our team if you need help choosing activities, accommodation, or a package for your group."
          action={{ label: 'Contact us', route: '/contact' }}
        />
      </Section>
    </PageLayout>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pickerInfo: { flex: 1 },
  itemName: { color: colors.text, fontSize: 14, fontWeight: '700' },
  itemPrice: { marginTop: 4, color: colors.muted, fontSize: 12 },
  counter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  counterButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundDark,
  },
  counterSymbol: { color: colors.accent, fontSize: 20, fontWeight: '700' },
  count: { minWidth: 18, color: colors.text, fontSize: 15, fontWeight: '800', textAlign: 'center' },
  summary: {
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  summaryLabel: { flex: 1, color: colors.muted, fontSize: 13 },
  summaryValue: { color: colors.text, fontSize: 13, fontWeight: '700' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
  },
  totalLabel: { color: colors.text, fontSize: 15, fontWeight: '800' },
  totalValue: { color: colors.accent, fontSize: 20, fontWeight: '900' },
  input: {
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    color: colors.text,
    backgroundColor: colors.backgroundDark,
    fontSize: 14,
  },
  notesInput: { minHeight: 96 },
  formNote: { marginBottom: spacing.sm, color: colors.muted, fontSize: 12, lineHeight: 18 },
  message: { marginVertical: spacing.sm, color: colors.accent, fontSize: 13, lineHeight: 20 },
  submit: {
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingVertical: 15,
    borderRadius: 999,
    backgroundColor: colors.accent,
  },
  submitPressed: { opacity: 0.82 },
  submitText: {
    color: colors.backgroundDark,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
