import { BitcoinP2PWorker } from '../bitcoin/p2p';
import { BaseModule } from '..';
import { BTCStateProvider } from '../../providers/chain-state/btc/btc';

export default class PKTModule extends BaseModule {
  constructor(services) {
    super(services);
    services.Libs.register('PKT', 'bitcore-lib-pkt', 'bitcore-p2p-pkt');
    services.P2P.register('PKT', BitcoinP2PWorker);
    services.CSP.registerService('PKT', new BTCStateProvider('PKT'));
  }
}
