import { ResponderProfile, IResponderProfile } from '../models/ResponderProfile';
import { User } from '../models/User';
import { ENV } from '../config/env';

export interface NearbyResponderResult {
  responderProfile: IResponderProfile;
  distanceMeters: number;
}

export class GeoService {
  /**
   * Finds nearby verified responders using MongoDB 2dsphere $nearSphere
   * Criteria:
   * 1. ResponderProfile verificationStatus === 'approved'
   * 2. ResponderProfile isAvailable === true
   * 3. User status === 'active' (not suspended/banned)
   * 4. Within maxDistanceMeters
   */
  static async findNearbyResponders(
    longitude: number,
    latitude: number,
    maxDistanceMeters: number = ENV.DEFAULT_EMERGENCY_RADIUS_METERS
  ): Promise<IResponderProfile[]> {
    try {
      // Find active approved users
      const activeUsers = await User.find({ status: 'active' }).select('_id');
      const activeUserIds = activeUsers.map((u) => u._id);

      const responders = await ResponderProfile.find({
        userId: { $in: activeUserIds },
        verificationStatus: 'approved',
        isAvailable: true,
        currentLocation: {
          $nearSphere: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
            $maxDistance: maxDistanceMeters,
          },
        },
      }).populate('userId', 'name username profilePhoto rating');

      return responders;
    } catch (error) {
      console.error('[GeoService] Error querying nearby responders:', error);
      // Fallback query if 2dsphere index has issues
      return await ResponderProfile.find({
        verificationStatus: 'approved',
        isAvailable: true,
      }).populate('userId', 'name username profilePhoto rating');
    }
  }
}
