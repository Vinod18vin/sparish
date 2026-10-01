#include <WiFi.h>
#include <WebServer.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <TinyGPS++.h>
#include <HardwareSerial.h>
#include <time.h>

// =====================================================
// WiFi Credentials
// =====================================================

const char* ssid     = "V2141";
const char* password = "12345678";

// =====================================================
// Firebase Realtime Database
// =====================================================

const char* firebaseUrl =
  "https://sparish-f9d5b-default-rtdb.firebaseio.com/readings.json";

// =====================================================
// Pin Definitions
// =====================================================

const int phPin   = 32;   // ADC1_CH4
const int tdsPin  = 34;   // ADC1_CH7
const int turbPin = 35;   // ADC1_CH6

#define ONE_WIRE_BUS 23   // DS18B20 Data Pin

// GPS module NEO-7M on UART2
#define GPS_RX_PIN 5     // ESP32 RX2 <- GPS TX
#define GPS_TX_PIN 16     // ESP32 TX2 -> GPS RX

// =====================================================
// Objects
// =====================================================

LiquidCrystal_I2C lcd(0x27, 16, 2);

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

WebServer server(80);

TinyGPSPlus gps;
HardwareSerial gpsSerial(2);

// =====================================================
// Latest Sensor Readings
// =====================================================

float g_ph   = 0;
float g_tds  = 0;
float g_turb = 0;
float g_temp = 0;

bool g_safe = false;

// =====================================================
// Latest GPS Reading
// =====================================================

double g_lat = 0;
double g_lng = 0;

bool g_gpsValid = false;

uint32_t g_satellites = 0;

// =====================================================
// Timing
// =====================================================

unsigned long lastSensorRead = 0;

const unsigned long SENSOR_INTERVAL_MS = 1000;


// Firebase upload every 4 seconds

unsigned long lastFirebasePush = 0;

const unsigned long FIREBASE_INTERVAL_MS = 4000;


// LCD switching

unsigned long lastLcdSwitch = 0;

int lcdScreen = 0;

// 0 = readings screen
// 1 = status screen

const unsigned long LCD_SCREEN_1_MS = 2500;
const unsigned long LCD_SCREEN_2_MS = 2000;


// =====================================================
// Read and Average ADC
// =====================================================

int readAveragedADC(int pin, int samples = 20) {

  long sum = 0;

  for (int i = 0; i < samples; i++) {

    sum += analogRead(pin);

    delay(5);
  }

  return sum / samples;
}


// =====================================================
// Get Unix Timestamp
// =====================================================

unsigned long getUnixTime() {

  time_t now;

  time(&now);

  return (unsigned long)now;
}


// =====================================================
// Build JSON
// =====================================================

String buildReadingsJson() {

  String json = "{";

  // ---------------------------------------------------
  // IMPORTANT:
  // Timestamp of the latest ESP32 reading
  // ---------------------------------------------------

  json += "\"lastUpdate\":" + String(getUnixTime()) + ",";

  // ---------------------------------------------------
  // Sensor values
  // ---------------------------------------------------

  json += "\"ph\":" +
          String(g_ph, 2) + ",";

  json += "\"tds\":" +
          String(g_tds, 0) + ",";

  json += "\"turbidity\":" +
          String(g_turb, 1) + ",";

  json += "\"temperature\":" +
          String(g_temp, 1) + ",";

  // ---------------------------------------------------
  // GPS
  // ---------------------------------------------------

  json += "\"lat\":" +
          String(g_lat, 6) + ",";

  json += "\"lng\":" +
          String(g_lng, 6) + ",";

  json += "\"gpsValid\":" +
          String(g_gpsValid ? "true" : "false") + ",";

  json += "\"satellites\":" +
          String(g_satellites) + ",";

  // ---------------------------------------------------
  // Water Safety
  // ---------------------------------------------------

  json += "\"safe\":" +
          String(g_safe ? "true" : "false");

  json += "}";

  return json;
}


// =====================================================
// Local Web Server - /data
// =====================================================

void handleData() {

  server.sendHeader(
    "Access-Control-Allow-Origin",
    "*"
  );

  server.send(
    200,
    "application/json",
    buildReadingsJson()
  );
}


// =====================================================
// CORS OPTIONS
// =====================================================

void handleOptions() {

  server.sendHeader(
    "Access-Control-Allow-Origin",
    "*"
  );

  server.sendHeader(
    "Access-Control-Allow-Methods",
    "GET, OPTIONS"
  );

  server.send(204);
}


// =====================================================
// Push Data to Firebase
// =====================================================

