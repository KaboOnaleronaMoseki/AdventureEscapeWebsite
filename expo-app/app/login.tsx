import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ActionButton, BodyText, BulletList, PageLayout, Section } from '@/components/SiteUI';
import { colors, spacing } from '@/constants/theme';

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState('');

  return (
    <PageLayout
      eyebrow="Customer portal preview"
      title="Welcome back, adventurer"
      intro="Find your way back to your next great escape."
      image={require('../assets/site-images/team-campfire.png')}
    >
      <Section eyebrow="Customer portal preview" title="Sign in to your account">
        <BodyText>
          A future customer portal could help you review booking requests and keep your adventure
          details together.
        </BodyText>
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Demo only</Text>
          <Text style={styles.noticeText}>
            Sign-in is not connected to an account system. Do not enter a real password; this demo
            does not send or save credentials.
          </Text>
        </View>

        <Text style={styles.label}>Email address</Text>
        <TextInput
          style={styles.input}
          placeholder="Demo email address"
          placeholderTextColor="rgba(255,255,255,0.48)"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          accessibilityLabel="Email address"
          onChangeText={() => setNotice('')}
        />

        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Demo password"
            placeholderTextColor="rgba(255,255,255,0.48)"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
            accessibilityLabel="Password"
            onChangeText={() => setNotice('')}
          />
          <Pressable
            onPress={() => setShowPassword((visible) => !visible)}
            style={styles.visibilityButton}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            accessibilityState={{ selected: showPassword }}
          >
            <Text style={styles.visibilityLabel}>{showPassword ? 'Hide' : 'Show'}</Text>
          </Pressable>
        </View>

        <Pressable onPress={() => setNotice('For account access, contact our team.')} accessibilityRole="link">
          <Text style={styles.forgotLink}>Forgot password?</Text>
        </Pressable>

        <Pressable
          onPress={() =>
            setNotice(
              'This sign-in is a visual demo only. Your details were not sent or saved.',
            )
          }
          style={({ pressed }) => [styles.submitButton, pressed && styles.submitPressed]}
          accessibilityRole="button"
        >
          <Text style={styles.submitLabel}>Preview sign-in</Text>
        </Pressable>
        {notice ? (
          <Text style={styles.statusMessage} accessibilityLiveRegion="polite">
            {notice}
          </Text>
        ) : null}
        <Text style={styles.registerText}>Need an account? Contact our team to get started.</Text>
        <ActionButton label="Contact our team" route="/contact" />
      </Section>

      <Section eyebrow="Your adventure, all together" title="What a customer account could offer">
        <BulletList
          items={[
            'Review the status of your booking requests.',
            'Keep your activity and accommodation details handy.',
            'Contact our team if your plans change.',
          ]}
        />
        <BodyText>
          These portal features are ideas for a future version and are not available through this
          demo sign-in.
        </BodyText>
        <ActionButton label="Plan a booking" route="/fees" />
      </Section>
    </PageLayout>
  );
}

const styles = StyleSheet.create({
  notice: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: 'rgba(222,158,72,0.1)',
  },
  noticeTitle: { color: colors.accent, fontSize: 14, fontWeight: '900' },
  noticeText: { marginTop: spacing.xs, color: colors.text, fontSize: 13, lineHeight: 20 },
  label: {
    marginBottom: spacing.xs,
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  input: {
    minHeight: 48,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.backgroundDark,
    color: colors.text,
    fontSize: 15,
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  passwordInput: { flex: 1, marginBottom: 0 },
  visibilityButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    backgroundColor: colors.surfaceRaised,
  },
  visibilityLabel: { color: colors.accent, fontSize: 13, fontWeight: '800' },
  forgotLink: {
    alignSelf: 'flex-end',
    marginTop: spacing.sm,
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  submitButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginTop: spacing.md,
    borderRadius: 999,
    backgroundColor: colors.accent,
  },
  submitPressed: { opacity: 0.8 },
  submitLabel: {
    color: colors.backgroundDark,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  statusMessage: {
    marginTop: spacing.md,
    color: colors.accent,
    fontSize: 13,
    lineHeight: 20,
  },
  registerText: {
    marginTop: spacing.lg,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
});
