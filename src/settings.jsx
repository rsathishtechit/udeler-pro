import React, { Fragment, useContext, useEffect, useState } from "react";
import { DbContext, DefaultSettingsContext } from "./context/context";

import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { LANGUAGES, VIDEO_QUALITY } from "./constants/settings";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Settings = () => {
  let { db } = useContext(DbContext);
  let { setDefaultSettings } = useContext(DefaultSettingsContext);

  const [settings, setSettings] = useState({});

  const setData = async (dbObject) => {
    const { videoQuality, language } = await dbObject._data;
    setSettings({ videoQuality, language });
    setDefaultSettings({ videoQuality, language });
  };

  const changeSetting = async (key, value) => {
    const data = await db.settings
      .findOne({
        selector: {
          id: {
            $eq: "1",
          },
        },
      })
      .exec();
    const newData = await data.update({
      id: "1",
      ...settings,
      [key]: value,
    });
    setData(newData);
  };

  const loadSettings = async () => {
    const response = await db.settings
      .findOne({
        selector: {
          id: {
            $eq: "1",
          },
        },
      })
      .exec();
    console.log(await response._data);
    setData(response);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <div className="border-b border-gray-900/10 pb-12">
      <h2 className="text-base font-semibold leading-7 text-gray-900">
        Settings
      </h2>
      <p className="mt-1 text-sm leading-6 text-gray-600">
        Select Your Prefered Option
      </p>
      <hr className="mb-2" />
      {Object.keys(settings).length && (
        <>
          <Listbox
            value={settings.videoQuality}
            onChange={(e) => changeSetting("videoQuality", e)}
          >
            {({ open }) => (
              <>
                <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">
                  Video Quality
                </Listbox.Label>
                <div className="relative mt-2">
                  <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                    <span className="block truncate">
                      {settings.videoQuality.name}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronUpDownIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </span>
                  </Listbox.Button>

                  <Transition
                    show={open}
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {VIDEO_QUALITY.map((vQulaity) => (
                        <Listbox.Option
                          key={vQulaity.id}
                          className={({ active }) =>
                            classNames(
                              active
                                ? "bg-indigo-600 text-white"
                                : "text-gray-900",
                              "relative cursor-default select-none py-2 pl-3 pr-9"
                            )
                          }
                          value={vQulaity}
                        >
                          {({ selected, active }) => (
                            <>
                              <span
                                className={classNames(
                                  selected ? "font-semibold" : "font-normal",
                                  "block truncate"
                                )}
                                data-id={{ selected }}
                              >
                                {vQulaity.name}
                              </span>

                              {selected ? (
                                <span
                                  className={classNames(
                                    active ? "text-white" : "text-indigo-600",
                                    "absolute inset-y-0 right-0 flex items-center pr-4"
                                  )}
                                >
                                  <CheckIcon
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                  />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </>
            )}
          </Listbox>
          <hr className="my-3" />
          <Listbox
            value={settings.language}
            onChange={(e) => changeSetting("language", e)}
          >
            {({ open }) => (
              <>
                <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">
                  Language
                </Listbox.Label>
                <div className="relative mt-2">
                  <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                    <span className="block truncate">
                      {settings.language.name}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronUpDownIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </span>
                  </Listbox.Button>

                  <Transition
                    show={open}
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {LANGUAGES.map((language) => (
                        <Listbox.Option
                          key={language.id}
                          className={({ active }) =>
                            classNames(
                              active
                                ? "bg-indigo-600 text-white"
                                : "text-gray-900",
                              "relative cursor-default select-none py-2 pl-3 pr-9"
                            )
                          }
                          value={language}
                        >
                          {({ active }) => (
                            <>
                              <span
                                className={classNames(
                                  settings.language.id === language.id
                                    ? "font-semibold"
                                    : "font-normal",
                                  "block truncate"
                                )}
                              >
                                {language.name}
                              </span>

                              {settings.language.id === language.id ? (
                                <span
                                  className={classNames(
                                    active ? "text-white" : "text-indigo-600",
                                    "absolute inset-y-0 right-0 flex items-center pr-4"
                                  )}
                                >
                                  <CheckIcon
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                  />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </>
            )}
          </Listbox>
        </>
      )}
    </div>
  );
};

export default Settings;
