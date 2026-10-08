import { ActionButton, BodyText, BulletList, Card, PageLayout, Section } from '@/components/SiteUI';
import { colors } from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';

const values = [
  {
    title: 'Our Mission',
    body: 'To provide professionally guided, eco-conscious outdoor adventures that inspire confidence, build community, and foster a lifelong appreciation for the natural beauty of the Western Cape.',
  },
  {
    title: 'Our Vision',
    body: 'To become a leading adventure tourism company in southern Africa, recognized for excellence in safety, environmental stewardship, and customer experience.',
  },
  {
    title: 'Safety First',
    body: 'Every decision prioritizes the wellbeing of our guests and guides through continuous investment in training, equipment inspection, and risk management.',
  },
  {
    title: 'Environmental Respect',
    body: 'We are committed to low-impact tourism that preserves the Western Cape’s unique fynbos, coastlines, and ecosystems.',
  },
  {
    title: 'Team Spirit',
    body: 'Experiences are designed to build confidence, communication, and lasting memories together.',
  },
  {
    title: 'Inclusive Adventures',
    body: 'Adventure is for everyone. Our experiences welcome participants of varying abilities and backgrounds, from beginners to experts.',
  },
];

export default function AboutScreen() {
  return (
    <PageLayout
      eyebrow="Our story"
      title="From passion to profession"
      intro="Meet the people and values behind Adventure Escape SA’s guided outdoor experiences in the Western Cape."
      image={require('../assets/site-images/team-campfire.png')}
    >
      <Section eyebrow="Our story" title="Outdoor adventures with purpose">
        <BodyText>
          Adventure Escape SA was founded in 2024 by Liam Daniels, an experienced outdoor guide
          with a deep love for the Western Cape’s natural landscapes. After years of guiding
          individuals and corporate groups, Liam set out to create a professional, sustainable
          adventure tourism company focused on safety, quality, and a genuine connection with
          nature.
        </BodyText>
        <BodyText>
          Starting with a small team of hand-selected guides, the company has grown intentionally,
          prioritising guide quality and customer satisfaction over rapid expansion.
        </BodyText>
      </Section>

      <Section eyebrow="Why we do this" title="Our mission and values">
        {values.map((value) => (
          <Card key={value.title} title={value.title} body={value.body} />
        ))}
      </Section>

      <Section eyebrow="Quick facts" title="Adventure Escape SA">
        <View style={styles.facts}>
          <Fact label="Founded" value="2024" />
          <Fact label="Professional guides" value="15+" />
          <Fact label="Activities offered" value="4 core adventures" />
          <Fact label="Operating region" value="Western Cape" />
          <Fact label="Guiding standards" value="FGASA & SAG" />
          <Fact label="Annual participants" value="500+" />
        </View>
      </Section>

      <Section eyebrow="Safety & expertise" title="We take safety seriously">
        <BodyText>
          Our guides undergo rigorous training, continuous professional development, and annual
          certifications to ensure every adventure meets high safety standards.
        </BodyText>
        <BulletList
          items={[
            'Certified, experienced guides with ongoing professional training.',
            'Equipment is regularly inspected, serviced, and certified.',
            'Risk assessments, activity briefings, and emergency protocols are reviewed and practiced.',
          ]}
        />
      </Section>
      <Section title="Ready to explore with us?">
        <Text style={styles.closingText}>
          Choose a guided activity or build a custom escape for your group.
        </Text>
        <ActionButton label="Explore activities" route="/activities" />
      </Section>
    </PageLayout>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Text style={styles.factValue}>{value}</Text>
      <Text style={styles.factLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  facts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  fact: {
    flexGrow: 1,
    flexBasis: '45%',
    minHeight: 92,
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  factValue: { color: colors.accent, fontSize: 22, fontWeight: '900' },
  factLabel: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  closingText: { color: colors.muted, fontSize: 15, lineHeight: 23 },
});
