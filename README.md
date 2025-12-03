# Kajak Kalender

A calendar integration application built with Astro and Azure Functions that provides calendar access for club activities.

## 🏗️ Architecture

This repository contains two main components:
- **Frontend** (`/site`): Astro-based static site with Starlight documentation framework
- **Backend** (`/func`): Azure Functions API for calendar data processing and authentication

## 🚀 Quick Start

### Prerequisites

- Node.js >22.0.0
- Azure Functions Core Tools
- Azure Static Web Apps CLI (SWA CLI)

### Installation

1. Install SWA CLI globally:
```bash
npm install -g @azure/static-web-apps-cli
```

2. Install dependencies for both components:
```bash
# Install frontend dependencies
npm --prefix ./site install

# Install backend dependencies
npm --prefix ./func install
```

### Development Setup

1. Configure local settings in `func/local.settings.json`:
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "Client_Secret": "your_client_secret",
    "Client_Id": "your_client_id", 
    "Site_id": "your_site_id",
    "Hashing_Key": "your_hashing_key",
    "Table_ConnectionString": "your_azure_table_storage_connection_string"
  }
}
```

2. Start the development environment:
```bash
swa start ./site --api-location ./func --run "npm --prefix ./site run dev" --app-devserver-url http://localhost:4321
```

This will start:
- Astro dev server on http://localhost:4321
- Azure Functions runtime for the API
- SWA CLI proxy to connect them

## 🔧 Configuration

### Required Secrets

The application requires the following configuration values:

- **Client_Secret**: OAuth client secret for authentication
- **Client_Id**: OAuth client identifier  
- **Site_id**: Site identifier from the member portal
- **Hashing_Key**: Key used for link encryption/decryption. Just generate a random UUID
- **Table_ConnectionString**: Azure Table Storage connection string for data persistence. Create a table storage manually in the Aure Portal.

### Obtaining Secrets

The client credentials and site ID are extracted from the member portal application using reverse engineering techniques:

> **Note**: These values are obtained through analysis of the member portal app using Frida server on a rooted Android emulator. For the Frida server implementation and extraction process, see the related [Frida Server Project](https://github.com/example/frida-server-project).

## 📁 Project Structure

```
kajak-kalender/
├── func/                          # Azure Functions API
│   ├── src/
│   │   ├── functions/
│   │   │   ├── GetCalendarData.ts # Calendar data retrieval endpoint
│   │   │   └── GetCalendarLink.ts # Calendar link generation endpoint
│   │   └── utils/
│   │       ├── AkkkLogin.ts       # Authentication handling
│   │       ├── LinkCrypto.ts      # Link encryption/decryption
│   │       └── TableAccess.ts     # Azure Table Storage access
│   ├── host.json                  # Functions runtime configuration
│   ├── local.settings.json        # Local development settings
│   └── package.json
└── site/                          # Astro frontend
    ├── src/
    │   ├── components/
    │   │   ├── AkkkLogin.astro    # Login component
    │   │   ├── LinkInputBox.astro # Link input interface
    │   │   └── Empty.astro
    │   └── content/
    │       └── docs/              # Documentation content
    ├── astro.config.mjs
    └── package.json
```

## 🛠️ Available Scripts

### Site (Frontend)
```bash
npm --prefix ./site run dev      # Start development server
npm --prefix ./site run build    # Build for production
npm --prefix ./site run preview  # Preview production build
```

### Functions (Backend)
```bash
npm --prefix ./func run start    # Start Functions runtime
npm --prefix ./func run clean    # Clean compiled files
npm --prefix ./func run build    # Start Functions runtime
```

## 🔗 API Endpoints

- `GET /api/GetCalendarData` - Retrieve calendar events and activities
- `GET /api/GetCalendarLink` - Generate encrypted calendar subscription links

## 🚀 Deployment

This application is designed to be deployed as an Azure Static Web App with integrated Azure Functions backend. Use the VS code Static Web app + Azure extension to generate the appropriate GitHub Action YAML.

