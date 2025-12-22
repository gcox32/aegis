import { MuscleGroupName } from "@/types/anatomy";

const imagePath = '/images/anatomy';
const imagePathFront = `${imagePath}/front/svg`;
const imagePathBack = `${imagePath}/back/svg`;

export const muscleGroupImages: Record<MuscleGroupName, { front: string[], back: string[] }> = {
  'chest': {
    front: [`${imagePathFront}/pec-major.svg`],
    back: []
  },
  'anterior delts': {
    front: [`${imagePathFront}/deltoids.svg`],
    back: []
  },
  'lateral delts': {
    front: [`${imagePathFront}/deltoids.svg`],
    back: []
  },
  'posterior delts': {
    front: [],
    back: [`${imagePathBack}/deltoids.svg`]
  },
  'lats': {
    front: [`${imagePathFront}/serratus-anterior.svg`],
    back: [`${imagePathBack}/lattisimus-dorsi.svg`]
  },
  'rhomboids': {
    front: [],
    back: [`${imagePathBack}/rhomboid-major.svg`, `${imagePathBack}/trapezius-lower.svg`, `${imagePathBack}/teres-major.svg`]
  },
  'traps': {
    front: [`${imagePathFront}/trapezius.svg`],
    back: [`${imagePathBack}/trapezius.svg`, `${imagePathBack}/lower-trapezius.svg`]
  },
  'spinal erectors': {
    front: [],
    back: [`${imagePathBack}/thoracolumbar-fascia.svg`]
  },
  'quadratus lumborum': {
    front: [],
    back: []
  },
  'biceps': {
    front: [`${imagePathFront}/biceps-brachii.svg`, `${imagePathFront}/brachialis.svg`],
    back: []
  },
  'triceps': {
    front: [`${imagePathFront}/triceps-long-head.svg`, `${imagePathFront}/triceps-medial-head.svg`],
    back: [`${imagePathBack}/triceps-brachii.svg`]
  },
  'forearms': {
    front: [
      `${imagePathFront}/brachioradialis.svg`,
      `${imagePathFront}/extensor-carpi-radialis.svg`,
      `${imagePathFront}/flexor-carpi-radialis.svg`
    ],
    back: [
      `${imagePathBack}/brachioradialis.svg`,
      `${imagePathBack}/extensor-carpi-radialis.svg`,
      `${imagePathBack}/flexor-carpi-radialis.svg`,
      `${imagePathBack}/flexor-carpi-ulnaris.svg`
    ]
  },
  'anterior core': {
    front: [`${imagePathFront}/rectus-abdominus.svg`, `${imagePathFront}/rectus-abdominus-lower.svg`],
    back: []
  },
  'obliques': {
    front: [`${imagePathFront}/external-obliques.svg`],
    back: [`${imagePathBack}/external-obliques.svg`]
  },
  'deep core': {
    front: [`${imagePathFront}/rectus-abdominus.svg`, `${imagePathFront}/rectus-abdominus-lower.svg`, `${imagePathFront}/external-obliques.svg`],
    back: [`${imagePathBack}/external-obliques.svg`]
  },
  'glutes': {
    front: [],
    back: [`${imagePathBack}/gluteus-maximus.svg`, `${imagePathBack}/gluteus-medius.svg`]
  },
  'hip flexors': {
    front: [`${imagePathFront}/sartorius.svg`, `${imagePathFront}/tensor-fascia-latae.svg`],
    back: [`${imagePathBack}/tensor-fascia-latae.svg`]
  },
  'quadriceps': {
    front: [`${imagePathFront}/rectus-femoris.svg`, `${imagePathFront}/vastus-lateralis.svg`, `${imagePathFront}/vastus-medialis.svg`],
    back: []
  },
  'hamstrings': {
    front: [],
    back: [`${imagePathBack}/biceps-femoris.svg`]
  },
  'adductors': {
    front: [`${imagePathFront}/add-longus.svg`],
    back: [`${imagePathBack}/add-gracilis.svg`, `${imagePathBack}/add-magnus.svg`]
  },
  'abductors': {
    front: [`${imagePathFront}/tensor-fascia-latae.svg`],
    back: [`${imagePathBack}/gluteus-medius.svg`, `${imagePathBack}/tensor-fascia-latae.svg`]
  },
  'calves': {
    front: [`${imagePathFront}/gastocnemuis.svg`, `${imagePathFront}/soleus.svg`],
    back: [`${imagePathBack}/gastroc-lateral.svg`, `${imagePathBack}/gastroc-medial.svg`]
  },
  'anterior tibialis': {
    front: [],
    back: []
  },
  'rotator cuff': {
    front: [],
    back: [`${imagePathBack}/infraspinatus.svg`]
  },
  'neck': {
    front: [`${imagePathFront}/sternocleidomastoid.svg`, `${imagePathFront}/omohyoid.svg`],
    back: []
  },
  'jaw': {
    front: [],
    back: []
  },
  'other': {
    front: [`${imagePathFront}/peroneus-longus.svg`],
    back: []
  }
};
