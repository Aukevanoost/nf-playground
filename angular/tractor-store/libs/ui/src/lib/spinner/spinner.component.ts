import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';

@Component({
  selector: 'ts-spinner',
  template: `
    <div class="c_Spinner" role="status" [attr.aria-label]="label()">
      <span class="c_Spinner__circle" aria-hidden="true"></span>
      <span class="c_Spinner__label">{{ label() }}</span>
    </div>
  `,
  styleUrl: './spinner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class SpinnerComponent {
  readonly label = input<string>('Loading…');
}
