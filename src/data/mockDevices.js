/* =========================================================
   MOCK DEVICE REGISTRY
   ---------------------------------------------------------
   Only one physical unit right now, so only one entry.
   When the real backend/API is ready, replace this file
   with a fetch() call that returns the same shape:
   { id, name, location, status }
========================================================= */

export const DEVICES = [
  {
    id: "01",
    name: "Sparish Device",
    location: "NKCOE",
    status: "online", // "online" | "offline"
  },
];

export function getDeviceById(id) {
  return DEVICES.find((device) => device.id === id) || null;
}
