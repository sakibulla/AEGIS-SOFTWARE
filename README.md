# A.E.G.I.S.
**Autonomous Emergency Ground Intelligence Swarm**

*A low-cost, COTS-based swarm of ground robots that responds to indoor emergencies — mapping the space, checking on people, and detecting hazards — so help doesn't have to wait for a human to arrive first.*

📺 **Project overview video:** [Watch on YouTube](https://www.youtube.com/watch?v=Inbc1NvTbIw)

---

## The Problem

Most homes and small buildings only have passive safety tools — fixed cameras and alarms:

- **Blind spots** — fixed cameras miss closed rooms and corners
- **No context** — an alarm goes off, but nobody knows if it's a false alarm or someone is actually trapped
- **No action** — alerts just... alert. They can't go check, and they can't help.

## The Solution

A.E.G.I.S. is a team of three small autonomous robots that work together like a hive — no central controller, no single point of failure. Each robot has a distinct job:

| Robot | Role | What it does |
|---|---|---|
| 🟦 **Pathfinder** | Explorer | Maps the space, finds doors and obstacles, shares the map with the team |
| 🟧 **Guardian** | Rescue | Listens for calls for help, checks on people, carries a first-aid box |
| 🟥 **Warden** | Hazard Control | Watches for fire and gas leaks, searches for trapped people after a fire |

They talk to each other wirelessly in real time, so if one robot goes offline, the other two keep working. Everything is viewable live on a central dashboard — video feeds, maps, alerts, and status.

**Total cost to build all three robots: ~$453 USD (55,670 BDT)** — a fraction of the cost of comparable commercial or research robotics platforms.

## Why It's Different

- **Actually does something** — instead of just alerting, the robots physically go check, assess, and even deliver first aid
- **No single point of failure** — fully decentralized; the mission continues even if a robot fails
- **Cheap and reproducible** — built entirely from off-the-shelf parts (ESP32s, common sensors), no custom hardware
- **Built for real emergencies** — designed around the situations that actually happen most: fires, gas leaks, falls, intrusions

## Who It's For

- **Homes** — active protection against fire, gas leaks, falls, and intrusions, no subscription needed
- **Small offices & shops** — an affordable alternative to expensive single-purpose security systems
- **Under-resourced areas** — low-cost, locally buildable emergency response where professional services are slow or limited

## Project Status

Built as a senior design project at the Department of ECE, North South University.

- ✅ **Phase 1 — Lab Prototype:** Core architecture validated, individual components tested
- 🔄 **Phase 2 — Controlled Testing:** Full swarm integration and scenario rehearsals (in progress)
- ⏳ **Phase 3 — Real-World Pilots:** Campus building and residential trials
- ⏳ **Phase 4 — Release:** Open-source publication or commercial partnership

## Team

**Shahriar Jaman** · **MD Sakib Sarker** · **Ahmed Sadman Sadik** · **Mohammed Bin Ahmed** · **Zahid Hasan Rana** · **Md. Fahmidul Hasan**

Supervised by **Dr. Shahnewaz Siddique**, Associate Professor, Department of ECE, North South University

---

## Repository Contents

This repo contains the mobile app used as the live command dashboard for the swarm — showing video feeds, maps, alerts, and manual controls. For technical setup and development details, see [`docs/APP_SETUP.md`](docs/APP_SETUP.md) *(coming soon)*.