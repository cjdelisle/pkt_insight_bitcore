import { Component, Injectable } from '@angular/core';
import { IonicPage, NavParams } from 'ionic-angular';
import { ApiProvider, ChainNetwork } from '../../providers/api/api';
import { BlocksProvider } from '../../providers/blocks/blocks';
import { CurrencyProvider } from '../../providers/currency/currency';
import { PriceProvider } from '../../providers/price/price';
import { RedirProvider } from '../../providers/redir/redir';
import { TxsProvider } from '../../providers/transactions/transactions';

@Injectable()
@IonicPage({
  name: 'block-detail',
  segment: ':chain/:network/block/:blockHash',
  defaultHistory: ['home']
})
@Component({
  selector: 'page-block-detail',
  templateUrl: 'block-detail.html'
})
export class BlockDetailPage {
  public loading = true;
  public errorMessage: string;
  public confirmations: number;
  public block: any = {
    tx: []
  };
  public chainNetwork: ChainNetwork;
  public pcp: any;

  private blockHash: string;

  private packetcryptMagicPrefix: Buffer = Buffer.from('6a3009f91102', 'hex');

  constructor(
    public navParams: NavParams,
    public currencyProvider: CurrencyProvider,
    public redirProvider: RedirProvider,
    public txProvider: TxsProvider,
    private blocksProvider: BlocksProvider,
    private apiProvider: ApiProvider,
    private priceProvider: PriceProvider
  ) {
    this.blockHash = navParams.get('blockHash');
    const chain: string = navParams.get('chain');
    const network: string = navParams.get('network');

    this.chainNetwork = {
      chain,
      network
    };
    this.apiProvider.changeNetwork(this.chainNetwork);
    this.currencyProvider.setCurrency(this.chainNetwork);
    this.priceProvider.setCurrency();
  }

  ionViewDidEnter() {
    if (this.chainNetwork.chain === 'PKT') {
      this.blocksProvider
        .getCoinsForBlockHash(this.blockHash, this.chainNetwork, 1, 1)
        .subscribe(txidCoins => {
          const out = txidCoins.outputs.pop();
          if (out.value !== 0) {
              return;
          }
          let buf = Buffer.from(out.script, 'base64');
          if (buf.indexOf(this.packetcryptMagicPrefix) !== 0) {
              return;
          }
          buf = buf.slice(this.packetcryptMagicPrefix.length);
          const annLeastWorkTarget = buf.readUInt32LE(0);
          const diff = Math.floor(this.blocksProvider.pktWorkForBits(annLeastWorkTarget));
          const annCount = buf.readUInt32LE(4 + 32) + (buf.readUInt32LE(4 + 32 + 4) * 0x100000000);
          this.pcp = { diff, annCount };
        });
    }

    this.blocksProvider.getBlock(this.blockHash, this.chainNetwork).subscribe(
      response => {
        let block;
        if (
          this.chainNetwork.chain === 'BTC' ||
          this.chainNetwork.chain === 'BCH'
        ) {
          block = this.blocksProvider.toUtxoCoinAppBlock(response);
        }
        if (this.chainNetwork.chain === 'PKT') {
          block = this.blocksProvider.toPKTAppBlock(response);
        }
        if (this.chainNetwork.chain === 'ETH') {
          block = this.blocksProvider.toEthAppBlock(response);
        }
        this.block = block;
        this.txProvider
          .getConfirmations(this.block.height, this.chainNetwork)
          .subscribe(confirmations => (this.confirmations = confirmations));
        this.loading = false;
      },
      err => {
        this.errorMessage = err;
        this.loading = false;
      }
    );
  }

  public pktGetBlockMinerHashes(): number {
      if (this.loading || this.pcp === undefined) { return -1; }
      const cube = Math.pow(this.block.difficulty * 4096, 3);
      return Math.floor(cube / this.pcp.diff / this.pcp.annCount);
  }

  public goToPreviousBlock(): void {
    this.redirProvider.redir('block-detail', {
      blockHash: this.block.previousblockhash,
      chain: this.chainNetwork.chain,
      network: this.chainNetwork.network
    });
  }

  public goToNextBlock(): void {
    this.redirProvider.redir('block-detail', {
      blockHash: this.block.nextblockhash,
      chain: this.chainNetwork.chain,
      network: this.chainNetwork.network
    });
  }
}
