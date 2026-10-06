import type { EventTicket } from '../types/domain';
import type { SeatTarget } from '../types/navigation';

export function resolveTicketToSeat(ticket:EventTicket,seats:SeatTarget[]):SeatTarget|null{
  return seats.find((seat)=>
    seat.section===ticket.section &&
    seat.row===ticket.row &&
    seat.seat===ticket.seat
  ) ?? null;
}

export function parseGoARTicketQR(raw:string):EventTicket|null{
  try{
    if(!raw.startsWith('GOAR:TICKET:')) return null;
    const json=decodeURIComponent(raw.slice('GOAR:TICKET:'.length));
    const value=JSON.parse(json);
    if(!value?.id||!value?.venueId||!value?.section||!value?.row||!value?.seat) return null;
    return value as EventTicket;
  }catch{return null;}
}
