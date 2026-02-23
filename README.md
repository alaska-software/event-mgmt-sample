# Event Management Sample

A simple event management web application built with [Xbase++](https://www.alaska-software.com/) and [CXP (Compiled Xbase++ Pages)](https://doc.alaska-software.com/content/cxp_h1_technical_concepts.cxp) by Alaska Software. The application features both a public event calendar for browsing upcoming events and an internal management interface for creating, editing, and deleting events.

## About CXP

**Compiled Xbase++ Pages (CXP)** is a build and execution infrastructure for creating dynamic web applications. CXP pages combine HTML markup with Xbase++ server-side code — similar in concept to ASP or PHP — but with a key difference: CXP pages are compiled to native code (DLLs) on first access, delivering significantly better performance than traditional scripting solutions.

CXP supports a unified web platform, meaning the same views can be used both behind a web server (IIS, Apache) and in standalone mode via a built-in `HttpEndpoint`. Key features include automatic session management, layout composition, pagelets, internationalization, and built-in data persistence.

For a complete introduction, see the [CXP Technical Concepts](https://doc.alaska-software.com/content/cxp_h1_technical_concepts.cxp) documentation.

## Features

**Public Event Calendar** (`show-events.cxp`) — Browse upcoming events displayed as tiles with date badges. Select events and download them as an `.ics` file for import into Outlook, Thunderbird, or other calendar applications.

**Internal Event Management** (`list-events.cxp`) — Add, edit, and delete events through a tabular management interface. Supports setting event title, dates, city, and country.

**Detailed Event Editing** (`edit-event.cxp`) — Full event editing form with fields for title, description, start/end dates and times, category, status, languages, location, contact information, and event URL.

**iCalendar Export** (`export-events.cxp`) — Export selected (or all) events as a standard `.ics` file using the built-in `VCalendar`/`VEvent` classes.

**Dynamic Date Badges** (`datebadge.cxp`) — GIF images showing the day and month are generated on-the-fly using the Xbase++ graphics engine — a great example of CXP returning binary content instead of HTML.

**Session-based Event Selection** (`toggle-event.cxp`) — Users can mark events for download, with selections tracked via CXP's automatic session management.

## CXP Concepts Demonstrated

This sample showcases several core CXP and Xbase++ web development techniques:

- **Site layouts** — A shared `site.layout` file defines the common HTML structure (header, footer, navigation, asset references) using the `@RENDER Body` directive to inject page-specific content.
- **Application configuration** — The `application.config` XML file externalizes data paths and display settings (max events, date range), accessed at runtime via `::application:Config`.
- **Helper DLLs** — Reusable Xbase++ code is compiled into helper DLLs (`event-helper.dll`, `ical-helper.dll`) and loaded by CXP pages automatically.
- **Database access** — Events are stored in DBF/CDX tables (FoxPro-compatible) and accessed using standard Xbase++ ISAM commands (`USE`, `DbSeek`, `DbAppend`, etc.).
- **Alaska WebUI** — Client-side integration via `data-action`, `data-parameter`, `data-confirm`, and `data-css-target` attributes for asynchronous CXP page calls without full-page reloads.
- **Pagelets** — The `::renderPage()` method is used to compose pages from other CXP pages (e.g., rendering the edit form after adding an event).
- **Binary content generation** — The `datebadge.cxp` page uses `XbpBitmap` and the Xbase++ graphics engine to create GIF images returned via `::HttpResponse:WriteBinary()`.
- **Session management** — Selected events are stored in `::Session:SelectedCommunityEvents`, automatically persisted across requests by the CXP infrastructure.

## Prerequisites

- **Xbase++ 2.0** (or later) — Professional or Foundation Edition
- **Xbase++ Workbench** — For project management, editing, and debugging
- **CXP Runtime** — Included with the Xbase++ installation

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/alaska-software/event-mgmt-sample.git
cd event-mgmt-sample
```

### 2. Open in Xbase++ Workbench

Open `project.xpj` in the Xbase++ Workbench. The project is configured with three build targets:

| Target | Description |
|---|---|
| `event-management.web` | The CXP web application (all `.cxp` pages and the layout) |
| `helpers/ical-helper.dll` | Helper DLL for iCalendar (.ics) file generation |
| `helpers/event-helper.dll` | Helper DLL with utility functions (data paths, formatting, etc.) |

### 3. Build and Run

Build the project from the Workbench, then run it. The entry point is `index.cxp`, which is configured as the host process in the project file. Navigate to the application in your browser to see the home page with two tiles:

- **Browse Events** — Public event calendar
- **Manage Events** — Internal management interface

## Project Structure

```
event-mgmt-sample/
├── index.cxp               # Home page with navigation tiles
├── show-events.cxp         # Public event calendar (tile view)
├── show-event.cxp          # Event detail view
├── list-events.cxp         # Internal event management (table view)
├── add-event.cxp           # Add a new event
├── edit-event.cxp          # Edit an existing event
├── save-event.cxp          # Persist event changes to database
├── delete-event.cxp        # Delete an event
├── toggle-event.cxp        # Toggle event selection (session-based)
├── export-events.cxp       # Export selected events as .ics file
├── datebadge.cxp           # Dynamic GIF date badge generator
├── site.layout             # Shared layout (header, footer, assets)
├── application.config      # Application configuration (data paths, display settings)
├── project.xpj             # Xbase++ Workbench project file
├── data/
│   ├── events.dbf/.cdx     # Events table and index
│   ├── event_keys.dbf/.cdx # Lookup table for categories, statuses
│   └── country.dbf/.cdx    # Country reference table
├── helpers/
│   ├── event-helper.prg    # Utility functions (paths, formatting, links)
│   ├── ical-helper.prg     # VCalendar/VEvent classes for .ics generation
│   ├── *.dll / *.lib       # Pre-built helper binaries
│   └── project.xpj         # Helper sub-project
└── assets/
    ├── css/                 # Metro Bootstrap CSS framework
    ├── js/                  # jQuery, Metro UI, Alaska WebUI, validators
    ├── fonts/               # Icon font files
    └── sumoselect/          # SumoSelect jQuery plugin (multi-select dropdowns)
```

## Configuration

The `application.config` file controls runtime behavior:

```xml
<config>
   <helpers lib="event-helper.lib" lib="ical-helper.lib" />
   <events path=".\data\"
           showmax="10"
           showdaysahead="335"
           showdaysbefore="30" />
</config>
```

- **path** — Relative path to the DBF data files
- **showmax** — Maximum number of events to display
- **showdaysahead** — How many days into the future to show events
- **showdaysbefore** — How many past days to still show events

## Documentation & Resources

- [CXP Technical Concepts](https://doc.alaska-software.com/content/cxp_h1_technical_concepts.cxp) — Core architecture and concepts
- [CXP Programming Guide](https://doc.alaska-software.com/content/cxp_h1_programming_guide.cxp) — In-depth development guide
- [CXP Samples](https://samples.alaska-software.com/cxp-features/index.cxp) — Interactive, runnable CXP examples
- [Alaska Software Website](https://www.alaska-software.com/) — Product information and downloads
- [Xbase++ Features & Technologies](https://www.alaska-software.com/products/features-list.cxp) — Full platform overview

## License

Copyright © 2025 Alaska Software. All rights reserved.
