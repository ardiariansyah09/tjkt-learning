import { capacity, parseIPv6 } from './studio-core.js';

export { capacity, parseIPv6 };
export function ticketLoad(tickets,duration,staff,minutes){
  const work=tickets*duration,available=staff*minutes;
  return {work,available,utilization:100*work/available,remaining:available-work};
}
export function sensorData(sensors,bytes,interval,retained){
  const samples=sensors*86400/interval,raw=samples*bytes,sent=raw*retained/100;
  return {samples,raw,sent,saved:raw-sent};
}
export function venture(fixed,variable,price,jobs){
  const contribution=price-variable;
  return {contribution,revenue:price*jobs,cost:fixed+variable*jobs,profit:jobs*contribution-fixed,breakEven:contribution>0?Math.ceil(fixed/contribution):null};
}
export function propagation(distance,speed){const oneWay=distance/speed*1000;return {oneWay,rtt:2*oneWay};}
export function opticalPower(transmit,loss,sensitivity,maximum){
  if(sensitivity>=maximum)throw Error('Sensitivitas harus lebih rendah daripada batas maksimum penerima.');
  const received=transmit-loss;
  return {received,margin:received-sensitivity,state:received<sensitivity?'low':received>maximum?'overload':'range'};
}
