import {Module} from "vuex";
import {RootState} from "../../root";
import {DynamicFormData, DynamicFormMeta} from "@reside-ic/vue-dynamic-form";
import {mutations} from "./mutations";
import {localStorageManager} from "../../localStorageManager";
import {actions} from "./actions";
import {VersionInfo, Error} from "../../generated";

export interface ModelCalibrateState {
    optionsFormMeta: DynamicFormMeta
    options: DynamicFormData
    fetching: boolean
    calibrating: boolean
    complete: boolean
    version: VersionInfo
    error: Error | null
}

export const initialModelCalibrateState = (): ModelCalibrateState => {
    return {
        optionsFormMeta: {controlSections: []},
        options: {},
        fetching: false,
        calibrating: false,
        complete: false,
        version: {hintr: "unknown", naomi: "unknown", rrq: "unknown"},
        error: null
    }
};

const namespaced = true;

const existingState = localStorageManager.getState();

export const modelCalibrate: Module<ModelCalibrateState, RootState> = {
    namespaced,
    state: {...initialModelCalibrateState(), ...existingState && existingState.modelCalibrate},
    mutations,
    actions
};
