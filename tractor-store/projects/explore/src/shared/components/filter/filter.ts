import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NavLinkDirective, NavTarget } from '@internal/events';

export interface FilterItem {
  link: NavTarget;
  name: string;
  active: boolean;
}

@Component({
  selector: 'app-filter',
  imports: [NavLinkDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './filter.scss',
  template: `
    <div class="e_Filter">
      Filter:
      <ul>
        @for (f of filters(); track f.name) {
          @if (f.active) {
            <li class="e_Filter__filter--active">{{ f.name }}</li>
          } @else {
            <li><a [navLink]="f.link.intent" [navParams]="f.link.params ?? {}">{{ f.name }}</a></li>
          }
        }
      </ul>
    </div>
  `,
})
export class FilterComponent {
  readonly filters = input.required<FilterItem[]>();
}
