import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { SplitViewService } from '../split-view.service';

/**
 * The view component is part of the `SplitViewComponent`. The view
 * contains the navigable content that should be split up. It maintains
 * a view position and allows to show or hide the view.
 *
 * The ViewComponent interacts with the `SplitViewService` for handing over the
 * view state, so that the overarching `SplitViewComponent` can manage the
 * overall experience.
 */
@Component({
  selector: 'cx-view',
  templateUrl: './view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewComponent implements OnInit, OnDestroy {
  protected _hidden;

  @Input()
  @HostBinding('attr.position')
  position: string;

  /**
   * The disappeared flag is added to the
   */
  @HostBinding('attr.disappeared') disappeared = true;

  /**
   * The hidden input is used to set the initial visible state of the view.
   * The hidden state defaults to false.
   *
   * The hidden input supports 2-way binding, see `hiddenChange` property.
   */
  @Input()
  set hidden(hidden: boolean) {
    this._hidden = hidden;
    this.splitService.toggle(this.viewPosition, hidden);
  }

  /**
   * An update of the view visibility is emitted to the hiddenChange output.
   */
  @Output()
  hiddenChange = new EventEmitter();

  protected subscription: Subscription;

  constructor(
    protected splitService: SplitViewService,
    protected elementRef: ElementRef
  ) {}

  ngOnInit() {
    this.splitService.splitViewCount = this.splitViewCount;

    const hidden = this._hidden ? { hidden: this._hidden } : {};
    this.splitService.add(this.viewPosition, hidden);

    this.subscription = this.splitService
      .getViewState(Number(this.position))
      .subscribe((view) => {
        this.hiddenChange.emit(view.hidden);
        this._hidden = view.hidden;
        if (view.hidden) {
          setTimeout(() => {
            this.disappeared = true;
          }, this.duration * 1.25);
        } else {
          this.disappeared = false;
        }
      });
  }

  /**
   * Toggles the visibility of the view.
   *
   * An optional force flag can be used to explicitly show or hide view component.
   */
  toggle(force?: boolean) {
    this.splitService.toggle(this.viewPosition, force);
  }

  /**
   * Returns the position for the view.
   *
   * The position is either taken from the input `position` or generated by the `SplitService`.
   */
  protected get viewPosition(): number {
    if (!(Number(this.position) >= 0)) {
      this.position = this.splitService.nextPosition.toString();
    }
    return Number(this.position);
  }

  /**
   * Returns the duration in milliseconds. The duration is based on the CSS custom property
   * `--cx-transition-duration`. Defaults to 300 milliseconds.
   */
  protected get duration(): number {
    const duration: string = getComputedStyle(this.elementRef.nativeElement)
      .getPropertyValue('--cx-transition-duration')
      .trim();

    if (duration.indexOf('ms') > -1) {
      return Number(duration.split('ms')[0]);
    } else if (duration.indexOf('s') > -1) {
      return Number(duration.split('s')[0]) * 1000;
    } else {
      return 300;
    }
  }

  /**
   * Returns the maximum number of views per split-view. The number is based on the CSS custom property
   * `--cx-max-views`. Defaults to `2`
   */
  protected get splitViewCount(): number {
    return Number(
      getComputedStyle(this.elementRef.nativeElement)
        .getPropertyValue('--cx-max-views')
        .trim() || 2
    );
  }

  /**
   * The view is removed from the `SplitService` so that the view no longer
   * plays a role in the overall split view.
   */
  ngOnDestroy() {
    this.splitService.remove(this.viewPosition);
    this.subscription?.unsubscribe();
  }
}
