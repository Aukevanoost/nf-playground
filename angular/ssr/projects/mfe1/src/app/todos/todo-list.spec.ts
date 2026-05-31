import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { TodoListComponent } from './todo-list';

describe('TodoListComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [TodoListComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  function setup() {
    const fixture = TestBed.createComponent(TodoListComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('renders the seeded todos', () => {
    const fixture = setup();
    const items = fixture.nativeElement.querySelectorAll('.todos__item');
    expect(items.length).toBe(4);
  });

  it('adds a todo through the reactive form', () => {
    const fixture = setup();
    const input = fixture.nativeElement.querySelector('#new-todo') as HTMLInputElement;
    input.value = 'Buy milk';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('.todos__add') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const titles = Array.from(
      fixture.nativeElement.querySelectorAll('.todos__title') as NodeListOf<HTMLElement>,
    ).map((el) => el.textContent?.trim());
    expect(titles).toContain('Buy milk');
  });

  it('disables the add button when the field is empty', () => {
    const fixture = setup();
    const button = fixture.nativeElement.querySelector(
      '.todos__add button',
    ) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('toggles a todo via its checkbox', () => {
    const fixture = setup();
    const firstCheckbox = fixture.nativeElement.querySelector(
      '.todos__item input[type="checkbox"]',
    ) as HTMLInputElement;
    const wasChecked = firstCheckbox.checked;
    firstCheckbox.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const nowChecked = (
      fixture.nativeElement.querySelector(
        '.todos__item input[type="checkbox"]',
      ) as HTMLInputElement
    ).checked;
    expect(nowChecked).toBe(!wasChecked);
  });
});
