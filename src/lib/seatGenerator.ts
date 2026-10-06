import type { MappingPoint, SeatRowDraft } from '../types/venueMapping';

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function generateSeatRow(draft: SeatRowDraft): MappingPoint[] {
  const count = Math.max(1, Math.floor(draft.seatCount));
  return Array.from({ length: count }, (_, index) => {
    const t = count === 1 ? 0 : index / (count - 1);
    const seat = String(draft.firstSeatNumber + index);
    return {
      id: `seat-${draft.section}-${draft.row}-${seat}`.toLowerCase(),
      venueId: draft.venueId,
      label: `Seat ${seat}`,
      kind: 'seat',
      floor: draft.floor,
      section: draft.section,
      row: draft.row,
      seat,
      position: {
        x: lerp(draft.start.x, draft.end.x, t),
        y: lerp(draft.start.y, draft.end.y, t),
        z: lerp(draft.start.z, draft.end.z, t),
      },
    };
  });
}

export function generateSeatBlock(args: {
  firstRowStart: SeatRowDraft;
  rowLabels: string[];
  rowOffset: { x: number; y: number; z: number };
}): MappingPoint[] {
  return args.rowLabels.flatMap((row, rowIndex) => {
    const offset = {
      x: args.rowOffset.x * rowIndex,
      y: args.rowOffset.y * rowIndex,
      z: args.rowOffset.z * rowIndex,
    };
    return generateSeatRow({
      ...args.firstRowStart,
      row,
      start: {
        x: args.firstRowStart.start.x + offset.x,
        y: args.firstRowStart.start.y + offset.y,
        z: args.firstRowStart.start.z + offset.z,
      },
      end: {
        x: args.firstRowStart.end.x + offset.x,
        y: args.firstRowStart.end.y + offset.y,
        z: args.firstRowStart.end.z + offset.z,
      },
    });
  });
}
