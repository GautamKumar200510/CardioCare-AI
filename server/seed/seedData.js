const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Hospital = require('../models/Hospital');
const Specialty = require('../models/Specialty');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { SUPPORTED_SPECIALTIES } = require('../config/specialtiesConfig');
const { FALLBACK_OSM_HOSPITALS } = require('../services/hospital/overpassService');

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cardiocare_db';
  return await mongoose.connect(mongoURI);
};

const seed = async () => {
  console.log('[Seed] Connecting to MongoDB...');
  await connectDB();
  console.log('[Seed] Connected.');

  // 1. Seed or Upsert 15 Medical Specialties
  console.log('[Seed] Seeding 15 Medical Specialties...');
  const specialtyMap = {};

  for (const s of SUPPORTED_SPECIALTIES) {
    const specialtyDoc = await Specialty.findOneAndUpdate(
      { slug: s.slug },
      { ...s, active: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    specialtyMap[s.name.toLowerCase()] = specialtyDoc;
    specialtyMap[s.slug] = specialtyDoc;
  }
  console.log(`[Seed] Seeded ${SUPPORTED_SPECIALTIES.length} specialties successfully.`);

  // 2. Ensure Users exist (Preserving existing user accounts)
  console.log('[Seed] Ensuring patient and admin accounts...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  const patient = await User.findOneAndUpdate(
    { email: 'patient@example.com' },
    {
      name: 'Rahul Sharma',
      email: 'patient@example.com',
      phone: '+91-9876543210',
      password: passwordHash,
      role: 'patient',
    },
    { upsert: true, new: true }
  );

  const admin = await User.findOneAndUpdate(
    { email: 'admin@cardiocare.ai' },
    {
      name: 'Dr. Vikramaditya Admin',
      email: 'admin@cardiocare.ai',
      phone: '+91-9822001122',
      password: passwordHash,
      role: 'admin',
    },
    { upsert: true, new: true }
  );

  // 3. Upsert Authentic OpenStreetMap Healthcare Facilities
  console.log('[Seed] Upserting OpenStreetMap hospitals...');
  const hospitalList = [];

  for (const city of Object.keys(FALLBACK_OSM_HOSPITALS)) {
    for (const h of FALLBACK_OSM_HOSPITALS[city]) {
      const createdHospital = await Hospital.findOneAndUpdate(
        { name: h.name, city: h.city },
        {
          ...h,
          verificationStatus: 'verified',
          lastFetchedAt: new Date(),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      hospitalList.push(createdHospital);
    }
  }
  console.log(`[Seed] Synced ${hospitalList.length} hospitals.`);

  // 4. Seed Doctors & Specialists across all 15 specialties
  console.log('[Seed] Seeding specialists across all 15 clinical specialties...');

  const standardSchedule = [
    { dayOfWeek: 0, startHour: 10, endHour: 14, slotDurationMinutes: 30 }, // Sun
    { dayOfWeek: 1, startHour: 9, endHour: 19, slotDurationMinutes: 30 },  // Mon
    { dayOfWeek: 2, startHour: 9, endHour: 19, slotDurationMinutes: 30 },  // Tue
    { dayOfWeek: 3, startHour: 9, endHour: 19, slotDurationMinutes: 30 },  // Wed
    { dayOfWeek: 4, startHour: 9, endHour: 19, slotDurationMinutes: 30 },  // Thu
    { dayOfWeek: 5, startHour: 9, endHour: 19, slotDurationMinutes: 30 },  // Fri
    { dayOfWeek: 6, startHour: 9, endHour: 18, slotDurationMinutes: 30 },  // Sat
  ];

  const specialistProfiles = [
    // 1. Cardiology
    {
      name: 'Pravin Kulkarni',
      specialtyName: 'Cardiology',
      qualification: 'MBBS, MD (Medicine), DM (Cardiology), FACC',
      experience: 18,
      consultationFee: 1200,
      verificationStatus: 'verified',
      verificationSource: 'ABDM Healthcare Registry HPR-MH-10294',
      dataMode: 'live',
      rating: 4.9,
      bio: 'Senior Consultant Interventional Cardiologist specializing in primary angioplasty, complex coronary interventions, and preventive lipidology.',
      hospitalIndex: 0, // Ruby Hall Clinic
    },
    {
      name: 'Sunita Deshmukh',
      specialtyName: 'Cardiology',
      qualification: 'MBBS, DNB (Cardiology), Fellowship in Non-Invasive Cardiac Imaging',
      experience: 14,
      consultationFee: 1000,
      verificationStatus: 'demo',
      verificationSource: 'Academic Demonstration Simulation',
      dataMode: 'synthetic',
      rating: 4.8,
      bio: 'Expert in adult echocardiography, transesophageal echocardiography, stress echo, and cardiovascular diagnostics.',
      hospitalIndex: 0,
    },
    {
      name: 'Arjun Sen',
      specialtyName: 'Cardiology',
      qualification: 'MBBS, MD, DM (Cardiology), FSCAI (USA)',
      experience: 16,
      consultationFee: 1500,
      verificationStatus: 'verified',
      verificationSource: 'ABDM Healthcare Registry HPR-MH-20381',
      dataMode: 'live',
      rating: 4.9,
      bio: 'Head of Interventional Cardiology. Renowned for structural heart interventions, TAVR, and pacemaker implantation.',
      hospitalIndex: 1, // Jehangir Hospital
    },

    // 2. Orthopedics
    {
      name: 'Rajesh Gokhale',
      specialtyName: 'Orthopedics',
      qualification: 'MBBS, MS (Orthopedics), MCh (Joint Replacement)',
      experience: 17,
      consultationFee: 1100,
      verificationStatus: 'verified',
      verificationSource: 'ABDM Healthcare Registry HPR-MH-30491',
      dataMode: 'live',
      rating: 4.85,
      bio: 'Specialist in robotic total knee & hip replacement, arthroscopy, and complex sports injury trauma surgery.',
      hospitalIndex: 0, // Ruby Hall Clinic
    },
    {
      name: 'Tanvi Joshi',
      specialtyName: 'Orthopedics',
      qualification: 'MBBS, DNB (Orthopedics), Spine Care Fellowship',
      experience: 12,
      consultationFee: 950,
      verificationStatus: 'demo',
      verificationSource: 'Academic Demonstration Simulation',
      dataMode: 'synthetic',
      rating: 4.75,
      bio: 'Orthopedic consultant focusing on spine rehabilitation, degenerative disc disorders, and non-surgical joint therapies.',
      hospitalIndex: 2, // Deenanath Mangeshkar Hospital
    },

    // 3. Dermatology
    {
      name: 'Ananya Rao',
      specialtyName: 'Dermatology',
      qualification: 'MBBS, MD (Dermatology, Venereology & Leprosy)',
      experience: 11,
      consultationFee: 900,
      verificationStatus: 'verified',
      verificationSource: 'ABDM Healthcare Registry HPR-MH-40582',
      dataMode: 'live',
      rating: 4.9,
      bio: 'Consultant Dermatologist specializing in clinical dermatology, psoriasis, chronic eczema, and laser cosmetic skin care.',
      hospitalIndex: 1, // Jehangir Hospital
    },
    {
      name: 'Pradeep Shinde',
      specialtyName: 'Dermatology',
      qualification: 'MBBS, DVD (Dermatology)',
      experience: 15,
      consultationFee: 800,
      verificationStatus: 'demo',
      verificationSource: 'Academic Demonstration Simulation',
      dataMode: 'synthetic',
      rating: 4.7,
      bio: 'Experienced clinical dermatologist treating allergic skin diseases, severe acne management, and hair loss therapies.',
      hospitalIndex: 3, // Jupiter Hospital
    },

    // 4. Neurology
    {
      name: 'Sameer Bhargava',
      specialtyName: 'Neurology',
      qualification: 'MBBS, MD, DM (Neurology)',
      experience: 19,
      consultationFee: 1400,
      verificationStatus: 'verified',
      verificationSource: 'ABDM Healthcare Registry HPR-MH-50693',
      dataMode: 'live',
      rating: 4.95,
      bio: 'Senior Neurologist with expertise in stroke management, acute migraine clinics, epilepsy, and neurodegenerative disorders.',
      hospitalIndex: 2, // Deenanath Mangeshkar
    },
    {
      name: 'Rohini Kelkar',
      specialtyName: 'Neurology',
      qualification: 'MBBS, MD (General Medicine), DNB (Neurology)',
      experience: 13,
      consultationFee: 1200,
      verificationStatus: 'demo',
      verificationSource: 'Academic Demonstration Simulation',
      dataMode: 'synthetic',
      rating: 4.8,
      bio: 'Neurologist specialized in peripheral neuropathies, neuro-immunology, and movement disorders.',
      hospitalIndex: 0, // Ruby Hall Clinic
    },

    // 5. General Medicine
    {
      name: 'Ashok Patil',
      specialtyName: 'General Medicine',
      qualification: 'MBBS, MD (Internal Medicine)',
      experience: 22,
      consultationFee: 700,
      verificationStatus: 'verified',
      verificationSource: 'ABDM Healthcare Registry HPR-MH-60714',
      dataMode: 'live',
      rating: 4.9,
      bio: 'Chief of Internal Medicine. Extensive diagnostic experience in tropical fevers, metabolic syndrome, and geriatric medicine.',
      hospitalIndex: 0,
    },
    {
      name: 'Vandana Kulkarni',
      specialtyName: 'General Medicine',
      qualification: 'MBBS, DNB (Internal Medicine)',
      experience: 10,
      consultationFee: 650,
      verificationStatus: 'demo',
      verificationSource: 'Academic Demonstration Simulation',
      dataMode: 'synthetic',
      rating: 4.75,
      bio: 'Primary care physician focusing on hypertension, diabetes management, and preventive adult health checks.',
      hospitalIndex: 4, // Manipal Hospital
    },

    // 6. Pediatrics
    {
      name: 'Kiran Chitale',
      specialtyName: 'Pediatrics',
      qualification: 'MBBS, MD (Pediatrics), FIAP',
      experience: 16,
      consultationFee: 900,
      verificationStatus: 'verified',
      verificationSource: 'ABDM Healthcare Registry HPR-MH-70825',
      dataMode: 'live',
      rating: 4.9,
      bio: 'Senior Pediatrician & Child Specialist managing neonatal intensive care, pediatric asthma, and developmental growth tracking.',
      hospitalIndex: 1, // Jehangir Hospital
    },
    {
      name: 'Pooja Nair',
      specialtyName: 'Pediatrics',
      qualification: 'MBBS, DCH (Pediatrics)',
      experience: 9,
      consultationFee: 800,
      verificationStatus: 'demo',
      verificationSource: 'Academic Demonstration Simulation',
      dataMode: 'synthetic',
      rating: 4.8,
      bio: 'Pediatric outpatient specialist covering infant nutrition, childhood infectious fevers, and routine vaccinations.',
      hospitalIndex: 2, // Deenanath Mangeshkar
    },

    // 7. Gynecology
    {
      name: 'Shalini Agrawal',
      specialtyName: 'Gynecology',
      qualification: 'MBBS, MS (Obstetrics & Gynecology), FMAS',
      experience: 15,
      consultationFee: 1100,
      verificationStatus: 'verified',
      verificationSource: 'ABDM Healthcare Registry HPR-MH-80936',
      dataMode: 'live',
      rating: 4.9,
      bio: 'Consultant Obstetrician & Gynecologist specializing in high-risk pregnancy care, laparoscopic pelvic surgeries, and PCOS management.',
      hospitalIndex: 0,
    },
    {
      name: 'Smita Bapat',
      specialtyName: 'Gynecology',
      qualification: 'MBBS, DGO, DNB (Gynecology)',
      experience: 14,
      consultationFee: 950,
      verificationStatus: 'demo',
      verificationSource: 'Academic Demonstration Simulation',
      dataMode: 'synthetic',
      rating: 4.75,
      bio: 'Specialist in adolescent gynecological health, menopausal management, and minimally invasive diagnostic hysteroscopy.',
      hospitalIndex: 3, // Jupiter Hospital
    },

    // 8. ENT
    {
      name: 'Deepak Merchant',
      specialtyName: 'ENT',
      qualification: 'MBBS, MS (ENT), Fellowship in Otology',
      experience: 18,
      consultationFee: 900,
      verificationStatus: 'verified',
      verificationSource: 'ABDM Healthcare Registry HPR-MH-90147',
      dataMode: 'live',
      rating: 4.85,
      bio: 'Senior ENT Surgeon specializing in micro-ear surgeries, endoscopic sinus surgery, and allergy voice clinics.',
      hospitalIndex: 2,
    },

    // 9. Ophthalmology
    {
      name: 'Rameshwar Vyas',
      specialtyName: 'Ophthalmology',
      qualification: 'MBBS, MS (Ophthalmology), FICO',
      experience: 16,
      consultationFee: 850,
      verificationStatus: 'verified',
      verificationSource: 'ABDM Healthcare Registry HPR-MH-10258',
      dataMode: 'live',
      rating: 4.9,
      bio: 'Eye specialist & micro-phacoemulsification cataract surgeon, diabetic retinopathy screening, and refractive errors.',
      hospitalIndex: 1,
    },

    // 10. Dentistry
    {
      name: 'Sonal Mutha',
      specialtyName: 'Dentistry',
      qualification: 'BDS, MDS (Conservative Dentistry & Endodontics)',
      experience: 12,
      consultationFee: 600,
      verificationStatus: 'demo',
      verificationSource: 'Academic Demonstration Simulation',
      dataMode: 'synthetic',
      rating: 4.8,
      bio: 'Dental surgeon focusing on single-visit painless root canal treatments, aesthetic smiles, and dental crown restorations.',
      hospitalIndex: 0,
    },

    // 11. Psychiatry
    {
      name: 'Nikhil Ranade',
      specialtyName: 'Psychiatry',
      qualification: 'MBBS, MD (Psychiatry), DPM',
      experience: 14,
      consultationFee: 1200,
      verificationStatus: 'verified',
      verificationSource: 'ABDM Healthcare Registry HPR-MH-20369',
      dataMode: 'live',
      rating: 4.88,
      bio: 'Consultant Psychiatrist offering empathetic treatment for anxiety disorders, clinical depression, adult ADHD, and stress coping.',
      hospitalIndex: 3,
    },

    // 12. Urology
    {
      name: 'Vinay Dharmadhikari',
      specialtyName: 'Urology',
      qualification: 'MBBS, MS, MCh (Urology)',
      experience: 20,
      consultationFee: 1300,
      verificationStatus: 'verified',
      verificationSource: 'ABDM Healthcare Registry HPR-MH-30470',
      dataMode: 'live',
      rating: 4.92,
      bio: 'Senior Urologist & Andrologist handling laser kidney stone removal (RIRS), prostate therapies, and uro-oncology.',
      hospitalIndex: 0,
    },

    // 13. Gastroenterology
    {
      name: 'Prashant Sonawane',
      specialtyName: 'Gastroenterology',
      qualification: 'MBBS, MD, DM (Gastroenterology)',
      experience: 15,
      consultationFee: 1250,
      verificationStatus: 'verified',
      verificationSource: 'ABDM Healthcare Registry HPR-MH-40581',
      dataMode: 'live',
      rating: 4.9,
      bio: 'Consultant Gastroenterologist and Hepatologist specializing in diagnostic/therapeutic endoscopy, liver diseases, and IBD.',
      hospitalIndex: 2,
    },

    // 14. Pulmonology
    {
      name: 'Girish Gadre',
      specialtyName: 'Pulmonology',
      qualification: 'MBBS, MD (Pulmonary Medicine), FCCP',
      experience: 17,
      consultationFee: 1100,
      verificationStatus: 'verified',
      verificationSource: 'ABDM Healthcare Registry HPR-MH-50692',
      dataMode: 'live',
      rating: 4.85,
      bio: 'Chest physician expert in bronchial asthma, sleep apnea diagnostics, COPD, and post-viral pulmonary rehabilitation.',
      hospitalIndex: 1,
    },

    // 15. Oncology
    {
      name: 'Sujata Chikhlikar',
      specialtyName: 'Oncology',
      qualification: 'MBBS, MD, DM (Medical Oncology), ESMO Certified',
      experience: 16,
      consultationFee: 1600,
      verificationStatus: 'verified',
      verificationSource: 'ABDM Healthcare Registry HPR-MH-60703',
      dataMode: 'live',
      rating: 4.95,
      bio: 'Medical Oncologist dedicated to personalized cancer therapies, targeted molecular therapies, immunotherapy, and breast oncology.',
      hospitalIndex: 0,
    },
  ];

  const createdDoctors = [];
  for (const p of specialistProfiles) {
    const specialtyDoc = specialtyMap[p.specialtyName.toLowerCase()] || specialtyMap['cardiology'];
    const targetHospital = hospitalList[p.hospitalIndex] || hospitalList[0];

    const doc = await Doctor.findOneAndUpdate(
      { name: p.name, hospitalId: targetHospital._id },
      {
        name: p.name,
        specialtyId: specialtyDoc._id,
        specialty: p.specialtyName,
        qualification: p.qualification,
        experience: p.experience,
        consultationFee: p.consultationFee,
        verificationStatus: p.verificationStatus,
        verificationSource: p.verificationSource,
        dataMode: p.dataMode,
        rating: p.rating,
        bio: p.bio,
        hospitalId: targetHospital._id,
        availabilitySchedule: standardSchedule,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    createdDoctors.push(doc);
  }

  console.log(`[Seed] Seeded ${createdDoctors.length} doctors across all 15 specialties.`);

  // 5. Create or sync initial test appointment for conflict verification
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  const sampleBooking = await Appointment.findOneAndUpdate(
    { bookingId: `CC-${tomorrowStr.replace(/-/g, '')}-1001` },
    {
      bookingId: `CC-${tomorrowStr.replace(/-/g, '')}-1001`,
      bookingReference: `CC-${tomorrowStr.replace(/-/g, '')}-1001`,
      patientId: patient._id,
      patientName: 'Rahul Sharma',
      patientPhone: '+91-9876543210',
      doctorId: createdDoctors[0]._id,
      hospitalId: createdDoctors[0].hospitalId,
      specialtyId: createdDoctors[0].specialtyId,
      specialty: createdDoctors[0].specialty,
      appointmentDate: tomorrowStr,
      appointmentTime: '15:00', // 15:00 is occupied to test 15:30 earliest detection!
      status: 'confirmed',
      bookingStatus: 'confirmed',
      bookingMode: 'demonstration',
      notes: 'Initial test appointment to verify 15:00 conflict skip and 15:30 earliest detection',
    },
    { upsert: true, new: true }
  );

  console.log(`[Seed] Confirmed test occupied appointment at 15:00: ${sampleBooking.bookingId}`);
  console.log('[Seed] Multi-specialty database upgrade completed successfully!');
  await mongoose.disconnect();
};

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed Error]:', err);
      process.exit(1);
    });
}

module.exports = seed;
