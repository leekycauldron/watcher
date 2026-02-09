# WATCHER — Smart Security Camera System

**Pi Camera Module → PC Processing Hub → Tailscale Remote Access**

A Raspberry Pi camera mounted to a window streams video to a local Windows PC, which handles all detection, alerting, recording, and serves a web dashboard accessible anywhere via Tailscale.

---

## Stream Sources (Pi → mediamtx)

| Protocol | URL |
|----------|-----|
| RTSP | `rtsp://192.168.2.150:8554/cam` |
| WebRTC | `http://192.168.2.150:8889/cam` |
| API | `http://192.168.2.150:9997/v3/paths/list` |

---

## Architecture

```
Raspberry Pi                    Windows PC                         Remote
─────────────                   ──────────                         ──────
Camera capture                  Receive RTSP stream                Tailscale VPN
H.264 HW encode       →        Motion detection (MOG2)            Dashboard access
RTSP out via mediamtx           Object detection (YOLOv8n GPU)     Live stream
                                Rule engine evaluation             Discord webhook alerts
                                Alarm sound playback
                                Event recording + history
                                Re-stream via WebRTC/HLS
                                Serve dashboard UI
```

## Tech Stack

- **Backend:** Python / FastAPI
- **Frontend:** React (Vite) + TailwindCSS
- **CV:** OpenCV MOG2 background subtraction
- **Object Detection:** YOLOv8n (nano) with CUDA
- **Stream Ingest:** OpenCV VideoCapture (RTSP)
- **Stream Re-serve:** mediamtx (WebRTC + HLS)
- **Database:** SQLite + filesystem (clips/snapshots)
- **Alerts:** pygame (local alarm), Discord Webhook (remote)
- **Remote Access:** Tailscale
- **Scheduling:** APScheduler (auto-delete, health checks)

## Latency Profile

| Segment | Latency |
|---------|---------|
| Pi capture + encode | 50–100ms |
| LAN transfer | 1–5ms |
| Motion detection (CPU) | 5–15ms |
| Object detection (GPU) | 20–50ms |
| **Total local** | **~150–300ms** |
| Tailscale overhead | +10–80ms |
| **Total remote** | **~200–500ms** |

---

## Data Model

### events
Stores every detection — timestamp, event type (person/vehicle/animal/motion), confidence score, zone reference, alert level (critical/warning/info/suppressed), duration, snapshot path, clip path, and bounding box metadata as JSON.

### zones
Named polygon regions drawn on the camera frame — stores the polygon point coordinates, display color, and enabled state.

### rules
User-defined alert rules — matches on object type, zone, time window (supports overnight spans like 22:00–06:00), and minimum linger duration. Each rule specifies its alert level and actions: play alarm, send Discord webhook, save clip. Rules have priority ordering and can be enabled/disabled.

### config
Key-value store for system settings: RTSP URL, detection thresholds, alarm file path, Discord webhook URL, auto-delete retention days, stream resolution, recording buffer length.

### Filesystem
- Snapshots: `/watcher/snapshots/YYYY-MM-DD/event_{id}.jpg`
- Clips: `/watcher/clips/YYYY-MM-DD/event_{id}.mp4`
- Alarm: `/watcher/audio/alarm.wav`
- DB: `/watcher/watcher.db`
- Logs: `/watcher/logs/watcher.log`

---

## API Endpoints

### Stream
- `GET /api/stream/snapshot` — current frame as JPEG
- `GET /api/stream/mjpeg` — MJPEG stream fallback
- `GET /api/stream/status` — FPS, resolution, connection health

### Events
- `GET /api/events` — list with filters (date, type, zone, alert level), paginated
- `GET /api/events/{id}` — single event detail
- `DELETE /api/events/{id}` — delete event + files
- `DELETE /api/events/bulk` — bulk delete by date range or IDs
- `GET /api/events/{id}/snapshot` — serve snapshot image
- `GET /api/events/{id}/clip` — serve video clip
- `GET /api/events/stats` — aggregates (events/day, by type, by zone)

### Zones
- `GET /api/zones` — list all
- `POST /api/zones` — create (name, polygon points, color)
- `PUT /api/zones/{id}` — update
- `DELETE /api/zones/{id}` — delete (cascades to rules)
- `GET /api/zones/reference-frame` — current camera frame for zone drawing

### Rules
- `GET /api/rules` — list by priority
- `POST /api/rules` — create
- `PUT /api/rules/{id}` — update
- `DELETE /api/rules/{id}` — delete
- `POST /api/rules/reorder` — reorder priorities
- `POST /api/rules/{id}/test` — dry-run against last 24h of events

