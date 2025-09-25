"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../chizu-renderer/src/runtime.ts
var import_react, Ctx;
var init_runtime = __esm({
  "../chizu-renderer/src/runtime.ts"() {
    "use strict";
    import_react = __toESM(require("react"), 1);
    Ctx = (0, import_react.createContext)({});
  }
});

// ../chizu-renderer/src/codegen.ts
var init_codegen = __esm({
  "../chizu-renderer/src/codegen.ts"() {
    "use strict";
  }
});

// ../chizu-renderer/src/index.ts
function applyHoverFlexible(el, presetIdOrIds, presets) {
  if (!presetIdOrIds) return el;
  const REG = (init_index(), __toCommonJS(index_exports));
  const ids = Array.isArray(presetIdOrIds) ? presetIdOrIds : [presetIdOrIds];
  let node = el;
  for (const id of ids) {
    const p = presets?.[id];
    if (p) node = REG.mergeHoverStyle(node, p);
  }
  return node;
}
var import_react2;
var init_src = __esm({
  "../chizu-renderer/src/index.ts"() {
    "use strict";
    import_react2 = __toESM(require("react"), 1);
    init_runtime();
    init_codegen();
    init_runtime();
  }
});

// ../../node_modules/.pnpm/use-sync-external-store@1.5.0_react@19.1.1/node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.production.js
var require_use_sync_external_store_shim_production = __commonJS({
  "../../node_modules/.pnpm/use-sync-external-store@1.5.0_react@19.1.1/node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.production.js"(exports2) {
    "use strict";
    var React13 = require("react");
    function is(x, y) {
      return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
    }
    var objectIs = "function" === typeof Object.is ? Object.is : is;
    var useState = React13.useState;
    var useEffect2 = React13.useEffect;
    var useLayoutEffect2 = React13.useLayoutEffect;
    var useDebugValue2 = React13.useDebugValue;
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
    exports2.useSyncExternalStore = void 0 !== React13.useSyncExternalStore ? React13.useSyncExternalStore : shim;
  }
});

