// Points at your Firebase Realtime Database. Firebase returns JSON in
// exactly the same shape the ESP32's own /data endpoint used to, so
// nothing else in the app needed to change — useLiveReadings.js and
// useDeviceConnection.js still just do fetch(ESP32_URL) as before.
export const ESP32_URL = "https://sparish-f9d5b-default-rtdb.firebaseio.com/readings.json";