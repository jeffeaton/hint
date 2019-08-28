import {PasswordState} from "./password";
import {PasswordActionPayload} from "./actions";
import {Mutation, MutationTree} from "vuex";

interface PasswordMutation extends Mutation<PasswordState> {
    payload?: PasswordActionPayload<any>
}

export interface PasswordMutations {
    ResetLinkRequested:PasswordMutation
    RequestResetLinkError: PasswordMutation
}

export const mutations: MutationTree<PasswordState> & PasswordMutations = {
    ResetLinkRequested(state: PasswordState) {
        state.resetLinkRequested = true;
        state.requestResetLinkError = "";
    },

    RequestResetLinkError(state: PasswordState, action: PasswordActionPayload<string>) {
        state.resetLinkRequested = false;
        state.requestResetLinkError = action.payload;
    }
};
