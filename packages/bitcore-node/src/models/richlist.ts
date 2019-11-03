import { BaseModel } from './base';
import { StorageService } from '../services/storage';

export type IRichList = {
  address: string;
  balance: number;
};

export class RichListModel extends BaseModel<IRichList> {
  constructor(storage?: StorageService) {
    super('richlist', storage);
  }

  allowedPaging = [
    {
      key: 'balance' as 'balance',
      type: 'number' as 'number'
    }
  ];

  onConnect() {
    this.collection.createIndex({ balance: 1 }, { background: true });
  }

  async getRichList(params: { query: any }): Promise<IRichList[]> {
    return await this.collection.find(params.query).toArray();
  }
}
export let RichListStorage = new RichListModel();
