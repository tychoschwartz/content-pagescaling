// Slide content for the 5 Pagescaling Instagram posts.
// One deliverable per prompt. Text is verbatim from the briefs.

export const posts = [
  {
    id: 'post1',
    slug: 'flagship-carousel',
    kicker: 'The engine',
    slides: [
      { type: 'hook',      eyebrow: 'The engine · 01—04', title: 'How a page goes from <b>handed-over</b> to <b>growing.</b>', sub: 'Four steps. Then we run the engine.' },
      { type: 'step', num: '01', label: 'Kickoff & audit',        body: 'A short call to read your page or niche, lock the goals, and set up Discord + Drive.' },
      { type: 'step', num: '02', label: 'Strategy & content plan', body: 'We build the angle, the hooks and formats, and a posting calendar for your niche.' },
      { type: 'step', num: '03', label: 'Daily posting',          body: 'Posted every day. We ride trending audio while it’s hot and test several hooks per idea.' },
      { type: 'step', num: '04', label: 'Track & double down',    body: 'A weekly Social Blade report. We kill what underperforms and scale what spikes.' },
      { type: 'statement', eyebrow: 'The whole loop', title: 'That’s the whole engine. <b>No guessing, no vibes</b> — a loop that compounds.' },
      { type: 'cta', eyebrow: 'Your move', title: 'Want this run on <b>your page?</b>', cta: 'Free teardown in bio' },
    ],
  },
  {
    id: 'post2',
    slug: 'reframe-single',
    kicker: 'Reframe',
    slides: [
      { type: 'reframe', lines: ['Growth isn’t luck.', 'It’s a <b>system</b> you can', 'run again.'], foot: '@pagescaling — done-for-you page management.' },
    ],
  },
  {
    id: 'post3',
    slug: 'audit-carousel',
    kicker: 'The audit',
    slides: [
      { type: 'hook',  eyebrow: 'Step 01 · The audit', title: 'Before we post anything, <b>we read the page.</b>', sub: 'Step 01 — the audit.' },
      { type: 'point', num: '·', body: 'We look at what’s actually pulling — <b>hooks, formats, the audio that hit</b> — and what’s dead weight.' },
      { type: 'point', num: '·', body: 'We check the growth curve on <b>Social Blade.</b> Flat or declining tells us where the leak is.' },
      { type: 'point', num: '·', body: 'Then we lock the goals and set up <b>Discord + Drive</b> so nothing lives in DMs.' },
      { type: 'cta', eyebrow: 'The difference', title: 'Most pages skip this and post on vibes. <b>We don’t.</b>', cta: 'Free teardown in bio' },
    ],
  },
  {
    id: 'post4',
    slug: 'weekly-loop-single',
    kicker: 'The weekly loop',
    slides: [
      { type: 'loop', top: 'Every week:', items: ['Pull the Social Blade report', 'Kill what underperforms', 'Scale what spikes'], repeat: 'Repeat. That’s the <b>compounding.</b>', foot: '@pagescaling' },
    ],
  },
  {
    id: 'post5',
    slug: 'deliverables-carousel',
    kicker: 'A managed week',
    slides: [
      { type: 'hook',  eyebrow: 'What you get', title: 'What a managed week <b>actually looks like.</b>', sub: 'Real deliverables. Not vague promises.' },
      { type: 'deliver', num: '01', body: '<b>Daily posts</b> — scheduled and shipped, every day, no gaps.' },
      { type: 'deliver', num: '02', body: '<b>Trending audio,</b> caught while it’s still climbing.' },
      { type: 'deliver', num: '03', body: '<b>Several hooks tested</b> per idea — we let the data pick the winner.' },
      { type: 'deliver', num: '04', body: 'A weekly <b>Social Blade report</b> in your inbox. Numbers, not feelings.', live: true },
      { type: 'cta', eyebrow: 'The deal', title: 'You watch it grow. <b>We run the engine.</b>', cta: 'Free teardown in bio' },
    ],
  },
];
