# Workflow: Firmware & Frontend Communication Multi-Agent SOP

This Standard Operating Procedure (SOP) coordinates the 4 specialized hardware/firmware-to-frontend AI subagents to design, implement, integrate, and test real-time communication between embedded devices (Raspberry Pi/ESP32) and frontend clients (Android App & Web Admin).

---

## Phase 1: Protocol & Schema Architecture Design
- **Agent Assigned**: `firmware-architect`
- **Actions**:
  1. Define event payloads for hardware sensors (HX711 scale, GM65 scanner, AI camera, cart lock solenoid).
  2. Choose transmission channel (WebSockets, MQTT, HTTP REST, UART/Serial frames).
  3. Define sequence flow, state machine, and error reconnection rules.
- **Exit Gate**: Hardware-to-Frontend Protocol Spec document approved.

---

## Phase 2: Embedded Firmware Driver & Telemetry Implementation
- **Agent Assigned**: `firmware-developer`
- **Actions**:
  1. Implement hardware sensor readers (Python/C++ on Raspberry Pi/ESP32).
  2. Apply noise filtering, tare calculation, and anomaly detection.
  3. Broadcast telemetry events over WebSocket/MQTT conforming to Phase 1 spec.
- **Exit Gate**: Hardware drivers emitting clean events locally and over network.

---

## Phase 3: Bridge & Real-Time Frontend Integration
- **Agent Assigned**: `firmware-bridge-developer`
- **Actions**:
  1. Build WebSocket / Socket.io gateway bridge server to aggregate hardware events.
  2. Connect Android App (StateFlow ViewModels) and Web Admin (Next.js components) to live event streams.
  3. Handle automatic reconnection, buffer queueing, and UI state sync.
- **Exit Gate**: Real-time sensor events reflect instantly in Android App and Web Admin UI.

---

## Phase 4: Hardware Simulation & End-to-End Latency QA
- **Agent Assigned**: `firmware-qa-tester`
- **Actions**:
  1. Run hardware telemetry simulators (simulating weight scale fluctuations, item additions, network dropouts).
  2. Benchmark end-to-end latency (<100ms requirement).
  3. Verify anomaly alerts (unscanned items, weight mismatches) trigger overlay screens correctly.
- **Exit Gate**: 100% telemetry tests pass with clean reconnection & zero state desynchronization.
