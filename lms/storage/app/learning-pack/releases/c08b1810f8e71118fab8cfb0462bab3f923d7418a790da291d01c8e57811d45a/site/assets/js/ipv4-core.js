// IPv4 arithmetic: unsigned 32-bit integers, with explicit /31 and /32 handling.
export function parseIPv4(value) {
  if (typeof value !== 'string') return null;
  const parts = value.trim().split('.');
  if (parts.length !== 4 || !parts.every(p => /^(0|[1-9]\d{0,2})$/.test(p) && Number(p) <= 255)) return null;
  return parts.reduce((n, p) => ((n * 256) + Number(p)) >>> 0, 0);
}
export function formatIPv4(number) {
  return [24, 16, 8, 0].map(shift => (number >>> shift) & 255).join('.');
}
export function subnetInfo(ip, prefix) {
  const value = parseIPv4(ip);
  if (value === null || !Number.isInteger(prefix) || prefix < 0 || prefix > 32) return null;
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const network = (value & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const total = 2 ** (32 - prefix);
  const usable = prefix === 32 ? 1 : prefix === 31 ? 2 : total - 2;
  const first = prefix >= 31 ? network : network + 1;
  const last = prefix >= 31 ? broadcast : broadcast - 1;
  return { ip: formatIPv4(value), prefix, mask: formatIPv4(mask), network: formatIPv4(network), broadcast: formatIPv4(broadcast), total, usable, first: formatIPv4(first), last: formatIPv4(last), hostBits: 32 - prefix };
}
export function octetBits(octet) { return Number(octet).toString(2).padStart(8, '0'); }