// ../../node_modules/.pnpm/use-sync-external-store@1.5.0_react@19.1.1/node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.development.js
var require_use_sync_external_store_shim_development = __commonJS({
  "../../node_modules/.pnpm/use-sync-external-store@1.5.0_react@19.1.1/node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.development.js"(exports2) {
    "use strict";
    "production" !== process.env.NODE_ENV && (function() {
      function is(x, y) {
        return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
      }
      function useSyncExternalStore$2(subscribe, getSnapshot) {
        didWarnOld18Alpha || void 0 === React13.startTransition || (didWarnOld18Alpha = true, console.error(
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
      var React13 = require("react"), objectIs = "function" === typeof Object.is ? Object.is : is, useState = React13.useState, useEffect2 = React13.useEffect, useLayoutEffect2 = React13.useLayoutEffect, useDebugValue2 = React13.useDebugValue, didWarnOld18Alpha = false, didWarnUncachedGetSnapshot = false, shim = "undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement ? useSyncExternalStore$1 : useSyncExternalStore$2;
      exports2.useSyncExternalStore = void 0 !== React13.useSyncExternalStore ? React13.useSyncExternalStore : shim;
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
    })();
  }
});

// ../../node_modules/.pnpm/use-sync-external-store@1.5.0_react@19.1.1/node_modules/use-sync-external-store/shim/index.js
var require_shim = __commonJS({
  "../../node_modules/.pnpm/use-sync-external-store@1.5.0_react@19.1.1/node_modules/use-sync-external-store/shim/index.js"(exports2, module2) {
    "use strict";
    if (process.env.NODE_ENV === "production") {
      module2.exports = require_use_sync_external_store_shim_production();
    } else {
      module2.exports = require_use_sync_external_store_shim_development();
    }
  }
});

// ../../node_modules/.pnpm/swr@2.2.5_react@19.1.1/node_modules/swr/dist/_internal/index.mjs
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
var import_react3, noop, UNDEFINED, OBJECT, isUndefined, isFunction, mergeObjects, isPromiseLike, table, counter, stableHash, SWRGlobalState, EMPTY_CACHE, INITIAL_CACHE, STR_UNDEFINED, isWindowDefined, isDocumentDefined, hasRequestAnimationFrame, createCacheHelper, online, isOnline, onWindowEvent, offWindowEvent, isVisible, initFocus, initReconnect, preset, defaultConfigOptions, IS_REACT_LEGACY, IS_SERVER, rAF, useIsomorphicLayoutEffect, navigatorConnection, slowConnection, serialize, __timestamp, getTimestamp, FOCUS_EVENT, RECONNECT_EVENT, MUTATE_EVENT, ERROR_REVALIDATE_EVENT, events, revalidateAllKeys, initCache, onErrorRetry, compare, cache, mutate, defaultConfig, mergeConfigs, SWRConfigContext, SWRConfig, INFINITE_PREFIX, enableDevtools, use, setupDevTools, normalize, useSWRConfig, middleware, BUILT_IN_MIDDLEWARE, withArgs, subscribeCallback;
var init_internal = __esm({
  "../../node_modules/.pnpm/swr@2.2.5_react@19.1.1/node_modules/swr/dist/_internal/index.mjs"() {
    "use strict";
    import_react3 = __toESM(require("react"), 1);
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
    IS_REACT_LEGACY = !import_react3.default.useId;
    IS_SERVER = !isWindowDefined || "Deno" in window;
    rAF = (f) => hasRequestAnimationFrame() ? window["requestAnimationFrame"](f) : setTimeout(f, 1);
    useIsomorphicLayoutEffect = IS_SERVER ? import_react3.useEffect : import_react3.useLayoutEffect;
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
    SWRConfigContext = (0, import_react3.createContext)({});
    SWRConfig = (props) => {
      const { value } = props;
      const parentConfig = (0, import_react3.useContext)(SWRConfigContext);
      const isFunctionalConfig = isFunction(value);
      const config = (0, import_react3.useMemo)(() => isFunctionalConfig ? value(parentConfig) : value, [
        isFunctionalConfig,
        parentConfig,
        value
      ]);
      const extendedConfig = (0, import_react3.useMemo)(() => isFunctionalConfig ? config : mergeConfigs(parentConfig, config), [
        isFunctionalConfig,
        parentConfig,
        config
      ]);
      const provider = config && config.provider;
      const cacheContextRef = (0, import_react3.useRef)(UNDEFINED);
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
      return (0, import_react3.createElement)(SWRConfigContext.Provider, mergeObjects(props, {
        value: extendedConfig
      }));
    };
    INFINITE_PREFIX = "$inf$";
    enableDevtools = isWindowDefined && window.__SWR_DEVTOOLS_USE__;
    use = enableDevtools ? window.__SWR_DEVTOOLS_USE__ : [];
    setupDevTools = () => {
      if (enableDevtools) {
        window.__SWR_DEVTOOLS_REACT__ = import_react3.default;
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
      return mergeObjects(defaultConfig, (0, import_react3.useContext)(SWRConfigContext));
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
var import_react4, import_shim, use2, WITH_DEDUPE, useSWRHandler, SWRConfig2, useSWR;
var init_core = __esm({
  "../../node_modules/.pnpm/swr@2.2.5_react@19.1.1/node_modules/swr/dist/core/index.mjs"() {
    "use strict";
    import_react4 = __toESM(require("react"), 1);
    import_shim = __toESM(require_shim(), 1);
    init_internal();
    init_internal();
    use2 = import_react4.default.use || ((promise) => {
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
      const initialMountedRef = (0, import_react4.useRef)(false);
      const unmountedRef = (0, import_react4.useRef)(false);
      const keyRef = (0, import_react4.useRef)(key);
      const fetcherRef = (0, import_react4.useRef)(fetcher2);
      const configRef = (0, import_react4.useRef)(config);
      const getConfig = () => configRef.current;
      const isActive = () => getConfig().isVisible() && getConfig().isOnline();
      const [getCache, setCache, subscribeCache, getInitialCache] = createCacheHelper(cache2, key);
      const stateDependencies = (0, import_react4.useRef)({}).current;
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
      const getSnapshot = (0, import_react4.useMemo)(() => {
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
      const cached = (0, import_shim.useSyncExternalStore)((0, import_react4.useCallback)(
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
      const laggyDataRef = (0, import_react4.useRef)(data);
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
      const revalidate = (0, import_react4.useCallback)(
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
      const boundMutate = (0, import_react4.useCallback)(
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
      (0, import_react4.useDebugValue)(returnedData);
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

// src/components/BacklinkList.tsx
function bfsUp(graph, start) {
  const up = [];
  const seen = /* @__PURE__ */ new Set([start]);
  let q = [start];
  while (q.length) {
    const cur = q.shift();
    graph.edges.filter((e) => e.to === cur).forEach((e) => {
      if (!seen.has(e.from)) {
        seen.add(e.from);
        up.push(e.from);
        q.push(e.from);
      }
    });
  }
  return up;
}
function bfsDown(graph, start) {
  const down = [];
  const seen = /* @__PURE__ */ new Set([start]);
  let q = [start];
  while (q.length) {
    const cur = q.shift();
    graph.edges.filter((e) => e.from === cur).forEach((e) => {
      if (!seen.has(e.to)) {
        seen.add(e.to);
        down.push(e.to);
        q.push(e.to);
      }
    });
  }
  return down;
}
function BacklinkList({ title = "Backlinks", selectedId, onSelect }) {
  const { data } = useLineage();
  const up = (0, import_react5.useMemo)(() => data && selectedId ? bfsUp(data, selectedId) : [], [data, selectedId]);
  const down = (0, import_react5.useMemo)(() => data && selectedId ? bfsDown(data, selectedId) : [], [data, selectedId]);
  if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "text-sm text-gray-500", children: "Loading lineage\u2026" });
  if (!selectedId) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "text-sm text-gray-500", children: "\u30CE\u30FC\u30C9\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044" });
  const nodeLabel = (id) => data.nodes[id]?.label ?? id;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "space-y-3", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "font-medium", children: title }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "text-xs font-semibold opacity-70 mb-1", children: [
        "\u4E0A\u6D41\uFF08",
        up.length,
        "\uFF09"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "space-y-1", children: up.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          className: "text-sm underline underline-offset-2 hover:opacity-80",
          onClick: () => onSelect?.(id),
          type: "button",
          children: nodeLabel(id)
        }
      ) }, `up-${id}`)) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "text-xs font-semibold opacity-70 mb-1", children: [
        "\u4E0B\u6D41\uFF08",
        down.length,
        "\uFF09"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "space-y-1", children: down.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          className: "text-sm underline underline-offset-2 hover:opacity-80",
          onClick: () => onSelect?.(id),
          type: "button",
          children: nodeLabel(id)
        }
      ) }, `down-${id}`)) })
    ] })
  ] });
}
var import_react5, import_jsx_runtime;
var init_BacklinkList = __esm({
  "src/components/BacklinkList.tsx"() {
    "use strict";
    "use client";
    import_react5 = require("react");
    init_useLineage();
    import_jsx_runtime = require("react/jsx-runtime");
  }
});

