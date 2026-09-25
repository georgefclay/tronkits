---
title: "Raspberry Pi Colocation Setup"
slug: "raspberry-pi-node-nginx-colocation"
date: "2026-04-04"
description: "Set up a Raspberry Pi as a Node.js web server for colocation: Pi OS Lite, PM2, an Nginx reverse proxy, a UFW firewall and a static IP."
category: "pi"
difficulty: 3
steps: 11
minutes: 45
tags: ["raspberry-pi", "nodejs", "nginx", "linux", "self-hosting"]
---

Node.js Server with Nginx Reverse Proxy (Debian 12 Bookworm).

## 1. Initial OS Setup

- Install **Raspberry Pi OS Lite (Debian 12 Bookworm)** using Raspberry Pi Imager.
- Enable **SSH** and set a hostname during imaging.
- Boot and SSH into the Pi.

## 2. Disable Wi-Fi and Bluetooth

```
sudo nano /boot/firmware/config.txt
# Add at the bottom
dtoverlay=disable-wifi
dtoverlay=disable-bt

sudo reboot
```

## 3. Update and upgrade

```
sudo apt update
sudo apt upgrade -y
```

## 4. Install Node.js and NPM

```
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v && npm -v
```

## 5. Install project dependencies

```
cd ~/tronkits
npm install
```

## 6. Install OpenSCAD (for STL generation)

```
sudo apt install -y openscad
```

## 7. PM2 process manager

```
sudo npm install -g pm2
cd ~/tronkits
pm2 start app.js --name tronkits
pm2 save
pm2 startup
```

## 8. Nginx reverse proxy

```
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/default
```

```
server {
  listen 80;
  server_name _;
  location / {
    proxy_pass http://localhost:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

```
sudo systemctl restart nginx
```

## 9. UFW firewall

```
sudo apt install ufw
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw limit 22/tcp
sudo ufw logging on
sudo ufw enable
sudo ufw status verbose
```

## 10. Static IP for colocation

```
sudo nmcli con add type ethernet ifname eth0 con-name static-eth0 ipv4.method manual \
  ipv4.addresses 154.9.0.34/30 ipv4.gateway 154.9.0.33 \
  ipv4.dns "8.8.8.8 1.1.1.1" ipv6.method ignore
sudo nmcli con up static-eth0
```

## 11. Pre-ship checklist

- Confirm all services running.
- Shutdown cleanly: `sudo shutdown now`
- Package your Pi securely for shipment.
