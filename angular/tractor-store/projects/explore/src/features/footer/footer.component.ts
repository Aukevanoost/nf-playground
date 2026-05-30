import {
  ChangeDetectionStrategy,
  Component,
  inject,
  ViewEncapsulation,
} from '@angular/core';
import { ResourceService } from '../../shared/utils/resource.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class FooterComponent {
  private readonly image = inject(ResourceService);
  readonly neulandLogo = this.image.cdnUrl('/cdn/img/neulandlogo.svg');
}