// src/components/NodeInspector.tsx
function NodeInspector({ selectedId, showRounding = true }) {
  const { data } = useLineage();
  if (!data) return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "text-sm text-gray-500", children: "Loading\u2026" });
  if (!selectedId) return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "text-sm text-gray-500", children: "\u30CE\u30FC\u30C9\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044" });
  const meta = data.nodes[selectedId];
  if (!meta) return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "text-sm text-red-500", children: [
    "\u672A\u767B\u9332\u30CE\u30FC\u30C9: ",
    selectedId
  ] });
  const connected = (0, import_react6.useMemo)(
    () => data.edges.filter((e) => e.from === selectedId || e.to === selectedId),
    [data, selectedId]
  );
  const flagsAgg = connected.reduce(
    (acc, e) => {
      acc.rounded ||= !!e.flags?.rounded;
      acc.taxAdjust ||= !!e.flags?.taxAdjust;
      acc.manualAdjust ||= !!e.flags?.manualAdjust;
      return acc;
    },
    { rounded: false, taxAdjust: false, manualAdjust: false }
  );
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "space-y-2 text-sm", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "font-semibold", children: "Node Inspector" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "opacity-60", children: "ID\uFF1A" }),
      meta.id
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "opacity-60", children: "Label\uFF1A" }),
      meta.label ?? "-"
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "opacity-60", children: "Kind\uFF1A" }),
      meta.kind
    ] }),
    meta.tags?.length ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "opacity-60", children: "Tags\uFF1A" }),
      meta.tags.join(", ")
    ] }) : null,
    showRounding && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "pt-2", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "opacity-60 text-xs", children: "Flags" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("ul", { className: "list-disc list-inside", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("li", { children: [
          "rounded: ",
          String(flagsAgg.rounded)
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("li", { children: [
          "taxAdjust: ",
          String(flagsAgg.taxAdjust)
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("li", { children: [
          "manualAdjust: ",
          String(flagsAgg.manualAdjust)
        ] })
      ] })
    ] })
  ] });
}
var import_react6, import_jsx_runtime2;
var init_NodeInspector = __esm({
  "src/components/NodeInspector.tsx"() {
    "use strict";
    "use client";
    import_react6 = require("react");
    init_useLineage();
    import_jsx_runtime2 = require("react/jsx-runtime");
  }
});

