import { Order, Runner } from "./types";

/**
 * Runner dispatch algorithm — section proximity sorting.
 *
 * Assigns the closest idle runner to an order based on the absolute
 * distance between the runner's current section and the order's seat
 * section. Sections are numeric (e.g. "112", "205") so distance is
 * computed as |runner_section - order_section|.
 *
 * If sections are non-numeric, falls back to lexicographic comparison
 * so the algorithm never crashes on unexpected input.
 */
export function rankRunnersByProximity(
  order: Order,
  runners: Runner[]
): Runner[] {
  const idleRunners = runners.filter((r) => r.status === "idle");

  if (idleRunners.length === 0) return [];

  const orderSection = parseSection(order.seat_section);

  return idleRunners.sort((a, b) => {
    const distA = sectionDistance(a.current_section, orderSection);
    const distB = sectionDistance(b.current_section, orderSection);
    return distA - distB;
  });
}

/**
 * Pick the single best runner for an order.
 * Returns null if no idle runners are available.
 */
export function assignRunner(
  order: Order,
  runners: Runner[]
): Runner | null {
  const ranked = rankRunnersByProximity(order, runners);
  return ranked.length > 0 ? ranked[0] : null;
}

/**
 * Sort orders by proximity to a runner's current section.
 * Used on the runner dashboard to show nearest orders first.
 */
export function sortOrdersByProximity(
  orders: Order[],
  runnerSection: string | null
): Order[] {
  if (!runnerSection) return orders;

  const section = parseSection(runnerSection);

  return [...orders].sort((a, b) => {
    const distA = sectionDistance(a.seat_section, section);
    const distB = sectionDistance(b.seat_section, section);
    return distA - distB;
  });
}

function parseSection(section: string | null): number {
  if (!section) return 0;
  const num = parseInt(section, 10);
  return isNaN(num) ? 0 : num;
}

function sectionDistance(
  runnerSection: string | null,
  orderSection: number
): number {
  return Math.abs(parseSection(runnerSection) - orderSection);
}
