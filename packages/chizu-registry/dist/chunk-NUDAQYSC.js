import {
  __commonJS,
  __esm,
  __require,
  __toESM
} from "./chunk-2ESYSVXG.js";

// ../../node_modules/.pnpm/use-sync-external-store@1.5.0_react@19.1.1/node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.production.js
var require_use_sync_external_store_shim_production = __commonJS({
  "../../node_modules/.pnpm/use-sync-external-store@1.5.0_react@19.1.1/node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.production.js"(exports) {
    "use strict";
    var React2 = __require("react");
    function is(x, y) {
      return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
    }
    var objectIs = "function" === typeof Object.is ? Object.is : is;
    var useState = React2.useState;
    var useEffect2 = React2.useEffect;
    var useLayoutEffect2 = React2.useLayoutEffect;
    var useDebugValue2 = React2.useDebugValue;
    function useSyncExternalStore$2(subscribe, getSnapshot) {
      var value = getSnapshot(), _useState = useState({ inst: { value, getSnapshot } }), inst = _useState[0].inst, forceUpdate = _useState[1];
      useLayoutEffect2(
        function() {
          inst.value = value;
          inst.getSnapshot = getSnapshot;
          checkIfSnapshotChanged(inst) && forceUpdate({ inst });
        },
        [subscribe, value, getSnapshot]
      );
      useEffect2(
        function() {
          checkIfSnapshotChanged(inst) && forceUpdate({ inst });
          return subscribe(function() {
            checkIfSnapshotChanged(inst) && forceUpdate({ inst });
          });
        },
        [subscribe]
      );
      useDebugValue2(value);
      return value;
    }
    function checkIfSnapshotChanged(inst) {
      var latestGetSnapshot = inst.getSnapshot;
      inst = inst.value;
      try {
        var nextValue = latestGetSnapshot();
        return !objectIs(inst, nextValue);
      } catch (error) {
        return true;
      }
    }
    function useSyncExternalStore$1(subscribe, getSnapshot) {
      return getSnapshot();
    }
    var shim = "undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement ? useSyncExternalStore$1 : useSyncExternalStore$2;
    exports.useSyncExternalStore = void 0 !== React2.useSyncExternalStore ? React2.useSyncExternalStore : shim;
  }
});

// ../../node_modules/.pnpm/use-sync-external-store@1.5.0_react@19.1.1/node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.development.js
var require_use_sync_external_store_shim_development = __commonJS({
  "../../node_modules/.pnpm/use-sync-external-store@1.5.0_react@19.1.1/node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.development.js"(exports) {
    "use strict";
    "production" !== process.env.NODE_ENV && (function() {
      function is(x, y) {
        return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
      }
      function useSyncExternalStore$2(subscribe, getSnapshot) {
        didWarnOld18Alpha || void 0 === React2.startTransition || (didWarnOld18Alpha = true, console.error(
          "You are using an outdated, pre-release alpha of React 18 that does not support useSyncExternalStore. The use-sync-external-store shim will not work correctly. Upgrade to a newer pre-release."
        ));
        var value = getSnapshot();
        if (!didWarnUncachedGetSnapshot) {
          var cachedValue = getSnapshot();
          objectIs(value, cachedValue) || (console.error(
            "The result of getSnapshot should be cached to avoid an infinite loop"
          ), didWarnUncachedGetSnapshot = true);
        }
        cachedValue = useState({
          inst: { value, getSnapshot }
        });
        var inst = cachedValue[0].inst, forceUpdate = cachedValue[1];
        useLayoutEffect2(
          function() {
            inst.value = value;
            inst.getSnapshot = getSnapshot;
            checkIfSnapshotChanged(inst) && forceUpdate({ inst });
          },
          [subscribe, value, getSnapshot]
        );
        useEffect2(
          function() {
            checkIfSnapshotChanged(inst) && forceUpdate({ inst });
            return subscribe(function() {
              checkIfSnapshotChanged(inst) && forceUpdate({ inst });
            });
          },
          [subscribe]
        );
        useDebugValue2(value);
        return value;
      }
      function checkIfSnapshotChanged(inst) {
        var latestGetSnapshot = inst.getSnapshot;
        inst = inst.value;
        try {
          var nextValue = latestGetSnapshot();
          return !objectIs(inst, nextValue);
        } catch (error) {
          return true;
        }
      }
      function useSyncExternalStore$1(subscribe, getSnapshot) {
        return getSnapshot();
      }
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
      var React2 = __require("react"), objectIs = "function" === typeof Object.is ? Object.is : is, useState = React2.useState, useEffect2 = React2.useEffect, useLayoutEffect2 = React2.useLayoutEffect, useDebugValue2 = React2.useDebugValue, didWarnOld18Alpha = false, didWarnUncachedGetSnapshot = false, shim = "undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement ? useSyncExternalStore$1 : useSyncExternalStore$2;
      exports.useSyncExternalStore = void 0 !== React2.useSyncExternalStore ? React2.useSyncExternalStore : shim;
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
    })();
  }
});

