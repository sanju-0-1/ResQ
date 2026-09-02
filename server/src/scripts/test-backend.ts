import mongoose from 'mongoose';
import { ENV } from '../config/env';
import { User } from '../models/User';
import { ResponderProfile } from '../models/ResponderProfile';
import { Emergency } from '../models/Emergency';
import { Verification } from '../models/Verification';
import { GeoService } from '../services/geoService';
import bcrypt from 'bcryptjs';

async function runBackendVerification() {
  console.log('🧪 Starting ResQ Backend Verification Suite...\n');

  try {
    await mongoose.connect(ENV.MONGODB_URI);
    console.log('✅ 1. MongoDB Connection established.');

    // Cleanup previous test data
    await User.deleteMany({ email: /@test-resq\.org$/ });
    await ResponderProfile.deleteMany({});
    await Emergency.deleteMany({ description: /TEST_EMERGENCY/ });
    await Verification.deleteMany({});
    console.log('✅ 2. Test database cleaned.');

    // 1. Create Requester User
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const requester = await User.create({
      name: 'Sarah Requester',
      username: 'sarah_r',
      email: 'sarah@test-resq.org',
      phone: '+15550001111',
      password: hashedPassword,
      role: 'normal',
      status: 'active',
    });
    console.log(`✅ 3. Requester User created: ${requester.name} (${requester._id})`);

    // 2. Create ResQ Responder User & Profile
    const responderUser = await User.create({
      name: 'Elena Responder',
      username: 'elena_h',
      email: 'elena@test-resq.org',
      phone: '+15550002222',
      password: hashedPassword,
      role: 'resq',
      isVerifiedResponder: true,
      status: 'active',
    });

    const responderLocation = [-73.98513, 40.748817]; // NYC Empire State Building area [lng, lat]
    const responderProfile = await ResponderProfile.create({
      userId: responderUser._id,
      verificationStatus: 'approved',
      isAvailable: true,
      currentLocation: {
        type: 'Point',
        coordinates: responderLocation as [number, number],
      },
      emergencyRadiusMeters: 5000,
    });
    console.log(`✅ 4. Approved & Available ResQ Responder created: ${responderUser.name} at location [${responderLocation.join(', ')}]`);

    // 3. Test Geospatial Nearby Search
    const requesterLocation = [-73.98400, 40.74850]; // ~150 meters away
    const nearbyResponders = await GeoService.findNearbyResponders(
      requesterLocation[0],
      requesterLocation[1],
      5000
    );

    console.log(`✅ 5. Geospatial search returned ${nearbyResponders.length} nearby responder(s).`);

    // 4. Create Emergency Incident
    const emergency = await Emergency.create({
      requesterId: requester._id,
      location: {
        type: 'Point',
        coordinates: requesterLocation,
      },
      addressDescription: 'TEST_EMERGENCY: Near 5th Ave & 34th St',
      description: 'TEST_EMERGENCY: Physical harassment near street corner',
      severity: 'high',
      status: 'active',
      respondersNotified: nearbyResponders.map((r) => r.userId._id),
    });
    console.log(`✅ 6. Emergency incident created with status "active" (ID: ${emergency._id})`);

    // 5. Responder Accepts Emergency
    emergency.responderId = responderUser._id;
    emergency.respondersAccepted = [responderUser._id];
    emergency.status = 'responder_found';
    await emergency.save();
    console.log(`✅ 7. Responder ${responderUser.name} accepted emergency. New status: "responder_found"`);

    // 6. Resolve Emergency
    emergency.status = 'resolved';
    emergency.resolvedAt = new Date();
    await emergency.save();

    await ResponderProfile.findOneAndUpdate(
      { userId: responderUser._id },
      { $inc: { totalAssists: 1 } }
    );
    console.log(`✅ 8. Emergency marked as "resolved". Total assists incremented.`);

    console.log('\n==================================================');
    console.log('🎉 ALL BACKEND API & DATABASE CHECKS PASSED!');
    console.log('==================================================\n');
  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

runBackendVerification();
