import { useLocale } from "./index";
import { ref } from "vue";
import { ZhCn } from "@eimsnext/locale";

let _t = null;
let locale = ref(null);

function t(...args) {
  return _t(...args) || args[0];
}

const globalUseLocale = (_locale) => {
  locale.value = _locale || ZhCn;
  const data = useLocale(locale);
  _t = data.t;
  return data;
};

globalUseLocale();

export default globalUseLocale;

export { t, locale };
