import { Status } from '@prisma/client';
import {
  FAKE_ADDRESS,
  FAKE_PRICE_PER_KM,
} from './../../src/constants/fake-data';
export const location = async (): Promise<any[]> => {
  const locations = [];

  for (let i = 0; i < FAKE_ADDRESS.length; i++) {
    locations.push({
      locationName: `${FAKE_ADDRESS[i]}`,
      price: `${FAKE_PRICE_PER_KM[i]}`,
      status: Status.ENABLE,
    });
  }
  return [...locations];
};
