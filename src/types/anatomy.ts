import { User } from "./user";

type MuscleGroupName =
    'chest' | 'anterior delts' | 'lateral delts' | 'posterior delts' |
    'lats' | 'rhomboids' | 'traps' | 'spinal erectors' | 'quadratus lumborum' |
    'biceps' | 'triceps' | 'forearms' |
    'anterior core' | 'lateral core' | 'deep core' |
    'glutes' | 'hip flexors' | 'quadriceps' | 'hamstrings' | 'adductors' | 'abductors' | 'calves' | 'anterior lower leg' |
    'neck' | 'jaw' | 'other';


type MuscleName =
    // Upper Body
    'pectoralis major' |
    'anterior deltoid' | 'lateral deltoid' | 'posterior deltoid' |
    'latissimus dorsi' | 'trapezius' | 'rhomboids' | 'teres major' |
    'biceps brachii' | 'brachialis' | 'triceps brachii' | 'forearms' |

    // Core
    'rectus abdominis' |
    'obliques' |
    'transversus abdominis' |
    'erector spinae' | 'quadratus lumborum' | 'multifidus' |
    'serratus anterior' | 'iliopsoas' |

    // Lower Body
    'gluteus maximus' | 'gluteus medius' | 'gluteus minimus' |
    'hamstrings' |
    'rectus femoris' | 'vastus lateralis' | 'vastus medialis' | 'vastus intermedius' |
    'adductor magnus' | 'adductors' |
    'gastrocnemius' | 'soleus' |

    'other';

type ScientificName =
    'soleus' | 'gastrocnemius' | 'tibialis anterior' | 'tibialis posterior' |
    'biceps brachii' | 'triceps brachii' | 'brachialis' | 'brachioradialis' |
    'trapezius' | 'levator scapulae' | 'erector spinae' | 'quadratus lumborum' |
    'multifidus' | 'longissimus dorsi' | 'iliopsoas' | 'piriformis' |
    'obliquus externus abdominis' | 'obliquus internus abdominis' | 'rectus abdominis' |
    'transversus abdominis' | 'serratus anterior' | 'intercostals' | 'diaphragm' |
    'sternocleidomastoid' | 'scalenes' |
    'splenius capitis' | 'splenius cervicis' |
    'pectoralis major' | 'pectoralis minor' |
    'anterior deltoid' | 'lateral deltoid' | 'posterior deltoid' |
    'latissimus dorsi' | 'rhomboid major' | 'rhomboid minor' |
    'teres major' | 'teres minor' |
    'infraspinatus' | 'supraspinatus' |
    'pronator teres' | 'supinator' |
    'flexor carpi radialis' | 'flexor carpi ulnaris' |
    'extensor carpi radialis longus' | 'extensor carpi radialis brevis' |
    'extensor carpi ulnaris' |
    'gluteus maximus' | 'gluteus medius' | 'gluteus minimus' |
    'tensor fasciae latae' |
    'adductor magnus' | 'adductor longus' | 'adductor brevis' |
    'pectineus' | 'gracilis' |
    'biceps femoris long head' | 'biceps femoris short head' |
    'semitendinosus' | 'semimembranosus' |
    'rectus femoris' |
    'vastus lateralis' | 'vastus medialis' | 'vastus intermedius' |
    'flexor hallucis longus' | 'flexor digitorum longus' |
    'extensor hallucis longus' | 'extensor digitorum longus' |
    'peroneus longus' | 'peroneus brevis' |
    'other';


export interface MuscleGroup {
    id: string;
    name: MuscleGroupName;
    description: string;
    muscles: Muscle[]; // hydrated with muscle data
}

export interface Muscle {
    id: string;
    name: MuscleName;
    description?: string;
    muscleGroupId: MuscleGroup['id'];
}

interface Measurement {
    id: string;
    value: number;
    unit: string;
    method?: string;
    site: MeasurementSite; // hydrated with measurement site data
}

interface MeasurementSite {
    id: string;
    name: string;
    description?: string;
}

interface MeasurementInstance {
    id: string;
    userId: User['id'];
    measurementId: Measurement['id'];
    date: Date;
}

export interface MeasurementLog {
    id: string;
    userId: User['id'];
    measurements: MeasurementInstance[]; // hydrated with measurement data
}