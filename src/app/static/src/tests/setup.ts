import i18next from "i18next";
import Vue from "vue";
import Vuex from "vuex";
import {Language, locales} from "../app/store/translations/locales";

// create mock element for app to attach to
const app = document.createElement('div');
app.setAttribute('id', 'app');
document.body.appendChild(app);

// implement innerText as its not implemented in jest/jsdom
// https://github.com/jsdom/jsdom/issues/1245
Object.defineProperty((global as any).Element.prototype, 'innerText', {
    get() {
        return this.textContent
    },
    set(value: string) {
        this.textContent = value
    },
    configurable: true
});

i18next.init({
    lng: Language.en,
    resources: {
        en: {translation: locales.en},
        fr: {translation: locales.fr}
    },
    fallbackLng: Language.en
});

Vue.use(Vuex);
Vue.config.productionTip = false;

global.console.error = (message: any) => {
    throw (message instanceof Error ? message : new Error(message))
}