### Config
- `GET /api/config` — all settings
- `PUT /api/config/{key}` — update setting
- `POST /api/config/alarm/test` — play alarm sound
- `POST /api/config/alarm/upload` — upload new alarm file
- `GET /api/config/storage` — disk usage breakdown

### System
- `GET /api/system/health` — CPU, RAM, GPU, disk, stream status
- `POST /api/system/arm` — enable detection + alerting
- `POST /api/system/disarm` — stream only, no alerts
- `GET /api/system/status` — armed state, uptime, active rules
- `WS /ws/events` — real-time event push to dashboard

---

## Dashboard Design Language

The dashboard follows a cybernetic, Tony Stark / Iron Man HUD aesthetic throughout. This is not a skin — it defines how every component looks and feels.

**Visual Identity:**
- Dark base (`#0a0a0f` to `#12121a`) with deep blue-black panels
- Cyan/electric blue (`#00f0ff`) as the primary accent for active elements, borders, and data highlights
- Secondary accents: amber/orange for warnings, red for critical alerts, green for healthy/armed states
- Subtle scan-line or grid overlay texture on backgrounds
- Thin glowing borders (1px cyan with soft box-shadow glow) on cards and panels
- Monospace font for data readouts (timestamps, FPS, coordinates), clean sans-serif for labels

**Component Patterns:**
- Cards and panels have clipped corners (angled/chamfered, not rounded) to evoke HUD framing
- Status indicators use pulsing dots or animated rings rather than static badges
- Progress bars and gauges styled as arc reactors or circular HUD elements
- Transitions use fade + slight scale, no bouncy animations
- Data tables have subtle row hover glow effects
- Buttons have a beveled/tech feel with glow on hover

**Live View Specific:**
- Stream has a thin HUD frame overlay with corner brackets
- Bounding boxes drawn with targeting reticle style (corner lines, not full rectangles)
- Zone overlays use translucent fills with glowing polygon edges
- Status readouts (FPS, resolution, armed state) positioned as floating HUD elements on the stream

**Navigation — iOS 26 Liquid Glass Slider:**

The bottom tab bar and any segmented controls use a sliding glass indicator inspired by iOS 26's Liquid Glass. When switching tabs, a translucent frosted-glass pill slides smoothly to the active tab rather than snapping. This is the primary navigation micro-interaction across the entire dashboard.

Implementation approach (CSS/React):
- The tab bar container is `position: relative` with all tab items in a flex row
- A single indicator element sits behind the tab icons as an `position: absolute` pseudo-element
- The indicator uses `backdrop-filter: blur(16px) saturate(180%)` with a translucent fill (`rgba(0, 240, 255, 0.08)`) and a subtle `1px` border of `rgba(0, 240, 255, 0.25)` to create the glass refraction look
- On tab change, the indicator's `transform: translateX()` and `width` are animated via CSS `transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1)` — this gives the fluid, slightly overshooting spring feel that Liquid Glass uses
- The indicator should subtly morph width during transition (slightly squish/stretch via `scaleX` at the midpoint) to mimic the gel-like fluidity — use a keyframe animation or layered transitions
- A soft `box-shadow: 0 0 20px rgba(0, 240, 255, 0.15)` glow follows the indicator
- Tab icons/labels crossfade opacity (inactive: `0.5`, active: `1.0`) with the same easing curve
- On hover (desktop), the indicator shows a faint preview ghost at the hovered tab position
- The same sliding glass pill pattern applies to any segmented controls in the UI (e.g., grid/list toggle on Event History, filter tabs)

This effect is purely CSS transitions + a React state tracking the active tab index and computing the indicator's X offset and width from tab element refs. No animation library required.

**Mobile-First Design:**
- All layouts designed for mobile viewport first, then scale up for tablet/desktop
- Bottom navigation bar on mobile (thumb-friendly), expands to sidebar on desktop
- Stream view fills the full mobile viewport with floating HUD overlays
- Touch-friendly tap targets (minimum 44px), swipe gestures for event history navigation
- Zone editor supports touch drawing (tap to place vertices, long-press to drag)
- Single-column card layout on mobile, grid on desktop
- Collapsible panels — settings and filters hidden behind slide-out drawers on mobile
- Critical controls (arm/disarm, alarm silence) always accessible without scrolling