void pushToFirebase() {

  WiFiClientSecure client;

  // Skip certificate validation.
  // Suitable for this prototype.
  client.setInsecure();

  HTTPClient https;

  if (https.begin(client, firebaseUrl)) {

    https.addHeader(
      "Content-Type",
      "application/json"
    );

    String jsonData = buildReadingsJson();

    int httpCode = https.PUT(jsonData);

    Serial.print("Firebase push status: ");
    Serial.println(httpCode);

    if (httpCode > 0) {

      Serial.print("Firebase response: ");
      Serial.println(
        https.getString()
      );
    }

    https.end();

  } else {

    Serial.println(
      "Firebase push failed to begin connection"
    );
  }
}


// =====================================================
// Setup
// =====================================================

void setup() {

  Serial.begin(115200);

  // ===================================================
  // Temperature Sensor
  // ===================================================

  sensors.begin();


  // ===================================================
  // ADC Configuration
  // ===================================================

  analogReadResolution(12);

  analogSetAttenuation(ADC_11db);


  // ===================================================
  // GPS
  // ===================================================

  gpsSerial.begin(
    9600,
    SERIAL_8N1,
    GPS_RX_PIN,
    GPS_TX_PIN
  );


  // ===================================================
  // LCD
  // ===================================================

  lcd.init();

  lcd.backlight();

  lcd.clear();

  lcd.setCursor(0, 0);
  lcd.print("Water Monitor");

  lcd.setCursor(0, 1);
  lcd.print("Connecting WiFi");


  // ===================================================
  // WiFi Power
  // ===================================================

  WiFi.setTxPower(
    WIFI_POWER_11dBm
  );


  // ===================================================
  // Connect WiFi
  // ===================================================

  WiFi.begin(
    ssid,
    password
  );

  while (
    WiFi.status() != WL_CONNECTED
  ) {

    delay(300);

    Serial.print(".");
  }

  Serial.println();

  Serial.println(
    "WiFi Connected"
  );

  Serial.print(
    "IP address: "
  );

  Serial.println(
    WiFi.localIP()
  );


  // ===================================================
  // NTP Time
  // ===================================================

  Serial.println(
    "Synchronizing time..."
  );

  configTime(
    19800,             // UTC +5:30 India
    0,
    "pool.ntp.org",
    "time.nist.gov"
  );


  // Give NTP some time to synchronize

  time_t now = time(nullptr);

  int attempts = 0;

  while (
    now < 100000 &&
    attempts < 20
  ) {

    delay(500);

    now = time(nullptr);

    attempts++;

    Serial.print(".");
  }

  Serial.println();

  if (now > 100000) {

    Serial.println(
      "Time synchronized"
    );

    Serial.print(
      "Unix time: "
    );

    Serial.println(
      (unsigned long)now
    );

  } else {

    Serial.println(
      "WARNING: Time synchronization failed"
    );
  }


  // ===================================================
  // LCD WiFi Status
  // ===================================================

  lcd.clear();

  lcd.setCursor(0, 0);

  lcd.print(
    "WiFi Connected"
  );

  lcd.setCursor(0, 1);

  lcd.print(
    WiFi.localIP().toString()
  );

  delay(2000);


  // ===================================================
  // Local Web Server
  // ===================================================

  server.on(
    "/data",
    HTTP_GET,
    handleData
  );

  server.on(
    "/data",
    HTTP_OPTIONS,
    handleOptions
  );

  server.begin();

  Serial.println(
    "Local web server started"
  );


  // ===================================================
  // Initialize LCD Timer
  // ===================================================

  lastLcdSwitch = millis();
}


// =====================================================
// Feed GPS
// =====================================================

void feedGPS() {

  while (
    gpsSerial.available() > 0
  ) {

    gps.encode(
      gpsSerial.read()
    );
  }


  // ===================================================
  // GPS Location
  // ===================================================

  if (
    gps.location.isValid()
  ) {

    g_gpsValid = true;

    g_lat =
      gps.location.lat();

    g_lng =
      gps.location.lng();

  } else {

    g_gpsValid = false;
  }


  // ===================================================
  // Satellites
  // ===================================================

  if (
    gps.satellites.isValid()
  ) {

    g_satellites =
      gps.satellites.value();
  }
}


// =====================================================
// Read Sensors
// =====================================================