// src/components/GridSheet.tsx
function cast(v, type) {
  if (v == null) return v;
  if (type === "number") return typeof v === "number" ? v : Number(v);
  if (type === "date") return v instanceof Date ? v : new Date(v);
  return String(v);
}
function GridSheet({ schema, rows: initRows }) {
  const [rows, setRows] = import_react7.default.useState(initRows ?? []);
  const addRow = () => setRows((r) => [...r, Object.fromEntries(schema.columns.map((c) => [c.key, null]))]);
  const delRow = (i) => setRows((r) => r.filter((_, idx) => idx !== i));
  const setCell = (i, key, value) => setRows((r) => r.map((row, idx) => idx === i ? { ...row, [key]: value } : row));
  const errors = import_react7.default.useMemo(() => {
    return rows.map((row) => {
      const er = {};
      for (const col of schema.columns) {
        const v = row[col.key];
        if (col.required && (v === null || v === void 0 || v === "")) er[col.key] = "\u5FC5\u9808";
        if (col.type === "number" && v != null && Number.isNaN(Number(v))) er[col.key] = "\u6570\u5024\u3092\u5165\u529B";
      }
      return er;
    });
  }, [rows, schema.columns]);
  const footerSum = {};
  (schema.footer?.sum ?? []).forEach((key) => {
    footerSum[key] = rows.reduce((acc, row) => acc + (Number(row[key]) || 0), 0);
  });
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "text-sm", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("table", { className: "min-w-full border border-gray-200", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("tr", { className: "bg-gray-50", children: [
        schema.columns.map((c) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("th", { className: "px-2 py-1 text-left border-b", children: c.label }, c.key)),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("th", { className: "px-2 py-1 text-left border-b w-20", children: "\u64CD\u4F5C" })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("tbody", { children: rows.map((row, i) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("tr", { children: [
        schema.columns.map((c) => {
          const err = errors[i]?.[c.key];
          return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("td", { className: "px-2 py-1 border-b align-top", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              "input",
              {
                className: `w-full border rounded px-1 py-0.5 ${err ? "border-red-400" : "border-gray-200"}`,
                value: row[c.key] ?? "",
                type: c.type === "number" ? "number" : c.type === "date" ? "date" : "text",
                onChange: (e) => setCell(i, c.key, cast(e.target.value, c.type))
              }
            ),
            err ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "text-xs text-red-500 mt-0.5", children: err }) : null
          ] }, c.key);
        }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("td", { className: "px-2 py-1 border-b", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { className: "underline", onClick: () => delRow(i), type: "button", children: "\u524A\u9664" }) })
      ] }, i)) }),
      schema.footer?.sum?.length ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("tfoot", { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("tr", { className: "bg-gray-50", children: [
        schema.columns.map((c) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("td", { className: "px-2 py-1 border-t font-medium", children: schema.footer?.sum?.includes(c.key) ? footerSum[c.key] : "" }, c.key)),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("td", { className: "px-2 py-1 border-t" })
      ] }) }) : null
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "mt-2", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { className: "underline", onClick: addRow, type: "button", children: "\u884C\u3092\u8FFD\u52A0" }) })
  ] });
}
var import_react7, import_jsx_runtime3;
var init_GridSheet = __esm({
  "src/components/GridSheet.tsx"() {
    "use strict";
    "use client";
    import_react7 = __toESM(require("react"), 1);
    import_jsx_runtime3 = require("react/jsx-runtime");
  }
});