**Dashboard-Wide:**
- Sidebar navigation on desktop, bottom tab bar on mobile, icon-based with subtle glow on active page
- System health displayed as a mini HUD widget (CPU/RAM/GPU as arc gauges)
- Event cards show threat level with color-coded edge accents
- Toast notifications slide in with a tech/holographic feel
- Progressive disclosure — mobile shows essential data first, expand for detail

---

## Dashboard Pages

### Live View (Home)
Full-width live stream (WebRTC, MJPEG fallback) with HUD frame overlay, zone overlays, and targeting-reticle bounding boxes. Floating status readouts for armed/disarmed state, FPS, connection health. Recent events sidebar with thumbnail cards. Quick arm/disarm toggle styled as a reactor power switch.

### Event History
Filterable event log with date range, type, zone, and alert level. Grid/list view toggle. Click to expand with full snapshot, clip playback, and metadata. Bulk select + delete. CSV export.

### Zone Editor
Reference frame displayed full-width. Click-to-draw polygon tool for defining zones. Existing zones shown as glowing colored overlays. Drag vertices to edit. Zone list with name, color picker, enable/disable, delete.

### Rules Manager
Sortable rule list (drag-to-reorder priority). Rule builder form with object type, zone, time window, duration, alert level, and action toggles (play alarm, Discord webhook, save clip). Dry-run test button. Pre-built templates: "Night Watch", "Daytime Logger", "Vehicle Alert".

### Settings
Stream config (Pi RTSP URL, resolution, FPS). Detection thresholds (motion, YOLO confidence). Alert config (alarm upload/test, Discord webhook URL, cooldown). Storage (auto-delete days, manual purge, disk usage). System (logs viewer, restart pipeline, Tailscale status).

---

## Development Stages

### Stage 1: Stream Ingest + Basic Dashboard

Get the Pi's RTSP stream received on the PC and displayed in a web dashboard. Set up FastAPI project structure, StreamManager class with auto-reconnect, mediamtx for re-streaming, React scaffold with cybernetic HUD theme, live stream embed, and verify Tailscale remote access.

**Done when:** Stream displays in browser within 2 seconds, recovers from Pi disconnect within 10 seconds, and works on mobile over Tailscale.

---

### Stage 2: Detection Pipeline
*Depends on Stage 1*

Add motion detection and object classification. Build MOG2 motion detector, YOLOv8n object detector (GPU), pipeline orchestrator that triggers YOLO only on motion, centroid tracker for linger duration, SQLite event storage, and snapshot/clip saving with a rolling buffer. Wire targeting-reticle bounding boxes into the live stream view.

**Done when:** Walking past the camera triggers a "person" event within 1 second, empty scenes produce zero events, pipeline runs at 15+ FPS.

---

### Stage 3: Zones + Rules Engine
*Depends on Stage 2*

Implement zone polygons with `pointPolygonTest`, build the interactive zone editor UI, create the rule engine that evaluates events against prioritized rules (matching on object type, zone, time, duration), wire up alarm playback via pygame, and build the rules manager UI with templates and dry-run testing.

**Done when:** Zones correctly filter detections, rules fire only for exact matches, alarm plays within 1 second of critical match, dry-run accurately replays history.

---

### Stage 4: Notifications + History Management
*Depends on Stage 3*

Add Discord webhook notifications with embedded snapshots, build the full event history page with filters and bulk operations, CSV export, APScheduler auto-delete job, storage usage tracking, and WebSocket real-time event push to the dashboard.

**Done when:** Discord webhook fires within 3 seconds with snapshot embed, history filters work in combination, auto-delete cleans old events and files, WebSocket pushes within 500ms.

---

### Stage 5: Hardening + Polish
*Depends on Stage 4*

Global arm/disarm (dashboard + Discord bot commands), graceful error handling for all failure modes (stream drop, YOLO crash, disk full, API failures), performance profiling, structured logging with dashboard viewer, Windows startup automation with health checks, and full cybernetic UI polish across all pages and mobile.

**Done when:** System recovers from failures without intervention, runs stable 48+ hours, dashboard works on mobile, boots and is operational within 30 seconds.

---

## Summary

| # | Stage | Outcome |
|---|-------|---------|
| 1 | Stream Ingest + Dashboard | Live stream viewable locally and over Tailscale |
| 2 | Detection Pipeline | Motion + object detection with event logging |
| 3 | Zones + Rules Engine | Zone filtering, configurable rules, alarm playback |
| 4 | Notifications + History | Discord alerts, event history, auto-delete |
| 5 | Hardening + Polish | Production reliability, auto-start, cybernetic UI |

Each stage produces a working system. Stage 1 alone gives you a functional security camera viewable anywhere.