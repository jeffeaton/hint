import Vue from "vue";
import Vuex, {mapActions, StoreOptions} from "vuex";
import ForgotPassword from "./components/password/ForgotPassword.vue";
import {initialPasswordState, PasswordState} from "./store/password/password";
import {actions} from './store/password/actions';
import {mutations} from './store/password/mutations';
import init from "./store/translations/init";

Vue.use(Vuex);

const passwordStoreOptions: StoreOptions<PasswordState> = {
    state: initialPasswordState,
    actions: actions,
    mutations: mutations
};

const store = new Vuex.Store<PasswordState>(passwordStoreOptions);
init(store);

export const forgotPasswordApp = new Vue({
    el: "#app",
    store,
    components: {
        ForgotPassword
    },
    render: h => h(ForgotPassword),
    methods: {
        ...mapActions({requestResetLink: 'password/requestResetLink'})
    }
});
