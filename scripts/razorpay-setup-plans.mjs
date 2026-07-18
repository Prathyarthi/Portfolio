#!/usr/bin/env node
/**
 * Create Razorpay subscription plans for Livefolio Pro (monthly / quarterly / yearly).
 *
 * Matches lib/pricing.ts PRO_PRICING and a.md setup guide.
 *
 * Usage:
 *   node scripts/razorpay-setup-plans.mjs              # create INR plans (test/live keys from .env)
 *   node scripts/razorpay-setup-plans.mjs --currency=usd
 *   node scripts/razorpay-setup-plans.mjs --dry-run
 *   node scripts/razorpay-setup-plans.mjs --list
 *   node scripts/razorpay-setup-plans.mjs --write-env   # append plan IDs to .env
 *
 * Requires in .env:
 *   RAZORPAY_KEY_ID
 *   RAZORPAY_KEY_SECRET
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import Razorpay from "razorpay";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ENV_PATH = join(ROOT, ".env");

dotenv.config({ path: ENV_PATH });

/** Keep in sync with lib/pricing.ts PRO_PRICING */
const PRO_PRICING = {
  monthly: { usd: 7, inr: 599 },
  quarterly: { usd: 19, inr: 1599 },
  yearly: { usd: 70, inr: 5999 },
};

const PLAN_NAME_PREFIX =
  process.env.RAZORPAY_PLAN_NAME_PREFIX?.trim() || "Livefolio Pro";

const PLAN_DEFS = [
  {
    key: "monthly",
    envVar: "RAZORPAY_PRO_PLAN_ID_MONTHLY",
    legacyEnvVar: "RAZORPAY_PRO_PLAN_ID",
    label: "Monthly",
    period: "monthly",
    interval: 1,
  },
  {
    key: "quarterly",
    envVar: "RAZORPAY_PRO_PLAN_ID_QUARTERLY",
    label: "Quarterly",
    period: "monthly",
    interval: 3,
  },
  {
    key: "yearly",
    envVar: "RAZORPAY_PRO_PLAN_ID_YEARLY",
    label: "Yearly",
    period: "yearly",
    interval: 1,
  },
];

function parseArgs(argv) {
  const flags = {
    dryRun: false,
    list: false,
    writeEnv: false,
    currency:
      process.env.NEXT_PUBLIC_BILLING_CURRENCY?.toLowerCase() === "usd"
        ? "usd"
        : "inr",
  };

  for (const arg of argv) {
    if (arg === "--dry-run") flags.dryRun = true;
    else if (arg === "--list") flags.list = true;
    else if (arg === "--write-env") flags.writeEnv = true;
    else if (arg.startsWith("--currency=")) {
      const value = arg.split("=")[1]?.toLowerCase();
      if (value === "inr" || value === "usd") flags.currency = value;
      else throw new Error(`Invalid currency "${value}". Use inr or usd.`);
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return flags;
}

function printHelp() {
  console.log(`
Razorpay Pro plan setup (monthly / quarterly / yearly)

  node scripts/razorpay-setup-plans.mjs [options]

Options:
  --currency=inr|usd   Plan currency (default: inr)
  --dry-run            Print payloads without calling Razorpay
  --list               List existing plans in the account
  --write-env          Write plan IDs into .env
  -h, --help           Show this help

INR amounts (from lib/pricing.ts):
  Monthly   ₹599
  Quarterly ₹1,599
  Yearly    ₹5,999

USD amounts:
  Monthly   $7
  Quarterly $19
  Yearly    $70

After creating plans, configure webhook in Razorpay Dashboard:
  POST https://your-domain.com/api/billing/webhook
  Events: subscription.authenticated, subscription.pending, subscription.activated,
          subscription.charged, subscription.cancelled, subscription.halted,
          subscription.paused, subscription.resumed, subscription.completed
`);
}

function getCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!keyId || !keySecret) {
    throw new Error(
      "Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET in .env"
    );
  }

  return { keyId, keySecret };
}

function toSubunits(amount, currency) {
  if (currency === "inr") return Math.round(amount * 100);
  if (currency === "usd") return Math.round(amount * 100);
  throw new Error(`Unsupported currency: ${currency}`);
}

function formatDisplayAmount(amount, currency) {
  if (currency === "inr") return `₹${amount.toLocaleString("en-IN")}`;
  return `$${amount}`;
}

