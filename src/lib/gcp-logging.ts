import { Logging } from "@google-cloud/logging";

/**
 * Google Cloud Logging — structured logging for analysis requests and errors.
 * Enables monitoring, alerting, and audit trails in Cloud Logging.
 * Requires GOOGLE_APPLICATION_CREDENTIALS or running on GCP with appropriate IAM.
 */

let _logging: Logging | null = null;

function getLogging(): Logging {
  if (_logging) return _logging;
  _logging = new Logging();
  return _logging;
}

const LOG_NAME = "foodlabel-analysis";

export type LogSeverity = "INFO" | "WARNING" | "ERROR";

interface AnalysisLogEntry {
  action: string;
  mode: "text" | "image";
  verdict?: string;
  flags?: string[];
  durationMs?: number;
  error?: string;
}

/** Write a structured log entry for analysis events */
export async function logAnalysisEvent(
  entry: AnalysisLogEntry,
  severity: LogSeverity = "INFO"
): Promise<void> {
  const logging = getLogging();
  const log = logging.log(LOG_NAME);

  const metadata = {
    resource: { type: "cloud_run_revision" },
    severity,
  };

  const logEntry = log.entry(metadata, {
    ...entry,
    timestamp: new Date().toISOString(),
    service: "foodlabel",
  });

  await log.write(logEntry);
}

/** Log an analysis request */
export async function logAnalysisRequest(
  mode: "text" | "image",
  durationMs: number,
  verdict: string,
  flags: string[]
): Promise<void> {
  await logAnalysisEvent({
    action: "analysis_completed",
    mode,
    verdict,
    flags,
    durationMs,
  });
}

/** Log an analysis error */
export async function logAnalysisError(
  mode: "text" | "image",
  error: string
): Promise<void> {
  await logAnalysisEvent(
    {
      action: "analysis_failed",
      mode,
      error,
    },
    "ERROR"
  );
}