// ../../node_modules/.pnpm/use-sync-external-store@1.5.0_react@19.1.1/node_modules/use-sync-external-store/shim/index.js
var require_shim = __commonJS({
  "../../node_modules/.pnpm/use-sync-external-store@1.5.0_react@19.1.1/node_modules/use-sync-external-store/shim/index.js"(exports, module) {
    "use strict";
    if (process.env.NODE_ENV === "production") {
      module.exports = require_use_sync_external_store_shim_production();
    } else {
      module.exports = require_use_sync_external_store_shim_development();
    }
  }
});

// ../../node_modules/.pnpm/swr@2.2.5_react@19.1.1/node_modules/swr/dist/_internal/index.mjs
import React, { useEffect, useLayoutEffect, createContext, useContext, useMemo, useRef, createElement } from "react";
async function internalMutate(...args) {
  const [cache2, _key, _data, _opts] = args;
  const options = mergeObjects({
    populateCache: true,
    throwOnError: true
  }, typeof _opts === "boolean" ? {
    revalidate: _opts
  } : _opts || {});
  let populateCache = options.populateCache;
  const rollbackOnErrorOption = options.rollbackOnError;
  let optimisticData = options.optimisticData;
  const rollbackOnError = (error) => {
    return typeof rollbackOnErrorOption === "function" ? rollbackOnErrorOption(error) : rollbackOnErrorOption !== false;
  };
  const throwOnError = options.throwOnError;
  if (isFunction(_key)) {
    const keyFilter = _key;
    const matchedKeys = [];
    const it = cache2.keys();
    for (const key of it) {
      if (
        // Skip the special useSWRInfinite and useSWRSubscription keys.
        !/^\$(inf|sub)\$/.test(key) && keyFilter(cache2.get(key)._k)
      ) {
        matchedKeys.push(key);
      }
    }
    return Promise.all(matchedKeys.map(mutateByKey));
  }
  return mutateByKey(_key);
  async function mutateByKey(_k) {
    const [key] = serialize(_k);
    if (!key) return;
    const [get, set] = createCacheHelper(cache2, key);
    const [EVENT_REVALIDATORS, MUTATION, FETCH, PRELOAD] = SWRGlobalState.get(cache2);
    const startRevalidate = () => {
      const revalidators = EVENT_REVALIDATORS[key];
      const revalidate = isFunction(options.revalidate) ? options.revalidate(get().data, _k) : options.revalidate !== false;
      if (revalidate) {
        delete FETCH[key];
        delete PRELOAD[key];
        if (revalidators && revalidators[0]) {
          return revalidators[0](MUTATE_EVENT).then(() => get().data);
        }
      }
      return get().data;
    };
    if (args.length < 3) {
      return startRevalidate();
    }
    let data = _data;
    let error;
    const beforeMutationTs = getTimestamp();
    MUTATION[key] = [
      beforeMutationTs,
      0
    ];
    const hasOptimisticData = !isUndefined(optimisticData);
    const state = get();
    const displayedData = state.data;
    const currentData = state._c;
    const committedData = isUndefined(currentData) ? displayedData : currentData;
    if (hasOptimisticData) {
      optimisticData = isFunction(optimisticData) ? optimisticData(committedData, displayedData) : optimisticData;
      set({
        data: optimisticData,
        _c: committedData
      });
    }
    if (isFunction(data)) {
      try {
        data = data(committedData);
      } catch (err) {
        error = err;
      }
    }
    if (data && isPromiseLike(data)) {
      data = await data.catch((err) => {
        error = err;
      });
      if (beforeMutationTs !== MUTATION[key][0]) {
        if (error) throw error;
        return data;
      } else if (error && hasOptimisticData && rollbackOnError(error)) {
        populateCache = true;
        set({
          data: committedData,
          _c: UNDEFINED
        });
      }
    }
    if (populateCache) {
      if (!error) {
        if (isFunction(populateCache)) {
          const populateCachedData = populateCache(data, committedData);
          set({
            data: populateCachedData,
            error: UNDEFINED,
            _c: UNDEFINED
          });
        } else {
          set({
            data,
            error: UNDEFINED,
            _c: UNDEFINED
          });
        }
      }
    }
    MUTATION[key][1] = getTimestamp();
    Promise.resolve(startRevalidate()).then(() => {
      set({
        _c: UNDEFINED
      });
    });
    if (error) {
      if (throwOnError) throw error;
      return;
    }
    return data;
  }
}
var noop, UNDEFINED, OBJECT, isUndefined, isFunction, mergeObjects, isPromiseLike, table, counter, stableHash, SWRGlobalState, EMPTY_CACHE, INITIAL_CACHE, STR_UNDEFINED, isWindowDefined, isDocumentDefined, hasRequestAnimationFrame, createCacheHelper, online, isOnline, onWindowEvent, offWindowEvent, isVisible, initFocus, initReconnect, preset, defaultConfigOptions, IS_REACT_LEGACY, IS_SERVER, rAF, useIsomorphicLayoutEffect, navigatorConnection, slowConnection, serialize, __timestamp, getTimestamp, FOCUS_EVENT, RECONNECT_EVENT, MUTATE_EVENT, ERROR_REVALIDATE_EVENT, events, revalidateAllKeys, initCache, onErrorRetry, compare, cache, mutate, defaultConfig, mergeConfigs, SWRConfigContext, SWRConfig, INFINITE_PREFIX, enableDevtools, use, setupDevTools, normalize, useSWRConfig, middleware, BUILT_IN_MIDDLEWARE, withArgs, subscribeCallback;
var init_internal = __esm({
  "../../node_modules/.pnpm/swr@2.2.5_react@19.1.1/node_modules/swr/dist/_internal/index.mjs"() {
    "use strict";
    noop = () => {
    };
    UNDEFINED = /*#__NOINLINE__*/
    noop();
    OBJECT = Object;
    isUndefined = (v) => v === UNDEFINED;
    isFunction = (v) => typeof v == "function";
    mergeObjects = (a, b) => ({
      ...a,
      ...b
    });
    isPromiseLike = (x) => isFunction(x.then);
    table = /* @__PURE__ */ new WeakMap();
    counter = 0;
    stableHash = (arg) => {
      const type = typeof arg;
      const constructor = arg && arg.constructor;
      const isDate = constructor == Date;
      let result;
      let index;
      if (OBJECT(arg) === arg && !isDate && constructor != RegExp) {
        result = table.get(arg);
        if (result) return result;
        result = ++counter + "~";
        table.set(arg, result);
        if (constructor == Array) {
          result = "@";
          for (index = 0; index < arg.length; index++) {
            result += stableHash(arg[index]) + ",";
          }
          table.set(arg, result);
        }
        if (constructor == OBJECT) {
          result = "#";
          const keys = OBJECT.keys(arg).sort();
          while (!isUndefined(index = keys.pop())) {
            if (!isUndefined(arg[index])) {
              result += index + ":" + stableHash(arg[index]) + ",";
            }
          }
          table.set(arg, result);
        }
      } else {
        result = isDate ? arg.toJSON() : type == "symbol" ? arg.toString() : type == "string" ? JSON.stringify(arg) : "" + arg;
      }
      return result;
    };
    SWRGlobalState = /* @__PURE__ */ new WeakMap();
    EMPTY_CACHE = {};
    INITIAL_CACHE = {};
    STR_UNDEFINED = "undefined";
    isWindowDefined = typeof window != STR_UNDEFINED;
    isDocumentDefined = typeof document != STR_UNDEFINED;
    hasRequestAnimationFrame = () => isWindowDefined && typeof window["requestAnimationFrame"] != STR_UNDEFINED;
    createCacheHelper = (cache2, key) => {
      const state = SWRGlobalState.get(cache2);
      return [
        // Getter
        () => !isUndefined(key) && cache2.get(key) || EMPTY_CACHE,
        // Setter
        (info) => {
          if (!isUndefined(key)) {
            const prev = cache2.get(key);
            if (!(key in INITIAL_CACHE)) {
              INITIAL_CACHE[key] = prev;
            }
            state[5](key, mergeObjects(prev, info), prev || EMPTY_CACHE);
          }
        },
        // Subscriber
        state[6],
        // Get server cache snapshot
        () => {
          if (!isUndefined(key)) {
            if (key in INITIAL_CACHE) return INITIAL_CACHE[key];
          }
          return !isUndefined(key) && cache2.get(key) || EMPTY_CACHE;
        }
      ];
    };
    online = true;
    isOnline = () => online;
    [onWindowEvent, offWindowEvent] = isWindowDefined && window.addEventListener ? [
      window.addEventListener.bind(window),
      window.removeEventListener.bind(window)
    ] : [
      noop,
      noop
    ];
    isVisible = () => {
      const visibilityState = isDocumentDefined && document.visibilityState;
      return isUndefined(visibilityState) || visibilityState !== "hidden";
    };
    initFocus = (callback) => {
      if (isDocumentDefined) {
        document.addEventListener("visibilitychange", callback);
      }
      onWindowEvent("focus", callback);
      return () => {
        if (isDocumentDefined) {
          document.removeEventListener("visibilitychange", callback);
        }
        offWindowEvent("focus", callback);
      };
    };
    initReconnect = (callback) => {
      const onOnline = () => {
        online = true;
        callback();
      };
      const onOffline = () => {
        online = false;
      };
      onWindowEvent("online", onOnline);
      onWindowEvent("offline", onOffline);
      return () => {
        offWindowEvent("online", onOnline);
        offWindowEvent("offline", onOffline);
      };
    };
    preset = {
      isOnline,
      isVisible
    };
    defaultConfigOptions = {
      initFocus,
      initReconnect
    };
    IS_REACT_LEGACY = !React.useId;
    IS_SERVER = !isWindowDefined || "Deno" in window;
    rAF = (f) => hasRequestAnimationFrame() ? window["requestAnimationFrame"](f) : setTimeout(f, 1);
    useIsomorphicLayoutEffect = IS_SERVER ? useEffect : useLayoutEffect;
    navigatorConnection = typeof navigator !== "undefined" && navigator.connection;
    slowConnection = !IS_SERVER && navigatorConnection && ([
      "slow-2g",
      "2g"
    ].includes(navigatorConnection.effectiveType) || navigatorConnection.saveData);
    serialize = (key) => {
      if (isFunction(key)) {
        try {
          key = key();
        } catch (err) {
          key = "";
        }
      }
      const args = key;
      key = typeof key == "string" ? key : (Array.isArray(key) ? key.length : key) ? stableHash(key) : "";
      return [
        key,
        args
      ];
    };
    __timestamp = 0;
    getTimestamp = () => ++__timestamp;
    FOCUS_EVENT = 0;
    RECONNECT_EVENT = 1;
    MUTATE_EVENT = 2;
    ERROR_REVALIDATE_EVENT = 3;
    events = {
      __proto__: null,
      ERROR_REVALIDATE_EVENT,
      FOCUS_EVENT,
      MUTATE_EVENT,
      RECONNECT_EVENT
    };
    revalidateAllKeys = (revalidators, type) => {
      for (const key in revalidators) {
        if (revalidators[key][0]) revalidators[key][0](type);
      }
    };
    initCache = (provider, options) => {
      if (!SWRGlobalState.has(provider)) {
        const opts = mergeObjects(defaultConfigOptions, options);
        const EVENT_REVALIDATORS = {};
        const mutate2 = internalMutate.bind(UNDEFINED, provider);
        let unmount = noop;
        const subscriptions = {};
        const subscribe = (key, callback) => {
          const subs = subscriptions[key] || [];
          subscriptions[key] = subs;
          subs.push(callback);
          return () => subs.splice(subs.indexOf(callback), 1);
        };
        const setter = (key, value, prev) => {
          provider.set(key, value);
          const subs = subscriptions[key];
          if (subs) {
            for (const fn of subs) {
              fn(value, prev);
            }
          }
        };
        const initProvider = () => {
          if (!SWRGlobalState.has(provider)) {
            SWRGlobalState.set(provider, [
              EVENT_REVALIDATORS,
              {},
              {},
              {},
              mutate2,
              setter,
              subscribe
            ]);
            if (!IS_SERVER) {
              const releaseFocus = opts.initFocus(setTimeout.bind(UNDEFINED, revalidateAllKeys.bind(UNDEFINED, EVENT_REVALIDATORS, FOCUS_EVENT)));
              const releaseReconnect = opts.initReconnect(setTimeout.bind(UNDEFINED, revalidateAllKeys.bind(UNDEFINED, EVENT_REVALIDATORS, RECONNECT_EVENT)));
              unmount = () => {
                releaseFocus && releaseFocus();
                releaseReconnect && releaseReconnect();
                SWRGlobalState.delete(provider);
              };
            }
          }
        };
        initProvider();
        return [
          provider,
          mutate2,
          initProvider,
          unmount
        ];
      }
      return [
        provider,
        SWRGlobalState.get(provider)[4]
      ];
    };
    onErrorRetry = (_, __, config, revalidate, opts) => {
      const maxRetryCount = config.errorRetryCount;
      const currentRetryCount = opts.retryCount;
      const timeout = ~~((Math.random() + 0.5) * (1 << (currentRetryCount < 8 ? currentRetryCount : 8))) * config.errorRetryInterval;
      if (!isUndefined(maxRetryCount) && currentRetryCount > maxRetryCount) {
        return;
      }
      setTimeout(revalidate, timeout, opts);
    };
    compare = (currentData, newData) => stableHash(currentData) == stableHash(newData);
    [cache, mutate] = initCache(/* @__PURE__ */ new Map());
    defaultConfig = mergeObjects(
      {
        // events
        onLoadingSlow: noop,
        onSuccess: noop,
        onError: noop,
        onErrorRetry,
        onDiscarded: noop,
        // switches
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        revalidateIfStale: true,
        shouldRetryOnError: true,
        // timeouts
        errorRetryInterval: slowConnection ? 1e4 : 5e3,
        focusThrottleInterval: 5 * 1e3,
        dedupingInterval: 2 * 1e3,
        loadingTimeout: slowConnection ? 5e3 : 3e3,
        // providers
        compare,
        isPaused: () => false,
        cache,
        mutate,
        fallback: {}
      },
      // use web preset by default
      preset
    );
    mergeConfigs = (a, b) => {
      const v = mergeObjects(a, b);
      if (b) {
        const { use: u1, fallback: f1 } = a;
        const { use: u2, fallback: f2 } = b;
        if (u1 && u2) {
          v.use = u1.concat(u2);
        }
        if (f1 && f2) {
          v.fallback = mergeObjects(f1, f2);
        }
      }
      return v;
    };
    SWRConfigContext = createContext({});
    SWRConfig = (props) => {
      const { value } = props;
      const parentConfig = useContext(SWRConfigContext);
      const isFunctionalConfig = isFunction(value);
      const config = useMemo(() => isFunctionalConfig ? value(parentConfig) : value, [
        isFunctionalConfig,
        parentConfig,
        value
      ]);
      const extendedConfig = useMemo(() => isFunctionalConfig ? config : mergeConfigs(parentConfig, config), [
        isFunctionalConfig,
        parentConfig,
        config
      ]);
      const provider = config && config.provider;
      const cacheContextRef = useRef(UNDEFINED);
      if (provider && !cacheContextRef.current) {
        cacheContextRef.current = initCache(provider(extendedConfig.cache || cache), config);
      }
      const cacheContext = cacheContextRef.current;
      if (cacheContext) {
        extendedConfig.cache = cacheContext[0];
        extendedConfig.mutate = cacheContext[1];
      }
      useIsomorphicLayoutEffect(() => {
        if (cacheContext) {
          cacheContext[2] && cacheContext[2]();
          return cacheContext[3];
        }
      }, []);
      return createElement(SWRConfigContext.Provider, mergeObjects(props, {
        value: extendedConfig
      }));
    };
    INFINITE_PREFIX = "$inf$";
    enableDevtools = isWindowDefined && window.__SWR_DEVTOOLS_USE__;
    use = enableDevtools ? window.__SWR_DEVTOOLS_USE__ : [];
    setupDevTools = () => {
      if (enableDevtools) {
        window.__SWR_DEVTOOLS_REACT__ = React;
      }
    };
    normalize = (args) => {
      return isFunction(args[1]) ? [
        args[0],
        args[1],
        args[2] || {}
      ] : [
        args[0],
        null,
        (args[1] === null ? args[2] : args[1]) || {}
      ];
    };
    useSWRConfig = () => {
      return mergeObjects(defaultConfig, useContext(SWRConfigContext));
    };
    middleware = (useSWRNext) => (key_, fetcher_, config) => {
      const fetcher2 = fetcher_ && ((...args) => {
        const [key] = serialize(key_);
        const [, , , PRELOAD] = SWRGlobalState.get(cache);
        if (key.startsWith(INFINITE_PREFIX)) {
          return fetcher_(...args);
        }
        const req = PRELOAD[key];
        if (isUndefined(req)) return fetcher_(...args);
        delete PRELOAD[key];
        return req;
      });
      return useSWRNext(key_, fetcher2, config);
    };
    BUILT_IN_MIDDLEWARE = use.concat(middleware);
    withArgs = (hook) => {
      return function useSWRArgs(...args) {
        const fallbackConfig = useSWRConfig();
        const [key, fn, _config] = normalize(args);
        const config = mergeConfigs(fallbackConfig, _config);
        let next = hook;
        const { use: use3 } = config;
        const middleware2 = (use3 || []).concat(BUILT_IN_MIDDLEWARE);
        for (let i = middleware2.length; i--; ) {
          next = middleware2[i](next);
        }
        return next(key, fn || config.fetcher || null, config);
      };
    };
    subscribeCallback = (key, callbacks, callback) => {
      const keyedRevalidators = callbacks[key] || (callbacks[key] = []);
      keyedRevalidators.push(callback);
      return () => {
        const index = keyedRevalidators.indexOf(callback);
        if (index >= 0) {
          keyedRevalidators[index] = keyedRevalidators[keyedRevalidators.length - 1];
          keyedRevalidators.pop();
        }
      };
    };
    setupDevTools();
  }
});

