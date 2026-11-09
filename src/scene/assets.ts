declare const __SKIN_ASSETS__: Record<string,string> | undefined;
/** Native bundle embeds every image; the web preview respects its hosting base path. */
export function sceneAsset(name: string) {
  if(typeof __SKIN_ASSETS__ !== 'undefined')return __SKIN_ASSETS__[name];
  return `${import.meta.env.BASE_URL}scene/${name}`;
}