void readSensors() {

  // ===================================================
  // 1. DS18B20 Temperature
  // ===================================================

  sensors.requestTemperatures();

  g_temp =
    sensors.getTempCByIndex(0);


  // ===================================================
  // 2. pH Sensor
  // ===================================================

  int phRaw =
    readAveragedADC(
      phPin
    );

  float phVoltage =
    phRaw *
    (3.3 / 4095.0);

  g_ph =
    3.5 *
    phVoltage;


  // ===================================================
  // 3. TDS Sensor
  // ===================================================

  int tdsRaw =
    readAveragedADC(
      tdsPin
    );

  float tdsVoltage =
    tdsRaw *
    (3.3 / 4095.0);

  g_tds =
    (
      133.42 *
      pow(tdsVoltage, 3)

      -

      255.86 *
      pow(tdsVoltage, 2)

      +

      857.39 *
      tdsVoltage
    ) *
    0.5;


  if (
    g_tds < 0
  ) {

    g_tds = 0;
  }


  // ===================================================
  // 4. Turbidity
  // ===================================================

  int turbRaw =
    readAveragedADC(
      turbPin
    );

  g_turb =
    (float)(
      4095 - turbRaw
    ) *
    (10.0 / 4095.0);


  if (
    g_turb < 0
  ) {

    g_turb = 0;
  }


  if (
    g_turb > 10
  ) {

    g_turb = 10;
  }


  // ===================================================
  // 5. Safety Logic
  //
  // Turbidity is intentionally excluded
  // ===================================================

  bool phSafe =
    (
      g_ph >= 6.5 &&
      g_ph <= 8.5
    );


  bool tdsSafe =
    (
      g_tds >= 0 &&
      g_tds <= 300
    );


  bool tempSafe =
    (
      g_temp >= 20.0 &&
      g_temp <= 35.0
    );


  g_safe =
    phSafe &&
    tdsSafe &&
    tempSafe;


  // ===================================================
  // 6. Serial Output
  // ===================================================

  Serial.print("pH: ");
  Serial.print(g_ph, 2);

  Serial.print(" | TDS: ");
  Serial.print(g_tds, 0);
  Serial.print(" ppm");

  Serial.print(" | Turb: ");
  Serial.print(g_turb, 1);
  Serial.print(" NTU");

  Serial.print(" | Temp: ");
  Serial.print(g_temp, 1);
  Serial.print(" C");

  Serial.print(" | Status: ");

  Serial.print(
    g_safe
      ? "SAFE"
      : "UNSAFE"
  );

  Serial.print(" | GPS: ");


  if (
    g_gpsValid
  ) {

    Serial.print(
      g_lat,
      6
    );

    Serial.print(",");

    Serial.print(
      g_lng,
      6
    );

    Serial.print(" (");

    Serial.print(
      g_satellites
    );

    Serial.println(
      " sats)"
    );

  } else {

    Serial.println(
      "no fix"
    );
  }
}


// =====================================================
// LCD Update
// =====================================================

void updateLcd() {

  unsigned long now =
    millis();

  unsigned long elapsed =
    now - lastLcdSwitch;


  // ===================================================
  // Screen 0 → Screen 1
  // ===================================================

  if (
    lcdScreen == 0 &&
    elapsed >= LCD_SCREEN_1_MS
  ) {

    lcdScreen = 1;

    lastLcdSwitch = now;

    lcd.clear();

    lcd.setCursor(0, 0);

    lcd.print(
      "Water Status:"
    );

    lcd.setCursor(0, 1);

    lcd.print(
      g_safe
        ? "SAFE (DRINKABLE)"
        : "UNSAFE ALERT!"
    );
  }


  // ===================================================
  // Screen 1 → Screen 0
  // ===================================================

  else if (
    lcdScreen == 1 &&
    elapsed >= LCD_SCREEN_2_MS
  ) {

    lcdScreen = 0;

    lastLcdSwitch = now;

    lcd.clear();

    lcd.setCursor(0, 0);

    lcd.print("pH:");
    lcd.print(
      g_ph,
      1
    );

    lcd.print(" TDS:");
    lcd.print(
      (int)g_tds
    );


    lcd.setCursor(0, 1);

    lcd.print("NTU:");
    lcd.print(
      g_turb,
      1
    );

    lcd.print(" T:");
    lcd.print(
      g_temp,
      1
    );

    lcd.print("C");
  }
}


// =====================================================
// Main Loop
// =====================================================

void loop() {

  // ===================================================
  // Handle Local Web Server
  // ===================================================

  server.handleClient();


  // ===================================================
  // GPS
  // ===================================================

  feedGPS();


  unsigned long now =
    millis();


  // ===================================================
  // Read Sensors
  // ===================================================

  if (
    now - lastSensorRead >=
    SENSOR_INTERVAL_MS
  ) {

    lastSensorRead = now;

    readSensors();
  }


  // ===================================================
  // Firebase Upload
  // ===================================================

  if (
    now - lastFirebasePush >=
    FIREBASE_INTERVAL_MS
  ) {

    lastFirebasePush = now;

    pushToFirebase();
  }


  // ===================================================
  // LCD
  // ===================================================

  updateLcd();
}