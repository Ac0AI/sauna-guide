import type { QuizQuestion } from './types'

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    answerKey: 'motivation',
    title: 'What draws you to the heat?',
    subtitle: 'No wrong answer.',
    options: [
      {
        value: 'health',
        label: 'Health benefits',
        description: 'Cardiovascular, recovery, longevity.',
        icon: '♥',
      },
      {
        value: 'relaxation',
        label: 'Stress relief',
        description: 'Unwinding. Silence. A ritual.',
        icon: '◯',
      },
      {
        value: 'social',
        label: 'Sharing it',
        description: 'Family, friends, hosting.',
        icon: '⊕',
      },
      {
        value: 'cold-contrast',
        label: 'Hot-cold contrast',
        description: 'Plunge pools, cold showers, the full protocol.',
        icon: '◆',
      },
    ],
  },
  {
    id: 'q2',
    answerKey: 'placement',
    title: 'Indoor or outdoor?',
    subtitle: "Where you'd actually use it most.",
    options: [
      {
        value: 'indoor',
        label: 'Indoor',
        description: 'Basement, bathroom, spare room.',
        icon: '⌂',
      },
      {
        value: 'outdoor',
        label: 'Outdoor',
        description: 'Backyard, deck, garden.',
        icon: '☀',
      },
    ],
  },
  {
    id: 'q3',
    answerKey: 'capacity',
    title: 'How many people, typically?',
    subtitle: 'Be honest. Most are used solo or as a couple.',
    options: [
      {
        value: '1-2',
        label: '1-2 people',
        description: 'Solo sessions or with a partner.',
        icon: '●',
      },
      {
        value: '3-4',
        label: '3-4 people',
        description: 'Small group. Family-sized.',
        icon: '●●',
      },
      {
        value: '5+',
        label: '5+ people',
        description: 'Entertaining. The full experience.',
        icon: '●●●',
      },
    ],
  },
  {
    id: 'q4',
    answerKey: 'heatType',
    title: 'Traditional steam or infrared?',
    subtitle: 'This is the big one.',
    options: [
      {
        value: 'traditional',
        label: 'Traditional',
        description: 'Hot rocks, steam, the authentic experience.',
        icon: '△',
        pros: ['Authentic löyly', 'Higher temperatures', 'Social tradition'],
        cons: ['Higher install cost', 'Needs ventilation', 'Longer heat-up'],
      },
      {
        value: 'infrared',
        label: 'Infrared',
        description: 'Gentle radiant heat, lower temperatures.',
        icon: '≋',
        pros: ['Lower running cost', 'Plug-and-play install', 'Gentle on body'],
        cons: ['No steam', 'Different sensation', 'Smaller capacity'],
      },
      {
        value: 'open-to-both',
        label: 'Open to both',
        description: "I'll go where the recommendation leads.",
        icon: '⇌',
      },
    ],
  },
  {
    id: 'q5',
    answerKey: 'budget',
    title: 'What feels right for the investment?',
    subtitle: 'All-in numbers. Unit + install + electrical.',
    options: [
      {
        value: '3k-5k',
        label: '$3,000 - $5,000',
        description: 'Entry-level. Solid options exist here.',
        icon: '$',
      },
      {
        value: '5k-10k',
        label: '$5,000 - $10,000',
        description: 'The sweet spot for most buyers.',
        icon: '$$',
      },
      {
        value: '10k-15k',
        label: '$10,000 - $15,000',
        description: 'Premium materials and brands.',
        icon: '$$$',
      },
      {
        value: '15k+',
        label: '$15,000+',
        description: 'Custom builds. No compromises.',
        icon: '$$$$',
      },
    ],
  },
  {
    id: 'q6',
    answerKey: 'timeline',
    title: 'Where are you in the process?',
    subtitle: 'No judgment. Most research for 6 months.',
    options: [
      {
        value: 'researching',
        label: 'Just researching',
        description: 'Gathering information. No rush.',
        icon: '◎',
      },
      {
        value: 'within-3-months',
        label: 'Within 3 months',
        description: 'Actively planning. Getting serious.',
        icon: '▸',
      },
      {
        value: 'ready-now',
        label: 'Ready now',
        description: 'Budget set. Ready to pull the trigger.',
        icon: '▶',
      },
    ],
  },
  {
    id: 'q7',
    answerKey: 'priority',
    title: 'If you had to pick one thing?',
    options: [
      {
        value: 'design',
        label: 'Design',
        description: 'It has to look beautiful.',
        icon: '◇',
      },
      {
        value: 'performance',
        label: 'Performance',
        description: 'Best heat. Best build. Period.',
        icon: '▲',
      },
      {
        value: 'value',
        label: 'Value',
        description: 'Best quality for the money.',
        icon: '✦',
      },
      {
        value: 'trust',
        label: 'Trust',
        description: 'Proven brand. Reliable warranty.',
        icon: '■',
      },
    ],
  },
]
