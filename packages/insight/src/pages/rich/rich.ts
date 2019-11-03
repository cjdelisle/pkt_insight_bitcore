import { Component, Injectable, Input } from '@angular/core';
import { IonicPage, NavParams } from 'ionic-angular';
import { AddressProvider } from '../../providers/address/address';
import { ApiProvider, ChainNetwork } from '../../providers/api/api';
import { CurrencyProvider } from '../../providers/currency/currency';
import { PriceProvider } from '../../providers/price/price';
import { RedirProvider } from '../../providers/redir/redir';

@Injectable()
@IonicPage({
  name: 'rich',
  segment: ':chain/:network/rich',
  defaultHistory: ['home']
})
@Component({
  selector: 'page-rich',
  templateUrl: 'rich.html'
})
export class RichPage {
  public loading = true;
  public richlist;
  public chainNetwork: ChainNetwork;

  constructor(
    public navParams: NavParams,
    private addressProvider: AddressProvider,
    private apiProvider: ApiProvider,
    private currencyProvider: CurrencyProvider,
    private priceProvider: PriceProvider,
    private redirProvider: RedirProvider,
  ) {
    const chain: string = navParams.get('chain');
    const network: string = navParams.get('network');
    this.chainNetwork = {
      chain,
      network
    };
    this.apiProvider.changeNetwork(this.chainNetwork);
    this.currencyProvider.setCurrency(this.chainNetwork);
    this.priceProvider.setCurrency();

    this.addressProvider.getRichList(this.chainNetwork).subscribe(
      richlist => {
        this.richlist = richlist.map((r) => {
            r.balance = Math.floor(r.balance / 0x40000000);
            return r;
        });
        this.loading = false;
      },
      () => {
        this.loading = false;
      }
    );
  }

  public goToAddress(addrStr: string): void {
    this.redirProvider.redir('address', {
      addrStr,
      chain: this.chainNetwork.chain,
      network: this.chainNetwork.network
    });
  }
}
