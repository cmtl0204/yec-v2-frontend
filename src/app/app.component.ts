import {Component, Inject} from '@angular/core';
import {PrimeNGConfig} from 'primeng/api';
import {
  BreadcrumbService,
  CataloguesHttpService,
  CoreService,
  SchoolPeriodsHttpService,
  SchoolPeriodsService
} from "@services/core";
import {BreadcrumbEnum, CoreMessageEnum} from "@utils/enums";
import {DOCUMENT} from "@angular/common";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  protected readonly CoreMessageEnum = CoreMessageEnum;
  visible = false;

  show() {
    this.visible = !this.visible;
  }

  constructor(@Inject(DOCUMENT) private document: Document, private primengConfig: PrimeNGConfig,
              public readonly coreService: CoreService, private breadcrumbService: BreadcrumbService,
  ) {
    this.breadcrumbService.setItems([{label: BreadcrumbEnum.HOME}]);
  }

  ngOnInit() {
    this.primengConfig.ripple = true;
  }
}
