'use client';

import { Fragment, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/20/solid';

interface ToastProps {
  show: boolean;
  message: string;
  type?: 'success' | 'error';
  onCloseAction: () => void;
}

export default function Toast({ show, message, type = 'success', onCloseAction }: ToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onCloseAction();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [show, onCloseAction]);

  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-0 flex items-end justify-end p-6 z-50"
    >
      <div className="flex flex-col items-end space-y-4 w-full max-w-sm">
        <Transition
          show={show}
          as={Fragment}
          enter="transform ease-out duration-300 transition"
          enterFrom="translate-y-2 opacity-0 translate-x-2"
          enterTo="translate-y-0 opacity-100 translate-x-0"
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="pointer-events-auto w-full overflow-hidden rounded-2xl bg-gray-900/95 border border-white/[0.06] shadow-lg shadow-black/20 ring-1 ring-black ring-opacity-5 backdrop-blur-xl">
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {type === 'success' ? (
                    <CheckCircleIcon className="h-6 w-6 text-green-400" aria-hidden="true" />
                  ) : (
                    <XCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />
                  )}
                </div>
                <div className="ml-3 w-0 flex-1">
                  <p className="text-sm font-medium text-white/90">{message}</p>
                </div>
                <div className="ml-4 flex flex-shrink-0">
                  <button
                    type="button"
                    className="inline-flex rounded-md text-white/60 hover:text-white focus:outline-none"
                    onClick={onCloseAction}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  );
}