// src/components/GridSheetV2.tsx
function toDateString(v) {
  if (!v) return "";
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const d = v instanceof Date ? v : new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}
function GridSheetV2({ schema, rows: initRows }) {
  const [rows, setRows] = import_react8.default.useState(
    (initRows ?? []).map((r) => {
      const nr = { ...r };
      for (const c of schema.columns) {
        if (c.type === "date" && nr[c.key] != null) nr[c.key] = toDateString(nr[c.key]);
      }
      return nr;
    })
  );
  const addRow = () => setRows((r) => [...r, Object.fromEntries(schema.columns.map((c) => [c.key, ""]))]);
  const delRow = (i) => setRows((r) => r.filter((_, idx) => idx !== i));
  const setCell = (i, key, value) => setRows((r) => r.map((row, idx) => idx === i ? { ...row, [key]: value } : row));
  const errors = import_react8.default.useMemo(() => rows.map((row) => {
    const er = {};
    for (const col of schema.columns) {
      const v = row[col.key];
      if (col.required && (v === null || v === void 0 || v === "")) er[col.key] = "\u5FC5\u9808";
      if (col.type === "number" && v !== "" && Number.isNaN(Number(v))) er[col.key] = "\u6570\u5024\u3092\u5165\u529B";
    }
    return er;
  }), [rows, schema.columns]);
  const footerSum = {};
  (schema.footer?.sum ?? []).forEach((key) => {
    footerSum[key] = rows.reduce((acc, row) => acc + (Number(row[key]) || 0), 0);
  });
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "text-sm", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("table", { className: "min-w-full border border-gray-200", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("tr", { className: "bg-gray-50", children: [
        schema.columns.map((c) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("th", { className: "px-2 py-1 text-left border-b", children: c.label }, c.key)),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("th", { className: "px-2 py-1 text-left border-b w-20", children: "\u64CD\u4F5C" })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("tbody", { children: rows.map((row, i) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("tr", { children: [
        schema.columns.map((c) => {
          const err = errors[i]?.[c.key];
          const value = c.type === "date" ? toDateString(row[c.key]) : c.type === "number" ? row[c.key] ?? "" : row[c.key] ?? "";
          const inputType = c.type === "number" ? "number" : c.type === "date" ? "date" : "text";
          return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("td", { className: "px-2 py-1 border-b align-top", children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
              "input",
              {
                className: `w-full border rounded px-1 py-0.5 ${err ? "border-red-400" : "border-gray-200"}`,
                value,
                type: inputType,
                onChange: (e) => setCell(i, c.key, inputType === "number" ? e.target.value : e.target.value)
              }
            ),
            err ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "text-xs text-red-500 mt-0.5", children: err }) : null
          ] }, c.key);
        }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("td", { className: "px-2 py-1 border-b", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { className: "underline", onClick: () => delRow(i), type: "button", children: "\u524A\u9664" }) })
      ] }, i)) }),
      schema.footer?.sum?.length ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("tfoot", { children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("tr", { className: "bg-gray-50", children: [
        schema.columns.map((c) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("td", { className: "px-2 py-1 border-t font-medium", children: schema.footer?.sum?.includes(c.key) ? footerSum[c.key] : "" }, c.key)),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("td", { className: "px-2 py-1 border-t" })
      ] }) }) : null
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "mt-2", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { className: "underline", onClick: addRow, type: "button", children: "\u884C\u3092\u8FFD\u52A0" }) })
  ] });
}
var import_react8, import_jsx_runtime4;
var init_GridSheetV2 = __esm({
  "src/components/GridSheetV2.tsx"() {
    "use strict";
    "use client";
    import_react8 = __toESM(require("react"), 1);
    import_jsx_runtime4 = require("react/jsx-runtime");
  }
});

// src/components/NodeInspectorV2.tsx
function NodeInspectorV2({ selectedId, showRounding = true }) {
  const { data } = useLineage();
  if (!data) return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "text-sm text-gray-500", children: "Loading\u2026" });
  if (!selectedId) return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "text-sm text-gray-500", children: "\u30CE\u30FC\u30C9\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044" });
  const meta = data.nodes[selectedId];
  if (!meta) return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "text-sm text-red-500", children: [
    "\u672A\u767B\u9332\u30CE\u30FC\u30C9: ",
    selectedId
  ] });
  const connected = (0, import_react9.useMemo)(
    () => data.edges.filter((edge) => edge.from === selectedId || edge.to === selectedId),
    [data, selectedId]
  );
  const flagsAgg = connected.reduce(
    (acc, edge) => ({
      rounded: acc.rounded || !!edge.flags?.rounded,
      taxAdjust: acc.taxAdjust || !!edge.flags?.taxAdjust,
      manualAdjust: acc.manualAdjust || !!edge.flags?.manualAdjust
    }),
    { rounded: false, taxAdjust: false, manualAdjust: false }
  );
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "space-y-2 text-sm", children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "font-semibold", children: "Node Inspector V2" }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "opacity-60", children: "ID\uFF1A" }),
      meta.id
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "opacity-60", children: "Label\uFF1A" }),
      meta.label ?? "-"
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "opacity-60", children: "Kind\uFF1A" }),
      meta.kind
    ] }),
    meta.tags?.length ? /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "opacity-60", children: "Tags\uFF1A" }),
      meta.tags.join(", ")
    ] }) : null,
    showRounding && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "pt-2", children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "opacity-60 text-xs", children: "Flags" }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("ul", { className: "list-disc list-inside", children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("li", { children: [
          "rounded: ",
          String(flagsAgg.rounded)
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("li", { children: [
          "taxAdjust: ",
          String(flagsAgg.taxAdjust)
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("li", { children: [
          "manualAdjust: ",
          String(flagsAgg.manualAdjust)
        ] })
      ] })
    ] })
  ] });
}
var import_react9, import_jsx_runtime5;
var init_NodeInspectorV2 = __esm({
  "src/components/NodeInspectorV2.tsx"() {
    "use strict";
    "use client";
    import_react9 = require("react");
    init_useLineage();
    import_jsx_runtime5 = require("react/jsx-runtime");
  }
});