// ../../node_modules/.pnpm/swr@2.2.5_react@19.1.1/node_modules/swr/dist/core/index.mjs
import ReactExports, { useRef as useRef2, useMemo as useMemo2, useCallback, useDebugValue } from "react";
var import_shim, use2, WITH_DEDUPE, useSWRHandler, SWRConfig2, useSWR;
var init_core = __esm({
  "../../node_modules/.pnpm/swr@2.2.5_react@19.1.1/node_modules/swr/dist/core/index.mjs"() {
    "use strict";
    import_shim = __toESM(require_shim(), 1);
    init_internal();
    init_internal();
    use2 = ReactExports.use || ((promise) => {
      if (promise.status === "pending") {
        throw promise;
      } else if (promise.status === "fulfilled") {
        return promise.value;
      } else if (promise.status === "rejected") {
        throw promise.reason;
      } else {
        promise.status = "pending";
        promise.then((v) => {
          promise.status = "fulfilled";
          promise.value = v;
        }, (e) => {
          promise.status = "rejected";
          promise.reason = e;
        });
        throw promise;
      }
    });
    WITH_DEDUPE = {
      dedupe: true
    };
    useSWRHandler = (_key, fetcher2, config) => {
      const { cache: cache2, compare: compare2, suspense, fallbackData, revalidateOnMount, revalidateIfStale, refreshInterval, refreshWhenHidden, refreshWhenOffline, keepPreviousData } = config;
      const [EVENT_REVALIDATORS, MUTATION, FETCH, PRELOAD] = SWRGlobalState.get(cache2);
      const [key, fnArg] = serialize(_key);
      const initialMountedRef = useRef2(false);
      const unmountedRef = useRef2(false);
      const keyRef = useRef2(key);
      const fetcherRef = useRef2(fetcher2);
      const configRef = useRef2(config);
      const getConfig = () => configRef.current;
      const isActive = () => getConfig().isVisible() && getConfig().isOnline();
      const [getCache, setCache, subscribeCache, getInitialCache] = createCacheHelper(cache2, key);
      const stateDependencies = useRef2({}).current;
      const fallback = isUndefined(fallbackData) ? config.fallback[key] : fallbackData;
      const isEqual = (prev, current) => {
        for (const _ in stateDependencies) {
          const t = _;
          if (t === "data") {
            if (!compare2(prev[t], current[t])) {
              if (!isUndefined(prev[t])) {
                return false;
              }
              if (!compare2(returnedData, current[t])) {
                return false;
              }
            }
          } else {
            if (current[t] !== prev[t]) {
              return false;
            }
          }
        }
        return true;
      };
      const getSnapshot = useMemo2(() => {
        const shouldStartRequest = (() => {
          if (!key) return false;
          if (!fetcher2) return false;
          if (!isUndefined(revalidateOnMount)) return revalidateOnMount;
          if (getConfig().isPaused()) return false;
          if (suspense) return false;
          if (!isUndefined(revalidateIfStale)) return revalidateIfStale;
          return true;
        })();
        const getSelectedCache = (state) => {
          const snapshot = mergeObjects(state);
          delete snapshot._k;
          if (!shouldStartRequest) {
            return snapshot;
          }
          return {
            isValidating: true,
            isLoading: true,
            ...snapshot
          };
        };
        const cachedData2 = getCache();
        const initialData = getInitialCache();
        const clientSnapshot = getSelectedCache(cachedData2);
        const serverSnapshot = cachedData2 === initialData ? clientSnapshot : getSelectedCache(initialData);
        let memorizedSnapshot = clientSnapshot;
        return [
          () => {
            const newSnapshot = getSelectedCache(getCache());
            const compareResult = isEqual(newSnapshot, memorizedSnapshot);
            if (compareResult) {
              memorizedSnapshot.data = newSnapshot.data;
              memorizedSnapshot.isLoading = newSnapshot.isLoading;
              memorizedSnapshot.isValidating = newSnapshot.isValidating;
              memorizedSnapshot.error = newSnapshot.error;
              return memorizedSnapshot;
            } else {
              memorizedSnapshot = newSnapshot;
              return newSnapshot;
            }
          },
          () => serverSnapshot
        ];
      }, [
        cache2,
        key
      ]);
      const cached = (0, import_shim.useSyncExternalStore)(useCallback(
        (callback) => subscribeCache(key, (current, prev) => {
          if (!isEqual(prev, current)) callback();
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
          cache2,
          key
        ]
      ), getSnapshot[0], getSnapshot[1]);
      const isInitialMount = !initialMountedRef.current;
      const hasRevalidator = EVENT_REVALIDATORS[key] && EVENT_REVALIDATORS[key].length > 0;
      const cachedData = cached.data;
      const data = isUndefined(cachedData) ? fallback : cachedData;
      const error = cached.error;
      const laggyDataRef = useRef2(data);
      const returnedData = keepPreviousData ? isUndefined(cachedData) ? laggyDataRef.current : cachedData : data;
      const shouldDoInitialRevalidation = (() => {
        if (hasRevalidator && !isUndefined(error)) return false;
        if (isInitialMount && !isUndefined(revalidateOnMount)) return revalidateOnMount;
        if (getConfig().isPaused()) return false;
        if (suspense) return isUndefined(data) ? false : revalidateIfStale;
        return isUndefined(data) || revalidateIfStale;
      })();
      const defaultValidatingState = !!(key && fetcher2 && isInitialMount && shouldDoInitialRevalidation);
      const isValidating = isUndefined(cached.isValidating) ? defaultValidatingState : cached.isValidating;
      const isLoading = isUndefined(cached.isLoading) ? defaultValidatingState : cached.isLoading;
      const revalidate = useCallback(
        async (revalidateOpts) => {
          const currentFetcher = fetcherRef.current;
          if (!key || !currentFetcher || unmountedRef.current || getConfig().isPaused()) {
            return false;
          }
          let newData;
          let startAt;
          let loading = true;
          const opts = revalidateOpts || {};
          const shouldStartNewRequest = !FETCH[key] || !opts.dedupe;
          const callbackSafeguard = () => {
            if (IS_REACT_LEGACY) {
              return !unmountedRef.current && key === keyRef.current && initialMountedRef.current;
            }
            return key === keyRef.current;
          };
          const finalState = {
            isValidating: false,
            isLoading: false
          };
          const finishRequestAndUpdateState = () => {
            setCache(finalState);
          };
          const cleanupState = () => {
            const requestInfo = FETCH[key];
            if (requestInfo && requestInfo[1] === startAt) {
              delete FETCH[key];
            }
          };
          const initialState = {
            isValidating: true
          };
          if (isUndefined(getCache().data)) {
            initialState.isLoading = true;
          }
          try {
            if (shouldStartNewRequest) {
              setCache(initialState);
              if (config.loadingTimeout && isUndefined(getCache().data)) {
                setTimeout(() => {
                  if (loading && callbackSafeguard()) {
                    getConfig().onLoadingSlow(key, config);
                  }
                }, config.loadingTimeout);
              }
              FETCH[key] = [
                currentFetcher(fnArg),
                getTimestamp()
              ];
            }
            [newData, startAt] = FETCH[key];
            newData = await newData;
            if (shouldStartNewRequest) {
              setTimeout(cleanupState, config.dedupingInterval);
            }
            if (!FETCH[key] || FETCH[key][1] !== startAt) {
              if (shouldStartNewRequest) {
                if (callbackSafeguard()) {
                  getConfig().onDiscarded(key);
                }
              }
              return false;
            }
            finalState.error = UNDEFINED;
            const mutationInfo = MUTATION[key];
            if (!isUndefined(mutationInfo) && // case 1
            (startAt <= mutationInfo[0] || // case 2
            startAt <= mutationInfo[1] || // case 3
            mutationInfo[1] === 0)) {
              finishRequestAndUpdateState();
              if (shouldStartNewRequest) {
                if (callbackSafeguard()) {
                  getConfig().onDiscarded(key);
                }
              }
              return false;
            }
            const cacheData = getCache().data;
            finalState.data = compare2(cacheData, newData) ? cacheData : newData;
            if (shouldStartNewRequest) {
              if (callbackSafeguard()) {
                getConfig().onSuccess(newData, key, config);
              }
            }
          } catch (err) {
            cleanupState();
            const currentConfig = getConfig();
            const { shouldRetryOnError } = currentConfig;
            if (!currentConfig.isPaused()) {
              finalState.error = err;
              if (shouldStartNewRequest && callbackSafeguard()) {
                currentConfig.onError(err, key, currentConfig);
                if (shouldRetryOnError === true || isFunction(shouldRetryOnError) && shouldRetryOnError(err)) {
                  if (!getConfig().revalidateOnFocus || !getConfig().revalidateOnReconnect || isActive()) {
                    currentConfig.onErrorRetry(err, key, currentConfig, (_opts) => {
                      const revalidators = EVENT_REVALIDATORS[key];
                      if (revalidators && revalidators[0]) {
                        revalidators[0](events.ERROR_REVALIDATE_EVENT, _opts);
                      }
                    }, {
                      retryCount: (opts.retryCount || 0) + 1,
                      dedupe: true
                    });
                  }
                }
              }
            }
          }
          loading = false;
          finishRequestAndUpdateState();
          return true;
        },
        // `setState` is immutable, and `eventsCallback`, `fnArg`, and
        // `keyValidating` are depending on `key`, so we can exclude them from
        // the deps array.
        //
        // FIXME:
        // `fn` and `config` might be changed during the lifecycle,
        // but they might be changed every render like this.
        // `useSWR('key', () => fetch('/api/'), { suspense: true })`
        // So we omit the values from the deps array
        // even though it might cause unexpected behaviors.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
          key,
          cache2
        ]
      );
      const boundMutate = useCallback(
        // Use callback to make sure `keyRef.current` returns latest result every time
        (...args) => {
          return internalMutate(cache2, keyRef.current, ...args);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
      );
      useIsomorphicLayoutEffect(() => {
        fetcherRef.current = fetcher2;
        configRef.current = config;
        if (!isUndefined(cachedData)) {
          laggyDataRef.current = cachedData;
        }
      });
      useIsomorphicLayoutEffect(() => {
        if (!key) return;
        const softRevalidate = revalidate.bind(UNDEFINED, WITH_DEDUPE);
        let nextFocusRevalidatedAt = 0;
        const onRevalidate = (type, opts = {}) => {
          if (type == events.FOCUS_EVENT) {
            const now = Date.now();
            if (getConfig().revalidateOnFocus && now > nextFocusRevalidatedAt && isActive()) {
              nextFocusRevalidatedAt = now + getConfig().focusThrottleInterval;
              softRevalidate();
            }
          } else if (type == events.RECONNECT_EVENT) {
            if (getConfig().revalidateOnReconnect && isActive()) {
              softRevalidate();
            }
          } else if (type == events.MUTATE_EVENT) {
            return revalidate();
          } else if (type == events.ERROR_REVALIDATE_EVENT) {
            return revalidate(opts);
          }
          return;
        };
        const unsubEvents = subscribeCallback(key, EVENT_REVALIDATORS, onRevalidate);
        unmountedRef.current = false;
        keyRef.current = key;
        initialMountedRef.current = true;
        setCache({
          _k: fnArg
        });
        if (shouldDoInitialRevalidation) {
          if (isUndefined(data) || IS_SERVER) {
            softRevalidate();
          } else {
            rAF(softRevalidate);
          }
        }
        return () => {
          unmountedRef.current = true;
          unsubEvents();
        };
      }, [
        key
      ]);
      useIsomorphicLayoutEffect(() => {
        let timer;
        function next() {
          const interval = isFunction(refreshInterval) ? refreshInterval(getCache().data) : refreshInterval;
          if (interval && timer !== -1) {
            timer = setTimeout(execute, interval);
          }
        }
        function execute() {
          if (!getCache().error && (refreshWhenHidden || getConfig().isVisible()) && (refreshWhenOffline || getConfig().isOnline())) {
            revalidate(WITH_DEDUPE).then(next);
          } else {
            next();
          }
        }
        next();
        return () => {
          if (timer) {
            clearTimeout(timer);
            timer = -1;
          }
        };
      }, [
        refreshInterval,
        refreshWhenHidden,
        refreshWhenOffline,
        key
      ]);
      useDebugValue(returnedData);
      if (suspense && isUndefined(data) && key) {
        if (!IS_REACT_LEGACY && IS_SERVER) {
          throw new Error("Fallback data is required when using suspense in SSR.");
        }
        fetcherRef.current = fetcher2;
        configRef.current = config;
        unmountedRef.current = false;
        const req = PRELOAD[key];
        if (!isUndefined(req)) {
          const promise = boundMutate(req);
          use2(promise);
        }
        if (isUndefined(error)) {
          const promise = revalidate(WITH_DEDUPE);
          if (!isUndefined(returnedData)) {
            promise.status = "fulfilled";
            promise.value = true;
          }
          use2(promise);
        } else {
          throw error;
        }
      }
      return {
        mutate: boundMutate,
        get data() {
          stateDependencies.data = true;
          return returnedData;
        },
        get error() {
          stateDependencies.error = true;
          return error;
        },
        get isValidating() {
          stateDependencies.isValidating = true;
          return isValidating;
        },
        get isLoading() {
          stateDependencies.isLoading = true;
          return isLoading;
        }
      };
    };
    SWRConfig2 = OBJECT.defineProperty(SWRConfig, "defaultValue", {
      value: defaultConfig
    });
    useSWR = withArgs(useSWRHandler);
  }
});

// ../chizu-ui/src/hooks/useLineage.ts
function useLineage() {
  const { data, error, isLoading } = useSWR("/api/lineage", fetcher, {
    revalidateOnFocus: false
  });
  return { data, error, isLoading };
}
var fetcher;
var init_useLineage = __esm({
  "../chizu-ui/src/hooks/useLineage.ts"() {
    "use strict";
    "use client";
    init_core();
    fetcher = (url) => fetch(url).then((r) => r.json());
  }
});

export {
  useLineage,
  init_useLineage
};
/*! Bundled license information:

use-sync-external-store/cjs/use-sync-external-store-shim.production.js:
  (**
   * @license React
   * use-sync-external-store-shim.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

use-sync-external-store/cjs/use-sync-external-store-shim.development.js:
  (**
   * @license React
   * use-sync-external-store-shim.development.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
