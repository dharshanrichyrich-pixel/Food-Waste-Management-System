import { Delivery, Donation, Match, VolunteerProfile, Route, ImpactMetric } from '../../models/mongoose/index.js';
import { emitDeliveryUpdate, emitToRole } from '../../websocket/socket.js';
import { impactAgent } from '../../agents/impact.agent.js';

export const DeliveryService = {
  /**
   * Get single delivery by ID
   */
  async getDeliveryById(deliveryId) {
    const delivery = await Delivery.findById(deliveryId)
      .populate({
        path: 'donationId',
        populate: { path: 'donorId' },
      })
      .populate({
        path: 'matchId',
        populate: { path: 'recipientId' },
      })
      .populate('volunteerId');

    if (!delivery) throw new Error('Delivery not found');
    return delivery;
  },

  /**
   * List all deliveries with optional filter
   */
  async listDeliveries(filters = {}) {
    const query = {};
    if (filters.status) query.status = filters.status;
    if (filters.volunteerId) query.volunteerId = filters.volunteerId;

    return await Delivery.find(query)
      .populate({
        path: 'donationId',
        populate: { path: 'donorId' },
      })
      .populate({
        path: 'matchId',
        populate: { path: 'recipientId' },
      })
      .populate('volunteerId')
      .sort({ assignedAt: -1 });
  },

  /**
   * Update delivery status and broadcast live transition
   */
  async updateStatus(deliveryId, status) {
    const validTransitions = [
      'ASSIGNED',
      'EN_ROUTE_PICKUP',
      'PICKED_UP',
      'EN_ROUTE_DROPOFF',
      'COMPLETED',
      'FAILED',
      'CANCELLED',
    ];

    if (!validTransitions.includes(status)) {
      throw new Error(`Invalid delivery status: ${status}`);
    }

    const updateData = { status };
    if (status === 'PICKED_UP') updateData.pickedUpAt = new Date();
    if (status === 'COMPLETED') updateData.completedAt = new Date();

    const delivery = await Delivery.findByIdAndUpdate(
      deliveryId,
      { $set: updateData },
      { new: true }
    )
      .populate({
        path: 'donationId',
        populate: { path: 'donorId' },
      })
      .populate({
        path: 'matchId',
        populate: { path: 'recipientId' },
      })
      .populate('volunteerId');

    if (!delivery) throw new Error('Delivery not found');

    // Update corresponding donation status
    if (delivery.donationId) {
      const donationId = delivery.donationId._id || delivery.donationId;
      const donationStatus =
        status === 'COMPLETED'
          ? 'DELIVERED'
          : status === 'PICKED_UP'
          ? 'PICKED_UP'
          : undefined;

      if (donationStatus) {
        await Donation.findByIdAndUpdate(donationId, {
          $set: { status: donationStatus },
        });
      }

      // If completed, compute and record impact
      if (status === 'COMPLETED') {
        const donationDoc = await Donation.findById(donationId);
        if (donationDoc) {
          const impact = await impactAgent.execute({
            donationId: donationId.toString(),
            quantityKg: donationDoc.quantityValue,
            foodCategory: donationDoc.foodCategory,
          });

          await ImpactMetric.findOneAndUpdate(
            { donationId },
            {
              $set: {
                mealsRescued: impact.mealsRescued,
                co2AvoidedKg: impact.co2AvoidedKg,
                waterSavedLiters: impact.waterSavedLiters,
                peopleFed: impact.peopleFed,
                calculatedAt: new Date(),
              },
            },
            { upsert: true, new: true }
          );
        }
      }
    }

    try {
      emitDeliveryUpdate(deliveryId, {
        status,
        deliveryId,
        timestamp: new Date().toISOString(),
      });
      emitToRole('admin', 'delivery:status_change', { deliveryId, status });
    } catch (wsErr) {
      // ignore
    }

    return delivery;
  },

  /**
   * Submit Proof of Delivery (Photo & Signature)
   */
  async submitProof(deliveryId, proofData) {
    const { proofPhotoUrl, recipientSignatureUrl } = proofData;

    const delivery = await Delivery.findByIdAndUpdate(
      deliveryId,
      {
        $set: {
          proofPhotoUrl: proofPhotoUrl || null,
          recipientSignatureUrl: recipientSignatureUrl || null,
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!delivery) throw new Error('Delivery not found');

    if (delivery.donationId) {
      await Donation.findByIdAndUpdate(delivery.donationId, {
        $set: { status: 'DELIVERED' },
      });
    }

    return delivery;
  },
};

export default DeliveryService;
