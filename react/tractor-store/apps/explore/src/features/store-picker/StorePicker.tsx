import { useRef, useState } from 'react';
import { storeSelected } from '@react-internal/event-bus';
import { Button } from '@react-internal/ui';
import { getStores, type Store } from '../../api/stores';
import { useAsync } from '@react-internal/mfe-runtime';
import { useCdnBase } from '@react-internal/mfe-runtime';
import { imgSrc, imgSrcset } from '@react-internal/mfe-runtime';
import { useScopedStyles } from '@react-internal/mfe-runtime';
import { storePickerStyles } from './store-picker-styles';

export function StorePicker() {
  useScopedStyles('explore-store-picker', storePickerStyles);

  const base = useCdnBase();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [selected, setSelected] = useState<Store | null>(null);

  const { value: stores, error } = useAsync(() => getStores(), []);

  const open = (): void => dialogRef.current?.showModal();
  const select = (store: Store): void => {
    setSelected(store);
    dialogRef.current?.close();
    storeSelected.emit({ id: store.id });
  };

  return (
    <div className="e_StorePicker">
      <div className="e_StorePicker_control" data-boundary="explore">
        {selected ? (
          <div className="e_StorePicker_selected">
            <img
              className="e_StorePicker_image"
              src={imgSrc(selected.image, 200, base)}
              srcSet={imgSrcset(selected.image, [200, 400], base)}
              width={200}
              height={200}
              alt=""
            />
            <p className="e_StorePicker_address">
              {selected.name}
              <br />
              {selected.street}
              <br />
              {selected.city}
            </p>
          </div>
        ) : null}
        <Button extraClass="e_StorePicker_choose" type="button" onClick={open}>
          choose a store
        </Button>
      </div>
      <dialog
        ref={dialogRef}
        className="e_StorePicker_dialog"
        data-boundary="explore"
      >
        <div className="e_StorePicker_wrapper">
          <h2>Stores</h2>
          {error ? (
            <p role="alert">Failed to load stores. Please refresh.</p>
          ) : null}
          <ul className="e_StorePicker_list">
            {(stores ?? []).map((s) => (
              <li key={s.id} className="e_StorePicker_entry">
                <div className="e_StorePicker_content">
                  <img
                    className="e_StorePicker_image"
                    src={imgSrc(s.image, 200, base)}
                    srcSet={imgSrcset(s.image, [200, 400], base)}
                    width={200}
                    height={200}
                    alt=""
                  />
                  <p className="e_StorePicker_address">
                    {s.name}
                    <br />
                    {s.street}
                    <br />
                    {s.city}
                  </p>
                </div>
                <Button
                  extraClass="e_StorePicker_select"
                  type="button"
                  dataId={s.id}
                  onClick={() => select(s)}
                >
                  select
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </div>
  );
}
