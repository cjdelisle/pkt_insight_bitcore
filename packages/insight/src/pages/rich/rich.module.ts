import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FooterComponentModule } from '../../components/footer/footer.module';
import { HeadNavComponentModule } from '../../components/head-nav/head-nav.module';
import { LatestBlocksComponentModule } from '../../components/latest-blocks/latest-blocks.module';
import { LoaderComponentModule } from '../../components/loader/loader.module';
import { RichPage } from './rich';

@NgModule({
  declarations: [RichPage],
  imports: [
    IonicPageModule.forChild(RichPage),
    FooterComponentModule,
    HeadNavComponentModule,
    LatestBlocksComponentModule,
    LoaderComponentModule
  ],
  exports: [RichPage]
})
export class RichPageModule {}