// src/components/TraceGraph.tsx
function TraceGraph({ highlightPath = [] }) {
  const { data } = useLineage();
  if (!data) return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "text-sm text-gray-500", children: "Loading lineage\u2026" });
  const groups = (0, import_react10.useMemo)(() => {
    const m = /* @__PURE__ */ new Map();
    for (const id of Object.keys(data.nodes)) {
      const gid = data.nodes[id]?.groupId || "ungrouped";
      if (!m.has(gid)) m.set(gid, []);
      m.get(gid).push(id);
    }
    return Array.from(m.entries()).map(([gid, ids]) => ({ gid, ids }));
  }, [data]);
  const colCount = groups.length || 1;
  const itemH = 44;
  const vGap = 12;
  const colPad = 12;
  const pos = (0, import_react10.useMemo)(() => {
    const p = {};
    groups.forEach((g, col) => {
      g.ids.forEach((id, row) => {
        p[id] = { col, row };
      });
    });
    return p;
  }, [groups]);
  const maxRows = (0, import_react10.useMemo)(() => Math.max(1, ...groups.map((g) => g.ids.length)), [groups]);
  const svgW = 1e3;
  const svgH = maxRows * itemH + Math.max(0, maxRows - 1) * vGap + 2 * colPad;
  const hpairs = /* @__PURE__ */ new Set();
  if (highlightPath.length >= 2) {
    for (let i = 0; i < highlightPath.length - 1; i++) {
      hpairs.add(`${highlightPath[i]}->${highlightPath[i + 1]}`);
    }
  }
  function nodeCenter(id) {
    const { col, row } = pos[id] || { col: 0, row: 0 };
    const x = (col + 0.5) / colCount * svgW;
    const y = colPad + row * (itemH + vGap) + itemH / 2;
    return { x, y };
  }
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "relative", style: { padding: 8 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "grid gap-4", style: { gridTemplateColumns: `repeat(${colCount}, minmax(0,1fr))` }, children: groups.map((g) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "space-y-2", children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "text-xs font-semibold opacity-70", children: g.gid }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "flex flex-col gap-3", children: g.ids.map((id) => {
        const isHL = highlightPath.includes(id);
        const meta = data.nodes[id];
        return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
          "div",
          {
            className: `px-2 py-2 rounded border ${isHL ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"}`,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: `text-xs ${isHL ? "font-semibold" : ""}`, children: meta?.label ?? id }),
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "text-[10px] opacity-60", children: id })
            ]
          },
          id
        );
      }) })
    ] }, g.gid)) }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      "svg",
      {
        width: "100%",
        height: svgH,
        viewBox: `0 0 ${svgW} ${svgH}`,
        className: "pointer-events-none absolute inset-0",
        children: data.edges.map((e, idx) => {
          const a = nodeCenter(e.from);
          const b = nodeCenter(e.to);
          const key = `${e.from}->${e.to}`;
          const hl = hpairs.has(key);
          return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
            "line",
            {
              x1: a.x,
              y1: a.y,
              x2: b.x,
              y2: b.y,
              stroke: hl ? "#2563eb" : "#94a3b8",
              strokeWidth: hl ? 3 : 1.5,
              strokeOpacity: 0.9
            },
            idx
          );
        })
      }
    )
  ] });
}
var import_react10, import_jsx_runtime6;
var init_TraceGraph = __esm({
  "src/components/TraceGraph.tsx"() {
    "use strict";
    "use client";
    import_react10 = require("react");
    init_useLineage();
    import_jsx_runtime6 = require("react/jsx-runtime");
  }
});

// src/components/TraceLegend.tsx
function TraceLegend({ graph }) {
  const groups = Array.from(new Set(Object.values(graph.nodes).map((n) => n.groupId ?? "ungrouped")));
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "text-xs text-gray-600 flex flex-wrap gap-2", children: groups.map((g) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "px-2 py-0.5 rounded border border-gray-300 bg-white", children: g }, g)) });
}
var import_jsx_runtime7;
var init_TraceLegend = __esm({
  "src/components/TraceLegend.tsx"() {
    "use strict";
    "use client";
    import_jsx_runtime7 = require("react/jsx-runtime");
  }
});

// src/components/RecoPanel.tsx
function RecoPanel({
  left,
  right,
  matches,
  onConfirm
}) {
  const [confirmed, setConfirmed] = import_react11.default.useState(/* @__PURE__ */ new Set());
  const confirm = (m) => {
    const key = `${m.leftId}-${m.rightId}`;
    setConfirmed((s) => new Set(s).add(key));
    onConfirm?.(m);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "text-sm space-y-2", children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "font-semibold", children: "\u7167\u5408\u5019\u88DC" }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("ul", { className: "space-y-1", children: matches.map((m) => {
      const key = `${m.leftId}-${m.rightId}`;
      const done = confirmed.has(key);
      return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("li", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "px-2 py-0.5 rounded bg-gray-100", children: m.score.toFixed(2) }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { children: [
          m.leftId,
          " \u2194 ",
          m.rightId
        ] }),
        done ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "text-green-600", children: "\u78BA\u5B9A\u6E08" }) : /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("button", { className: "underline", onClick: () => confirm(m), type: "button", children: "\u78BA\u5B9A" })
      ] }, key);
    }) })
  ] });
}
var import_react11, import_jsx_runtime8;
var init_RecoPanel = __esm({
  "src/components/RecoPanel.tsx"() {
    "use strict";
    "use client";
    import_react11 = __toESM(require("react"), 1);
    import_jsx_runtime8 = require("react/jsx-runtime");
  }
});

