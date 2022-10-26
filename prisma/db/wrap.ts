import { Status } from '@prisma/client';
import {
  POSITION_WRAP,
  PRICE_POSITION_WRAP,
} from './../../src/constants/fake-data';
export const wrap = async (): Promise<any[]> => {
  const wraps = [];

  for (let i = 0; i < POSITION_WRAP.length; i++) {
    wraps.push({
      positionWrap: `${POSITION_WRAP[i]}`,
      price: `${PRICE_POSITION_WRAP[i]}`,
      status: Status.ENABLE,
    });
  }
  return [...wraps];
};