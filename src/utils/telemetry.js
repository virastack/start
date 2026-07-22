import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { getCliVersion } from "./package-info.js";

const CONFIG_DIR = path.join(os.homedir(), ".virastack");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");
const DEFAULT_ENDPOINT = "https://virastack.com/api/telemetry";
const REQUEST_TIMEOUT_MS = 2000;

async function readConfig() {
  try {
    const raw = await fs.readFile(CONFIG_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeConfig(patch) {
  try {
    const current = await readConfig();
    await fs.mkdir(CONFIG_DIR, { recursive: true });
    await fs.writeFile(
      CONFIG_FILE,
      `${JSON.stringify({ ...current, ...patch }, null, 2)}\n`,
    );
  } catch {
    // Non-fatal: telemetry preferences are a nice-to-have, never block the CLI.
  }
}

export async function isTelemetryDisabled() {
  if (process.env.VIRASTACK_TELEMETRY_DISABLED === "1") return true;
  if (process.env.DO_NOT_TRACK === "1") return true;

  const config = await readConfig();
  return config.telemetryDisabled === true;
}

export async function disableTelemetry() {
  await writeConfig({ telemetryDisabled: true });
}

export async function hasSeenTelemetryNotice() {
  const config = await readConfig();
  return config.telemetryNoticeShown === true;
}

export async function markTelemetryNoticeShown() {
  await writeConfig({ telemetryNoticeShown: true });
}

/**
 * Fire-and-forget anonymous usage event. Never collects personal data
 * (no project name, no file paths, no IP is read or stored by the CLI) and
 * never throws — a slow or unreachable endpoint must not affect the CLI flow.
 */
export async function trackEvent(event, properties = {}) {
  if (await isTelemetryDisabled()) return;

  const endpoint = process.env.VIRASTACK_TELEMETRY_URL ?? DEFAULT_ENDPOINT;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        event,
        properties: {
          ...properties,
          cliVersion: getCliVersion(),
          nodeVersion: process.version,
          platform: process.platform,
        },
      }),
      signal: controller.signal,
    });
  } catch {
    // Swallow silently — telemetry must never break or slow down the CLI.
  } finally {
    clearTimeout(timeoutId);
  }
}
