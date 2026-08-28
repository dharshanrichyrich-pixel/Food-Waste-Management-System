import { BaseAgent } from './orchestrator.js';
import { calculateDistanceKm } from './matching.agent.js';

/**
 * Logistics Agent
 * Solves multi-stop pickup and dropoff vehicle routing problem (VRP / TSP heuristic),
 * estimates turnaround durations, calculates ETAs, and generates map waypoints.
 */
export class LogisticsAgent extends BaseAgent {
  constructor() {
    super('LogisticsAgent', '2.1.0');
  }

  /**
   * Optimize delivery route with multi-stop waypoints
   * @param {object} payload { origin, stops: [{ id, type: 'PICKUP'|'DROPOFF', name, latitude, longitude, address }] }
   */
  async execute(payload) {
    const {
      origin = { latitude: 37.7749, longitude: -122.4194, name: 'Current Location' },
      stops = [],
      averageSpeedKmh = 35.0,
    } = payload;

    if (!stops || stops.length === 0) {
      return {
        totalDistanceKm: 0,
        estimatedDurationMin: 0,
        optimizedWaypoints: [],
        polyline: [],
      };
    }

    // 1. Separate Pickups and Dropoffs to enforce precedence constraint (Pickup before its dropoff)
    const unvisited = [...stops];
    const orderedStops = [];
    let currentLocation = { ...origin };

    // Greedy Nearest-Neighbor heuristic with Pickup-before-Dropoff constraint
    while (unvisited.length > 0) {
      // Find candidate stops that are valid to visit next:
      // A DROPOFF is valid only if its corresponding PICKUP has already been added to orderedStops (or if unmatched)
      const validCandidates = unvisited.filter((stop) => {
        if (stop.type === 'DROPOFF' && stop.relatedPickupId) {
          const pickupDone = orderedStops.some((s) => s.id === stop.relatedPickupId);
          return pickupDone;
        }
        return true;
      });

      const pool = validCandidates.length > 0 ? validCandidates : unvisited;

      // Find nearest stop from current location
      let nearestIndex = 0;
      let minDistance = Infinity;

      pool.forEach((stop, index) => {
        const dist = calculateDistanceKm(
          currentLocation.latitude,
          currentLocation.longitude,
          stop.latitude,
          stop.longitude
        );
        if (dist < minDistance) {
          minDistance = dist;
          nearestIndex = index;
        }
      });

      const chosenStop = pool[nearestIndex];
      orderedStops.push(chosenStop);

      // Remove chosen stop from unvisited
      const unvisitedIdx = unvisited.findIndex((s) => s.id === chosenStop.id);
      if (unvisitedIdx !== -1) {
        unvisited.splice(unvisitedIdx, 1);
      }

      currentLocation = {
        latitude: chosenStop.latitude,
        longitude: chosenStop.longitude,
      };
    }

    // 2. Compute Segment Distances, ETAs, and Waypoint Details
    let totalDistanceKm = 0;
    let accumulatedTimeMin = 0;
    let prevLoc = { ...origin };

    const waypointsWithEta = orderedStops.map((stop, index) => {
      const segmentDistance = calculateDistanceKm(
        prevLoc.latitude,
        prevLoc.longitude,
        stop.latitude,
        stop.longitude
      );

      totalDistanceKm += segmentDistance;

      // Travel time + 8 mins dwell time for handover at each stop
      const travelTimeMin = (segmentDistance / averageSpeedKmh) * 60;
      const dwellTimeMin = 8;
      accumulatedTimeMin += travelTimeMin + dwellTimeMin;

      const etaDate = new Date(Date.now() + accumulatedTimeMin * 60 * 1000);

      prevLoc = { latitude: stop.latitude, longitude: stop.longitude };

      return {
        stepNumber: index + 1,
        id: stop.id,
        type: stop.type,
        name: stop.name,
        address: stop.address,
        latitude: stop.latitude,
        longitude: stop.longitude,
        segmentDistanceKm: parseFloat(segmentDistance.toFixed(2)),
        eta: etaDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        etaTimestamp: etaDate.toISOString(),
      };
    });

    // 3. Generate Polyline Coordinate Path (for Leaflet/Canvas mapping)
    const polyline = [
      [origin.latitude, origin.longitude],
      ...waypointsWithEta.map((w) => [w.latitude, w.longitude]),
    ];

    return {
      totalDistanceKm: parseFloat(totalDistanceKm.toFixed(2)),
      estimatedDurationMin: Math.round(accumulatedTimeMin),
      stopsCount: orderedStops.length,
      waypoints: waypointsWithEta,
      polyline,
      calculatedAt: new Date().toISOString(),
      algorithm: `LogisticsAgent-${this.version}-precedence-tsp`,
    };
  }
}

export const logisticsAgent = new LogisticsAgent();
export default logisticsAgent;
