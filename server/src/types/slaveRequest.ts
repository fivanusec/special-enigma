export type SlaveData = {
  address: string;
  name?: string;
};

export type SlaveRequest = {
  id: SlaveData;
  message?: string;
  data?: string;
};
