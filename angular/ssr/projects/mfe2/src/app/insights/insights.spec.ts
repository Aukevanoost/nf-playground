import { TestBed } from '@angular/core/testing';

import { InsightsComponent } from './insights';

const STORAGE_KEY = 'nf-ssr-todos';

describe('InsightsComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [InsightsComponent],
    }).compileComponents();
  });

  async function render() {
    const fixture = TestBed.createComponent(InsightsComponent);
    fixture.detectChanges();
    await fixture.whenStable(); // let afterNextRender read localStorage
    fixture.detectChanges();
    return fixture;
  }

  it('shows the empty state when there are no persisted todos', async () => {
    const fixture = await render();
    expect(fixture.nativeElement.querySelector('.insights__empty')).toBeTruthy();
  });

  it('computes stats and completion rate from localStorage', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { id: 't-1', title: 'a', completed: true },
        { id: 't-2', title: 'b', completed: true },
        { id: 't-3', title: 'c', completed: false },
        { id: 't-4', title: 'd', completed: false },
      ]),
    );

    const fixture = await render();
    const values = Array.from(
      fixture.nativeElement.querySelectorAll('.insights__stat dd') as NodeListOf<HTMLElement>,
    ).map((el) => el.textContent?.trim());

    // total / active / completed
    expect(values).toEqual(['4', '2', '2']);

    const bar = fixture.nativeElement.querySelector('.insights__bar') as HTMLElement;
    expect(bar.getAttribute('aria-valuenow')).toBe('50');
  });

  it('tolerates corrupt storage', async () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    const fixture = await render();
    expect(fixture.nativeElement.querySelector('.insights__empty')).toBeTruthy();
  });
});
