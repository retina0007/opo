# 🚀 VAPI Demo Builder

Ein vollständiger VAPI Demo Builder mit SaaS-Konfiguration, Session-Management und professionellem Branding.

## ✨ Features

- **VAPI Integration** - Vollständige VAPI-Assistant-Integration
- **SaaS-Konfiguration** - Vollständig anpassbare Demo-Seiten über Admin-Interface
- **Session Management** - Redis-basierte Session-Verwaltung
- **Professional Branding** - Anpassbare Farben, Logo und Texte
- **Platzhalter-System** - Dynamische Texte mit {customer_name}, {company_name}, etc.
- **Coolify Ready** - Ein-Klick-Deployment bei Coolify
- **Health Monitoring** - Vollständige Health Checks

## 🎯 Schnellstart

### 1. Repository klonen
```bash
git clone https://github.com/BIFROTEK-com/vapi-demo-coolify.git
cd vapi-demo-coolify
```

### 2. Environment konfigurieren
```bash
cp .env.example .env
# Bearbeiten Sie .env mit Ihren Werten
```

### 3. Bei Coolify deployen
1. Neues Projekt in Coolify erstellen
2. Repository verbinden
3. Docker Compose als Build-Methode wählen
4. `docker-compose.yaml` als Konfigurationsdatei verwenden
5. Environment Variables aus `.env` eintragen
6. Deploy starten

## 📋 Voraussetzungen

- Coolify-Instanz
- VAPI-Account mit API-Keys
- Domain für Ihre Anwendung

## 🔧 Konfiguration

### VAPI-Konfiguration
1. Gehen Sie zu [VAPI Dashboard](https://dashboard.vapi.ai)
2. Erstellen Sie einen neuen Assistant
3. Kopieren Sie die Keys in Ihre `.env`-Datei

### Admin-Interface
Nach dem Deployment:
1. Gehen Sie zu `https://ihre-domain.com/config`
2. Melden Sie sich mit dem Admin-Passwort an
3. Konfigurieren Sie alle Texte, Farben und Logos
4. Verwenden Sie Platzhalter für dynamische Inhalte

## 📊 Services

Die Anwendung besteht aus 2 Services:

1. **vapi-demo** - Hauptanwendung (Port 8000)
2. **redis** - Session-Management

## 🔍 Health Checks

- **App Health:** `https://ihre-domain.com/health`
- **API Status:** `https://ihre-domain.com/api/config-status`

## 🎨 SaaS-Konfiguration

### Verfügbare Platzhalter
- `{customer_name}` - Name des Kunden
- `{company_name}` - Firmenname
- `{customer_domain}` - Domain des Kunden
- `{customer_email}` - E-Mail des Kunden

### Konfigurierbare Felder
- **Hero-Bereich:** Titel und Text
- **Willkommensnachricht:** Persönliche Begrüßung
- **CTA-Text:** Call-to-Action Button
- **Calendly-Link:** Terminbuchung
- **Erste Chat-Nachricht:** KI-Assistent Begrüßung
- **Powered By:** Branding-Informationen
- **Farben:** Primär-, Sekundär- und Akzentfarben
- **Logo:** Firmenlogo

## 📚 API Endpoints

- `GET /webapp` - Haupt-Demo-Seite
- `GET /config` - Admin-Konfiguration
- `GET /api/saas-config` - SaaS-Konfiguration abrufen
- `POST /api/saas-config` - SaaS-Konfiguration speichern
- `GET /health` - Health Check

## 🛠️ Support

Bei Problemen:
1. Prüfen Sie die Logs in Coolify
2. Testen Sie die Health Checks
3. Kontaktieren Sie den Support

## 📄 Lizenz

MIT License - siehe [LICENSE](LICENSE) für Details.

## 🤝 Contributing

Contributions sind willkommen! Bitte erstellen Sie einen Pull Request.

---

**Ihre VAPI Demo ist bereit für den Einsatz!** 🚀