function buildPlanPayload(def, currency) {
  const displayAmount = PRO_PRICING[def.key][currency];
  const name = `${PLAN_NAME_PREFIX} — ${def.label}`;

  return {
    period: def.period,
    interval: def.interval,
    item: {
      name,
      amount: toSubunits(displayAmount, currency),
      currency: currency.toUpperCase(),
      description: `${PLAN_NAME_PREFIX} ${def.label.toLowerCase()} subscription`,
    },
    notes: {
      product: "pro",
      interval: def.key,
      app: "livefolio",
    },
  };
}

async function fetchAllPlans(razorpay) {
  const items = [];
  let skip = 0;
  const count = 100;

  while (true) {
    const page = await razorpay.plans.all({ count, skip });
    items.push(...(page.items ?? []));
    if (!page.items?.length || page.items.length < count) break;
    skip += count;
  }

  return items;
}

async function listPlans(razorpay) {
  const plans = await fetchAllPlans(razorpay);

  if (!plans.length) {
    console.log("No plans found in this Razorpay account.");
    return;
  }

  console.log(`Found ${plans.length} plan(s):\n`);
  for (const plan of plans) {
    const amount = plan.item?.amount ?? 0;
    const currency = plan.item?.currency ?? "?";
    const major = amount / 100;
    console.log(
      `- ${plan.id}  ${plan.item?.name ?? "Unnamed"}  ${currency} ${major}  (${plan.period} × ${plan.interval})`
    );
  }
}

function findExistingPlan(plans, payload) {
  return plans.find(
    (plan) =>
      plan.item?.name === payload.item.name &&
      plan.item?.currency === payload.item.currency &&
      plan.item?.amount === payload.item.amount &&
      plan.period === payload.period &&
      plan.interval === payload.interval
  );
}

function printEnvBlock(results) {
  console.log("\n# Add to .env:\n");
  for (const { def, planId, created } of results) {
    const tag = created ? "created" : "existing";
    console.log(`# ${def.label} (${tag})`);
    console.log(`${def.envVar}=${planId}`);
    if (def.legacyEnvVar) {
      console.log(`${def.legacyEnvVar}=${planId}`);
    }
    console.log("");
  }
}

function upsertEnvVars(results) {
  let content = readFileSync(ENV_PATH, "utf8");

  for (const { def, planId } of results) {
    for (const key of [def.envVar, def.legacyEnvVar].filter(Boolean)) {
      const line = `${key}=${planId}`;
      const pattern = new RegExp(`^${key}=.*$`, "m");

      if (pattern.test(content)) {
        content = content.replace(pattern, line);
      } else {
        content = content.trimEnd() + `\n${line}\n`;
      }
    }
  }

  writeFileSync(ENV_PATH, content, "utf8");
  console.log(`\nUpdated ${ENV_PATH} with plan IDs.`);
}

async function main() {
  const flags = parseArgs(process.argv.slice(2));
  const { keyId, keySecret } = getCredentials();
  const mode = keyId.includes("_live_") ? "LIVE" : "TEST";

  const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

  console.log(`Razorpay mode: ${mode}`);
  console.log(`Currency: ${flags.currency.toUpperCase()}\n`);

  if (flags.list) {
    await listPlans(razorpay);
    return;
  }

  const existingPlans = flags.dryRun ? [] : await fetchAllPlans(razorpay);
  const results = [];

  for (const def of PLAN_DEFS) {
    const payload = buildPlanPayload(def, flags.currency);
    const displayAmount = PRO_PRICING[def.key][flags.currency];

    console.log(`→ ${def.label}`);
    console.log(
      `  ${payload.item.name} — ${formatDisplayAmount(displayAmount, flags.currency)} (${payload.period}, interval ${payload.interval})`
    );

    if (flags.dryRun) {
      console.log(`  payload: ${JSON.stringify(payload, null, 2)}\n`);
      results.push({ def, planId: `plan_DRY_RUN_${def.key}`, created: true });
      continue;
    }

    const existing = findExistingPlan(existingPlans, payload);
    if (existing) {
      console.log(`  reuse existing plan: ${existing.id}\n`);
      results.push({ def, planId: existing.id, created: false });
      continue;
    }

    const plan = await razorpay.plans.create(payload);
    console.log(`  created plan: ${plan.id}\n`);
    results.push({ def, planId: plan.id, created: true });
  }

  printEnvBlock(results);

  if (flags.writeEnv && !flags.dryRun) {
    upsertEnvVars(results);
  } else if (!flags.dryRun) {
    console.log("Tip: run with --write-env to save plan IDs to .env automatically.");
  }

  console.log(
    "\nNext: set RAZORPAY_WEBHOOK_SECRET and configure webhook URL in Razorpay Dashboard."
  );
}

main().catch((error) => {
  console.error("\nError:", error.message ?? error);
  process.exit(1);
});
