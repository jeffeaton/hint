import i18next from "i18next";
import {Language, locales} from "./locales";
import {Store} from "vuex";
import {TranslatableState} from "../../root";
import Vue from "vue";
import Translated from "../../components/Translated.vue";
import translate from "../../directives/translate";

export default <S extends TranslatableState>(store: Store<S>) => {
    i18next.init({
        lng: Language.en,
        resources: {
            en: {translation: locales.en},
            fr: {translation: locales.fr}
        },
        fallbackLng: Language.en
    });

    // usage 1: <input v-translate:attribute="'keyName'">
    // e.g. <input v-translate:placeholder="'email'">
    // usage 2: <div v-translate="'keyName'"></div>
    Vue.directive('translate', translate(store));
}