// src/components/PublishSummary.tsx
function PublishSummary({
  flags,
  onLockToggle
}) {
  const [state, setState] = import_react12.default.useState("Draft");
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "space-y-2 text-sm", children: [
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "font-semibold", children: "Publish Summary" }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("ul", { className: "list-disc list-inside", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("li", { children: [
        "rounded: ",
        String(!!flags.rounded)
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("li", { children: [
        "taxAdjust: ",
        String(!!flags.taxAdjust)
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("li", { children: [
        "manualAdjust: ",
        String(!!flags.manualAdjust)
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "pt-2", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("button", { className: "underline", onClick: () => {
      const next = state === "Draft" ? "Published" : "Draft";
      setState(next);
      onLockToggle?.(next);
    }, children: [
      "\u5207\u66FF: ",
      state,
      " \u2192 ",
      state === "Draft" ? "Published" : "Draft"
    ] }) })
  ] });
}
var import_react12, import_jsx_runtime9;
var init_PublishSummary = __esm({
  "src/components/PublishSummary.tsx"() {
    "use strict";
    "use client";
    import_react12 = __toESM(require("react"), 1);
    import_jsx_runtime9 = require("react/jsx-runtime");
  }
});

// src/index.ts
var index_exports = {};
__export(index_exports, {
  BacklinkList: () => BacklinkList,
  GridSheet: () => GridSheet,
  GridSheetV2: () => GridSheetV2,
  NodeInspector: () => NodeInspector,
  NodeInspectorV2: () => NodeInspectorV2,
  PublishSummary: () => PublishSummary,
  R: () => R,
  RecoPanel: () => RecoPanel,
  TraceGraph: () => TraceGraph,
  TraceLegend: () => TraceLegend,
  default: () => index_default,
  entries: () => entries,
  getSchema: () => getSchema,
  mergeHoverStyle: () => mergeHoverStyle
});
module.exports = __toCommonJS(index_exports);
function SlotContainer({ slotId, nodeId, as, children }) {
  const list = import_react13.default.Children.toArray(children ?? []);
  const pieces = [import_react13.default.createElement("div", { key: "sep-0", "data-drop-sep": "", "data-drop-index": 0 })];
  list.forEach((child, idx) => {
    pieces.push(child);
    pieces.push(import_react13.default.createElement("div", { key: `sep-${idx + 1}`, "data-drop-sep": "", "data-drop-index": idx + 1 }));
  });
  return import_react13.default.createElement(as, { "data-slot": slotId, "data-node-id": nodeId ?? slotId }, pieces);
}
function renderSlot(content) {
  if (Array.isArray(content)) {
    return content.map((n, i) => import_react13.default.createElement("div", { key: i }, n));
  }
  return content ?? null;
}
function getSchema(type) {
  return entries[type]?.propsSchema;
}
function mergeHoverStyle(el, preset2) {
  if (!preset2) return el;
  const props = { ...el.props || {} };
  const style = { ...props.style || {}, ...preset2.base || {} };
  if (preset2.transition) style.transition = preset2.transition;
  const onMouseEnter = (e) => {
    if (preset2.hover) Object.assign(e.currentTarget.style, preset2.hover);
    props.onMouseEnter?.(e);
  };
  const onMouseLeave = (e) => {
    if (preset2.base) Object.assign(e.currentTarget.style, preset2.base);
    props.onMouseLeave?.(e);
  };
  return import_react13.default.cloneElement(el, { ...props, style, onMouseEnter, onMouseLeave });
}
var import_react13, CommonHover, entries, R, index_default;
var init_index = __esm({
  "src/index.ts"() {
    import_react13 = __toESM(require("react"), 1);
    init_src();
    init_BacklinkList();
    init_NodeInspector();
    init_GridSheet();
    init_GridSheetV2();
    init_NodeInspectorV2();
    init_TraceGraph();
    init_TraceLegend();
    init_RecoPanel();
    init_PublishSummary();
    CommonHover = {
      hoverPresetId: { type: "string", title: "Hover Preset (single)", default: "" },
      hoverPresetIds: { type: "array", title: "Hover Presets (multi)", items: { type: "string" }, default: [] }
    };
    entries = {
      Text: {
        id: "Text",
        displayName: "Text",
        propsSchema: { type: "object", properties: { text: { type: "string", title: "text", default: "" } } },
        render: (p, _slots, runtime) => {
          const node = import_react13.default.createElement("span", { style: { display: "inline-block" } }, p.text ?? "");
          const presetArg = p.hoverPresetIds?.length ? p.hoverPresetIds : p.hoverPresetId;
          return applyHoverFlexible(node, presetArg, runtime?.api?.hoverPresets);
        }
      },
      Image: {
        id: "Image",
        displayName: "Image",
        propsSchema: { type: "object", properties: { src: { type: "string", title: "src", default: "" }, alt: { type: "string", title: "alt", default: "" } } },
        render: (p) => import_react13.default.createElement("img", { src: p.src, alt: p.alt })
      },
      Hero: {
        id: "Hero",
        displayName: "Hero",
        propsSchema: { type: "object", properties: { title: { type: "string", title: "title", default: "" } } },
        render: (p, _slots, runtime) => {
          const node = import_react13.default.createElement("h1", null, p.title ?? "");
          const presetArg = p.hoverPresetIds?.length ? p.hoverPresetIds : p.hoverPresetId;
          return applyHoverFlexible(node, presetArg, runtime?.api?.hoverPresets);
        }
      },
      TopNav: {
        id: "TopNav",
        displayName: "TopNav",
        propsSchema: { type: "object", properties: {} },
        render: () => import_react13.default.createElement("nav", null, "TopNav")
      },
      PrefList: {
        id: "PrefList",
        displayName: "PrefList",
        propsSchema: { type: "object", properties: {} },
        render: () => import_react13.default.createElement("aside", null, "PrefList")
      },
      // type helpers for slots
      Frame_Basic: {
        id: "Frame_Basic",
        displayName: "Frame Basic",
        propsSchema: { type: "object", properties: {} },
        slotSchema: [{ name: "header" }, { name: "sidebar" }, { name: "content", required: true }, { name: "footer" }],
        render: (_p, slots, _runtime) => import_react13.default.createElement(
          import_react13.default.Fragment,
          null,
          import_react13.default.createElement(SlotContainer, { slotId: "slot.header", as: "header" }, renderSlot(slots.header)),
          import_react13.default.createElement(SlotContainer, { slotId: "slot.sidebar", as: "aside" }, renderSlot(slots.sidebar)),
          import_react13.default.createElement(SlotContainer, { slotId: "slot.content", as: "main" }, renderSlot(slots.content)),
          import_react13.default.createElement(SlotContainer, { slotId: "slot.footer", as: "footer" }, renderSlot(slots.footer))
        )
      },
      Frame_Toponly: {
        id: "Frame_Toponly",
        displayName: "Frame TopOnly",
        propsSchema: { type: "object", properties: {} },
        slotSchema: [{ name: "header" }, { name: "content", required: true }],
        render: (_p, slots, _runtime) => import_react13.default.createElement(
          import_react13.default.Fragment,
          null,
          import_react13.default.createElement(SlotContainer, { slotId: "slot.header", as: "header" }, renderSlot(slots.header)),
          import_react13.default.createElement(SlotContainer, { slotId: "slot.content", as: "main" }, renderSlot(slots.content))
        )
      },
      Frame_Wide: {
        id: "Frame_Wide",
        displayName: "Frame Wide",
        propsSchema: { type: "object", properties: {} },
        slotSchema: [{ name: "content", required: true }, { name: "footer" }],
        render: (_p, slots, _runtime) => import_react13.default.createElement(
          import_react13.default.Fragment,
          null,
          import_react13.default.createElement(SlotContainer, { slotId: "slot.content", as: "main" }, renderSlot(slots.content)),
          import_react13.default.createElement(SlotContainer, { slotId: "slot.footer", as: "footer" }, renderSlot(slots.footer))
        )
      }
    };
    R = new Proxy(entries, { get: (t, p) => t[p]?.render ?? (() => import_react13.default.createElement("div", null, `Unknown:${p}`)) });
    index_default = R;
    entries.Text.propsSchema.properties = { ...entries.Text.propsSchema.properties, ...CommonHover };
    entries.Hero.propsSchema.properties = { ...entries.Hero.propsSchema.properties, ...CommonHover };
  }
});
init_index();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BacklinkList,
  GridSheet,
  GridSheetV2,
  NodeInspector,
  NodeInspectorV2,
  PublishSummary,
  R,
  RecoPanel,
  TraceGraph,
  TraceLegend,
  entries,
  getSchema,
  mergeHoverStyle
});
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
