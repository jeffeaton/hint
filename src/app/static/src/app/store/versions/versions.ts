import {Module} from 'vuex';
import {localStorageManager} from "../../localStorageManager";
import {RootState} from "../../root";
import {mutations} from "./mutations";
import {actions} from "./actions";

export interface VersionsState {
    userVersion: string | null,
    manageVersions: boolean,
    error: Error | null
}

export const initialVersionsState = (): VersionsState => {
    return {
        userVersion: null,
        manageVersions: false,
        error: null
    }
};

const namespaced: boolean = true;

const existingState = localStorageManager.getState();

export const versions: Module<VersionsState, RootState> = {
    namespaced,
    state: {...initialVersionsState(), ...existingState && existingState.versions},
    mutations,
    actions
};