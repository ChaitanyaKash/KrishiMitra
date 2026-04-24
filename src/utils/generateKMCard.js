export function generateKMCard() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let uid = '';
  for(let i=0; i<8; i++) {
    uid += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `KM-2024-${uid}`;
}
