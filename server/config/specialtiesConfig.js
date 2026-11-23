/**
 * Centralized Medical Specialties Catalog
 * Defines the 15 standard clinical specialties supported across CardioCare AI.
 */
const SUPPORTED_SPECIALTIES = [
  {
    name: 'Cardiology',
    slug: 'cardiology',
    description: 'Heart and cardiovascular care, heart rhythm, and preventive cardiology.',
    keywords: ['cardio', 'cardiologist', 'heart', 'cardiovascular', 'angioplasty', 'ecg', 'echocardiogram', 'cardiac'],
    iconName: 'Heart',
  },
  {
    name: 'Orthopedics',
    slug: 'orthopedics',
    description: 'Bone, joint, ligament, spine, and musculoskeletal disorders and sports injuries.',
    keywords: ['orthopedic', 'orthopedics', 'orthopedist', 'bone', 'joint', 'fracture', 'spine', 'knee', 'arthritis'],
    iconName: 'Bone',
  },
  {
    name: 'Dermatology',
    slug: 'dermatology',
    description: 'Skin, hair, nail conditions, allergies, acne, and dermatological therapies.',
    keywords: ['dermatology', 'dermatologist', 'skin', 'rash', 'acne', 'eczema', 'derma', 'hair loss'],
    iconName: 'Sparkles',
  },
  {
    name: 'Neurology',
    slug: 'neurology',
    description: 'Brain, spinal cord, nerve disorders, migraine, epilepsy, and neuro-care.',
    keywords: ['neurology', 'neurologist', 'neuro', 'brain', 'nerve', 'migraine', 'stroke', 'epilepsy', 'headache'],
    iconName: 'Brain',
  },
  {
    name: 'General Medicine',
    slug: 'general-medicine',
    description: 'Primary adult healthcare, acute infections, lifestyle disease management, and wellness checks.',
    keywords: ['general medicine', 'physician', 'general physician', 'fever', 'cough', 'cold', 'internal medicine', 'doctor'],
    iconName: 'Stethoscope',
  },
  {
    name: 'Pediatrics',
    slug: 'pediatrics',
    description: 'Infant, child, and adolescent healthcare, immunizations, and developmental health.',
    keywords: ['pediatric', 'pediatrics', 'pediatrician', 'child', 'baby', 'infant', 'kid', 'newborn', 'vaccination'],
    iconName: 'Baby',
  },
  {
    name: 'Gynecology',
    slug: 'gynecology',
    description: "Women's reproductive health, prenatal care, obstetric care, and hormonal wellness.",
    keywords: ['gynecology', 'gynecologist', 'gynae', 'gynaecologist', 'women', 'obstetrics', 'pregnancy', 'maternity'],
    iconName: 'ShieldCheck',
  },
  {
    name: 'ENT',
    slug: 'ent',
    description: 'Ear, nose, throat, sinus, voice, hearing disorders, and otolaryngology.',
    keywords: ['ent', 'ear', 'nose', 'throat', 'otolaryngologist', 'hearing', 'sinus', 'tonsils'],
    iconName: 'Headphones',
  },
  {
    name: 'Ophthalmology',
    slug: 'ophthalmology',
    description: 'Eye health, vision testing, cataracts, glaucoma, and refractive eye care.',
    keywords: ['ophthalmology', 'ophthalmologist', 'eye', 'vision', 'cataract', 'glaucoma', 'spectacles', 'retina'],
    iconName: 'Eye',
  },
  {
    name: 'Dentistry',
    slug: 'dentistry',
    description: 'Teeth, gums, oral hygiene, root canal therapies, and cosmetic dental treatments.',
    keywords: ['dental', 'dentist', 'dentistry', 'teeth', 'tooth', 'root canal', 'gums', 'cavity', 'oral'],
    iconName: 'Smile',
  },
  {
    name: 'Psychiatry',
    slug: 'psychiatry',
    description: 'Mental health, anxiety, depression, stress management, and psychological wellness.',
    keywords: ['psychiatry', 'psychiatrist', 'mental health', 'depression', 'anxiety', 'stress', 'therapy', 'mood'],
    iconName: 'SmilePlus',
  },
  {
    name: 'Urology',
    slug: 'urology',
    description: 'Urinary tract, kidneys, bladder, and male reproductive system consultations.',
    keywords: ['urology', 'urologist', 'urinary', 'kidney stone', 'bladder', 'prostate', 'urine'],
    iconName: 'Activity',
  },
  {
    name: 'Gastroenterology',
    slug: 'gastroenterology',
    description: 'Digestive system, stomach, liver, intestines, acid reflux, and endoscopy.',
    keywords: ['gastroenterology', 'gastroenterologist', 'gastro', 'stomach', 'liver', 'digestion', 'acidity', 'gut', 'colon'],
    iconName: 'Zap',
  },
  {
    name: 'Pulmonology',
    slug: 'pulmonology',
    description: 'Lungs, respiratory system, asthma, chronic bronchitis, and breathing wellness.',
    keywords: ['pulmonology', 'pulmonologist', 'lungs', 'asthma', 'breathing', 'respiratory', 'chest', 'bronchitis'],
    iconName: 'Wind',
  },
  {
    name: 'Oncology',
    slug: 'oncology',
    description: 'Cancer screening, medical oncology, chemotherapy, and tumor evaluations.',
    keywords: ['oncology', 'oncologist', 'cancer', 'tumor', 'chemotherapy', 'biopsy', 'carcinoma'],
    iconName: 'ShieldAlert',
  },
];

module.exports = {
  SUPPORTED_SPECIALTIES,
};
